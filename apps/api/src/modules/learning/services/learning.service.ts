import { BadRequestException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { and, asc, eq, desc, count } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/database.constants';
import type { DrizzleDB } from '../../../database/database.module';
import { learningProgressTable, learningSourcesTable, postsTable, quizQuestionsTable, quizzesTable } from '../../../database/schema';
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { UpsertQuizDto } from '../dto/upsert-quiz.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';
import { UpdateEditorialStatusDto } from '../dto/update-editorial-status.dto';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { QueryLearningPostsDto } from '../dto/query-learning-posts.dto';
import { CreateLearningSourceDto } from '../dto/create-learning-source.dto';
import { AuditLogRepository } from '../../../database/repositories/audit-log.repository';

@Injectable()
export class LearningService {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleDB, @Optional() private readonly auditLogService?: AuditLogService, @Optional() private readonly auditLogRepository?: AuditLogRepository) {}

  async getQuizForPost(postId: string) {
    const [post] = await this.db
      .select({ id: postsTable.id, contentType: postsTable.contentType, status: postsTable.status })
      .from(postsTable)
      .where(and(eq(postsTable.id, postId), eq(postsTable.contentType, 'SERIES'), eq(postsTable.status, 'PUBLISHED')))
      .limit(1);

    if (!post) throw new NotFoundException('Published learning post not found.');

    const [quiz] = await this.db.select().from(quizzesTable).where(eq(quizzesTable.postId, postId)).limit(1);
    if (!quiz) return { quiz: null, questions: [] };

    const questions = await this.db
      .select({ id: quizQuestionsTable.id, prompt: quizQuestionsTable.prompt, options: quizQuestionsTable.options, explanation: quizQuestionsTable.explanation, sortOrder: quizQuestionsTable.sortOrder })
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quiz.id))
      .orderBy(asc(quizQuestionsTable.sortOrder));

    return { quiz, questions: questions.map((question) => ({ ...question, options: (question.options as Array<Record<string, unknown>>).map(({ isCorrect, ...option }) => option) })) };
  }

  async getAdminQuizForPost(postId: string) {
    const [quiz] = await this.db.select().from(quizzesTable).where(eq(quizzesTable.postId, postId)).limit(1);
    if (!quiz) return { quiz: null, questions: [] };
    const questions = await this.db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quiz.id)).orderBy(asc(quizQuestionsTable.sortOrder));
    return { quiz, questions };
  }

  async getSources(postId: string, publicOnly = true) {
    return this.db.select({ id: learningSourcesTable.id, title: learningSourcesTable.title, url: learningSourcesTable.url, publisher: learningSourcesTable.publisher, sourceType: learningSourcesTable.sourceType, checkedAt: learningSourcesTable.checkedAt }).from(learningSourcesTable).where(publicOnly ? and(eq(learningSourcesTable.postId, postId), eq(learningSourcesTable.isPublic, true)) : eq(learningSourcesTable.postId, postId));
  }

  async getLearningDetail(postId: string, userId?: string) {
    const [post] = await this.db.select({ id: postsTable.id, title: postsTable.title, slug: postsTable.slug, body: postsTable.body, coverMediaId: postsTable.coverMediaId, categoryId: postsTable.categoryId, publishedAt: postsTable.publishedAt, updatedAt: postsTable.updatedAt, editorialStatus: postsTable.editorialStatus }).from(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.contentType, 'SERIES'), eq(postsTable.status, 'PUBLISHED'))).limit(1);
    if (!post) throw new NotFoundException('Published learning post not found.');
    const [quiz, sources, progress] = await Promise.all([
      this.getQuizForPost(postId),
      this.getSources(postId),
      userId ? this.getProgress(userId, postId) : Promise.resolve(null),
    ]);
    return { post, quiz, sources, progress };
  }

  async addSource(postId: string, dto: CreateLearningSourceDto) {
    const [source] = await this.db.insert(learningSourcesTable).values({ postId, title: dto.title, url: dto.url, publisher: dto.publisher, sourceType: dto.sourceType ?? 'REFERENCE', isPublic: dto.isPublic ?? true, notes: dto.notes, checkedAt: new Date() }).returning();
    return source;
  }

  async removeSource(id: string) { await this.db.delete(learningSourcesTable).where(eq(learningSourcesTable.id, id)); return { deleted: true }; }

  async upsertQuiz(postId: string, dto: UpsertQuizDto) {
    const [post] = await this.db.select({ id: postsTable.id }).from(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.contentType, 'SERIES'))).limit(1);
    if (!post) throw new NotFoundException('Learning post not found.');
    for (const question of dto.questions) {
      if (question.options.length < 2 || question.options.filter((option) => option.isCorrect).length !== 1) throw new BadRequestException('Each quiz question must have at least two options and exactly one correct answer.');
    }
    return this.db.transaction(async (tx) => {
      const [quiz] = await tx.insert(quizzesTable).values({ postId, title: dto.title, description: dto.description ?? null }).onConflictDoUpdate({ target: quizzesTable.postId, set: { title: dto.title, description: dto.description ?? null, updatedAt: new Date() } }).returning();
      await tx.delete(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quiz.id));
      if (dto.questions.length) await tx.insert(quizQuestionsTable).values(dto.questions.map((question, index) => ({ quizId: quiz.id, prompt: question.prompt, options: question.options, explanation: question.explanation ?? null, sortOrder: question.sortOrder ?? index })));
      return quiz;
    });
  }

  async submitQuiz(postId: string, dto: SubmitQuizDto) {
    const [quiz] = await this.db.select({ id: quizzesTable.id }).from(quizzesTable).where(eq(quizzesTable.postId, postId)).limit(1);
    if (!quiz) throw new NotFoundException('Quiz not found.');
    const questions = await this.db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quiz.id));
    const answerMap = new Map(dto.answers.map((answer) => [answer.questionId, answer.optionId]));
    const correct = questions.filter((question) => (question.options as Array<{ id: string; isCorrect: boolean }>).some((option) => option.id === answerMap.get(question.id) && option.isCorrect)).length;
    return { score: correct, total: questions.length, percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0 };
  }

  async updateProgress(userId: string, postId: string, dto: UpdateProgressDto) {
    const [post] = await this.db.select({ id: postsTable.id }).from(postsTable).where(and(eq(postsTable.id, postId), eq(postsTable.contentType, 'SERIES'), eq(postsTable.status, 'PUBLISHED'))).limit(1);
    if (!post) throw new NotFoundException('Published learning post not found.');

    const now = new Date();
    const [progress] = await this.db
      .insert(learningProgressTable)
      .values({ userId, postId, completedAt: dto.completed ? now : null, lastViewedAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: [learningProgressTable.userId, learningProgressTable.postId], set: { completedAt: dto.completed ? now : null, lastViewedAt: now, updatedAt: now } })
      .returning();

    return progress;
  }

  async getProgress(userId: string, postId: string) {
    const [progress] = await this.db.select().from(learningProgressTable).where(and(eq(learningProgressTable.userId, userId), eq(learningProgressTable.postId, postId))).limit(1);
    return progress ?? null;
  }

  async getUserProgress(userId: string) {
    return this.db
      .select({ postId: learningProgressTable.postId, title: postsTable.title, slug: postsTable.slug, completedAt: learningProgressTable.completedAt, lastViewedAt: learningProgressTable.lastViewedAt })
      .from(learningProgressTable)
      .innerJoin(postsTable, eq(postsTable.id, learningProgressTable.postId))
      .where(eq(learningProgressTable.userId, userId))
      .orderBy(desc(learningProgressTable.lastViewedAt));
  }

  async updateEditorialStatus(postId: string, dto: UpdateEditorialStatusDto, actorId?: string) {
    const [post] = await this.db.select({ id: postsTable.id, contentType: postsTable.contentType }).from(postsTable).where(eq(postsTable.id, postId)).limit(1);
    if (!post || post.contentType !== 'SERIES') throw new NotFoundException('Learning post not found.');
    const [updated] = await this.db.update(postsTable).set({ editorialStatus: dto.editorialStatus, updatedAt: new Date(), status: dto.editorialStatus === 'PUBLISHED' ? 'PUBLISHED' : dto.editorialStatus === 'ARCHIVED' ? 'ARCHIVED' : 'DRAFT' }).where(eq(postsTable.id, postId)).returning({ id: postsTable.id, editorialStatus: postsTable.editorialStatus, status: postsTable.status, updatedAt: postsTable.updatedAt });
    await this.auditLogService?.log({ actor_id: actorId || 'system', action: 'LEARNING_STATUS_UPDATE', entity_type: 'posts', entity_id: postId, metadata: { editorialStatus: dto.editorialStatus } });
    return updated;
  }

  async submitForReview(userId: string, postId: string) {
    const [updated] = await this.db.update(postsTable).set({ editorialStatus: 'REVIEW', status: 'DRAFT', updatedAt: new Date() }).where(and(eq(postsTable.id, postId), eq(postsTable.authorId, userId), eq(postsTable.contentType, 'SERIES'))).returning({ id: postsTable.id, editorialStatus: postsTable.editorialStatus, status: postsTable.status });
    if (!updated) throw new NotFoundException('Learning post not found or not owned by the current user.');
    await this.auditLogService?.log({ actor_id: userId, action: 'LEARNING_SUBMIT_REVIEW', entity_type: 'posts', entity_id: postId, metadata: { editorialStatus: 'REVIEW' } });
    return updated;
  }

  async getAuditHistory(postId: string) {
    if (this.auditLogRepository) {
      const result = await this.auditLogRepository.findLogsPaginated(1, 100, undefined, 'posts');
      return result.data.filter((log) => log.entityId === postId && ['LEARNING_SUBMIT_REVIEW', 'LEARNING_STATUS_UPDATE'].includes(log.action));
    }
    return (this.auditLogService?.getLogs() ?? []).filter((log) => log.entity_type === 'posts' && log.entity_id === postId && ['LEARNING_SUBMIT_REVIEW', 'LEARNING_STATUS_UPDATE'].includes(log.action));
  }

  async getEditorialQueue(query: QueryLearningPostsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filters = [eq(postsTable.contentType, 'SERIES')];
    if (query.editorialStatus) filters.push(eq(postsTable.editorialStatus, query.editorialStatus));
    const where = and(...filters);
    const [totalResult] = await this.db.select({ total: count() }).from(postsTable).where(where);
    const data = await this.db.select({ id: postsTable.id, title: postsTable.title, slug: postsTable.slug, status: postsTable.status, editorialStatus: postsTable.editorialStatus, categoryId: postsTable.categoryId, createdAt: postsTable.createdAt, updatedAt: postsTable.updatedAt, publishedAt: postsTable.publishedAt }).from(postsTable).where(where).orderBy(desc(postsTable.updatedAt)).limit(limit).offset((page - 1) * limit);
    const totalItems = Number(totalResult?.total || 0);
    return { data, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit), hasNextPage: page * limit < totalItems, hasPreviousPage: page > 1 } };
  }
}
