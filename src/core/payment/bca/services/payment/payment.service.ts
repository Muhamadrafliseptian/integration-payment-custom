import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { Repository } from 'typeorm';
import { PaymentParams } from 'src/utils/type';
@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(XenditEntity)
    private paymentRepository: Repository<XenditEntity>,
  ) {}
  createPayment(paymentDetails: PaymentParams) {
    const newUser = this.paymentRepository.create({
      ...paymentDetails,
    });
    return this.paymentRepository.save(newUser);
  }
}
