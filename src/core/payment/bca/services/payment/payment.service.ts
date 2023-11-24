import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TestPaymentsParams } from 'src/utils/type';
import { TestPayments } from 'src/typeorm/entities/TestingPayment';
import { Repository } from 'typeorm';
import axios, { AxiosResponse, AxiosError } from 'axios';
// import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/core/dtos/pagination/page-option.dto';
import { PageDto } from 'src/core/dtos/pagination/page.dto';
import { PageMetaDto } from 'src/core/dtos/pagination/page-meta.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(TestPayments)
    private readonly paymentRepository: Repository<TestPayments>,
    private readonly configService: ConfigService,
  ) {}

  public async getPayment(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<TestPayments>> {
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

  async createPayment(paymentDetails: TestPaymentsParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const { external_id, amount, currency } = paymentDetails;

    try {
      const response: AxiosResponse = await axios.post(
        'https://api.xendit.co/v2/invoices',
        {
          external_id,
          amount,
          currency,
          is_single_use: true,
        },
        { auth: { username: apiKey, password: '' } },
      );

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id: response.data.external_id,
          amount: response.data.amount,
          status: response.data.status,
          invoice_url: response.data.invoice_url,
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
}
