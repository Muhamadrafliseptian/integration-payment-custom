import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from '../../services/payment/payment.service';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { CreatePayment } from 'src/core/dtos/payment/create-payment.dto';
import { XenditEntity } from 'src/typeorm/entities/Xendit';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPayment(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<XenditEntity>> {
    return this.paymentService.getPayment(pageOptionsDto);
  }

  @Get('available_bank')
  @HttpCode(HttpStatus.OK)
  async getAvailableBank() {
    return this.paymentService.getAvailableBank();
  }

  @Post('virtualaccount')
  createPayment(@Body() createPaymentDto: CreatePayment) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('qrcode')
  createPaymentQr(@Body() createPaymentDto: CreatePayment) {
    return this.paymentService.createPaymentQr(createPaymentDto);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async updatePaymentStatusFromXenditCallback(
    @Body() xenditCallbackData: any,
  ): Promise<XenditEntity> {
    try {
      const { external_id, amount, payment_id } = xenditCallbackData;

      const updatedPayment =
        await this.paymentService.updatePaymentStatusByExternalId(
          external_id,
          amount,
          payment_id,
        );
      if (updatedPayment && updatedPayment.status === 'PAID') {
        return xenditCallbackData;
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (er) {
      console.error('Error updating payment status:', er);
      throw new Error('Internal Server Error');
    }
  }
}
