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
import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  server = http.createServer(express());
  io = new socketIo.Server(this.server);

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPayment(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<XenditEntity>> {
    return this.paymentService.getPayment(pageOptionsDto);
  }

  @Get('bank')
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

  @Post('ewallet')
  createPaymentEwallet(@Body() createPaymentDto: CreatePayment) {
    return this.paymentService.createPaymentEwallet(createPaymentDto);
  }

  @Post('qrcode/callback')
  @HttpCode(HttpStatus.OK)
  async updateQqrPayment(@Body() qrData: any): Promise<any> {
    try {
      const status = qrData?.data?.status;
      const reference_id = qrData?.data?.reference_id;
      const updatedPayment = await this.paymentService.updatePaymentQrStatus(
        reference_id,
        status,
      );
      console.log(qrData);
      this.io.emit('paymentUpdate', { reference_id, status });

      return {
        success: true,
        data: qrData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update payment status',
        error: error.message,
      };
    }
  }

  @Post('virtualaccount/callback')
  @HttpCode(HttpStatus.OK)
  async updatePaymentStatusFromXenditCallback(
    @Body() xenditCallbackData: any,
  ): Promise<XenditEntity> {
    try {
      if (!xenditCallbackData) {
        console.log('kosong data callback nya');
      }

      const { external_id, amount, payment_id } = xenditCallbackData;

      console.log(xenditCallbackData);

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

  @Post('ewallet/callback')
  @HttpCode(HttpStatus.OK)
  async updateEwalletPayment(@Body() ewalletData: any): Promise<any> {
    try {
      const status = ewalletData?.data?.status;
      const reference_id = ewalletData?.data?.reference_id;
      const updatedPayment = await this.paymentService.updateEwalletStatus(
        reference_id,
        status,
      );
      return {
        success: true,
        data: ewalletData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update payment status',
        error: error.message,
      };
    }
  }
}

const server = http.createServer(express()); // Use express()
const io = new socketIo.Server(server);

server.listen(3002, () => {
  console.log('Server is running on port 3002');
});
