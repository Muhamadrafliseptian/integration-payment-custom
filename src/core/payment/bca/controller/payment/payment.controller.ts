import { Controller, Post } from '@nestjs/common';
import { PaymentService } from '../../services/payment/payment.service';
// import { ApiKeyMiddleware } from 'src/api-key/api-key.middleware';

@Controller('payment')
// @UseGuards(ApiKeyMiddleware)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @Post()
  CreatePayment() {
    return 'test';
  }
}
