import { TagsService } from '../../src/modules/tags/services/tags.service';
import { TagsRepository } from '../../src/database/repositories/tags.repository';

describe('TagsService', () => {
  let tagsService: TagsService;
  let mockTagsRepo: jest.Mocked<TagsRepository>;

  beforeEach(() => {
    mockTagsRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      searchByName: jest.fn().mockResolvedValue([
        { id: 'tag-1', name: 'Investing', slug: 'investing', createdAt: new Date() },
      ]),
      createOrGetTx: jest.fn().mockImplementation(async (tx, name, slug) => ({
        id: 'tag-uuid-1',
        name,
        slug,
        createdAt: new Date(),
      })),
    } as any;

    tagsService = new TagsService(mockTagsRepo);
  });

  it('should slugify tag name correctly into kebab-case', () => {
    const slug1 = tagsService.slugify(' Value Investing & Stocks ');
    expect(slug1).toBe('value-investing-stocks');
  });

  it('should create or retrieve tag atomically using slug', async () => {
    const tag = await tagsService.createTag({ name: 'Personal Finance' });

    expect(tag.id).toBe('tag-uuid-1');
    expect(tag.slug).toBe('personal-finance');
    expect(mockTagsRepo.createOrGetTx).toHaveBeenCalledWith(undefined, 'Personal Finance', 'personal-finance');
  });

  it('should search tags by keyword', async () => {
    const results = await tagsService.searchTags('invest');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Investing');
  });
});
