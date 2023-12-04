import { Test, TestingModule } from '@nestjs/testing';
import { ChannelEwalletController } from './channel_ewallet.controller';

describe('ChannelEwalletController', () => {
  let controller: ChannelEwalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelEwalletController],
    }).compile();

    controller = module.get<ChannelEwalletController>(ChannelEwalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
