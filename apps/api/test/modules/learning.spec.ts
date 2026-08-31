import { LearningService } from '../../src/modules/learning/services/learning.service';

describe('LearningService', () => {
  it('grades submitted answers on the server', async () => {
    const db = {
      select: jest.fn()
        .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ id: 'quiz-1' }]) }) }) })
        .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([{ id: 'question-1', options: [{ id: 'a', isCorrect: true }, { id: 'b', isCorrect: false }] }]) }) }),
    } as any;
    const service = new LearningService(db);

    await expect(service.submitQuiz('post-1', { answers: [{ questionId: 'question-1', optionId: 'a' }] })).resolves.toEqual({ score: 1, total: 1, percentage: 100 });
  });

  it('does not return correct-answer flags in the public quiz payload', async () => {
    const db = {
      select: jest.fn()
        .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ id: 'post-1', contentType: 'SERIES', status: 'PUBLISHED' }]) }) }) })
        .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ id: 'quiz-1', postId: 'post-1', title: 'Quiz', description: null }]) }) }) })
        .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ orderBy: jest.fn().mockResolvedValue([{ id: 'q-1', prompt: 'Question', options: [{ id: 'a', label: 'A', isCorrect: true }], explanation: null, sortOrder: 0 }]) }) }) }),
    } as any;
    const service = new LearningService(db);
    const result = await service.getQuizForPost('post-1');
    expect(result.questions[0].options).toEqual([{ id: 'a', label: 'A' }]);
  });

  it('rejects quiz questions without exactly one correct answer', async () => {
    const db = { select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ id: 'post-1', contentType: 'SERIES' }]) }) }) }) } as any;
    const service = new LearningService(db);
    await expect(service.upsertQuiz('post-1', { title: 'Quiz', questions: [{ prompt: 'Q', options: [{ id: 'a', label: 'A', isCorrect: true }, { id: 'b', label: 'B', isCorrect: true }] }] })).rejects.toThrow('exactly one correct answer');
  });

  it('updates editorial and public status together', async () => {
    const db = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ id: 'post-1', contentType: 'SERIES' }]) }) }) }),
      update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'post-1', editorialStatus: 'PUBLISHED', status: 'PUBLISHED' }]) }) }) }),
    } as any;
    const service = new LearningService(db);
    await expect(service.updateEditorialStatus('post-1', { editorialStatus: 'PUBLISHED' })).resolves.toMatchObject({ editorialStatus: 'PUBLISHED', status: 'PUBLISHED' });
  });

  it('submits only the current user owned learning post for review', async () => {
    const db = { update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 'post-1', editorialStatus: 'REVIEW', status: 'DRAFT' }]) }) }) }) } as any;
    const service = new LearningService(db);
    await expect(service.submitForReview('author-1', 'post-1')).resolves.toEqual({ id: 'post-1', editorialStatus: 'REVIEW', status: 'DRAFT' });
    expect(db.update).toHaveBeenCalled();
  });
});
