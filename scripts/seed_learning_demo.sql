-- Dữ liệu demo Learning: có thể chạy lại an toàn nhờ các UUID cố định.
INSERT INTO learning_series (id,title,slug,description,domain_id,category_id,status,is_published,created_by)
SELECT '90000000-0000-4000-8000-000000000001', U&'Ch\1EE9ng kho\00E1n cho ng\01B0\1EDDi m\1EDBi', 'chung-khoan-cho-nguoi-moi', U&'L\1ED9 tr\00ECnh n\1EAFm v\1EEFng n\1EC1n t\1EA3ng ch\1EE9ng kho\00E1n.', d.id,c.id,'PUBLISHED',true,'11111111-aaaa-43f7-9abc-111111111111'
FROM domains d JOIN categories c ON c.domain_id=d.id WHERE d.code='MONEY' AND c.slug='chung-khoan' AND c.scope='SERIES'
ON CONFLICT (id) DO NOTHING;

INSERT INTO posts (id,author_id,content_type,title,slug,body,category_id,domain_id,status,editorial_status,moderation_status,source_type,meta_title,meta_description,published_at)
SELECT v.id::uuid,'11111111-aaaa-43f7-9abc-111111111111','SERIES',v.title,v.slug,v.body,c.id,d.id,'PUBLISHED','PUBLISHED','APPROVED','EDITORIAL',v.title,v.description,now()
FROM (VALUES
 ('91000000-0000-4000-8000-000000000001',U&'Ch\1EE9ng kho\00E1n l\00E0 g\00EC?','bai-1-chung-khoan-la-gi',U&'B\00E0i h\1ECDc 1: kh\00E1i ni\1EC7m c\01A1 b\1EA3n, c\00E1ch c\1ED5 phi\1EBFu v\00E0 th\1ECB tr\01B0\1EDDng ho\1EA1t \0111\1ED9ng.',U&'N\1EC1n t\1EA3ng ch\1EE9ng kho\00E1n'),
 ('91000000-0000-4000-8000-000000000002',U&'\0110\1ECDc b\00E1o c\00E1o t\00E0i ch\00EDnh','bai-2-doc-bao-cao-tai-chinh',U&'B\00E0i h\1ECDc 2: doanh thu, l\1EE3i nhu\1EADn, t\00E0i s\1EA3n v\00E0 n\1EE3 ph\1EA3i tr\1EA3.',U&'Ph\00E2n t\00EDch doanh nghi\1EC7p'),
 ('91000000-0000-4000-8000-000000000003',U&'\0110\1ECBnh gi\00E1 c\1ED5 phi\1EBFu c\01A1 b\1EA3n','bai-3-dinh-gia-co-phieu',U&'B\00E0i h\1ECDc 3: P/E, P/B, d\00F2ng ti\1EC1n v\00E0 nh\1EEFng gi\1EDBi h\1EA1n khi \0111\1ECBnh gi\00E1.',U&'\0110\1ECBnh gi\00E1 c\1ED5 phi\1EBFu')
) v(id,title,slug,body,description)
JOIN domains d ON d.code='MONEY' JOIN categories c ON c.domain_id=d.id AND c.slug='chung-khoan' AND c.scope='SERIES'
ON CONFLICT (id) DO NOTHING;

INSERT INTO learning_series_posts (series_id,post_id,lesson_order)
VALUES ('90000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001',1),('90000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002',2),('90000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000003',3)
ON CONFLICT DO NOTHING;

INSERT INTO quizzes (post_id,title,description) VALUES ('91000000-0000-4000-8000-000000000001',U&'Ki\1EC3m tra b\00E0i 1',U&'\00D4n l\1EA1i kh\00E1i ni\1EC7m c\01A1 b\1EA3n.') ON CONFLICT (post_id) DO NOTHING;
