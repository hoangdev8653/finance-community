import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../../categories/services/categories.service';
import { PostsRepository } from '../../../database/repositories/posts.repository';

@Injectable()
export class SeriesService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly postsRepo: PostsRepository,
  ) {}

  async getAllSeriesCategories(page = 1, limit = 20) {
    const categories = await this.categoriesService.getCategories('SERIES');

    const result = await Promise.all(
      categories.map(async (cat) => {
        const feed = await this.postsRepo.findFeedPaginated({
          contentType: 'SERIES',
          categoryId: cat.id,
          status: 'PUBLISHED',
          page: 1,
          limit: 1,
        });

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          publishedArticleCount: feed.meta.totalItems,
          createdAt: cat.createdAt,
        };
      }),
    );

    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNextPage: page * limit < result.length,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getSeriesDetailBySlug(slug: string, page = 1, limit = 20) {
    const categories = await this.categoriesService.getCategories('SERIES');
    const seriesCategory = categories.find((c) => c.slug === slug);

    if (!seriesCategory) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Series category with slug '${slug}' not found.`,
        code: 'SERIES_NOT_FOUND',
      });
    }

    const articles = await this.postsRepo.findFeedPaginated({
      contentType: 'SERIES',
      categoryId: seriesCategory.id,
      status: 'PUBLISHED',
      page,
      limit,
      sortBy: 'publishedAt',
      order: 'ASC',
    });

    return {
      series: {
        id: seriesCategory.id,
        name: seriesCategory.name,
        slug: seriesCategory.slug,
        description: seriesCategory.description,
        sortOrder: seriesCategory.sortOrder,
        createdAt: seriesCategory.createdAt,
      },
      articles: articles.data.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        publishedAt: article.publishedAt,
        viewCount: article.viewCount,
      })),
      meta: articles.meta,
    };
  }
}
