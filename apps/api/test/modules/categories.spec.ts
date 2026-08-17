import { CategoriesService } from '../../src/modules/categories/services/categories.service';
import { CategoriesRepository } from '../../src/database/repositories/categories.repository';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let mockCategoriesRepo: jest.Mocked<CategoriesRepository>;

  beforeEach(() => {
    mockCategoriesRepo = {
      createTx: jest.fn().mockImplementation(async (tx, data) => ({
        id: 'cat-uuid-1',
        name: data.name,
        slug: data.slug,
        scope: data.scope,
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      findById: jest.fn(),
      findByScopeAndSlug: jest.fn(),
      findAllByScope: jest.fn().mockResolvedValue([
        {
          id: 'cat-uuid-1',
          name: 'Market Analysis',
          slug: 'market-analysis',
          scope: 'COMMUNITY',
          description: null,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      updateTx: jest.fn(),
    } as any;

    categoriesService = new CategoriesService(mockCategoriesRepo);
  });

  it('should create new category in valid scope', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue(undefined);

    const result = await categoriesService.createCategory('admin-uuid-1', {
      name: 'Market Analysis',
      slug: 'market-analysis',
      scope: 'COMMUNITY',
    });

    expect(result.id).toBe('cat-uuid-1');
    expect(result.scope).toBe('COMMUNITY');
    expect(mockCategoriesRepo.createTx).toHaveBeenCalledTimes(1);
  });

  it('should reject category creation with duplicate slug within same scope', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue({
      id: 'cat-existing',
      name: 'Market Analysis',
      slug: 'market-analysis',
      scope: 'COMMUNITY',
      description: null,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      categoriesService.createCategory('admin-uuid-1', {
        name: 'Market Analysis',
        slug: 'market-analysis',
        scope: 'COMMUNITY',
      }),
    ).rejects.toThrow();
  });
});
