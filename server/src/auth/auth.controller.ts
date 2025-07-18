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
    constructor(private readonly authService: AuthService) { }

    @Get('check-email/:email')
    async checkEmail(@Param('email') email: string) {
        const exists = await this.authService.checkEmail(email);
        if (exists) {
            return { statusCode: HttpStatus.OK, message: 'This email already exists in pactda' };
        }
        throw new HttpException(
            { statusCode: HttpStatus.NOT_FOUND, message: 'This email was not found in pactda' },
            HttpStatus.NOT_FOUND,
        );
    }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        try {
            const result = await this.authService.register(dto);
            return { statusCode: HttpStatus.CREATED, message: 'User created successfully', data: result };
        } catch (error) {
            if (error.code === '23505') {
                // PostgreSQL duplicate error
                throw new HttpException({ statusCode: 409, message: 'Email already exists' }, HttpStatus.CONFLICT);
            }
            throw new HttpException({ statusCode: 500, message: 'Internal Server Error' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const token = await this.authService.login(dto);
        if (!token) {
            throw new HttpException({ statusCode: 401, message: 'Invalid email or password' }, HttpStatus.UNAUTHORIZED);
        }
        return { statusCode: HttpStatus.OK, message: 'Login successful', data: token };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req) {
        return { statusCode: HttpStatus.OK, data: req.user };
    }

    @Post('send_verification_email')
    @UseGuards(JwtAuthGuard)
    async sendVerificationEmail(@Req() req) {
        await this.authService.sendVerificationEmail(req.user.id);
        return { statusCode: 200, message: 'Verification email sent successfully' };
    }

    @Post('verify-email')
    async verifyEmail(@Query('token') token: string) {
        if (!token || token.trim() === '') {
            throw new BadRequestException('Missing token');
        }

        await this.authService.verifyEmail(token);
        return { statusCode: 200, message: 'Email verified successfully' };
    }
}
