import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentParams } from 'src/utils/type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { PageMetaDto } from 'src/core/dtos/pagination/page-meta.dto';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import {
  VirtualAccountService,
  AvailableBankServices,
} from 'src/core/services_modules/va-services';
import axios, { AxiosError } from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(XenditEntity)
    private readonly paymentRepository: Repository<XenditEntity>,
    private readonly configService: ConfigService,
    private readonly vaService: VirtualAccountService,
    private readonly listBankService: AvailableBankServices,
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

  public async getAvailableBank() {
    try {
      const apiKey = this.configService.get<string>('XENDIT_API_KEY');
      const response = await this.listBankService.getBanks(apiKey);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async createPayment(paymentDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const { external_id, currency, bank_code } = paymentDetails;

    try {
      const response = await this.vaService.createCallbackVirtualAccount(
        {
          external_id,
          currency,
          is_closed: true,
          is_single_use: true,
          bank_code,
          expected_amount: 10000,
          name: 'Hamdan',
        },
        apiKey,
      );

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id,
          amount: response.data.amount,
          status: response.data.status,
          bank_code: response.data.bank_code,
          account_number: response.data.account_number,
          expiration_date: response.data.expiration_date,
        }),
      );
      console.log(xenditPayment);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private handleAxiosError(error: any): void {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      console.error('Axios error:', axiosError);
    } else {
      console.error('Non-Axios error:', error.message);
    }
  }

  async updatePaymentStatusByExternalId(
    externalId: string,
    newStatus: string,
    newAmount: number,
  ): Promise<XenditEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { external_id: externalId },
    });

    if (!payment) {
      console.error(`Payment not found for external_id: ${externalId}`);
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    try {
      payment.status = newStatus;
      payment.amount = newAmount;

      return await this.paymentRepository.save(payment);
    } catch (error) {
      console.error('Error updating payment:', error.message);
      throw new HttpException(
        'Failed to update payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
