import { defaultNewsRssSources, newsSourcesConfig } from '../../src/config/news-sources.config';

describe('newsSourcesConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEWS_RSS_SOURCE_REGISTRY;
    delete process.env.NEWS_RSS_FEEDS;
    delete process.env.NEWS_CURATOR_ENABLED;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('exposes RSS sources across every promoted content domain', () => {
    const domainCodes = new Set(defaultNewsRssSources.map((source) => source.domainCode));

    expect(domainCodes).toEqual(new Set(['MONEY', 'BUSINESS', 'TECH', 'CAREER', 'LIFE', 'SPORTS']));
    expect(defaultNewsRssSources.some((source) => source.domainCode !== 'MONEY')).toBe(true);
  });

  it('keeps legacy feed URL compatibility while exposing structured sources', () => {
    const config = newsSourcesConfig();

    expect(config.enabled).toBe(true);
    expect(config.legacyFeedUrls).toContain('https://cafef.vn/thi-truong-chung-khoan.rss');
    expect(config.sources).toEqual(defaultNewsRssSources);
    expect(config.feedUrls).toContain('https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss');
  });

  it('allows deployments to override the structured registry with JSON', () => {
    process.env.NEWS_RSS_SOURCE_REGISTRY = JSON.stringify([
      {
        key: 'custom-tech',
        sourceName: 'Custom Tech',
        url: 'https://example.com/tech.rss',
        domainCode: 'TECH',
        topicSlug: 'technology',
        language: 'vi',
      },
    ]);

    const config = newsSourcesConfig();

    expect(config.sources).toEqual([
      {
        key: 'custom-tech',
        sourceName: 'Custom Tech',
        url: 'https://example.com/tech.rss',
        domainCode: 'TECH',
        topicSlug: 'technology',
        language: 'vi',
      },
    ]);
    expect(config.feedUrls).toEqual(['https://example.com/tech.rss']);
  });
});

