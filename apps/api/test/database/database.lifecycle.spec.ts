import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseModule } from '../../src/database/database.module';
import { PG_POOL_TOKEN, DRIZZLE_TOKEN } from '../../src/database/database.constants';
import { databaseConfig } from '../../src/config/database.config';

describe('DatabaseModule (Lifecycle & Connection)', () => {
  let moduleRef: TestingModule;
  let pool: Pool;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseConfig],
        }),
        DatabaseModule,
      ],
    }).compile();

    pool = moduleRef.get<Pool>(PG_POOL_TOKEN);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should initialize PG_POOL_TOKEN and DRIZZLE_TOKEN providers successfully', () => {
    expect(pool).toBeDefined();
    const drizzleDb = moduleRef.get(DRIZZLE_TOKEN);
    expect(drizzleDb).toBeDefined();
  });

  it('should trigger graceful connection pool shutdown on application teardown', async () => {
    const endSpy = jest.spyOn(pool, 'end').mockImplementation(() => Promise.resolve());
    await moduleRef.close();
    expect(endSpy).toHaveBeenCalled();
  });
});
