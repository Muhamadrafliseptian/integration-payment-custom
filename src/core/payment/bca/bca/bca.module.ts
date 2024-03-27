import { Module } from '@nestjs/common';
import { PaymentController } from '../controller/payment/payment.controller';
import { PaymentService } from '../services/payment/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { AsymmetricSignatureService } from '../services/asymetric-signature/asymetric-signature.service';
import { AccessTokenService } from '../services/access-token/access-token.service';
import {
  AvailableBankServices,
  EWalletService,
  QrCodeService,
  VirtualAccountService,
  LinkedDebitService,
  LinkOtpDebitService,
  AccessTokenPoint,
} from 'src/core/services_modules/endpoint-service';
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
    LinkedDebitService,
    LinkOtpDebitService,
    AppGateway,
    AsymmetricSignatureService,
    AccessTokenService,
    AccessTokenPoint,
  ],
})
export class BcaModule {}
