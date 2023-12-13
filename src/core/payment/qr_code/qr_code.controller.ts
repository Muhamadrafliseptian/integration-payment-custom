import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { QrCodeService } from './qr_code.service';

@Controller('qr_code')
export class QrCodeController {
  constructor(private qrService: QrCodeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getChannelQr() {
    return this.qrService.getQrCode();
  }
}
