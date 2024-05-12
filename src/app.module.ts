import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcaModule } from './core/payment/bca/bca/bca.module';
import { XenditEntity } from './typeorm/entities/Xendit';
import { PaymentConfigModule } from './core/module/config/config.module';
import { ChannelEwalletEntity } from './typeorm/entities/ChannelEwallet';
import { ChannelEwalletModule } from './core/payment/channel_ewallet/channel_ewallet.module';
import { SchedulerModule } from './core/module/scheduler/scheduler.module';
import { QrCodeModule } from './core/payment/qr_code/qr_code.module';
import { ChannelQrCode } from './typeorm/entities/ChannelQr';

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
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>(
          'DB_NAME',
          'db_payment_integration',
        ),
        entities: [
          XenditEntity,
          ChannelEwalletEntity,
          ChannelQrCode,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    BcaModule,
    ConfigModule,
    ChannelEwalletModule,
    SchedulerModule,
    QrCodeModule,
  ],
  providers: [],
})
export class AppModule {}
