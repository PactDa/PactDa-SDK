import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) { }

    async checkEmail(email: string): Promise<boolean> {
        const user = await this.userRepo.findOne({ where: { email } });
        return !!user;
    }

    async register(dto: RegisterDto): Promise<User> {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) throw new ConflictException('Email already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const newUser = this.userRepo.create({ ...dto, password_hash: hashedPassword });
        return this.userRepo.save(newUser);
    }

    async login(dto: LoginDto): Promise<{ accessToken: string } | null> {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (user && (await bcrypt.compare(dto.password, user.password_hash))) {
            const payload = { sub: user.id, email: user.email };
            return { accessToken: this.jwtService.sign(payload) };
        }
        throw new UnauthorizedException('Invalid email or password');
    }

    async sendVerificationEmail(userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        if (user.is_email_verified) {
            throw new ConflictException('Email already verified');
        }

        const token = randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

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
            .where(`user.metadata -> 'email_verification' ->> 'token' = :token`, { token })
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
}
