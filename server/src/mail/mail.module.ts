import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', 
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      },
      defaults: {
        from: `"Pactda Support" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],  
})
export class MailModule {}
