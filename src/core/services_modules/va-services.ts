// XenditApiService.ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class VirtualAccountService {
  async createCallbackVirtualAccount(
    data: any,
    apiKey: string,
  ): Promise<AxiosResponse> {
    return axios.post('https://api.xendit.co/callback_virtual_accounts', data, {
      auth: { username: apiKey, password: '' },
    });
  }
}

@Injectable()
export class AvailableBankServices {
  async getBanks(apiKey: string): Promise<AxiosResponse> {
    return axios.get('https://api.xendit.co/available_virtual_account_banks', {
      auth: { username: apiKey, password: '' },
    });
  }
}

@Injectable()
export class QrCodeService {
  async createQrService(data: any, apiKey: string): Promise<AxiosResponse> {
    return axios.post('https://api.xendit.co/qr_codes', data, {
      auth: { username: apiKey, password: '' },
    });
  }
}
