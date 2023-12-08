import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentParams } from 'src/utils/type';
import { In, LessThanOrEqual, Raw, Repository } from 'typeorm';
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
import { AppGateway } from 'src/core/services_modules/app.gateway';

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
    private readonly appGateway: AppGateway,
  ) {}

  async findPayment(invoice_id: string, bank_code: string): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { invoice_id, bank_code },
      });

      if (!payment) {
        return null;
      }

      const { amount, status, expiration_date } = payment;

      return { amount, bank_code, status, invoice_id, expiration_date };
    } catch (error) {
      throw error;
    }
  }

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

    const existingPayment = await this.paymentRepository.findOne({
      where: {
        invoice_id: paymentDetails.invoice_id,
        bank_code: paymentDetails.bank_code,
        expiration_date: LessThanOrEqual(expiresAt),
        status: 'PENDING',
      },
    });

    if (existingPayment) {
      console.log('error gabisa bikin va');
      return {
        success: false,
        error: {
          message: 'masih ada yang belum expired VA nya',
        },
      };
    }

    try {
      const response = await this.vaService.createCallbackVirtualAccount(
        {
          external_id: paymentDetails.external_id,
          currency: paymentDetails.currency,
          is_closed: false,
          is_single_use: true,
          bank_code: paymentDetails.bank_code,
          name: 'Hamdan Tr',
          expiration_date: expiresAt.toISOString(),
        },
        apiKey,
      );

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id: paymentDetails.external_id,
          invoice_id: 'INV-TNOS123',
          amount: response.data.amount,
          status: response.data.status,
          bank_code: response.data.bank_code,
          account_number: response.data.account_number,
          expiration_date: response.data.expiration_date,
          status_pembayaran: 'ACTIVE',
        }),
      );

      this.appGateway.sendStatusToClient(response.data.status);

      return xenditPayment;
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

    const reference_id = this.generateRandomWord();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        invoice_id: qrDetails.invoice_id,
        bank_code: qrDetails.bank_code,
        status: 'ACTIVE',
        expiration_date: LessThanOrEqual(expiresAt),
      },
    });

    if (existingPayment) {
      console.log(
        'Cannot create a new virtual account. There is an existing PENDING payment for the same invoice_id and bank_code with an unexpired expiration_date.',
      );
      return {
        success: false,
        error: {
          message:
            'Cannot create a new virtual account. There is an existing PENDING payment for the same invoice_id and bank_code with an unexpired expiration_date.',
        },
      };
    }
    try {
      const response = await this.qaService.createQrService(
        {
          reference_id,
          type: 'DYNAMIC',
          currency: qrDetails.currency,
          amount: 10000,
          channel_code: 'ID_DANA',
          expires_at: expiresAt,
        },
        apiKey,
      );

      const qrPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          reference_id: response.data.reference_id,
          currency: response.data.currency,
          external_id: response.data.external_id,
          invoice_id: 'INV-TNOS123',
          bank_code: response.data.channel_code,
          amount: response.data.amount,
          status: response.data.status,
          expiration_date: response.data.expires_at,
        }),
      );
      return qrPayment;
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
          invoice_id: 'INV-TNOS123',
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

    const statusesToDelete = ['PENDING', 'ACTIVE'];
    await this.deletePaymentsByStatus(
      updatedPayment.invoice_id,
      statusesToDelete,
    );

    return updatedPayment;
  }

  async updatePaymentStatusByExternalId(
    externalId: string,
    newAmount: number,
  ): Promise<XenditEntity> {
    try {
      let payment = await this.paymentRepository.findOne({
        where: { external_id: externalId },
      });
      if (!payment) {
        payment = this.paymentRepository.create({
          external_id: externalId,
          amount: newAmount,
          status: 'PENDING',
        });
      } else {
        payment.amount = newAmount;
        payment.status = 'PAID';
        payment.status_pembayaran = 'SUCCESS';
      }
      const updatedPayment = await this.paymentRepository.save(payment);

      const statusesToDelete = ['PENDING', 'ACTIVE'];
      await this.deletePaymentsByStatus(
        updatedPayment.invoice_id,
        statusesToDelete,
      );

      return updatedPayment;
    } catch (error) {
      throw new HttpException(
        'Failed to update payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePaymentsByStatus(
    invoiceId: string,
    statuses: string[],
  ): Promise<void> {
    try {
      console.log(
        `hapus payments untuk invoice_id ${invoiceId} dengan status ${statuses.join(
          ', ',
        )}`,
      );
      const paymentsToDelete = await this.paymentRepository.find({
        where: {
          invoice_id: invoiceId,
          status: In(statuses),
        },
      });
      for (const payment of paymentsToDelete) {
        await this.paymentRepository.delete(payment.id);
      }
      console.log(
        `berhasil hapus payments untuk invoice_id ${invoiceId} dengan statuses ${statuses.join(
          ', ',
        )}`,
      );
    } catch (error) {
      console.error(`Failed to delete payments: ${error.message}`);
      throw new HttpException(
        'Failed to delete payments',
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

    const statusesToDelete = ['PENDING', 'ACTIVE'];
    await this.deletePaymentsByStatus(
      updatedPayment.invoice_id,
      statusesToDelete,
    );

    return updatedPayment;
  }
}
