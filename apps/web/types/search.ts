import { PostEntity, TagEntity, CategoryEntity, PostsFeedParams } from './content';

export interface SearchFilterState {
  query?: string;
  contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS' | 'ALL';
  categoryId?: string;
  domainId?: string;
  tagId?: string;
  sortBy?: 'publishedAt' | 'createdAt';
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  type: 'post' | 'tag' | 'category';
  id: string;
  title: string;
  description?: string;
  slug?: string;
  contentType?: 'SERIES' | 'COMMUNITY' | 'NEWS';
  url: string;
}

export interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
}
