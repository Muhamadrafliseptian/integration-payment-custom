import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChannelQrCode } from '../../../typeorm/entities/ChannelQr';
import { QrCodeController } from './qr_code.controller';
import { QrCodeService } from './qr_code.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelQrCode]), ConfigModule.forRoot()],
  controllers: [QrCodeController],
  providers: [QrCodeService],
})
export class QrCodeModule {}
