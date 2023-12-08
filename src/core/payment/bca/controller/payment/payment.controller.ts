import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from '../../services/payment/payment.service';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { CreatePayment } from 'src/core/dtos/payment/create-payment.dto';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { AppGateway } from 'src/core/services_modules/app.gateway';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private readonly appGateway: AppGateway,
  ) {}

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

  @Get(':invoice_id/:bank_code/get')
  async findPayment(
    @Param('invoice_id') invoice_id: string,
    @Param('bank_code') bank_code: string,
  ): Promise<XenditEntity> {
    const paymentDetails = await this.paymentService.findPayment(
      invoice_id,
      bank_code,
    );
    if (!paymentDetails) {
      console.log('Unable to find payment');
    } else {
      return paymentDetails;
    }
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
      this.appGateway.sendStatusToClient(updatedPayment.status);
      console.log(qrData);
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

      const { external_id, amount } = xenditCallbackData;

      const updatedPayment =
        await this.paymentService.updatePaymentStatusByExternalId(
          external_id,
          amount,
        );

      if (
        updatedPayment &&
        updatedPayment.status === 'PAID' &&
        updatedPayment.status_pembayaran === 'SUCCESS'
      ) {
        this.appGateway.sendStatusToClient(updatedPayment.status);
        return xenditCallbackData;
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (er) {
      console.error('Error updating payment status:', er);
      throw new Error('Internal Server Errorrr');
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
      this.appGateway.sendStatusToClient(updatedPayment.status);
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
