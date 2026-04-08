import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { metalApiConfig } from '../config';

export interface MetalApiRatesResponse {
  metal: string;
  currency: string;
  price: number;
  prevPrice: number;
  change: number;
  changePercent: number;
  unit: string;
  timestamp: number;
}

export interface FetchRatesResult {
  success: boolean;
  rates: MetalApiRatesResponse[];
  error?: string;
}

@Injectable()
export class MetalApiService {
  private readonly logger = new Logger(MetalApiService.name);
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: metalApiConfig.baseUrl,
      timeout: 10000,
      headers: {
        'x-access-key': metalApiConfig.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchGoldRates(): Promise<FetchRatesResult> {
    try {
      this.logger.log('Fetching gold rates from Metal-API...');

      const response = await this.client.get<MetalApiRatesResponse[]>(
        '/v1/latest',
        {
          params: {
            base: 'USD',
            metals: 'XAU',
            currencies: 'USD,INR,AED,SAR,GBP,EUR',
          },
        },
      );

      this.logger.log(`Fetched ${response.data.length} gold rates`);

      return {
        success: true,
        rates: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data
        ? JSON.stringify(axiosError.response.data)
        : axiosError.message;
      this.logger.error(`Failed to fetch rates: ${message}`);
      return {
        success: false,
        rates: [],
        error: message,
      };
    }
  }

  async fetchRateForRegion(
    metal: string,
    currency: string,
  ): Promise<MetalApiRatesResponse | null> {
    try {
      const response = await this.client.get<MetalApiRatesResponse[]>(
        '/v1/latest',
        {
          params: {
            base: currency,
            metals: metal,
          },
        },
      );

      return response.data[0] || null;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to fetch ${metal}/${currency}: ${axiosError.message}`,
      );
      return null;
    }
  }
}
