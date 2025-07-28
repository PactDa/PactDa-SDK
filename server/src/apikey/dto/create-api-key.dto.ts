import { IsDateString, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateApiKeyDto {
  @IsOptional()
  @IsDateString()
  expired_at?: string;

  @IsOptional()
  @IsInt()
  quota?: number;

  @IsOptional()
  @IsArray()
  permission: number[];
}