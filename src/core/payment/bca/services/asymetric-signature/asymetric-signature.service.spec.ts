import { Test, TestingModule } from '@nestjs/testing';
import { AsymetricSignatureService } from './asymetric-signature.service';

describe('AsymetricSignatureService', () => {
  let service: AsymetricSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsymetricSignatureService],
    }).compile();

    service = module.get<AsymetricSignatureService>(AsymetricSignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
