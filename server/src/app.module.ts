import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CreditModule } from './credit/credit.module';
import { PaymentModule } from './payment/payment.module';
import { ApiKeyModule } from './apikey/api-key.module';
import { ApiModule } from './api/api.module';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres', 
      port: 5432,
      username: 'admin',
      password: '11223344',
      database: 'Pactda_DB',
      autoLoadEntities: true,
      synchronize: true, 
    }),
    UserModule,
    CreditModule,
    PaymentModule,
    ApiKeyModule,
    ApiModule,
    PermissionModule,
  ],
})
export class AppModule {}
