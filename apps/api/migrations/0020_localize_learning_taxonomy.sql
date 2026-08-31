-- Chuẩn hóa taxonomy Learning: tên và slug hiển thị tiếng Việt.
UPDATE categories c
SET name = v.name_en,
    name_vi = v.name_vi,
    slug = v.slug,
    updated_at = NOW()
FROM (VALUES
  ('MONEY', 'personal-finance', 'Tài chính cá nhân', 'Tài chính cá nhân', 'tai-chinh-ca-nhan'),
  ('TECH', 'digital-skills', 'Digital Skills', 'Kỹ năng số', 'ky-nang-so'),
  ('CAREER', 'career-skills', 'Career Skills', 'Kỹ năng nghề nghiệp', 'ky-nang-nghe-nghiep'),
  ('LIFE', 'health-basics', 'Health Basics', 'Sức khỏe cơ bản', 'suc-khoe-co-ban'),
  ('LIFE', 'life-skills', 'Life Skills', 'Kỹ năng sống', 'ky-nang-song')
) AS v(domain_code, old_slug, name_en, name_vi, slug)
JOIN domains d ON d.code = v.domain_code
WHERE c.domain_id = d.id
  AND c.scope = 'SERIES'
  AND c.slug = v.old_slug;

-- Tạo các tag Learning tiếng Việt dùng cho nội dung mới (không có tag cũ để migrate).
INSERT INTO tags (name, slug)
VALUES
  ('Tài chính cá nhân', 'tai-chinh-ca-nhan'),
  ('Kỹ năng số', 'ky-nang-so'),
  ('Kỹ năng nghề nghiệp', 'ky-nang-nghe-nghiep'),
  ('Sức khỏe cơ bản', 'suc-khoe-co-ban'),
  ('Kỹ năng sống', 'ky-nang-song')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
