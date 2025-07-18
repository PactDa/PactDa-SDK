import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.DOMAIN}/api/auth/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to,
      subject: 'Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a></p>`,
    });
  }
}
