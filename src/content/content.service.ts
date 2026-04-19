import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface ContentPage {
  slug: string;
  title: string;
  content: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  lastUpdated: Date;
}

export interface SitemapEntry {
  loc: string;
  lastmod: Date;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private readonly CACHE_KEY_PAGE = 'content:page:';
  private readonly CACHE_KEY_ALL = 'content:all';

  constructor(private cacheManager: Cache) {}

  async getPage(
    slug: string,
    forceRefresh = false,
  ): Promise<ContentPage | null> {
    const cacheKey = `${this.CACHE_KEY_PAGE}${slug}`;

    if (!forceRefresh) {
      const cached = await this.cacheManager.get<ContentPage>(cacheKey);
      if (cached) return cached;
    }

    const page = this.getStaticPage(slug);
    if (page) {
      await this.cacheManager.set(cacheKey, page, 3600);
    }
    return page;
  }

  async getAllPages(): Promise<ContentPage[]> {
    const cached = await this.cacheManager.get<ContentPage[]>(
      this.CACHE_KEY_ALL,
    );
    if (cached) return cached;

    const pages = this.getStaticPages();
    await this.cacheManager.set(this.CACHE_KEY_ALL, pages, 3600);
    return pages;
  }

  async search(query: string): Promise<ContentPage[]> {
    const pages = await this.getAllPages();
    const lowerQuery = query.toLowerCase();

    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(lowerQuery) ||
        page.content.toLowerCase().includes(lowerQuery) ||
        page.description?.toLowerCase().includes(lowerQuery) ||
        page.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)),
    );
  }

  async getSitemap(): Promise<SitemapEntry[]> {
    const pages = await this.getAllPages();

    return pages.map((page) => ({
      loc: `/content/${page.slug}`,
      lastmod: page.lastUpdated,
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));
  }

  private getStaticPage(slug: string): ContentPage | null {
    const pages = this.getStaticPages();
    return pages.find((p) => p.slug === slug) || null;
  }

  private getStaticPages(): ContentPage[] {
    return [
      {
        slug: 'home',
        title: 'Gold Field API - Real-Time Gold Rates',
        content:
          'Real-time gold rates for global markets. Track prices across USA, India, UAE, Saudi Arabia, UK, and EU.',
        description: 'Real-time gold rates API for global markets',
        keywords: ['gold rates', 'gold price', 'api', 'precious metals'],
        lastUpdated: new Date(),
      },
      {
        slug: 'about',
        title: 'About Gold Field API',
        content:
          'Gold Field API provides real-time gold rates, historical analytics, and market insights for investors and retailers.',
        description: 'About our gold rates platform',
        keywords: ['about', 'gold', 'api'],
        lastUpdated: new Date(),
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        content:
          'Get in touch with our team for API integration support or partnership inquiries.',
        description: 'Contact our team',
        keywords: ['contact', 'support', 'partnership'],
        lastUpdated: new Date(),
      },
      {
        slug: 'privacy',
        title: 'Privacy Policy',
        content:
          'Your privacy is important to us. We do not collect personal information without consent.',
        description: 'Privacy policy',
        keywords: ['privacy', 'policy'],
        lastUpdated: new Date(),
      },
      {
        slug: 'terms',
        title: 'Terms of Service',
        content:
          'By using this API, you agree to our terms. Data is for informational purposes only.',
        description: 'Terms of service',
        keywords: ['terms', 'service'],
        lastUpdated: new Date(),
      },
    ];
  }
}
