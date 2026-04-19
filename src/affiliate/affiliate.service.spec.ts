import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  AffiliateService,
  AffiliateLink,
  ClickStats,
} from './affiliate.service';
import {
  AffiliatePartner,
  PartnerStatus,
  PartnerCategory,
} from './entities/affiliate-partner.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';

describe('AffiliateService', () => {
  let service: AffiliateService;

  const mockPartnerRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockClickRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliateService,
        {
          provide: getRepositoryToken(AffiliatePartner),
          useValue: mockPartnerRepository,
        },
        {
          provide: getRepositoryToken(AffiliateClick),
          useValue: mockClickRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<AffiliateService>(AffiliateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllLinks', () => {
    it('should return cached affiliate links', async () => {
      const cachedLinks: AffiliateLink[] = [
        {
          code: 'test',
          name: 'Test',
          url: 'https://test.com',
          category: 'broker',
        },
      ];

      mockCacheManager.get.mockResolvedValue(cachedLinks);

      const result = await service.getAllLinks();

      expect(result).toEqual(cachedLinks);
    });

    it('should fetch and cache links from database', async () => {
      const partners = [
        {
          name: 'Test Partner',
          code: 'test',
          url: 'https://test.com',
          category: PartnerCategory.BROKER,
          commissionRate: 1.0,
          commissionType: 'percentage',
          commissionCurrency: 'USD',
        },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockPartnerRepository.find.mockResolvedValue(partners);

      const result = await service.getAllLinks(true);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('trackClick', () => {
    it('should track click for valid partner', async () => {
      const partner = {
        id: '1',
        code: 'test',
        url: 'https://test.com',
        status: PartnerStatus.ACTIVE,
      };

      mockPartnerRepository.findOne.mockResolvedValue(partner);
      mockClickRepository.create.mockReturnValue({});
      mockClickRepository.save.mockResolvedValue({});

      const result = await service.trackClick('test');

      expect(result.success).toBe(true);
      expect(result.redirectUrl).toBe('https://test.com');
    });

    it('should fail for invalid partner', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);

      const result = await service.trackClick('invalid');

      expect(result.success).toBe(false);
    });
  });

  describe('markConverted', () => {
    it('should mark click as converted', async () => {
      const click = {
        id: '1',
        partnerCode: 'test',
        converted: false,
      };

      mockClickRepository.findOne.mockResolvedValue(click);
      mockClickRepository.save.mockResolvedValue({});

      const result = await service.markConverted('1', 100, 'USD');

      expect(result.success).toBe(true);
      expect(click.converted).toBe(true);
    });

    it('should fail for non-existent click', async () => {
      mockClickRepository.findOne.mockResolvedValue(null);

      const result = await service.markConverted('999');

      expect(result.success).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return click statistics', async () => {
      mockClickRepository.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(25);

      const convertedClicks = [
        { conversionValue: 100 },
        { conversionValue: 200 },
      ];
      mockClickRepository.find.mockResolvedValue(convertedClicks);

      const result: ClickStats = await service.getStats();

      expect(result.totalClicks).toBe(100);
      expect(result.convertedClicks).toBe(25);
      expect(result.conversionRate).toBe(25);
      expect(result.totalEarnings).toBe(300);
    });

    it('should return stats filtered by partner code', async () => {
      mockClickRepository.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10);

      const convertedClicks = [{ conversionValue: 150 }];
      mockClickRepository.find.mockResolvedValue(convertedClicks);

      const result = await service.getStats('test');

      expect(result.totalClicks).toBe(50);
    });
  });

  describe('getPartnerStats', () => {
    it('should return stats for all partners', async () => {
      const partners = [
        { id: '1', code: 'test1', name: 'Partner 1' },
        { id: '2', code: 'test2', name: 'Partner 2' },
      ];

      mockPartnerRepository.find.mockResolvedValue(partners);
      mockClickRepository.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(5);
      mockClickRepository.find.mockResolvedValue([{ conversionValue: 100 }]);

      const result = await service.getPartnerStats();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });
  });

  describe('addPartner', () => {
    it('should add new partner', async () => {
      const partnerData = {
        name: 'New Partner',
        code: 'new',
        url: 'https://new.com',
      };

      const newPartner = { id: '1', ...partnerData };

      mockPartnerRepository.create.mockReturnValue(newPartner);
      mockPartnerRepository.save.mockResolvedValue(newPartner);

      const result = await service.addPartner(partnerData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Partner');
    });
  });

  describe('seedDefaultPartners', () => {
    it('should not seed if partners already exist', async () => {
      mockPartnerRepository.count.mockResolvedValue(5);

      await service.seedDefaultPartners();

      expect(mockPartnerRepository.save).not.toHaveBeenCalled();
    });

    it('should seed default partners if none exist', async () => {
      mockPartnerRepository.count.mockResolvedValue(0);
      mockPartnerRepository.save.mockResolvedValue({});

      await service.seedDefaultPartners();

      expect(mockPartnerRepository.save).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalledWith('affiliate:links');
    });
  });
});
