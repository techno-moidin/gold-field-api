import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GoldRatesService } from './gold-rates.service';
import {
  CreateGoldRateDto,
  BulkCreateGoldRateDto,
  HistoryQueryDto,
  LiveRateQueryDto,
  ChartQueryDto,
  ConvertQueryDto,
  RefreshRateQueryDto,
} from './dto';
import { Region, GoldPurity } from './enums/gold-rate.enums';

@Controller('gold-rates')
export class GoldRatesController {
  constructor(private readonly goldRatesService: GoldRatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGoldRateDto: CreateGoldRateDto) {
    return this.goldRatesService.create(createGoldRateDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  bulkCreate(@Body() rates: BulkCreateGoldRateDto[]) {
    if (!Array.isArray(rates) || rates.length === 0) {
      throw new BadRequestException('Rates array is required');
    }
    return this.goldRatesService.bulkCreate(rates);
  }

  @Get('live')
  async getLiveRates(@Query() query: LiveRateQueryDto) {
    if (query.region && query.purity) {
      const rate = await this.goldRatesService.getLiveByRegionAndPurity(
        query.region,
        query.purity,
      );
      if (!rate) {
        throw new BadRequestException(
          `No rate found for ${query.region} ${query.purity}`,
        );
      }
      return rate;
    }
    if (query.region) {
      return this.goldRatesService.getLiveByRegion(query.region);
    }
    return this.goldRatesService.getLiveAll();
  }

  @Get('live/:region')
  async getLiveByRegion(@Param('region') region: Region) {
    return this.goldRatesService.getLiveByRegion(region);
  }

  @Get('live/:region/:purity')
  async getLiveByRegionAndPurity(
    @Param('region') region: Region,
    @Param('purity') purity: GoldPurity,
  ) {
    const rate = await this.goldRatesService.getLiveByRegionAndPurity(
      region,
      purity,
    );
    if (!rate) {
      throw new BadRequestException(`No rate found for ${region} ${purity}`);
    }
    return rate;
  }

  @Get('history')
  async getHistory(@Query() query: HistoryQueryDto) {
    return this.goldRatesService.getHistory(query);
  }

  @Get('history/:region/:purity/:period')
  async getAggregatedHistory(
    @Param('region') region: Region,
    @Param('purity') purity: GoldPurity,
    @Param('period') period: 'day' | 'week' | 'month',
  ) {
    if (!['day', 'week', 'month'].includes(period)) {
      throw new BadRequestException('Period must be: day, week, or month');
    }
    return this.goldRatesService.getAggregatedHistory(region, purity, period);
  }

  @Get('chart')
  async getChartData(@Query() query: ChartQueryDto) {
    return this.goldRatesService.getChartData(query);
  }

  @Get('convert')
  async convert(@Query() query: ConvertQueryDto) {
    return this.goldRatesService.convert(query);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshRates(@Query() query: RefreshRateQueryDto) {
    return this.goldRatesService.refreshRates(query.region, query.purity);
  }

  @Get()
  findAll() {
    return this.goldRatesService.findAll();
  }
}
