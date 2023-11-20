import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './typeorm/entities/User';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'RafliKece26_',
      database: 'db_integration_payment',
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
  ],
  providers: [AppService],
})
export class AppModule {}
