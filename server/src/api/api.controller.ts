import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';

@Controller()
export class ApiController {
  constructor(private readonly ApiService: ApiService) {}

  @Post('create_Agreement')
  async create(@Body() body: CreateAgreementDto) {
    const contract = await this.ApiService.createAgreementContract(body);
    return {
      statusCode: HttpStatus.OK,
      data: contract,
    };
  }
}
