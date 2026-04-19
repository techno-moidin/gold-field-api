import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UaeMartsService, UaePremium } from './uaemarts.service';
import { SignalMetrics } from './entities/signal-metrics.entity';
import { GoldRate } from '../gold-rates/entities/gold-rate.entity';
import { GoldRatesService } from '../gold-rates/gold-rates.service';

describe('UaeMartsService', () => {
  let service: UaeMartsService;

  const mockMetricsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGoldRatesRepository = {
    find: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockGoldRatesService = {
    getLiveByRegionAndPurity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UaeMartsService,
        {
          provide: getRepositoryToken(SignalMetrics),
          useValue: mockMetricsRepository,
        },
        {
          provide: getRepositoryToken(GoldRate),
          useValue: mockGoldRatesRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: GoldRatesService,
          useValue: mockGoldRatesService,
        },
      ],
    }).compile();

    service = module.get<UaeMartsService>(UaeMartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPremium', () => {
    it('should return cached premium if available', async () => {
      const cachedPremium: UaePremium = {
        current: 4.5,
        average7d: 4.2,
        average30d: 4.0,
        trend: 'stable',
        recommendation: 'Premium is reasonable',
      };

      mockCacheManager.get.mockResolvedValue(cachedPremium);

      const result = await service.getPremium();

      expect(result).toEqual(cachedPremium);
    });

    it('should calculate premium from live rates', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockGoldRatesService.getLiveByRegionAndPurity.mockResolvedValue({
        pricePerGram: 325,
      });

      const rates = [
        { pricePerGram: 320 },
        { pricePerGram: 322 },
        { pricePerGram: 325 },
      ];
      mockGoldRatesRepository.find.mockResolvedValue(rates);

      const result = await service.getPremium(true);

      expect(result).toBeDefined();
      expect(result.current).toBeGreaterThan(0);
    });
  });

  describe('getBestTime', () => {
    it('should calculate best time to buy from historical data', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const rates = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 86400000),
        pricePerGram: 310 + (i % 5),
      }));
      mockGoldRatesRepository.find.mockResolvedValue(rates);

      const result = await service.getBestTime();

      expect(result).toBeDefined();
      expect(result.bestDay).toBeDefined();
      expect(result.bestTime).toBeDefined();
      expect(result.averagePriceDiff).toBeDefined();
    });
  });

  describe('getMakingCharges', () => {
    it('should return making charges data', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getMakingCharges();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].purity).toBeDefined();
      expect(result[0].perGram).toBeDefined();
    });
  });

  describe('getVatInfo', () => {
    it('should return VAT information', async () => {
      const result = await service.getVatInfo();

      expect(result).toBeDefined();
      expect(result.rate).toBe(5);
      expect(result.appliesTo).toBeDefined();
      expect(result.tips).toBeDefined();
    });
  });

  describe('getSummary', () => {
    it('should return complete market summary', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockGoldRatesService.getLiveByRegionAndPurity.mockResolvedValue({
        pricePerGram: 325,
      });

      const rates = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 86400000),
        pricePerGram: 310 + (i % 5),
      }));
      mockGoldRatesRepository.find.mockResolvedValue(rates);

      const result = await service.getSummary(true);

      expect(result).toBeDefined();
      expect(result.premium).toBeDefined();
      expect(result.bestTime).toBeDefined();
      expect(result.makingCharges).toBeDefined();
      expect(result.vatInfo).toBeDefined();
    });
  });

  describe('refreshData', () => {
    it('should clear cache and refresh data', async () => {
      mockCacheManager.del.mockResolvedValue(undefined);
      mockCacheManager.get.mockResolvedValue(null);
      mockGoldRatesService.getLiveByRegionAndPurity.mockResolvedValue({
        pricePerGram: 325,
      });

      const rates = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 86400000),
        pricePerGram: 310 + (i % 5),
      }));
      mockGoldRatesRepository.find.mockResolvedValue(rates);

      const result = await service.refreshData();

      expect(result.success).toBe(true);
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });
});
