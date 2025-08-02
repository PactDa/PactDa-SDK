import { IsString, IsNumber, IsNotEmpty, Matches, Min} from 'class-validator';

export class FundEscrowDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid contract ID format' })
  contractId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid escrow ID format' })
  escrowId: string;
  
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  totalCoinMist: number;

}
