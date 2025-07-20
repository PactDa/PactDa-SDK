import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        const oauth2Client = new OAuth2(
          process.env.GMAIL_CLIENT_ID,
          process.env.GMAIL_CLIENT_SECRET,
          'https://developers.google.com/oauthplayground' 
        );

        oauth2Client.setCredentials({
          refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        });

        const accessToken = await oauth2Client.getAccessToken();

        return {
          transport: {
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.EMAIL_USER,
              clientId: process.env.GMAIL_CLIENT_ID,
              clientSecret: process.env.GMAIL_CLIENT_SECRET,
              refreshToken: process.env.GMAIL_REFRESH_TOKEN,
              accessToken: accessToken.token,
            },
          },
          defaults: {
            from: `"Pactda Support" <${process.env.EMAIL_USER}>`,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
