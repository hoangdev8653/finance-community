import { apiClient } from '../api/client';
import {
  SeriesItem,
  SeriesDetailResponse,
  QuerySeriesParams,
} from '../../types/series';
import { PaginatedResult } from '../../types/content';

const MOCK_SERIES_LIST: SeriesItem[] = [
  {
    id: 'series-1',
    name: 'Quantitative Finance & Market Microstructure',
    slug: 'quantitative-finance-market-microstructure',
    description: 'A deep-dive curriculum into algorithmic execution, order book dynamics, and statistical arbitrage methodologies.',
    sortOrder: 1,
    publishedArticleCount: 6,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'series-2',
    name: 'Corporate Valuation & M&A Financial Modeling',
    slug: 'corporate-valuation-ma-financial-modeling',
    description: 'Mastering three-statement modeling, DCF sensitivity analysis, LBO structures, and accretion/dilution mechanics.',
    sortOrder: 2,
    publishedArticleCount: 8,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'series-3',
    name: 'Global Macro & Fixed Income Yield Curve Dynamics',
    slug: 'global-macro-fixed-income-yield-curve',
    description: 'Understanding central bank balance sheets, repo markets, interest rate swaps, and sovereign debt spreads.',
    sortOrder: 3,
    publishedArticleCount: 5,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export const seriesService = {
  /**
   * Get list of published educational series with offline fallback
   * GET /api/v1/series
   */
  async getAllSeries(params?: QuerySeriesParams): Promise<PaginatedResult<SeriesItem>> {
    try {
      const response = await apiClient.get<PaginatedResult<SeriesItem>>('/series', {
        params,
      });
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return {
        data: MOCK_SERIES_LIST,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_SERIES_LIST.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    } catch {
      return {
        data: MOCK_SERIES_LIST,
        meta: {
          page: 1,
          limit: 10,
          totalItems: MOCK_SERIES_LIST.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },

  /**
   * Get series curriculum overview and paginated post list by slug with offline fallback
   * GET /api/v1/series/:slug
   */
  async getBySlug(
    slug: string,
    params?: QuerySeriesParams
  ): Promise<SeriesDetailResponse> {
    try {
      const response = await apiClient.get<SeriesDetailResponse>(
        `/series/${encodeURIComponent(slug)}`,
        { params }
      );
      return response.data;
    } catch {
      const series = MOCK_SERIES_LIST.find((s) => s.slug === slug) || MOCK_SERIES_LIST[0];
      return {
        series: {
          id: series.id,
          name: series.name,
          slug: series.slug,
          description: series.description,
          sortOrder: series.sortOrder,
          createdAt: series.createdAt,
        },
        articles: [
          {
            id: 'art-1',
            title: 'Part 1: Order Book Mechanics and Price Discovery Foundations',
            slug: 'part-1-order-book-mechanics-foundations',
            status: 'PUBLISHED',
            publishedAt: '2026-01-12T00:00:00Z',
            viewCount: 4200,
          },
          {
            id: 'art-2',
            title: 'Part 2: Limit Order Book Liquidity & Bid-Ask Spread Dynamics',
            slug: 'part-2-limit-order-book-liquidity-spread-dynamics',
            status: 'PUBLISHED',
            publishedAt: '2026-01-18T00:00:00Z',
            viewCount: 3100,
          },
          {
            id: 'art-3',
            title: 'Part 3: Cross-Asset Statistical Arbitrage Strategies',
            slug: 'part-3-cross-asset-statistical-arbitrage-strategies',
            status: 'PUBLISHED',
            publishedAt: '2026-01-25T00:00:00Z',
            viewCount: 2850,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
  },
};
