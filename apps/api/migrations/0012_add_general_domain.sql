-- Fallback taxonomy for posts that do not belong to a specialized domain.
INSERT INTO domains (code, slug, name, name_vi, name_en, description, sort_order, is_active, is_promoted, created_at, updated_at)
VALUES ('GENERAL', 'general', 'General', 'Chung', 'General', 'Nội dung chưa thuộc một domain chuyên biệt.', 999, true, false, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET name_vi = EXCLUDED.name_vi, name_en = EXCLUDED.name_en, description = EXCLUDED.description, is_active = true;

INSERT INTO categories (name, slug, scope, domain_id, content_types, is_active, sort_order, created_at, updated_at)
SELECT 'Khác', 'other', 'COMMUNITY', id, '["COMMUNITY", "SERIES"]'::jsonb, true, 999, NOW(), NOW()
FROM domains WHERE code = 'GENERAL'
ON CONFLICT (scope, slug) DO UPDATE SET name = EXCLUDED.name, domain_id = EXCLUDED.domain_id, content_types = EXCLUDED.content_types, is_active = true;
