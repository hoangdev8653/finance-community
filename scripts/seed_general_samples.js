const { Client } = require('../apps/api/node_modules/pg');

const posts = [
  ['community-news', 'Cộng đồng MorningView chia sẻ kiến thức tài chính thiết thực', 28],
  ['events', 'Workshop quản lý tài chính cá nhân dành cho người trẻ', 17],
];

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_db' });
  await db.connect();
  try {
    await db.query('BEGIN');
    const admin = (await db.query("SELECT id FROM users WHERE email='admin@financepulse.vn' LIMIT 1")).rows[0];
    if (!admin) throw new Error('Admin user not found');
    for (const [categorySlug, title, views] of posts) {
      const category = (await db.query("SELECT id, domain_id FROM categories WHERE slug=$1 AND domain_id=(SELECT id FROM domains WHERE code='GENERAL') LIMIT 1", [categorySlug])).rows[0];
      if (!category) throw new Error(`General category not found: ${categorySlug}`);
      const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await db.query(`INSERT INTO posts (author_id, content_type, title, slug, body, category_id, domain_id, status, moderation_status, view_count, published_at, created_at, updated_at) VALUES ($1,'COMMUNITY',$2,$3,$4,$5,$6,'PUBLISHED','APPROVED',$7,NOW(),NOW(),NOW()) ON CONFLICT (content_type, slug) DO NOTHING`, [admin.id, title, slug, `<p>${title}</p><p>Nội dung chia sẻ dành cho cộng đồng MorningView.</p>`, category.id, category.domain_id, views]);
    }
    await db.query('COMMIT'); console.log('Created 2 General domain sample posts.');
  } catch (e) { await db.query('ROLLBACK'); throw e; } finally { await db.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
