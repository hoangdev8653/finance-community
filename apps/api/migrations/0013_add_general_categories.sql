-- Categories for content that does not belong to a specialized domain.
INSERT INTO categories (name, name_vi, name_en, slug, scope, domain_id, content_types, description, is_active, sort_order, created_at, updated_at)
SELECT v.name, v.name, v.name_en, v.slug, 'COMMUNITY', d.id, '["COMMUNITY", "NEWS", "SERIES"]'::jsonb, v.description, true, v.sort_order, NOW(), NOW()
FROM domains d
CROSS JOIN (VALUES
  ('Khác', 'Other', 'other', 'Nội dung chưa thuộc domain chuyên biệt.', 1),
  ('Tin cộng đồng', 'Community News', 'community-news', 'Hoạt động và thảo luận chung của cộng đồng.', 2),
  ('Thông báo', 'Announcements', 'announcements', 'Thông báo chính thức từ hệ thống hoặc ban quản trị.', 3),
  ('Sự kiện', 'Events', 'events', 'Hội thảo, cuộc thi và các hoạt động cộng đồng.', 4)
) AS v(name, name_en, slug, description, sort_order)
WHERE d.code = 'GENERAL'
ON CONFLICT (scope, slug) DO UPDATE SET name = EXCLUDED.name, name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, domain_id = EXCLUDED.domain_id, content_types = EXCLUDED.content_types, description = EXCLUDED.description, is_active = true;
