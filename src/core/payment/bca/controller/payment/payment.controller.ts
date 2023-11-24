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
import { TestPayments } from 'src/typeorm/entities/TestingPayment';
import { TestPaymentsDto } from 'src/core/dtos/payment/test-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPayment(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TestPayments>> {
    return this.paymentService.getPayment(pageOptionsDto);
  }

  @Post()
  createPayment(@Body() createPaymentDto: TestPaymentsDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async updatePaymentStatusFromXenditCallback(
    @Body() xenditCallbackData: any,
  ): Promise<TestPayments> {
    const { status, external_id } = xenditCallbackData;

    return await this.paymentService.updatePaymentStatusByExternalId(
      external_id,
      status,
    );
  }
}
