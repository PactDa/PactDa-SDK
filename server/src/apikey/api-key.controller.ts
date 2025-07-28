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
  NotFoundException,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.guard';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { EmailVerifiedGuard } from 'src/auth/strategies/emailverified.guard';

@Controller('api_keys')
export class ApiKeysController {
  constructor(private readonly apiKeyService: ApiKeyService) { }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get()
  async get_api_keys(@Req() req) {
    const api_keys = await this.apiKeyService.findByUserId(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      data: api_keys,
    };
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post("create")
  async create(@Req() req, @Body() body: CreateApiKeyDto) {
    const api_keys = await this.apiKeyService.create(req.user.id, body);
    return {
      statusCode: HttpStatus.OK,
      data: api_keys,
    };
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get("show_keys/:id")
  async decrypt_api_keys(@Req() req, @Param('id') id: number) {
    const apiKey = await this.apiKeyService.findOne(id);

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }
    if (apiKey.user.id !== req.user.id) {
      throw new ForbiddenException('You are not authorized to access this API Key');
    }
    const decrypted_api_keys = await this.apiKeyService.decryptWithIv(apiKey.api_key_encrypt);
    return {
      statusCode: HttpStatus.OK,
      data: decrypted_api_keys,
    };
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Patch("revoke/:id")
  async revoke_api_keys(@Req() req, @Param('id') id: number) {
    const apiKey = await this.apiKeyService.findOne(id);

    if (!apiKey || apiKey.user !== req.user.id) {
      throw new ForbiddenException('You are not authorized to access this API Key');
    }
    const revoke_api_keys = await this.apiKeyService.revoke(id);
    return {
      statusCode: HttpStatus.OK,
      data: revoke_api_keys,
    };
  }
}
