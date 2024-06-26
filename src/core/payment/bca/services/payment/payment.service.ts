import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentParams, LinkedAccountParams } from 'src/utils/type';
import { In, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { XenditEntity } from '../../../../../typeorm/entities/Xendit';
import {
  VirtualAccountService,
  AvailableBankServices,
  QrCodeService,
  EWalletService,
  LinkedDebitService,
  LinkOtpDebitService,
  QrCodeServiceDataGet
} from '../../../../services_modules/endpoint-service';
import axios, { AxiosError } from 'axios';
import { AppGateway } from '../../../../services_modules/app.gateway';
import * as CryptoJS from "crypto-js"
import { log } from 'console';

@Injectable()
export class PaymentService {

  private readonly key: string = "U2FsdGVkX1+RFxINtDchhPqAxYecNts3Di1tTgbwHg0=";

  constructor(
    @InjectRepository(XenditEntity)
    private readonly paymentRepository: Repository<XenditEntity>,
    private readonly qaServiceGet: QrCodeServiceDataGet,
    private readonly configService: ConfigService,
    private readonly vaService: VirtualAccountService,
    private readonly listBankService: AvailableBankServices,
    private readonly qaService: QrCodeService,
    private readonly ewalletService: EWalletService,
    private readonly linkedDebitService: LinkedDebitService,
    private readonly linkedOtpService: LinkOtpDebitService,
    private readonly appGateway: AppGateway,
  ) { }

  private encryptData(data: any): string {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), this.key).toString();
    return encryptedData;
  }

  decryptData(encryptedData: string): any {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }

  async findPayment(
    invoice_id: string,
    bank_code: string,
    external_id: string,
  ): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { invoice_id, bank_code, external_id },
      });

      if (!payment) {
        return {
          message:
            'Maaf bank yang kamu pilih sedang tidak tersedia atau sudah expired',
        };
      }

      const { amount, status, expiration_date, account_number } = payment;

      const convert = { amount, bank_code, status, invoice_id, expiration_date, external_id, account_number };
      const encrypt = this.encryptData(convert)

      return encrypt;

    } catch (error) {
      throw error;
    }
  }

  async findPaymentIdAll(invoice_id: string): Promise<any> {
    try {
      const payments = await this.paymentRepository.find({
        where: { invoice_id },
      });

      if (!payments || payments.length === 0) {
        return [{ message: 'No payments found for the specified invoice_id' }];
      }
      const formattedPayments = payments.map((payment) => {
        const {
          amount,
          status_pembayaran,
          expiration_date,
          account_number,
          bank_code,
          external_id,
        } = payment;

        return {
          amount,
          bank_code,
          status_pembayaran,
          invoice_id,
          expiration_date,
          external_id,
          account_number,
        };
      });

      return { data: formattedPayments };
    } catch (error) {
      throw error;
    }
  }

  async getAvailableBank() {
    try {
      const apiKey = this.configService.get<string>('XENDIT_API_KEY');
      const response = await this.listBankService.getBanks(apiKey);
      const encrypted = this.encryptData(response.data)
      return encrypted;
    } catch (err) {
      throw err;
    }
  }

  async getQrCodeOne(id: string) {
    try {
      const apiKey = this.configService.get<string>('XENDIT_API_KEY');
      const response = await this.qaServiceGet.getQrCodeById(apiKey, id);
      return response
    } catch (err) {
      console.log(err);
      
      throw err;
    }
  }

  async createVirtualAccount(paymentDetails: TestPaymentXendit): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('XENDIT_API_KEY');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const response = await this.vaService.createCallbackVirtualAccount(
        {
          external_id: paymentDetails.external_id,
          currency: paymentDetails.currency,
          is_closed: true,
          is_single_use: true,
          expected_amount: paymentDetails.amount,
          bank_code: paymentDetails.bank_code,
          name: 'Hamdan Tr',
          expiration_date: expiresAt,
        },
        apiKey,
      );

      console.log("Pembayaran Custom");
      console.log(response);

      const xenditPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id: paymentDetails.external_id,
          invoice_id: 'INV-TNOS123',
          amount: response.data.expected_amount,
          status: response.data.status,
          bank_code: response.data.bank_code,
          account_number: response.data.account_number,
          expiration_date: response.data.expiration_date,
          payment_method: 'VIRTUAL ACCOUNT',
          status_pembayaran: 'ACTIVE',
          description: "",
          customer: "",
          items: "",
          actions: "",
          is_closed: false,
        }),
      );
      const extendedResponse = {
        ...response.data,
        invoice_id: 'INV-TNOS123',
      };

      return extendedResponse;
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

      throw { success: false, error: { message: error } };
    }
  }

  async createQrisCode(amount: any, qrDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const parseAmount = parseInt(amount);
    const reference_id = this.generateRandomWord();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1);

    const { channel_code } = qrDetails;
    try {
      const response = await this.qaService.createQrService(
        {
          reference_id,
          type: 'DYNAMIC',
          currency: qrDetails.currency,
          amount: parseAmount,
          channel_code,
          expires_at: expiresAt,
        },
        apiKey,
      );

      const qrPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          reference_id: response.data.id,
          currency: response.data.currency,
          external_id: qrDetails.external_id,
          invoice_id: 'INV-TNOS123',
          bank_code: response.data.channel_code,
          amount: response.data.amount,
          status: response.data.status,
          payment_method: 'QRIS',
          expiration_date: response.data.expires_at,
          status_pembayaran: 'ACTIVE',
        }),
      );


      const extendedResponse = {
        ...response.data,
        invoice_id: 'INV-TNOS123',
        external_id: qrDetails.external_id,
      };

      return extendedResponse;
    } catch (error) {

      console.log(error);

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

  async createtEwallet(ewalletDetails: PaymentParams): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    const expiresAtString = expiresAt.toISOString();
    const {
      external_id,
      currency,
      channel_code,
      mobile_number,
      expiration_date,
      cashtag,
    } = ewalletDetails;
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
            cashtag: cashtag,
            success_redirect_url: 'http://127.0.0.1:3000/redirect_payment',
            failure_redirect_url: 'http://127.0.0.1:3000/redirect_payment',
          },
        },
        apiKey,
      );
      const ewalletPayment = await this.paymentRepository.save(
        this.paymentRepository.create({
          external_id,
          currency,
          invoice_id: 'INV-TNOS123',
          payment_method: 'E-WALLET',
          reference_id: response.data.reference_id,
          amount: response.data.charge_amount,
          bank_code: response.data.channel_code,
          status_pembayaran: 'ACTIVE',
          status: response.data.status,
          expiration_date: expiresAtString,
        }),
      );
      const extendedResponse = {
        ...response.data,
        invoice_id: ewalletPayment.invoice_id,
        external_id: ewalletDetails.external_id,
        expiration_date: ewalletPayment.expiration_date,
      };

      return extendedResponse;
    } catch (err) {
      throw err;
    }
  }

  async updateLinkStatus(
    newAuthenticationId: string,
    newStatus: string,
  ): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { authentication_id: newAuthenticationId },
      });

      if (!payment) {
        throw new HttpException(
          'authentication id not found',
          HttpStatus.NOT_FOUND,
        );
      }

      payment.status = newStatus;
    } catch (err) { }
  }

  async updateDebitPayment(
    newAuthenticationId: string,
    newStatus: string,
  ): Promise<any> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { authentication_id: newAuthenticationId },
      });

      if (!payment) {
        throw new HttpException(
          'authentication id not found',
          HttpStatus.NOT_FOUND,
        );
      }

      payment.status = newStatus;

      const updatedPayment = await this.paymentRepository.save(payment);

      return updatedPayment;
    } catch (err) { }
  }

  async updatePaymentQrStatus(
    referenceId: string,
    newStatus: string,
  ): Promise<any> {
    const payment = await this.paymentRepository.findOne({
      where: { reference_id: referenceId },
    });

    if (!payment) {
      throw new HttpException('reference id not found', HttpStatus.NOT_FOUND);
    }

    payment.status = newStatus;
    payment.status_pembayaran = 'SUCCESS';

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
      throw new HttpException('reference id not found', HttpStatus.NOT_FOUND);
    }

    payment.status = newStatus;
    payment.status_pembayaran = 'SUCCESS';

    const updatedPayment = await this.paymentRepository.save(payment);

    const statusesToDelete = ['PENDING', 'ACTIVE'];
    await this.deletePaymentsByStatus(
      updatedPayment.invoice_id,
      statusesToDelete,
    );

    return updatedPayment;
  }

  async initializeLinkedDirectDebit(
    linkDetails: LinkedAccountParams,
  ): Promise<any> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const {
      customer_id,
      channel_code,
      account_mobile_number,
      card_last_four,
      card_expiry,
      account_email,
    } = linkDetails;
    try {
      const response = await this.linkedDebitService.createLinkedDebitService(
        {
          customer_id,
          channel_code,
          properties: {
            account_mobile_number,
            success_redirect_url: 'https://redirect.com',
            card_last_four,
            card_expiry,
            account_email,
          },
          device: {
            id: 'WEB',
            ip_address: '192.168.1.46',
            user_agent: 'Mozilla/5.0',
          },
        },
        apiKey,
      );
      const initLink = await this.paymentRepository.save(
        this.paymentRepository.create({
          authentication_id: response.data.id,
          customer: response.data.customer_id,
          bank_code: response.data.channel_code,
          status: response.data.status,
        }),
      );
      const extendedResponse = {
        ...response.data,
      };

      return extendedResponse;
    } catch (err) {
      throw err;
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

  async deleteExpiredPayments() {
    try {
      const currentDate = new Date();
      const expiredPayments = await this.paymentRepository.find({
        where: {
          status_pembayaran: 'ACTIVE',
          expiration_date: LessThan(currentDate.toISOString()),
        },
      });
      if (expiredPayments.length > 0) {
        await this.paymentRepository.remove(expiredPayments);
        console.log('Berhasil hapus payment yang sudah expired');
      } else {
        console.log('Tidak ada payment yang sudah expired');
      }
    } catch (error) {
      console.error(
        'Error in deleting expired payments:',
        error.message || error,
      );
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
}
