// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { LayananModule } from './core/layanan/layanan.module';
import { RolesModule } from './core/roles/roles.module';
import { BcaModule } from './core/payment/bca/bca/bca.module';
import { User } from './typeorm/entities/User';
import { Layanan } from './typeorm/entities/Layanan';
import { Role } from './typeorm/entities/Roles';
import { XenditEntity } from './typeorm/entities/Xendit';
import { PaymentConfigModule } from './core/module/config/config.module';
import { TestPayments } from './typeorm/entities/TestingPayment';
import { ChannelEwalletEntity } from './typeorm/entities/ChannelEwallet';
import { ChannelEwalletModule } from './core/payment/channel_ewallet/channel_ewallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [PaymentConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'RafliKece26_'),
        database: configService.get<string>(
          'DB_NAME',
          'db_integration_payment',
        ),
        entities: [
          User,
          Layanan,
          Role,
          XenditEntity,
          TestPayments,
          ChannelEwalletEntity,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LayananModule,
    RolesModule,
    BcaModule,
    ConfigModule,
    ChannelEwalletModule,
  ],
  providers: [],
})
export class AppModule {}
