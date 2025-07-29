import { Controller, Post, Body, HttpStatus, Headers, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { ApiKeyGuard } from 'src/auth/strategies/apikeyguard.guard';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @UseGuards(ApiKeyGuard)
  @Post('create-agreement')
  async create(
    @Headers('pactda-api-key') apiKey: string,
    @Body() body: CreateAgreementDto
  ) {
    const contract = await this.apiService.createAgreementContract(body, apiKey);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }
}
