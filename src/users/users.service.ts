import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { PaymentHistory, PaymentAction } from './entity/payment-history.entity';
import { DebitBalanceDto } from './dto/debit-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(PaymentHistory)
    private readonly historyRepository: Repository<PaymentHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const initialBalance = dto.balance ?? 0;
    this.logger.log(`Creating user with initial balance=${initialBalance}`);
    const user = this.usersRepository.create({
      balance: initialBalance.toFixed(2),
    });
    const saved = await this.usersRepository.save(user);
    this.logger.log(`Created user id=${saved.id} balance=${saved.balance}`);
    return saved;
  }

  async debit(dto: DebitBalanceDto): Promise<User> {
    const { userId, amount } = dto;

    this.logger.log(`Debiting userId=${userId} amount=${amount}`);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.warn(`User not found, id=${userId}`);
        throw new NotFoundException('User not found');
      }

      const historyRepo = manager.getRepository(PaymentHistory);

      const debitAction: PaymentAction = 'debit';

      const historyRecord = historyRepo.create({
        userId,
        action: debitAction,
        amount: amount.toFixed(2),
      });
      await historyRepo.save(historyRecord);

      const sumResult = await historyRepo
        .createQueryBuilder('h')
        .select(
          "SUM(CASE WHEN h.action = 'credit' THEN h.amount ELSE -h.amount END)",
          'sum',
        )
        .where('h.userId = :userId', { userId })
        .getRawOne<{ sum: string | null }>();

      const newBalance = sumResult?.sum ?? '0';

      if (Number(newBalance) < 0) {
        this.logger.warn(`Insufficient funds for userId=${userId}, attempted debit=${amount}, balance=${newBalance}`);
        throw new BadRequestException('Insufficient funds');
      }

      user.balance = newBalance;
      await manager.save(user);

      this.logger.log(`Debited userId=${userId}, newBalance=${newBalance}`);
      return user;
    });
  }

  async credit(dto: DebitBalanceDto): Promise<User> {
    const { userId, amount } = dto;

    this.logger.log(`Crediting userId=${userId} amount=${amount}`);

    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        this.logger.warn(`User not found, id=${userId}`);
        throw new NotFoundException('User not found');
      }

      const historyRepo = manager.getRepository(PaymentHistory);

      const creditAction: PaymentAction = 'credit';

      const historyRecord = historyRepo.create({
        userId,
        action: creditAction,
        amount: amount.toFixed(2),
      });
      await historyRepo.save(historyRecord);

      const sumResult = await historyRepo
        .createQueryBuilder('h')
        .select(
          "SUM(CASE WHEN h.action = 'credit' THEN h.amount ELSE -h.amount END)",
          'sum',
        )
        .where('h.userId = :userId', { userId })
        .getRawOne<{ sum: string | null }>();

      const newBalance = sumResult?.sum ?? '0';

      user.balance = newBalance;
      await manager.save(user);

      this.logger.log(`Credited userId=${userId}, newBalance=${newBalance}`);
      return user;
    });
  }

  async getUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

