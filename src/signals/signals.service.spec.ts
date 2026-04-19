import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  SignalsService,
  SignalType,
  SignalConfidence,
} from './signals.service';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';

describe('SignalsService', () => {
  let service: SignalsService;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getRepositoryToken(GoldRate),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTodaySignal', () => {
    it('should return cached signal if available', async () => {
      const cachedSignal = {
        date: '2026-04-19',
        signal: SignalType.BUY,
        confidence: SignalConfidence.HIGH,
        reasoning: 'Test signal',
        metrics: {
          price24k: 310,
          change24h: 2,
          changePercent24h: 0.65,
          trend7d: 1.2,
          trend30d: 3.5,
          localPremium: 4.5,
        },
        disclaimer: 'Test disclaimer',
        lastUpdated: new Date(),
      };

      mockCacheManager.get.mockResolvedValue(cachedSignal);

      const result = await service.getTodaySignal();

      expect(result).toEqual(cachedSignal);
      expect(mockCacheManager.get).toHaveBeenCalledWith('signal:today');
    });

    it('should generate new signal if not cached', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.find
        .mockResolvedValueOnce([
          {
            pricePerGram: 310,
            change24h: 2,
            changePercent24h: 0.65,
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getTodaySignal(true);

      expect(result).toBeDefined();
      expect(result.date).toBeDefined();
      expect(result.signal).toBeDefined();
    });
  });

  describe('getSignalHistory', () => {
    it('should return signal history', async () => {
      const mockRates = [
        { timestamp: new Date('2026-04-19'), pricePerGram: 310 },
        { timestamp: new Date('2026-04-18'), pricePerGram: 308 },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.find.mockResolvedValue(mockRates);

      const result = await service.getSignalHistory(7);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
    });
  });

  describe('refreshSignal', () => {
    it('should clear cache and return new signal', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);
      mockCacheManager.get.mockResolvedValue(null);
      mockRepository.find
        .mockResolvedValueOnce([
          {
            pricePerGram: 310,
            change24h: 2,
            changePercent24h: 0.65,
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.refreshSignal();

      expect(mockCacheManager.del).toHaveBeenCalledWith('signal:today');
      expect(result).toBeDefined();
    });
  });
});
