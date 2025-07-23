import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import axios, { AxiosError } from 'axios';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/environment.validation';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async checkEmail(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    return !!user;
  }

  async register(dto: RegisterDto): Promise<User> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = this.userRepo.create({
      ...dto,
      password_hash: hashedPassword,
    });

    return await this.userRepo.save(newUser);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string } | null> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (user && (await bcrypt.compare(dto.password, user.password_hash))) {
      const payload = { sub: user.id, email: user.email };
      return { accessToken: this.jwtService.sign(payload) };
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async me(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async sendVerificationEmail(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.is_email_verified) {
      throw new ConflictException('Email already verified');
    }

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // Token will expire in the next 15 minutes

    user.metadata = {
      ...user.metadata,
      email_verification: {
        token,
        expiry,
      },
    };

    await this.userRepo.save(user);
    await this.mailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where(`user.metadata -> 'email_verification' ->> 'token' = :token`, {
        token,
      })
      .getOne();

    if (!user) throw new BadRequestException('Invalid or missing token');

    const meta = user.metadata?.email_verification;
    if (!meta || meta.token !== token) {
      throw new BadRequestException('Invalid token');
    }

    if (new Date(meta.expiry) < new Date()) {
      throw new GoneException('Token expired');
    }

    if (user.is_email_verified) {
      throw new ConflictException('Email already verified');
    }

    user.is_email_verified = true;
    user.metadata.email_verification = null;

    await this.userRepo.save(user);

    return { message: 'Email verified successfully' };
  }

  async validateGoogleUser(code: string): Promise<{ accessToken: string }> {
    if (!code) throw new BadRequestException('Missing authorization code');

    const timeout = this.configService.get('EXTERNAL_API_TIMEOUT_MS', {
      infer: true,
    });
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = this.configService.get('GOOGLE_REDIRECT_URI');

    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      throw new ServiceUnavailableException('Google OAuth is not configured');
    }

    try {
      // Exchange code for access token with timeout
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        null,
        {
          params: {
            code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: googleRedirectUri,
            grant_type: 'authorization_code',
          },
          timeout,
        },
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new BadRequestException('Invalid authorization code');
      }

      // Get user profile with timeout
      const profileResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
          timeout,
        },
      );

      const profile = profileResponse.data;

      if (!profile?.email) {
        throw new BadRequestException('Unable to retrieve user profile');
      }

      let user = await this.userRepo.findOne({
        where: { email: profile.email },
      });

      if (!user) {
        user = this.userRepo.create({
          username: profile.name || profile.email.split('@')[0],
          email: profile.email,
          is_email_verified: profile.verified_email || false,
          metadata: {
            googleId: profile.id,
            name: profile.name,
            picture: profile.picture,
            given_name: profile.given_name,
            family_name: profile.family_name,
            locale: profile.locale,
          },
        });
        user = await this.userRepo.save(user);
      }

      const payload = { sub: user.id, email: user.email };
      return { accessToken: this.jwtService.sign(payload) };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new ServiceUnavailableException('Google OAuth service timeout');
        }
        if (error.response?.status === 400) {
          throw new BadRequestException(
            'Invalid authorization code or OAuth configuration',
          );
        }
        throw new ServiceUnavailableException(
          'Google OAuth service temporarily unavailable',
        );
      }
      throw error;
    }
  }
}
