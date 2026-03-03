import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { PaymentHistory } from './entity/payment-history.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, PaymentHistory])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

