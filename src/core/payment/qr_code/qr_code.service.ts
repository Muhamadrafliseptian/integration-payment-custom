import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelQrCode } from '../../../typeorm/entities/ChannelQr';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(ChannelQrCode)
    private readonly qrCodeRepository: Repository<ChannelQrCode>,
  ) {}

  public async getQrCode() {
    const qrcodes = await this.qrCodeRepository.find();

    return { data: qrcodes };
  }
}
