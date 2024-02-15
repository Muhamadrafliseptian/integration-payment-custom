import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelQrCode } from '../../../typeorm/entities/ChannelQr';
import * as CryptoJS from "crypto-js"

@Injectable()
export class QrCodeService {

  private readonly key: string = "U2FsdGVkX1+RFxINtDchhPqAxYecNts3Di1tTgbwHg0=";
    
  constructor(
    @InjectRepository(ChannelQrCode)
    private readonly qrCodeRepository: Repository<ChannelQrCode>,
  ) {}

  public async getQrCode() {
    const qrcodes = await this.qrCodeRepository.find();
    const encrypt = this.encryptData(qrcodes)

    return { data: encrypt };
  }

  private encryptData(data: any): string {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), this.key).toString();
    return encryptedData;
  }

  decryptData(encryptedData: string): any {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
}
