const { Client } = require('../apps/api/node_modules/pg');

const categories = [
  ['MONEY', 'Personal Finance', 'personal-finance'], ['MONEY', 'Stocks', 'stock-market'], ['MONEY', 'Banking', 'banking'], ['MONEY', 'Real Estate', 'real-estate'], ['MONEY', 'Macroeconomics', 'macroeconomics'],
  ['BUSINESS', 'Business', 'business'], ['BUSINESS', 'Startups', 'startup'], ['TECH', 'Artificial Intelligence', 'ai'], ['TECH', 'Software', 'software'],
  ['CAREER', 'Career', 'career'], ['CAREER', 'Skills', 'skills'], ['LIFE', 'Health', 'health'], ['LIFE', 'Travel', 'travel'], ['SPORTS', 'Football', 'football'], ['SPORTS', 'Esports', 'esports'],
];
const posts = [
  ['MONEY', 'Stocks', 'How to read financial statements before buying a stock', 125], ['MONEY', 'Personal Finance', 'How to build an emergency fund in six months', 98], ['MONEY', 'Macroeconomics', 'Interest rates and the Vietnamese economy', 76],
  ['BUSINESS', 'Business', 'Key metrics for evaluating a business', 64], ['BUSINESS', 'Startups', 'From idea to a viable business model', 52], ['TECH', 'Artificial Intelligence', 'How AI is changing business operations', 110],
  ['TECH', 'Software', 'Building an effective digital workflow', 43], ['CAREER', 'Career', 'Skills needed in the modern labor market', 87], ['LIFE', 'Health', 'Principles for building healthy habits', 39], ['SPORTS', 'Football', 'Tactical analysis in modern football', 71],
];

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_db' });
  await db.connect();
  try {
    await db.query('BEGIN');
    const admin = await db.query("SELECT id FROM users WHERE email = 'admin@financepulse.vn' LIMIT 1");
    if (!admin.rows[0]) throw new Error('Admin user not found');
    const ids = new Map();
    for (const [code, name, slug] of categories) {
      const domain = await db.query('SELECT id FROM domains WHERE code = $1', [code]);
      if (!domain.rows[0]) throw new Error(`Domain ${code} not found`);
      const result = await db.query(`INSERT INTO categories (name, slug, scope, domain_id, content_types, is_active, sort_order, created_at, updated_at) VALUES ($1,$2,'COMMUNITY',$3,$4,true,1,NOW(),NOW()) ON CONFLICT (scope, slug) DO UPDATE SET name=EXCLUDED.name, domain_id=EXCLUDED.domain_id, content_types=EXCLUDED.content_types, is_active=true RETURNING id`, [name, slug, domain.rows[0].id, JSON.stringify(['COMMUNITY','NEWS','SERIES'])]);
      ids.set(`${code}:${name}`, result.rows[0].id);
    }
    for (const [code, category, title, views] of posts) {
      const domain = await db.query('SELECT id FROM domains WHERE code = $1', [code]);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await db.query(`INSERT INTO posts (author_id, content_type, title, slug, body, category_id, domain_id, status, moderation_status, view_count, published_at, created_at, updated_at) VALUES ($1,'COMMUNITY',$2,$3,$4,$5,$6,'PUBLISHED','APPROVED',$7,NOW(),NOW(),NOW()) ON CONFLICT (content_type, slug) DO NOTHING`, [admin.rows[0].id, title, slug, `<p>${title}</p>`, ids.get(`${code}:${category}`), domain.rows[0].id, views]);
    }
    await db.query('COMMIT');
    console.log(`Seeded ${categories.length} categories and ${posts.length} sample posts.`);
  } catch (e) { await db.query('ROLLBACK'); throw e; } finally { await db.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
