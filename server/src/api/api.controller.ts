import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
  BadRequestException,
  ForbiddenException,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.guard';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { EmailVerifiedGuard } from 'src/auth/strategies/emailverified.guard';

@Controller()
export class ApiController {
  constructor(private readonly ApiService: ApiService) { }

  @Post("create_Agreement")
  async create(@Body() body: CreateAgreementDto) {
      const contract = await this.ApiService.createAgreementContract(body);
      return {
        statusCode: HttpStatus.OK,
        data: contract,
      };
    }
}