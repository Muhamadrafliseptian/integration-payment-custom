import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
      headers: {
        'api-version': '2022-07-31',
      },
    });
  }
}

@Injectable()
export class QrCodeServiceDataGet {
  async getQrCodeById(apiKey: string, id:string): Promise<AxiosResponse> {
    return axios.get(`https://api.xendit.co/qr_codes/${id}`, {
      auth: { username: apiKey, password: '' },
      headers: {
        'api-version': '2022-07-31',
      },
      responseType: 'json'
    });
  }
}

@Injectable()
export class EWalletService {
  async createEwalletService(
    data: any,
    apiKey: string,
  ): Promise<AxiosResponse> {
    return axios.post('https://api.xendit.co/ewallets/charges', data, {
      auth: { username: apiKey, password: '' },
    });
  }
}

@Injectable()
export class LinkedDebitService {
  async createLinkedDebitService(
    data: any,
    apiKey: string,
  ): Promise<AxiosResponse> {
    return axios.post(
      'https://api.xendit.co/linked_account_tokens/auth',
      data,
      {
        auth: { username: apiKey, password: '' },
      },
    );
  }
}

@Injectable()
export class LinkOtpDebitService {
  async sendOtpRequest(data: any, apiKey: string): Promise<AxiosResponse> {
    return axios.post(
      'https://api.xendit.co/linked_account_tokens/:id/validate_otp',
      data,
      {
        auth: { username: apiKey, password: '' },
      },
    );
  }
}

@Injectable()
export class AccessTokenPoint {
  async createTokenPoint(
    data: any,
    headers: Record<string, string>,
  ): Promise<AxiosResponse> {
    return axios.post(
      'https://devapi.klikbca.com/openapi/v1.0/access-token/b2b',
      data,
      {
        headers: headers,
      },
    );
  }
}
