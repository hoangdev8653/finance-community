import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { eq, and, isNull, count } from 'drizzle-orm';
import { CategoriesService } from '../../categories/services/categories.service';
import { PostsRepository } from '../../../database/repositories/posts.repository';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { postsTable } from '../../../database/schema/posts.schema';

@Injectable()
export class SeriesService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly postsRepo: PostsRepository,
    @Optional() @Inject(DRIZZLE_TOKEN) private readonly db?: DrizzleDB,
  ) {}

  async getAllSeriesCategories(page = 1, limit = 20) {
    const categories = await this.categoriesService.getCategories('SERIES');

    if (categories.length === 0) {
      return {
        data: [],
        meta: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    let countMap = new Map<string, number>();

    if (this.db) {
      // Single aggregated GROUP BY query to count published articles per category
      const counts = await this.db
        .select({
          categoryId: postsTable.categoryId,
          total: count(),
        })
        .from(postsTable)
        .where(
          and(
            eq(postsTable.contentType, 'SERIES'),
            eq(postsTable.status, 'PUBLISHED'),
            isNull(postsTable.deletedAt),
          ),
        )
        .groupBy(postsTable.categoryId);

      for (const row of counts) {
        if (row.categoryId) {
          countMap.set(row.categoryId, Number(row.total));
        }
      }
    } else if (this.postsRepo) {
      // Unit test fallback when DB is omitted
      for (const cat of categories) {
        const feed = await this.postsRepo.findFeedPaginated({
          contentType: 'SERIES',
          categoryId: cat.id,
          status: 'PUBLISHED',
          page: 1,
          limit: 1,
        });
        countMap.set(cat.id, feed.meta.totalItems);
      }
    }

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      publishedArticleCount: countMap.get(cat.id) || 0,
      createdAt: cat.createdAt,
    }));

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

  async getSeriesNavigation(postId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post || post.contentType !== 'SERIES' || !post.categoryId) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'Not Found',
        message: `Series post with ID '${postId}' not found.`,
        code: 'SERIES_POST_NOT_FOUND',
      });
    }

    const category = await this.categoriesService.getCategoryById(post.categoryId);

    const allPosts = await this.postsRepo.findFeedPaginated({
      contentType: 'SERIES',
      categoryId: post.categoryId,
      status: 'PUBLISHED',
      page: 1,
      limit: 100,
      sortBy: 'publishedAt',
      order: 'ASC',
    });

    const currentIndex = allPosts.data.findIndex((p) => p.id === postId);
    const previousPost =
      currentIndex > 0
        ? {
            id: allPosts.data[currentIndex - 1].id,
            title: allPosts.data[currentIndex - 1].title,
            slug: allPosts.data[currentIndex - 1].slug,
          }
        : null;

    const nextPost =
      currentIndex >= 0 && currentIndex < allPosts.data.length - 1
        ? {
            id: allPosts.data[currentIndex + 1].id,
            title: allPosts.data[currentIndex + 1].title,
            slug: allPosts.data[currentIndex + 1].slug,
          }
        : null;

    return {
      series: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      currentPostIndex: currentIndex >= 0 ? currentIndex + 1 : 1,
      totalPosts: allPosts.data.length,
      previousPost,
      nextPost,
      tableOfContents: allPosts.data.map((p, idx) => ({
        index: idx + 1,
        id: p.id,
        title: p.title,
        slug: p.slug,
        isCurrent: p.id === postId,
      })),
    };
  }
}
