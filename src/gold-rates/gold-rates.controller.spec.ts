import { Test, TestingModule } from '@nestjs/testing';
import { GoldRatesController } from './gold-rates.controller';
import { GoldRatesService } from './gold-rates.service';

describe('GoldRatesController', () => {
  let controller: GoldRatesController;

  const mockGoldRatesService = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    getLiveAll: jest.fn(),
    getLiveByRegion: jest.fn(),
    getLiveByRegionAndPurity: jest.fn(),
    getHistory: jest.fn(),
    getAggregatedHistory: jest.fn(),
    getChartData: jest.fn(),
    convert: jest.fn(),
    refreshRates: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoldRatesController],
      providers: [
        {
          provide: GoldRatesService,
          useValue: mockGoldRatesService,
        },
      ],
    }).compile();

    controller = module.get<GoldRatesController>(GoldRatesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
