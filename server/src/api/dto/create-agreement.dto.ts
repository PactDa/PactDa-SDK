import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class CreateAgreementDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  partyAddresses: string[]; 

  @IsString()
  @IsNotEmpty()
  contractTitle: string;

  @IsString()
  @IsNotEmpty()
  creatorAddress: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
