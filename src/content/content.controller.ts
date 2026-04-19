import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.contentService.getPage(slug);
    if (!page) {
      throw new NotFoundException(`Page not found: ${slug}`);
    }
    return page;
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.contentService.search(query);
  }

  @Get('sitemap')
  async sitemap() {
    const entries = await this.contentService.getSitemap();
    return {
      urlset: entries.map((entry) => ({
        url: {
          loc: entry.loc,
          lastmod: entry.lastmod.toISOString(),
          changefreq: entry.changefreq,
          priority: entry.priority,
        },
      })),
    };
  }
}
