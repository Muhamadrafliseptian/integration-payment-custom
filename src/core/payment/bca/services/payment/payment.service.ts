import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentParams } from 'src/utils/type';
import { Repository } from 'typeorm';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { PageMetaDto } from 'src/core/dtos/pagination/page-meta.dto';
import { XenditEntity } from 'src/typeorm/entities/Xendit';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(XenditEntity)
    private readonly paymentRepository: Repository<XenditEntity>,
    private readonly configService: ConfigService,
  ) {}

  public async getPayment(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<XenditEntity>> {
    const queryBuilder =
      this.paymentRepository.createQueryBuilder('payment_xendits');

    queryBuilder
      .orderBy('payment_xendits.created_at', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async createPayment(paymentDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const { external_id, amount, currency } = paymentDetails;

    try {
      const response: AxiosResponse = await axios.post(
        // 'https://api.xendit.co/v2/invoices',
        'https://api.xendit.co/payment_requests',
        {
          amount,
          external_id,
          currency,
          is_single_use: true,
          payment_method: {
            type: 'VIRTUAL_ACCOUNT',
            reusability: 'ONE_TIME_USE',
            virtual_account: {
              channel_code: 'BSI',
              channel_properties: {
                customer_name: 'Hamdan',
              },
            },
          },
        },
        { auth: { username: apiKey, password: '' } },
      );

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id: response.data.external_id,
          business_id: response.data.business_id,
          amount: response.data.amount,
          status: response.data.status,
        }),
      );
      await this.paymentRepository.save(xenditPayment);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        console.error('Axios error:', axiosError);
      } else {
        console.error('Non-Axios error:', error.message);
      }
      throw error;
    }
  }

  async updatePaymentStatusByExternalId(
    referenceId: string,
    newStatus: string,
    bankCode: string,
    paymentMethod: string,
    paymentChannel: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { external_id: referenceId },
    });

    if (!payment) {
      console.error(`ga ketemu external id nya: ${referenceId}`);
      throw new HttpException('external id not found', HttpStatus.NOT_FOUND);
    }

    payment.status = newStatus;
    payment.bank_code = bankCode;
    payment.payment_method = paymentMethod;
    payment.payment_channel = paymentChannel;

    const updatedPayment = await this.paymentRepository.save(payment);

    const responsePayload = {
      id: updatedPayment.id,
      external_id: updatedPayment.external_id,
      status: updatedPayment.status,
      payment_method: updatedPayment.payment_method,
      bank_code: updatedPayment.bank_code,
      payment_channel: updatedPayment.payment_channel,
    };

    return responsePayload;
  }
}
