import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from '../../services/payment/payment.service';
import { CreatePayment } from 'src/core/dtos/payment/create-payment.dto';
// import { ApiKeyMiddleware } from 'src/api-key/api-key.middleware';
// @UseGuards(ApiKeyMiddleware)

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
  @Post()
  createPayment(@Body() createPaymentDto: CreatePayment) {
    this.paymentService.createPayment(createPaymentDto);
  }
}
