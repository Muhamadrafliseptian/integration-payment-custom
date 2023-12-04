import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChannelEwalletController } from './channel_ewallet.controller';
import { ChannelEwalletService } from './channel_ewallet.service';
import { ChannelEwalletEntity } from 'src/typeorm/entities/ChannelEwallet';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEwalletEntity]),
    ConfigModule.forRoot(),
  ],
  controllers: [ChannelEwalletController],
  providers: [ChannelEwalletService],
})
export class ChannelEwalletModule {}
