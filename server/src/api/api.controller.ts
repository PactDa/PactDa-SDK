import { Controller, Post, Body, HttpStatus, Headers, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { FundEscrowDto } from './dto/fund-the-escrow.dto';
import { ApiKeyGuard } from 'src/auth/strategies/api-key-guard.guard';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) { }

  @UseGuards(ApiKeyGuard)
  @Post('create-agreement')
  async create(
    @Headers('authorization') authHeader: string,
    @Body() body: CreateAgreementDto
  ) {
    const contract = await this.apiService.createAgreementContract(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }

  @UseGuards(ApiKeyGuard)
  @Post('fund-the-escrow')
  async fund(
    @Headers('authorization') authHeader: string,
    @Body() body: FundEscrowDto
  ) {
    const contract = await this.apiService.FundEscrow(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }

}
