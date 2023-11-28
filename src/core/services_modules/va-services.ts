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
