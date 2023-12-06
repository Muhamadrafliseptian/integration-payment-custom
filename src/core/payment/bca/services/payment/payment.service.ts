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
  QrCodeService,
  EWalletService,
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
    private readonly qaService: QrCodeService,
    private readonly ewalletService: EWalletService,
  ) { }

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
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1);
    try {
      const response = await this.vaService.createCallbackVirtualAccount(
        {
          external_id: paymentDetails.external_id,
          currency: paymentDetails.currency,
          is_closed: false,
          is_single_use: true,
          bank_code: paymentDetails.bank_code,
          name: 'Hamdan Tr',
          expiration_date: expiresAt,
        },
        apiKey,
      );

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id: paymentDetails.external_id,
          amount: response.data.amount,
          status: response.data.status,
          bank_code: response.data.bank_code,
          account_number: response.data.account_number,
          expiration_date: response.data.expiration_date,
        }),
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const { error_code, message } = error.response.data;
        return {
          success: false,
          error: {
            code: error_code,
            message: message,
          },
        };
      }

      throw { success: false, error: { message: 'An error occurred' } };
    }
  }

  async createPaymentQr(qrDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const { currency } = qrDetails;

    const reference_id = this.generateRandomWord();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1);

    try {
      const response = await this.qaService.createQrService(
        {
          reference_id,
          type: 'DYNAMIC',
          currency,
          amount: 10000,
          channel_code: 'ID_DANA',
          expires_at: expiresAt,
        },
        apiKey,
      );

      const qrPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          reference_id: response.data.reference_id,
          currency,
          bank_code: response.data.channel_code,
          amount: response.data.amount,
          status: response.data.status,
          expiration_date: response.data.expires_at,
        }),
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const { error_code, message } = error.response.data;
        return {
          success: false,
          error: {
            code: error_code,
            message: message,
          },
        };
      }
    }
  }

  private generateRandomWord(length = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async createPaymentEwallet(ewalletDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const { external_id, currency, channel_code, mobile_number } =
      ewalletDetails;
    const referenceId = `tnos-${Date.now()}`;

    try {
      const response = await this.ewalletService.createEwalletService(
        {
          currency: 'IDR',
          reference_id: referenceId,
          amount: 20000,
          checkout_method: 'ONE_TIME_PAYMENT',
          channel_code,
          channel_properties: {
            mobile_number,
            success_redirect_url: 'http://127.0.0.1:3000/',
          },
        },
        apiKey,
      );
      const ewalletPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id,
          currency,
          reference_id: response.data.reference_id,
          amount: response.data.charge_amount,
          bank_code: response.data.channel_code,
          status: response.data.status,
        }),
      );
      return response.data;
    } catch (err) {
      console.log('error');
      console.log(err);
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

  async updatePaymentQrStatus(
    referenceId: string,
    newStatus: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { reference_id: referenceId },
    });

    if (!payment) {
      console.log(payment);
      throw new HttpException('reference id not found', HttpStatus.NOT_FOUND);
    }

    payment.status = newStatus;

    const updatedPayment = await this.paymentRepository.save(payment);

    return updatedPayment;
  }

  async updatePaymentStatusByExternalId(
    externalId: string,
    newAmount: number,
    newPaymentId: string,
  ): Promise<XenditEntity> {
    try {
      let payment = await this.paymentRepository.findOne({
        where: { external_id: externalId },
      });
      if (!payment) {
        payment = this.paymentRepository.create({
          external_id: externalId,
          amount: newAmount,
          invoice_id: newPaymentId,
          status: 'PENDING',
        });
      } else {
        payment.amount = newAmount;
        payment.invoice_id = newPaymentId;
        payment.status = 'PAID';
      }
      const updatedPayment = await this.paymentRepository.save(payment);
      return updatedPayment;
    } catch (error) {
      throw new HttpException(
        'Failed to update payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateEwalletStatus(
    referenceId: string,
    newStatus: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { reference_id: referenceId },
    });

    if (!payment) {
      console.log(payment);
      throw new HttpException('reference id not found', HttpStatus.NOT_FOUND);
    }

    payment.status = newStatus;

    const updatedPayment = await this.paymentRepository.save(payment);

    return updatedPayment;
  }
}
