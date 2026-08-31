import { IsIn } from 'class-validator';

export class UpdateEditorialStatusDto {
  @IsIn(['DRAFT', 'REVIEW', 'PUBLISHED', 'NEEDS_UPDATE', 'ARCHIVED'])
  editorialStatus!: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'NEEDS_UPDATE' | 'ARCHIVED';
}
