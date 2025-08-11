import { Controller, Post, Body, HttpStatus, Headers, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { FundEscrowDto } from './dto/fund-the-escrow.dto';
import { ApiKeyGuard } from 'src/auth/strategies/api-key-guard.guard';
import { AddMilestone } from './dto/add-milestone.dto';
import { completeMilestone } from './dto/complete-milestone.dto';
import { ApproveMilestone } from './dto/approve-milestone.dto';
import { WithdrawMilestonePayment } from './dto/withdraw-milestone-payment.dto';

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

  @UseGuards(ApiKeyGuard)
  @Post('add-milestone')
  async createMilestone(
    @Headers('authorization') authHeader: string,
    @Body() body: AddMilestone
  ) {
    const contract = await this.apiService.addMilestone(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }

  @UseGuards(ApiKeyGuard)
  @Post('complete-milestone')
  async completeMilestone(
    @Headers('authorization') authHeader: string,
    @Body() body: completeMilestone
  ) {
    const contract = await this.apiService.completeMilestone(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }

  @UseGuards(ApiKeyGuard)
  @Post('approve-milestone')
  async approveMilestone(
    @Headers('authorization') authHeader: string,
    @Body() body: ApproveMilestone
  ) {
    const contract = await this.apiService.approveMilestone(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }

  @UseGuards(ApiKeyGuard)
  @Post('withdraw-milestone-payment')
  async withdrawMilestonePayment(
    @Headers('authorization') authHeader: string,
    @Body() body: WithdrawMilestonePayment
  ) {
    const contract = await this.apiService.withdrawMilestonePayment(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }


}
