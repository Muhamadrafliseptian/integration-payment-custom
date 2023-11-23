import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentParams } from 'src/utils/type';
import { XenditEntity } from 'src/typeorm/entities/Xendit';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(XenditEntity)
    private readonly paymentRepository: Repository<XenditEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(paymentDetails: PaymentParams): Promise<Observable<any>> {
    const apiKey = this.configService.get<string>('XENDIT_API_KEY');

    const reference_id = paymentDetails.reference_id;
    const amount = paymentDetails.amount;

    const secret_key = 'Basic ' + apiKey;

    try {
      const response = await axios.post(
        'https://api.xendit.co/v2/invoices',
        { reference_id, amount },
        { headers: { Authorization: secret_key } },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        if (axiosError.response) {
          console.log('ini apikey-nya:', apiKey);
          console.error('Response data:', axiosError.response.data);
          console.error('Response status:', axiosError.response.status);
          console.error('Response headers:', axiosError.response.headers);
        } else if (axiosError.request) {
          console.error('No response received. Request:', axiosError.request);
        } else {
          console.error('Error setting up the request:', axiosError.message);
        }
        console.error('Error config:', axiosError.config);
      } else {
        console.error('Non-Axios error:', error.message);
      }

      throw error;
    }
  }
}
