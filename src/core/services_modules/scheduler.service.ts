import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentService } from '../payment/bca/services/payment/payment.service';

@Injectable()
export class PaymentSchedulerService {
  constructor(private readonly paymentService: PaymentService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPayments() {
    try {
      await this.paymentService.deleteExpiredPayments();
    } catch (error) {
      console.error(
        'Error in handling expired payments:',
        error.message || error,
      );
    }
  }
}
