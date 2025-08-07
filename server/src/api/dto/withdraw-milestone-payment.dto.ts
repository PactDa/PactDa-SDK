import { IsString, IsNumber, IsNotEmpty, Matches, Min } from 'class-validator';

export class WithdrawMilestonePayment {
    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid contract ID format' })
    contractId: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid escrow ID format' })
    escrowId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Milestone Id must be at least 1' })
    milestoneId: number;

    @IsString()
    @IsNotEmpty()
    @Matches(/^0x[a-fA-F0-9]{16,64}$/, { message: 'Invalid Recipient User Address format' })
    recipientUserAddress: string;

}
