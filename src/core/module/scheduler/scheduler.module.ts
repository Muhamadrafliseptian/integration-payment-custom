import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import {
  AvailableBankServices,
  EWalletService,
  QrCodeService,
  VirtualAccountService,
} from 'src/core/services_modules/va-services';
import { AppGateway } from 'src/core/services_modules/app.gateway';
import { PaymentService } from '../../payment/bca/services/payment/payment.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentSchedulerService } from '../../services_modules/scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([XenditEntity]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
  ],
  providers: [
    PaymentService,
    VirtualAccountService,
    AvailableBankServices,
    EWalletService,
    QrCodeService,
    AppGateway,
    PaymentSchedulerService,
  ],
})
export class SchedulerModule {}
