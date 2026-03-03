import { IsInt, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DebitBalanceDto {
  @ApiProperty({
    description: 'User identifier',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  userId!: number;

  @ApiProperty({
    description: 'Amount to debit from user balance',
    example: 100,
  })
  @IsPositive()
  amount!: number;
}

