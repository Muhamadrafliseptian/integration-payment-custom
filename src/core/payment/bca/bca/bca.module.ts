import { Module } from '@nestjs/common';
import { PaymentController } from '../controller/payment/payment.controller';
import { PaymentService } from '../services/payment/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TestPayments } from 'src/typeorm/entities/TestingPayment';

@Module({
  imports: [TypeOrmModule.forFeature([TestPayments]), ConfigModule.forRoot()],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class BcaModule {}
