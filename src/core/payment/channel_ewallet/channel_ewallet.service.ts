import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelEwalletEntity } from 'src/typeorm/entities/ChannelEwallet';

@Injectable()
export class ChannelEwalletService {
  constructor(
    @InjectRepository(ChannelEwalletEntity)
    private readonly channelEwalletRepository: Repository<ChannelEwalletEntity>,
  ) {}

  public async getChannelEwallet() {
    const ewallets = await this.channelEwalletRepository.find();

    return { data: ewallets };
  }
}
