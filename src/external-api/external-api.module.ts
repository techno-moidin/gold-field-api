import { Module } from '@nestjs/common';
import { MetalApiService } from './metal-api.service';
import { MockDataService } from './mock-data.service';

@Module({
  providers: [MetalApiService, MockDataService],
  exports: [MetalApiService, MockDataService],
})
export class ExternalApiModule {}
