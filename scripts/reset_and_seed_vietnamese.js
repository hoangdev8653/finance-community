const { Client } = require('../apps/api/node_modules/pg');

const categories = [
  ['personal-finance', '\u0054\u00e0i ch\u00ednh c\u00e1 nh\u00e2n'], ['stock-market', 'Ch\u1ee9ng kho\u00e1n'], ['macroeconomics', 'V\u0129 m\u00f4'],
  ['business', 'Doanh nghi\u1ec7p'], ['startup', 'Kh\u1edfi nghi\u1ec7p'], ['ai', 'Tr\u00ed tu\u1ec7 nh\u00e2n t\u1ea1o'], ['software', 'Ph\u1ea7n m\u1ec1m'],
  ['career', 'Ngh\u1ec1 nghi\u1ec7p'], ['health', 'S\u1ee9c kh\u1ecfe'], ['football', 'B\u00f3ng \u0111\u00e1'],
];
const posts = [
  ['stock-market', 'C\u00e1ch \u0111\u1ecdc b\u00e1o c\u00e1o t\u00e0i ch\u00ednh tr\u01b0\u1edbc khi mua c\u1ed5 phi\u1ebfu', 125],
  ['ai', 'Tr\u00ed tu\u1ec7 nh\u00e2n t\u1ea1o \u0111ang thay \u0111\u1ed5i doanh nghi\u1ec7p Vi\u1ec7t Nam', 110],
  ['personal-finance', 'C\u00e1ch x\u00e2y d\u1ef1ng qu\u1ef9 d\u1ef1 ph\u00f2ng c\u00e1 nh\u00e2n trong s\u00e1u th\u00e1ng', 98],
  ['career', 'K\u1ef9 n\u0103ng quan tr\u1ecdng trong th\u1ecb tr\u01b0\u1eddng lao \u0111\u1ed9ng m\u1edbi', 87],
  ['macroeconomics', 'L\u00e3i su\u1ea5t v\u00e0 t\u00e1c \u0111\u1ed9ng \u0111\u1ebfn kinh t\u1ebf Vi\u1ec7t Nam', 76],
  ['football', 'Ph\u00e2n t\u00edch chi\u1ebfn thu\u1eadt trong b\u00f3ng \u0111\u00e1 hi\u1ec7n \u0111\u1ea1i', 71],
  ['business', 'Nh\u1eefng ch\u1ec9 s\u1ed1 quan tr\u1ecdng \u0111\u1ec3 \u0111\u00e1nh gi\u00e1 doanh nghi\u1ec7p', 64],
  ['startup', 'T\u1eeb \u00fd t\u01b0\u1edfng \u0111\u1ebfn m\u00f4 h\u00ecnh kinh doanh kh\u1ea3 thi', 52],
  ['software', 'X\u00e2y d\u1ef1ng quy tr\u00ecnh l\u00e0m vi\u1ec7c s\u1ed1 hi\u1ec7u qu\u1ea3', 43],
  ['health', 'Nguy\u00ean t\u1eafc x\u00e2y d\u1ef1ng th\u00f3i quen s\u1ed1ng l\u00e0nh m\u1ea1nh', 39],
];
async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finance_db' }); await db.connect();
  try { await db.query('BEGIN');
    const admin = (await db.query("SELECT id FROM users WHERE email='admin@financepulse.vn' LIMIT 1")).rows[0]; if (!admin) throw new Error('Admin user not found');
    await db.query('DELETE FROM posts');
    const ids = new Map();
    for (const [slug, name] of categories) { const r = await db.query('UPDATE categories SET name=$1, name_vi=$1, updated_at=NOW() WHERE slug=$2 RETURNING id', [name, slug]); if (r.rows[0]) ids.set(slug, r.rows[0].id); }
    for (const [categorySlug, title, views] of posts) { const c = await db.query('SELECT c.id, c.domain_id FROM categories c WHERE c.slug=$1 LIMIT 1', [categorySlug]); const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); await db.query(`INSERT INTO posts (author_id, content_type, title, slug, body, category_id, domain_id, status, moderation_status, view_count, published_at, created_at, updated_at) VALUES ($1,'COMMUNITY',$2,$3,$4,$5,$6,'PUBLISHED','APPROVED',$7,NOW(),NOW(),NOW())`, [admin.id, title, slug, `<p>${title}</p>`, c.rows[0].id, c.rows[0].domain_id, views]); }
    await db.query('COMMIT'); console.log('Replaced posts with 10 Vietnamese samples.');
  } catch (e) { await db.query('ROLLBACK'); throw e; } finally { await db.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
