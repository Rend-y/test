import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DebitBalanceDto } from './dto/debit-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Created user', type: User })
  createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User with current balance', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.getUser(id);
  }

  @Post('debit')
  @ApiOperation({ summary: 'Debit user balance' })
  @ApiBody({ type: DebitBalanceDto })
  @ApiResponse({ status: 200, description: 'Updated user with new balance', type: User })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient funds' })
  @ApiResponse({ status: 404, description: 'User not found' })
  debit(@Body() dto: DebitBalanceDto): Promise<User> {
    return this.usersService.debit(dto);
  }

  @Post('credit')
  @ApiOperation({ summary: 'Credit user balance' })
  @ApiBody({ type: DebitBalanceDto })
  @ApiResponse({ status: 200, description: 'Updated user with new balance', type: User })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  credit(@Body() dto: DebitBalanceDto): Promise<User> {
    return this.usersService.credit(dto);
  }
}

