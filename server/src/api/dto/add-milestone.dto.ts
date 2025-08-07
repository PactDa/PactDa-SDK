import { IsNumber, IsString, Matches, Min, IsNotEmpty, IsDefined } from 'class-validator';

export class AddMilestone {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid contract ID format' })
  contractId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid Address format' })
  approverAddress: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1 Mist' })
  amountInMist: number;

  @IsDefined()
  milestoneData: Record<string, any>; 
}
