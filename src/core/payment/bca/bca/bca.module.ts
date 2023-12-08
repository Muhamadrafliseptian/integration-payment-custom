import { Module } from '@nestjs/common';
import { PaymentController } from '../controller/payment/payment.controller';
import { PaymentService } from '../services/payment/payment.service';
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

@Module({
  imports: [TypeOrmModule.forFeature([XenditEntity]), ConfigModule.forRoot()],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    VirtualAccountService,
    AvailableBankServices,
    EWalletService,
    QrCodeService,
    AppGateway,
  ],
})
export class BcaModule {}
