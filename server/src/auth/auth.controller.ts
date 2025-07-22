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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './strategies/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    const exists = await this.authService.checkEmail(email);
    if (exists) {
      return {
        statusCode: HttpStatus.OK,
        message: 'This email already exists in pactda',
      };
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'This email was not found in pactda',
      },
      HttpStatus.NOT_FOUND,
    );
  }
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: result,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto);
    if (!token) {
      throw new HttpException(
        { statusCode: 401, message: 'Invalid email or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const user = await this.authService.me(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @Post('send_verification_email')
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(@Req() req) {
    await this.authService.sendVerificationEmail(req.user.id);
    return { statusCode: 200, message: 'Verification email sent successfully' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token || token.trim() === '') {
      throw new BadRequestException('Missing token');
    }

    await this.authService.verifyEmail(token);
    return { statusCode: 200, message: 'Email verified successfully' };
  }

  @Post('google/login')
  async googleLogin(@Body('code') code: string) {
    if (!code) throw new BadRequestException('Code is required');
    return await this.authService.validateGoogleUser(code);
  }
}
