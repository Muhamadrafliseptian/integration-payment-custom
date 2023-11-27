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

  @Post()
  createPayment(@Body() createPaymentDto: CreatePayment) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async updatePaymentStatusFromXenditCallback(
    @Body() xenditCallbackData: any,
  ): Promise<any> {
    try {
      // const {
      //   status,
      //   external_id,
      //   bank_code,
      //   payment_method,
      //   payment_channel,
      // } = xenditCallbackData;

      // console.log('Received Xendit Callback Data:', xenditCallbackData);

      // if (!status || !external_id) {
      //   throw new Error('Invalid callback data. Missing required fields.');
      // }

      // const updatedPayment =
      //   await this.paymentService.updatePaymentStatusByExternalId(
      //     external_id,
      //     status,
      //     bank_code,
      //     payment_method,
      //     payment_channel,
      //   );

      return {
        success: true,
        data: xenditCallbackData,
      };
    } catch (error) {
      console.error('Error updating payment status:', error.message);
      return {
        success: false,
        message: 'Failed to update payment status',
        error: error.message,
      };
    }
  }
}
