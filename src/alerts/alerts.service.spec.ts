import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import {
  Subscriber,
  AlertFrequency,
  SubscriptionTier,
} from './entities/subscriber.entity';
import { TelegramService } from './telegram.service';

describe('AlertsService', () => {
  let service: AlertsService;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockTelegramService = {
    sendSignal: jest.fn(),
    sendPriceAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Subscriber),
          useValue: mockRepository,
        },
        {
          provide: TelegramService,
          useValue: mockTelegramService,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should create new subscriber', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        telegramId: '123456',
        isSubscribed: true,
      });
      mockRepository.save.mockResolvedValue({});

      const result = await service.subscribe({
        telegramId: '123456',
      });

      expect(result.success).toBe(true);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should update existing subscriber', async () => {
      const existingSubscriber = {
        id: '1',
        telegramId: '123456',
        isSubscribed: false,
      };

      mockRepository.findOne.mockResolvedValue(existingSubscriber);
      mockRepository.save.mockResolvedValue({});

      const result = await service.subscribe({
        telegramId: '123456',
      });

      expect(result.success).toBe(true);
      expect(existingSubscriber.isSubscribed).toBe(true);
    });

    it('should fail without telegramId or whatsappPhone', async () => {
      const result = await service.subscribe({});

      expect(result.success).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe existing subscriber', async () => {
      const subscriber = {
        id: '1',
        telegramId: '123456',
        isSubscribed: true,
      };

      mockRepository.findOne.mockResolvedValue(subscriber);
      mockRepository.save.mockResolvedValue({});

      const result = await service.unsubscribe('123456');

      expect(result.success).toBe(true);
      expect(subscriber.isSubscribed).toBe(false);
    });

    it('should fail for non-existent subscriber', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.unsubscribe('999999');

      expect(result.success).toBe(false);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscriber status', async () => {
      const subscriber = {
        isSubscribed: true,
        preferredRegion: 'UAE',
        preferredPurity: '24K',
        alertFrequency: AlertFrequency.DAILY,
      };

      mockRepository.findOne.mockResolvedValue(subscriber);

      const result = await service.getSubscriptionStatus('123456');

      expect(result).toEqual({
        subscribed: true,
        region: 'UAE',
        purity: '24K',
        frequency: 'DAILY',
      });
    });

    it('should return null for non-existent subscriber', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getSubscriptionStatus('999999');

      expect(result).toBeNull();
    });
  });

  describe('getAllActiveSubscribers', () => {
    it('should return active subscribers', async () => {
      const subscribers = [
        { id: '1', telegramId: '123', isSubscribed: true, isActive: true },
        { id: '2', telegramId: '456', isSubscribed: true, isActive: true },
      ];

      mockRepository.find.mockResolvedValue(subscribers);

      const result = await service.getAllActiveSubscribers();

      expect(result).toHaveLength(2);
    });
  });

  describe('getSubscriberCount', () => {
    it('should return subscriber counts', async () => {
      mockRepository.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);

      const result = await service.getSubscriberCount();

      expect(result).toEqual({ total: 10, active: 5 });
    });
  });

  describe('sendSignalAlert', () => {
    it('should send signal alerts to subscribers', async () => {
      const subscribers = [
        { id: '1', telegramId: '123456', lastAlertAt: null },
      ];

      mockRepository.find.mockResolvedValue(subscribers);
      mockTelegramService.sendSignal.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue({});

      const signal = {
        signal: 'BUY',
        confidence: 'HIGH',
        reasoning: 'Test',
        price24k: 310,
        date: '2026-04-19',
      };

      const result = await service.sendSignalAlert(signal);

      expect(result.sent).toBe(1);
      expect(result.failed).toBe(0);
    });
  });

  describe('updatePreferences', () => {
    it('should update subscriber preferences', async () => {
      const subscriber = {
        id: '1',
        telegramId: '123456',
        preferredRegion: 'UAE',
      };

      mockRepository.findOne.mockResolvedValue(subscriber);
      mockRepository.save.mockResolvedValue({});

      const result = await service.updatePreferences('123456', {
        region: 'INDIA',
      });

      expect(result.success).toBe(true);
      expect(subscriber.preferredRegion).toBe('INDIA');
    });

    it('should fail for non-existent subscriber', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.updatePreferences('999999', {
        region: 'UAE',
      });

      expect(result.success).toBe(false);
    });
  });
});
