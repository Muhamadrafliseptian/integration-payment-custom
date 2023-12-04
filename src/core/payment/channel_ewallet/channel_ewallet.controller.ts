import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ChannelEwalletService } from './channel_ewallet.service';

@Controller('channel_ewallet')
export class ChannelEwalletController {
  constructor(private ewalletService: ChannelEwalletService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getChannelEwallet() {
    return this.ewalletService.getChannelEwallet();
  }
}
