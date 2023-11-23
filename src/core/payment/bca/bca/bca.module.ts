import { Module } from '@nestjs/common';
import { PaymentController } from '../controller/payment/payment.controller';
import { PaymentService } from '../services/payment/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([XenditEntity]), ConfigModule.forRoot()],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class BcaModule {}
