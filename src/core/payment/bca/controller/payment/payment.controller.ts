import {
  Body,
  Controller,
  // Get,
  // HttpCode,
  // HttpStatus,
  Post,
  // Query,
} from '@nestjs/common';
import { PaymentService } from '../../services/payment/payment.service';
import { CreatePayment } from 'src/core/dtos/payment/create-payment.dto';
// import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
// import { PageDto } from 'src/core/dtos/pagination/page.dto';
// import { XenditEntity } from 'src/typeorm/entities/Xendit';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async getUsers(
  //   @Query() pageOptionsDto: PageOptionsDto,
  // ): Promise<PageDto<XenditEntity>> {
  //   return this.paymentService.getPayment(pageOptionsDto);
  // }

  @Post()
  createPayment(@Body() createPaymentDto: CreatePayment) {
    this.paymentService.createPayment(createPaymentDto);
  }
}
