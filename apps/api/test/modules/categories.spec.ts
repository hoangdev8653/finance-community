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
        domainId: data.domainId,
        parentId: data.parentId || null,
        contentTypes: data.contentTypes || [data.scope],
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
      deleteTx: jest.fn(),
    } as any;

    categoriesService = new CategoriesService(mockCategoriesRepo);
  });

  it('should create new category in valid scope', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue(undefined);

    const result = await categoriesService.createCategory('admin-uuid-1', {
      name: 'Market Analysis',
      slug: 'market-analysis',
      scope: 'COMMUNITY',
      domainId: 'domain-money',
    });

    expect(result.id).toBe('cat-uuid-1');
    expect(result.scope).toBe('COMMUNITY');
    expect(result.domainId).toBe('domain-money');
    expect(mockCategoriesRepo.createTx).toHaveBeenCalledTimes(1);
  });

  it('should reject category creation with duplicate slug within same scope', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue({
      id: 'cat-existing',
      name: 'Market Analysis',
      slug: 'market-analysis',
        scope: 'COMMUNITY',
        domainId: 'domain-money',
        parentId: null,
        contentTypes: ['COMMUNITY'],
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
        domainId: 'domain-money',
      }),
    ).rejects.toThrow();
  });

  it('should require category domain when creating a root category', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue(undefined);

    await expect(
      categoriesService.createCategory('admin-uuid-1', {
        name: 'Market Analysis',
        slug: 'market-analysis',
        scope: 'COMMUNITY',
      }),
    ).rejects.toThrow();
  });

  it('should reject parent category from a different domain', async () => {
    mockCategoriesRepo.findByScopeAndSlug.mockResolvedValue(undefined);
    mockCategoriesRepo.findById.mockResolvedValue({
      id: 'parent-cat',
      name: 'Parent',
      slug: 'parent',
      scope: 'COMMUNITY',
      domainId: 'domain-money',
      parentId: null,
      contentTypes: ['COMMUNITY'],
      description: null,
      sortOrder: 0,
      isActive: true,
      isPromoted: false,
      nameVi: null,
      nameEn: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await expect(
      categoriesService.createCategory('admin-uuid-1', {
        name: 'AI',
        slug: 'ai',
        scope: 'NEWS',
        domainId: 'domain-tech',
        parentId: 'parent-cat',
      }),
    ).rejects.toThrow();
  });
});
