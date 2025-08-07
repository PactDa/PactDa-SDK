import { IsString, IsNumber, IsNotEmpty, Matches, Min} from 'class-validator';

export class ApproveMilestone {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid contract ID format' })
  contractId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Milestone Id must be at least 1' })
  milestoneId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid client Approver Address format' })
  clientApproverAddress: string;

}
