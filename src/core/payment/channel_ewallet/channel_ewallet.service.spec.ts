import { Test, TestingModule } from '@nestjs/testing';
import { ChannelEwalletService } from './channel_ewallet.service';

describe('ChannelEwalletService', () => {
  let service: ChannelEwalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelEwalletService],
    }).compile();

    service = module.get<ChannelEwalletService>(ChannelEwalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
