-- Hoàn thiện 4 lĩnh vực và nhóm kiến thức Learning.
UPDATE domains SET name=U&'\0110\1EDDi s\1ED1ng v\00E0 S\1EE9c kh\1ECFe', name_vi=U&'\0110\1EDDi s\1ED1ng v\00E0 S\1EE9c kh\1ECFe', slug='doi-song-suc-khoe' WHERE code='LIFE';

INSERT INTO categories (name, slug, scope, domain_id, name_vi, content_types, sort_order, is_active, is_promoted)
SELECT v.name, v.slug, 'SERIES', d.id, v.name, '["SERIES"]'::jsonb, v.sort_order, true, false
FROM (VALUES
  (U&'Ch\1EE9ng kho\00E1n', 'chung-khoan', 'MONEY', 20),
  (U&'\0110\1EA7u t\01B0', 'dau-tu', 'MONEY', 30),
  (U&'Kinh t\1EBF v\0129 m\00F4', 'kinh-te-vi-mo', 'MONEY', 40),
  (U&'Tr\00ED tu\1EC7 nh\00E2n t\1EA1o', 'tri-tue-nhan-tao', 'TECH', 20),
  (U&'An to\00E0n tr\1EF1c tuy\1EBFn', 'an-toan-truc-tuyen', 'TECH', 30),
  (U&'Ph\01B0\01A1ng ph\00E1p h\1ECDc t\1EADp', 'phuong-phap-hoc-tap', 'CAREER', 20),
  (U&'Ph\00E1t tri\1EC3n b\1EA3n th\00E2n', 'phat-trien-ban-than', 'CAREER', 30),
  (U&'Th\00F3i quen l\00E0nh m\1EA1nh', 'thoi-quen-lanh-manh', 'LIFE', 30)
) AS v(name, slug, domain_code, sort_order)
JOIN domains d ON d.code=v.domain_code
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.scope='SERIES' AND c.slug=v.slug);
