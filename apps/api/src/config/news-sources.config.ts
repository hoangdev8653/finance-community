import { registerAs } from '@nestjs/config';

export interface NewsRssSource {
  key: string;
  sourceName: string;
  url: string;
  domainCode: 'MONEY' | 'BUSINESS' | 'TECH' | 'CAREER' | 'LIFE' | 'SPORTS';
  topicSlug: string;
  language: 'vi' | 'en';
}

const legacyFinanceUrls = [
  'https://cafef.vn/thi-truong-chung-khoan.rss',
  'https://cafef.vn/tai-chinh-ngan-hang.rss',
  'https://cafef.vn/doanh-nghiep.rss',
  'https://cafef.vn/bat-dong-san.rss',
  'https://vneconomy.vn/tai-chinh.rss',
  'https://vnexpress.net/rss/kinh-doanh.rss',
  'https://vnexpress.net/rss/bat-dong-san.rss',
  'https://cointelegraph.com/rss',
];

export const defaultNewsRssSources: NewsRssSource[] = [
  {
    key: 'cafef-stock-market',
    sourceName: 'CafeF - Chung khoan',
    url: 'https://cafef.vn/thi-truong-chung-khoan.rss',
    domainCode: 'MONEY',
    topicSlug: 'stock-market',
    language: 'vi',
  },
  {
    key: 'cafef-banking',
    sourceName: 'CafeF - Tai chinh ngan hang',
    url: 'https://cafef.vn/tai-chinh-ngan-hang.rss',
    domainCode: 'MONEY',
    topicSlug: 'banking',
    language: 'vi',
  },
  {
    key: 'vnexpress-real-estate',
    sourceName: 'VnExpress - Bat dong san',
    url: 'https://vnexpress.net/rss/bat-dong-san.rss',
    domainCode: 'MONEY',
    topicSlug: 'real-estate',
    language: 'vi',
  },
  {
    key: 'cointelegraph',
    sourceName: 'Cointelegraph',
    url: 'https://cointelegraph.com/rss',
    domainCode: 'MONEY',
    topicSlug: 'crypto',
    language: 'en',
  },
  {
    key: 'thanhnien-economy',
    sourceName: 'Thanh Nien - Kinh te',
    url: 'https://thanhnien.vn/rss/kinh-te.rss',
    domainCode: 'BUSINESS',
    topicSlug: 'economy',
    language: 'vi',
  },
  {
    key: 'thanhnien-business',
    sourceName: 'Thanh Nien - Doanh nghiep',
    url: 'https://thanhnien.vn/rss/kinh-te/doanh-nghiep.rss',
    domainCode: 'BUSINESS',
    topicSlug: 'business',
    language: 'vi',
  },
  {
    key: 'tuoitre-business',
    sourceName: 'Tuoi Tre - Kinh doanh',
    url: 'https://tuoitre.vn/rss/kinh-doanh.rss',
    domainCode: 'BUSINESS',
    topicSlug: 'business',
    language: 'vi',
  },
  {
    key: 'vnexpress-technology',
    sourceName: 'VnExpress - Khoa hoc cong nghe',
    url: 'https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss',
    domainCode: 'TECH',
    topicSlug: 'technology',
    language: 'vi',
  },
  {
    key: 'tuoitre-technology',
    sourceName: 'Tuoi Tre - Cong nghe',
    url: 'https://tuoitre.vn/rss/cong-nghe.rss',
    domainCode: 'TECH',
    topicSlug: 'technology',
    language: 'vi',
  },
  {
    key: 'thanhnien-technology',
    sourceName: 'Thanh Nien - Cong nghe',
    url: 'https://thanhnien.vn/rss/cong-nghe.rss',
    domainCode: 'TECH',
    topicSlug: 'technology',
    language: 'vi',
  },
  {
    key: 'vnexpress-education',
    sourceName: 'VnExpress - Giao duc',
    url: 'https://vnexpress.net/rss/giao-duc.rss',
    domainCode: 'CAREER',
    topicSlug: 'education',
    language: 'vi',
  },
  {
    key: 'thanhnien-jobs',
    sourceName: 'Thanh Nien - Lao dong viec lam',
    url: 'https://thanhnien.vn/rss/thoi-su/lao-dong-viec-lam.rss',
    domainCode: 'CAREER',
    topicSlug: 'jobs',
    language: 'vi',
  },
  {
    key: 'thanhnien-career-opportunities',
    sourceName: 'Thanh Nien - Co hoi nghe nghiep',
    url: 'https://thanhnien.vn/rss/gioi-tre/co-hoi-nghe-nghiep.rss',
    domainCode: 'CAREER',
    topicSlug: 'career',
    language: 'vi',
  },
  {
    key: 'vnexpress-life',
    sourceName: 'VnExpress - Doi song',
    url: 'https://vnexpress.net/rss/doi-song.rss',
    domainCode: 'LIFE',
    topicSlug: 'life',
    language: 'vi',
  },
  {
    key: 'vnexpress-health',
    sourceName: 'VnExpress - Suc khoe',
    url: 'https://vnexpress.net/rss/suc-khoe.rss',
    domainCode: 'LIFE',
    topicSlug: 'health',
    language: 'vi',
  },
  {
    key: 'thanhnien-life',
    sourceName: 'Thanh Nien - Doi song',
    url: 'https://thanhnien.vn/rss/doi-song.rss',
    domainCode: 'LIFE',
    topicSlug: 'life',
    language: 'vi',
  },
  {
    key: 'vnexpress-sports',
    sourceName: 'VnExpress - The thao',
    url: 'https://vnexpress.net/rss/the-thao.rss',
    domainCode: 'SPORTS',
    topicSlug: 'sports',
    language: 'vi',
  },
  {
    key: 'tuoitre-sports',
    sourceName: 'Tuoi Tre - The thao',
    url: 'https://tuoitre.vn/rss/the-thao.rss',
    domainCode: 'SPORTS',
    topicSlug: 'sports',
    language: 'vi',
  },
  {
    key: 'thanhnien-sports',
    sourceName: 'Thanh Nien - The thao',
    url: 'https://thanhnien.vn/rss/the-thao.rss',
    domainCode: 'SPORTS',
    topicSlug: 'sports',
    language: 'vi',
  },
];

function parseLegacyFeedUrls(value?: string): string[] {
  if (!value) {
    return legacyFinanceUrls;
  }

  return value
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

function parseSourceRegistry(value?: string): NewsRssSource[] {
  if (!value) {
    return defaultNewsRssSources;
  }

  const parsed = JSON.parse(value) as NewsRssSource[];
  if (!Array.isArray(parsed)) {
    throw new Error('NEWS_RSS_SOURCE_REGISTRY must be a JSON array');
  }

  return parsed;
}

export const newsSourcesConfig = registerAs('newsSources', () => {
  const sources = parseSourceRegistry(process.env.NEWS_RSS_SOURCE_REGISTRY);

  return {
    enabled: process.env.NEWS_CURATOR_ENABLED !== 'false',
    legacyFeedUrls: parseLegacyFeedUrls(process.env.NEWS_RSS_FEEDS),
    sources,
    feedUrls: sources.map((source) => source.url),
  };
});

