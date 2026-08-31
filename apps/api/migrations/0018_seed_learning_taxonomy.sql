-- General Learning taxonomy. Safe to re-run and does not remove existing categories.
INSERT INTO categories (name, name_vi, name_en, slug, scope, domain_id, content_types, description, is_active, is_promoted, sort_order, created_at, updated_at)
SELECT v.name, v.name_vi, v.name_en, v.slug, 'SERIES', d.id, '["SERIES"]'::jsonb, v.description, true, v.is_promoted, v.sort_order, now(), now()
FROM (VALUES
  ('Personal Finance', 'Tài chính cá nhân', 'Personal Finance', 'personal-finance', 'Kiến thức quản lý tiền bạc và lập kế hoạch tài chính.', true, 10, 'MONEY'),
  ('Health Basics', 'Sức khỏe cơ bản', 'Health Basics', 'health-basics', 'Kiến thức nền tảng về sức khỏe và lối sống lành mạnh.', true, 20, 'LIFE'),
  ('Life Skills', 'Kỹ năng sống', 'Life Skills', 'life-skills', 'Những kỹ năng thiết thực để học tập và sống chủ động hơn.', true, 30, 'LIFE'),
  ('Career Skills', 'Kỹ năng nghề nghiệp', 'Career Skills', 'career-skills', 'Kỹ năng làm việc, giao tiếp và phát triển nghề nghiệp.', false, 40, 'CAREER'),
  ('Digital Skills', 'Kỹ năng số', 'Digital Skills', 'digital-skills', 'Kiến thức công nghệ và kỹ năng sử dụng công cụ số.', false, 50, 'TECH')
) AS v(name, name_vi, name_en, slug, description, is_promoted, sort_order, domain_code)
JOIN domains d ON d.code = v.domain_code
ON CONFLICT (scope, slug) DO UPDATE SET
  name_vi = EXCLUDED.name_vi,
  name_en = EXCLUDED.name_en,
  domain_id = EXCLUDED.domain_id,
  content_types = EXCLUDED.content_types,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();
