import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
})
export class AppModule {}
