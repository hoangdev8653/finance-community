import { SeriesService } from '../../src/modules/series/services/series.service';
import { CategoriesService } from '../../src/modules/categories/services/categories.service';
import { PostsRepository } from '../../src/database/repositories/posts.repository';

describe('SeriesService (Series Aggregation Engine)', () => {
  let seriesService: SeriesService;
  let mockCategoriesService: jest.Mocked<CategoriesService>;
  let mockPostsRepo: jest.Mocked<PostsRepository>;

  beforeEach(() => {
    mockCategoriesService = {
      getCategories: jest.fn().mockResolvedValue([
        {
          id: 'cat-series-1',
          name: 'Personal Finance 101',
          slug: 'personal-finance-101',
          scope: 'SERIES',
          description: 'Step-by-step guide to personal finance',
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      getCategoryById: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
    } as any;

    mockPostsRepo = {
      findFeedPaginated: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'post-series-1',
            authorId: 'author-1',
            contentType: 'SERIES',
            title: 'Chapter 1: Budgeting',
            slug: 'chapter-1-budgeting',
            body: 'Content 1',
            coverMediaId: null,
            categoryId: 'cat-series-1',
            status: 'PUBLISHED',
            metaTitle: null,
            metaDescription: null,
            viewCount: 10,
            publishedAt: new Date('2026-08-01'),
            createdAt: new Date('2026-08-01'),
            updatedAt: new Date('2026-08-01'),
            deletedAt: null,
          },
          {
            id: 'post-series-2',
            authorId: 'author-1',
            contentType: 'SERIES',
            title: 'Chapter 2: Saving',
            slug: 'chapter-2-saving',
            body: 'Content 2',
            coverMediaId: null,
            categoryId: 'cat-series-1',
            status: 'PUBLISHED',
            metaTitle: null,
            metaDescription: null,
            viewCount: 5,
            publishedAt: new Date('2026-08-02'),
            createdAt: new Date('2026-08-02'),
            updatedAt: new Date('2026-08-02'),
            deletedAt: null,
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          totalItems: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    } as any;

    seriesService = new SeriesService(mockCategoriesService, mockPostsRepo);
  });

  it('35.1: should return active series categories with scope = SERIES', async () => {
    const result = await seriesService.getAllSeriesCategories(1, 20);

    expect(mockCategoriesService.getCategories).toHaveBeenCalledWith('SERIES');
    expect(result.data.length).toBe(1);
    expect(result.data[0].slug).toBe('personal-finance-101');
    expect(result.data[0].publishedArticleCount).toBe(2);
  });

  it('35.2 & 35.4: should retrieve series TOC by category slug sorted sequentially', async () => {
    const seriesDetail = await seriesService.getSeriesDetailBySlug('personal-finance-101', 1, 20);

    expect(seriesDetail.series.slug).toBe('personal-finance-101');
    expect(seriesDetail.articles.length).toBe(2);
    expect(seriesDetail.articles[0].title).toBe('Chapter 1: Budgeting');
    expect(seriesDetail.articles[1].title).toBe('Chapter 2: Saving');
    expect(mockPostsRepo.findFeedPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'SERIES',
        categoryId: 'cat-series-1',
        status: 'PUBLISHED',
        sortBy: 'publishedAt',
        order: 'ASC',
      }),
    );
  });

  it('35.5: should throw 404 if requested series category slug does not exist', async () => {
    mockCategoriesService.getCategories.mockResolvedValueOnce([]);

    await expect(
      seriesService.getSeriesDetailBySlug('non-existent-series', 1, 20),
    ).rejects.toThrow();
  });
});
