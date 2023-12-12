// scheduler.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../core/payment/bca/services/payment/payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { XenditEntity } from '../typeorm/entities/Xendit';
import { PaymentSchedulerService } from '../core/services_modules/scheduler.service';

describe('PaymentSchedulerService', () => {
  let service: PaymentSchedulerService;

  const mockPaymentService = {
    deleteExpiredPayments: jest.fn(),
  };

  const mockXenditEntityRepository = {
    
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentSchedulerService,
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: getRepositoryToken(XenditEntity),
          useValue: mockXenditEntityRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentSchedulerService>(PaymentSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('handleExpiredPayments should run without errors', async () => {
    // Perform the test
    await service.handleExpiredPayments();

    // Verify that deleteExpiredPayments method in PaymentService was called
    expect(mockPaymentService.deleteExpiredPayments).toHaveBeenCalled();
  });
});
