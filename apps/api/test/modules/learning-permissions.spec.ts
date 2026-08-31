import 'reflect-metadata';
import { LearningController } from '../../src/modules/learning/controllers/learning.controller';
import { REQUIRE_PERMISSION_KEY } from '../../src/modules/auth/decorators/require-permission.decorator';

describe('Learning admin permissions', () => {
  it.each(['getAdminQuiz', 'upsertQuiz', 'updateEditorialStatus', 'getEditorialQueue', 'addSource', 'removeSource'])('requires learning:manage for %s', (method) => {
    const permissions = Reflect.getMetadata(REQUIRE_PERMISSION_KEY, LearningController.prototype[method as keyof LearningController]);
    expect(permissions).toEqual(['learning:manage']);
  });
});
