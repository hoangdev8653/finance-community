-- ============================================================================
-- Finance Pulse & Community Platform — Comprehensive Production Seed Data
-- ============================================================================
-- Ensures all 22 database tables contain realistic, high-quality records.
-- Financial learning content, valuation series & community.
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_credentials (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_auth_credentials_user_id UNIQUE (user_id),
    CONSTRAINT fk_auth_credentials_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_bookmarks (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            NOT NULL,
    post_id         UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_post_bookmarks_user_post UNIQUE (user_id, post_id),
    CONSTRAINT fk_post_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_bookmarks_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================================================================
-- 1. USERS & AUTH CREDENTIALS
-- ============================================================================
INSERT INTO users (id, email, status, created_at) VALUES
    ('11111111-aaaa-43f7-9abc-111111111111', 'admin@financepulse.vn', 'ACTIVE', NOW() - INTERVAL '60 days'),
    ('22222222-bbbb-43f7-9abc-222222222222', 'sarah.chen.cfa@financepulse.vn', 'ACTIVE', NOW() - INTERVAL '50 days'),
    ('33333333-cccc-43f7-9abc-333333333333', 'nguyen.viet.cuong@macroview.vn', 'ACTIVE', NOW() - INTERVAL '45 days'),
    ('44444444-dddd-43f7-9abc-444444444444', 'tran.minh.hoang@fundlead.vn', 'ACTIVE', NOW() - INTERVAL '30 days'),
    ('55555555-eeee-43f7-9abc-555555555555', 'le.thu.trang@bankingpulse.vn', 'ACTIVE', NOW() - INTERVAL '20 days'),
    ('66666666-ffff-43f7-9abc-666666666666', 'moderator@financepulse.vn', 'ACTIVE', NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, status = EXCLUDED.status;

INSERT INTO auth_credentials (id, user_id, password_hash) VALUES
    ('00000000-0000-4000-8000-000000000001', '11111111-aaaa-43f7-9abc-111111111111', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.'),
    ('00000000-0000-4000-8000-000000000002', '22222222-bbbb-43f7-9abc-222222222222', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.'),
    ('00000000-0000-4000-8000-000000000003', '33333333-cccc-43f7-9abc-333333333333', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.'),
    ('00000000-0000-4000-8000-000000000004', '44444444-dddd-43f7-9abc-444444444444', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.'),
    ('00000000-0000-4000-8000-000000000005', '55555555-eeee-43f7-9abc-555555555555', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.'),
    ('00000000-0000-4000-8000-000000000006', '66666666-ffff-43f7-9abc-666666666666', '$2b$10$kPq/oK03r0u.N0yM2QxLd.tYV1I9uWkU5q5S7D.0s5N1h4R9k3V4.')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 2. ROLES & USER ROLES
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
    ('00000000-0000-4000-8000-000000000011', 'SUPER_ADMIN', 'System administrator with full permissions'),
    ('00000000-0000-4000-8000-000000000012', 'ADMIN', 'Editorial lead and content administrator'),
    ('00000000-0000-4000-8000-000000000013', 'MODERATOR', 'Community moderator and report reviewer'),
    ('00000000-0000-4000-8000-000000000014', 'MEMBER', 'Standard verified finance contributor')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '11111111-aaaa-43f7-9abc-111111111111', id FROM roles WHERE name = 'SUPER_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '22222222-bbbb-43f7-9abc-222222222222', id FROM roles WHERE name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '66666666-ffff-43f7-9abc-666666666666', id FROM roles WHERE name = 'MODERATOR'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '33333333-cccc-43f7-9abc-333333333333', id FROM roles WHERE name = 'MEMBER'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '44444444-dddd-43f7-9abc-444444444444', id FROM roles WHERE name = 'MEMBER'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '55555555-eeee-43f7-9abc-555555555555', id FROM roles WHERE name = 'MEMBER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- 3. MEDIA (High-quality financial covers & author portraits)
-- ============================================================================
INSERT INTO media (id, uploader_id, cloudinary_public_id, secure_url, resource_type, format, width, height, file_size, purpose) VALUES
    -- Avatars
    ('00000000-0000-4000-8000-000000000021', '11111111-aaaa-43f7-9abc-111111111111', 'avatars/admin_pulse', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'image', 'jpg', 200, 200, 45000, 'avatar'),
    ('00000000-0000-4000-8000-000000000022', '22222222-bbbb-43f7-9abc-222222222222', 'avatars/sarah_chen', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', 'image', 'jpg', 200, 200, 48000, 'avatar'),
    ('00000000-0000-4000-8000-000000000023', '33333333-cccc-43f7-9abc-333333333333', 'avatars/cuong_macro', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'image', 'jpg', 200, 200, 42000, 'avatar'),
    ('00000000-0000-4000-8000-000000000024', '44444444-dddd-43f7-9abc-444444444444', 'avatars/hoang_fund', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'image', 'jpg', 200, 200, 51000, 'avatar'),
    ('00000000-0000-4000-8000-000000000025', '55555555-eeee-43f7-9abc-555555555555', 'avatars/trang_bank', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'image', 'jpg', 200, 200, 46000, 'avatar'),
    
    -- Article Cover Photos
    ('00000000-0000-4000-8000-000000000026', '11111111-aaaa-43f7-9abc-111111111111', 'covers/fed_rate_decision', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 180000, 'cover'),
    ('00000000-0000-4000-8000-000000000027', '22222222-bbbb-43f7-9abc-222222222222', 'covers/fdi_vietnam_industry', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 210000, 'cover'),
    ('00000000-0000-4000-8000-000000000028', '33333333-cccc-43f7-9abc-333333333333', 'covers/banking_nim_margin', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 195000, 'cover'),
    ('00000000-0000-4000-8000-000000000029', '44444444-dddd-43f7-9abc-444444444444', 'covers/dcf_valuation_mastery', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 220000, 'cover'),
    ('00000000-0000-4000-8000-00000000002a', '55555555-eeee-43f7-9abc-555555555555', 'covers/gold_fx_liquidity', 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 205000, 'cover'),
    ('00000000-0000-4000-8000-00000000002b', '22222222-bbbb-43f7-9abc-222222222222', 'covers/real_estate_bonds', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80', 'image', 'jpg', 1200, 675, 190000, 'cover')
ON CONFLICT (cloudinary_public_id) DO NOTHING;

-- ============================================================================
-- 4. PROFILES
-- ============================================================================
INSERT INTO profiles (id, user_id, username, display_name, avatar_media_id, bio) VALUES
    ('00000000-0000-4000-8000-000000000031', '11111111-aaaa-43f7-9abc-111111111111', 'editor_in_chief', 'Ban Biên Tập Finance Pulse', '00000000-0000-4000-8000-000000000021', 'Tổng hợp & thẩm định các phân tích vĩ mô, thị trường tài chính và kinh tế quốc tế.'),
    ('00000000-0000-4000-8000-000000000032', '22222222-bbbb-43f7-9abc-222222222222', 'sarah_chen_cfa', 'Sarah Chen, CFA', '00000000-0000-4000-8000-000000000022', 'Chuyên gia định giá doanh nghiệp, Trưởng nhóm nghiên cứu cấu trúc vốn & M&A.'),
    ('00000000-0000-4000-8000-000000000033', '33333333-cccc-43f7-9abc-333333333333', 'cuong_macro', 'Nguyễn Việt Cường', '00000000-0000-4000-8000-000000000023', 'Chuyên viên phân tích kinh tế vĩ mô, theo dõi chính sách tiền tệ Ngân hàng Nhà nước & Fed.'),
    ('00000000-0000-4000-8000-000000000034', '44444444-dddd-43f7-9abc-444444444444', 'hoang_tran_fund', 'Trần Minh Hoàng', '00000000-0000-4000-8000-000000000024', 'Nhà quản lý danh mục đầu tư, chuyên sâu về dòng vốn tổ chức và báo cáo tài chính doanh nghiệp.'),
    ('00000000-0000-4000-8000-000000000035', '55555555-eeee-43f7-9abc-555555555555', 'trang_banking', 'Lê Thu Trang', '00000000-0000-4000-8000-000000000025', 'Nghiên cứu ngành ngân hàng thương mại, tỷ lệ an toàn vốn CAR và tăng trưởng tín dụng.'),
    ('00000000-0000-4000-8000-000000000036', '66666666-ffff-43f7-9abc-666666666666', 'moderator_team', 'Finance Community Mod', '00000000-0000-4000-8000-000000000021', 'Đội ngũ điều hành chuẩn mực nội dung và kiểm duyệt cộng đồng.')
ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_media_id = EXCLUDED.avatar_media_id;

-- ============================================================================
-- 5. CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, slug, scope, description, sort_order) VALUES
    ('00000000-0000-4000-8000-000000000041', 'Cẩm Nang BCTC', 'financial-statement-analysis', 'SERIES', 'Chuỗi bài phân tích chuyên sâu Bảng CĐKT, Báo cáo KQKD và Lưu chuyển tiền tệ.', 1),
    ('00000000-0000-4000-8000-000000000042', 'Mô Hình Định Giá', 'valuation-mastery', 'SERIES', 'Hướng dẫn xây dựng mô hình DCF, định giá so sánh P/E, EV/EBITDA bài bản.', 2),
    ('00000000-0000-4000-8000-000000000043', 'Kinh Tế Vĩ Mô', 'macro-cycles-framework', 'SERIES', 'Nhận diện chu kỳ kinh tế, lãi suất, lạm phát và dòng tiền dịch chuyển.', 3),
    ('00000000-0000-4000-8000-000000000044', 'Tài Chính Việt Nam', 'corporate-finance', 'COMMUNITY', 'Vĩ mô trong nước, chính sách tín dụng, doanh nghiệp niêm yết và ngân hàng.', 1),
    ('00000000-0000-4000-8000-000000000045', 'Tài Chính Quốc Tế', 'global-markets', 'COMMUNITY', 'Chính sách tiền tệ Fed, ECB, Phố Wall, lạm phát toàn cầu.', 2),
    ('00000000-0000-4000-8000-000000000046', 'Hàng Hóa & Tỷ Giá', 'commodities', 'COMMUNITY', 'Diễn biến giá Vàng, Dầu thô Brent, Kim loại công nghiệp và DXY.', 3),
    ('00000000-0000-4000-8000-000000000047', 'Bất Động Sản & Thị Trường Vốn', 'real-estate-bonds', 'COMMUNITY', 'Thị trường trái phiếu doanh nghiệp, tái cấu trúc nợ.', 4),
    ('00000000-0000-4000-8000-000000000048', 'Tài Chính Cá Nhân', 'personal-wealth', 'COMMUNITY', 'Xây dựng dòng tiền bền vững, quản trị rủi ro và chiến lược tích sản.', 5)
ON CONFLICT (scope, slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- 6. TAGS
-- ============================================================================
INSERT INTO tags (id, name, slug) VALUES
    ('00000000-0000-4000-8000-000000000051', 'Vĩ Mô Việt Nam', 'vi-mo-viet-nam'),
    ('00000000-0000-4000-8000-000000000052', 'Chính Sách Fed', 'chinh-sach-fed'),
    ('00000000-0000-4000-8000-000000000053', 'Tín Dụng Ngân Hàng', 'tin-dung-ngan-hang'),
    ('00000000-0000-4000-8000-000000000054', 'Định Giá DCF', 'dinh-gia-dcf'),
    ('00000000-0000-4000-8000-000000000055', 'Giá Vàng SJC', 'gia-vang-sjc'),
    ('00000000-0000-4000-8000-000000000056', 'Dầu Thô Brent', 'dau-tho-brent'),
    ('00000000-0000-4000-8000-000000000057', 'Trái Phiếu Doanh Nghiệp', 'trai-phieu-doanh-nghiep'),
    ('00000000-0000-4000-8000-000000000058', 'Dòng Vốn FDI', 'dong-von-fdi')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- ============================================================================
-- 7. POSTS
-- ============================================================================
INSERT INTO posts (
    id, author_id, content_type, title, slug, body, cover_media_id, category_id,
    status, meta_title, meta_description, view_count, published_at, created_at, updated_at
) VALUES
    (
        '00000000-0000-4000-8000-000000000061',
        '11111111-aaaa-43f7-9abc-111111111111',
        'COMMUNITY',
        'Fed chính thức hạ lãi suất: Bước ngoặt nới lỏng chính sách tiền tệ toàn cầu và tác động đến các thị trường mới nổi',
        'fed-chinh-thuc-ha-lai-suat-buoc-ngoat-noi-long-tien-te-toan-cau',
        '## Toàn Cảnh Quyết Định Của FOMC

Quyết định cắt giảm lãi suất của Cục Dự trữ Liên bang Mỹ (Fed) đã đánh dấu bước chuyển pha quan trọng từ chu kỳ thắt chặt định lượng sang giai đoạn nới lỏng chính sách tiền tệ. 

### 1. Phân Tích Động Thái Của Lợi Suất Trái Phiếu
Đường cong lợi suất trái phiếu kho bạc Mỹ kỳ hạn 10 năm đã phản ánh kỳ vọng giảm áp lực chi phí vốn đối với các định chế tài chính toàn cầu. Khi chênh lệch lãi suất thu hẹp, sức ép tỷ giá tại các nền kinh tế mới nổi (Emerging Markets) bắt đầu có dấu hiệu hạ nhiệt rõ nét.

### 2. Tác Động Đến Dòng Vốn Quốc Tế
- **Dòng tiền dịch chuyển**: Khi lợi suất phi rủi ro tại Mỹ giảm, các quỹ đầu tư toàn cầu có xu hướng tái cơ cấu tỷ trọng tài sản, tìm kiếm cơ hội tăng trưởng tại các khu vực có nền tảng sản xuất vững mạnh.
- **Áp lực lạm phát nhập khẩu**: Việc đồng USD hạ nhiệt giúp giảm đáng kể chi phí nhập khẩu nguyên nhiên vật liệu chiến lược.

> *"Giai đoạn nới lỏng tiền tệ mở ra không gian điều hành chủ động hơn cho các ngân hàng trung ương châu Á trong việc duy trì mặt bằng lãi suất cho vay hỗ trợ sản xuất kinh doanh."*',
        '00000000-0000-4000-8000-000000000026',
        '00000000-0000-4000-8000-000000000045',
        'PUBLISHED',
        'Fed hạ lãi suất: Bước ngoặt chính sách tiền tệ toàn cầu',
        'Phân tích toàn diện quyết định nới lỏng tiền tệ của Fed và tác động tới dòng vốn cũng như tỷ giá các thị trường mới nổi.',
        8420,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '3 hours'
    ),
    (
        '00000000-0000-4000-8000-000000000062',
        '33333333-cccc-43f7-9abc-333333333333',
        'COMMUNITY',
        'Dòng vốn FDI và Chu kỳ Tín dụng mới: Động lực bứt phá của nhóm ngành sản xuất & xuất khẩu Việt Nam',
        'dong-von-fdi-va-chu-ky-tin-dung-moi-dong-luc-but-pha-san-xuat',
        '## Tăng Trưởng Vốn FDI Thực Hiện Tiếp Tục Lập Đỉnh

Trong bối cảnh chuỗi cung ứng công nghệ cao toàn cầu tiếp tục dịch chuyển, Việt Nam tiếp tục là điểm đến chiến lược cho các tập đoàn bán dẫn và linh kiện điện tử hàng đầu.

### Trọng Tâm Phân Tích
1. **Quy mô giải ngân FDI**: Tỷ lệ vốn thực hiện duy trì mức tăng trưởng ấn tượng trên 8.5% so với cùng kỳ.
2. **Khơi thông dòng vốn tín dụng thương mại**: Ngân hàng Nhà nước duy trì định hướng linh hoạt, ưu tiên hạn mức tín dụng cho lĩnh vực sản xuất thực, phụ trợ công nghiệp và xuất khẩu.
3. **Cơ hội bứt phá của các khu công nghiệp phía Bắc và vùng kinh tế trọng điểm phía Nam**.',
        '00000000-0000-4000-8000-000000000027',
        '00000000-0000-4000-8000-000000000044',
        'PUBLISHED',
        'Dòng vốn FDI & Chu kỳ tín dụng thúc đẩy sản xuất Việt Nam',
        'Đánh giá chuyên sâu về tác động của dòng vốn đầu tư trực tiếp nước ngoài kết hợp chính sách tín dụng hỗ trợ sản xuất.',
        6150,
        NOW() - INTERVAL '8 hours',
        NOW() - INTERVAL '9 hours',
        NOW() - INTERVAL '8 hours'
    ),
    (
        '00000000-0000-4000-8000-000000000063',
        '55555555-eeee-43f7-9abc-555555555555',
        'COMMUNITY',
        'Bức tranh NIM và Chất lượng Tài sản ngành Ngân hàng: Dự báo xu hướng phân hóa mạnh mẽ',
        'buc-tranh-nim-va-chat-luong-tai-san-nganh-ngan-hang',
        '## Xu Hướng Phân Hóa Lợi Nhuận Thuần Từ Lãi (NIM)

Biên lãi ròng (NIM) của toàn hệ thống ngân hàng đang cho thấy sự phân hóa sâu sắc giữa nhóm ngân hàng thương mại nhà nước có lợi thế chi phí vốn rẻ (CASA cao) và nhóm ngân hàng quy mô vừa phụ thuộc vào tiền gửi có kỳ hạn.

### Các Chỉ Số Trọng Yếu Cần Theo Dõi:
- **Tỷ lệ bao phủ nợ xấu (LLR)**: Nhóm ngân hàng top đầu tiếp tục duy trì bộ đệm trích lập dự phòng rủi ro vững chắc.
- **Tăng trưởng CASA**: Áp lực giữ chân dòng tiền gửi không kỳ hạn trong môi trường mặt bằng lãi suất cạnh tranh.',
        '00000000-0000-4000-8000-000000000028',
        '00000000-0000-4000-8000-000000000044',
        'PUBLISHED',
        'Bức tranh NIM và Chất lượng Tài sản ngành Ngân hàng',
        'Báo cáo phân tích chuyên sâu về biên lãi thuần NIM, tỷ lệ nợ xấu và khả năng duy trì tăng trưởng lợi nhuận ngành ngân hàng.',
        5320,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '00000000-0000-4000-8000-000000000064',
        '22222222-bbbb-43f7-9abc-222222222222',
        'SERIES',
        'Thực Hành Xây Dựng Mô Hình DCF (Chiết Khấu Dòng Tiền): Từ Dự Báo Doanh Thu Đến Chi Phí Vốn WACC',
        'thuc-hanh-xay-dung-mo-hinh-dcf-tu-du-bao-den-wacc',
        '## Khung Định Giá Chiết Khấu Dòng Tiền Tự Do (FCFF)

Trong phân tích tài chính chuyên nghiệp, mô hình DCF là tiêu chuẩn vàng để xác định giá trị nội tại (Intrinsic Value) của doanh nghiệp độc lập với biến động tâm lý ngắn hạn của thị trường.

### Cấu Trúc Các Bước Thực Hiện:
1. **Chuẩn hóa BCTC lịch sử**: Bóc tách các khoản thu nhập/chi phí bất thường (non-recurring items).
2. **Dự báo Dòng tiền Tự do cho Doanh nghiệp (FCFF)**:
   $$\\text{FCFF} = \\text{EBIT} \\times (1 - t) + \\text{Khấu hao} - \\text{Capex} - \\Delta \\text{Vốn lưu động}$$
3. **Ước lượng Chi phí Vốn bình quân gia quyền (WACC)**: Xác định tỷ trọng nợ vay/vốn chủ sở hữu và chi phí vốn chủ theo mô hình CAPM.',
        '00000000-0000-4000-8000-000000000029',
        '00000000-0000-4000-8000-000000000042',
        'PUBLISHED',
        'Thực hành mô hình định giá DCF bài bản',
        'Hướng dẫn chi tiết từng bước xây dựng bảng tính định giá DCF, chuẩn hóa dòng tiền FCFF và xác định chi phí sử dụng vốn WACC.',
        9800,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '00000000-0000-4000-8000-000000000065',
        '44444444-dddd-43f7-9abc-444444444444',
        'COMMUNITY',
        'Diễn Biến Giá Vàng Quốc Tế & Tỷ Giá DXY: Động Thái Mua Ròng Của Các Ngân Hàng Trung Ương',
        'dien-bien-gia-vang-quoc-te-va-ty-gia-dxy-dong-thai-ngan-hang-trung-uong',
        '## Nhu Cầu Tích Trữ Vàng Chiến Lược Của Khối Central Banks

Số liệu từ Hội đồng Vàng Thế giới (WGC) cho thấy xu hướng đa dạng hóa dự trữ ngoại hối tiếp tục được đẩy mạnh bởi các ngân hàng trung ương tại các nền kinh tế đang phát triển.

### Mối Tương Quan Giữa Vàng, Lợi Suất Thực Và Đồng USD
Khi lợi suất trái phiếu thực tế giảm, chi phí cơ hội của việc nắm giữ tài sản không sinh lãi suất như vàng giảm xuống, tạo lực cầu hỗ trợ vững chắc cho kim loại quý này.',
        '00000000-0000-4000-8000-00000000002a',
        '00000000-0000-4000-8000-000000000046',
        'PUBLISHED',
        'Giá vàng quốc tế và sức mạnh đồng USD DXY',
        'Phân tích cung cầu vàng toàn cầu, xu hướng mua ròng dự trữ ngoại hối của các ngân hàng trung ương và mối tương quan với DXY.',
        4720,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        '00000000-0000-4000-8000-000000000066',
        '33333333-cccc-43f7-9abc-333333333333',
        'COMMUNITY',
        'Thị Trường Trái Phiếu Doanh Nghiệp & Tín Dụng Bất Động Sản: Tín Hiệu Ấm Lên Của Thanh Khoản',
        'thi-truong-trai-phieu-doanh-nghiep-va-tin-dung-bat-dong-san',
        '## Tái Cấu Trúc Nghĩa Vụ Nợ Và Khôi Phục Kênh Huy Động Vốn

Hoạt động phát hành trái phiếu doanh nghiệp riêng lẻ đã có sự hồi phục đáng kể sau khi khung pháp lý mới được áp dụng và các tổ chức phát hành hoàn tất cơ cấu lại kỳ hạn trả nợ.',
        '00000000-0000-4000-8000-00000000002b',
        '00000000-0000-4000-8000-000000000047',
        'PUBLISHED',
        'Trái phiếu doanh nghiệp & tín dụng bất động sản',
        'Đánh giá tiến trình tái cấu trúc nợ đáo hạn và diễn biến phục hồi thanh khoản trên thị trường vốn nợ.',
        3900,
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '4 days'
    )
ON CONFLICT (content_type, slug) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body;

-- ============================================================================
-- 8. POST TAGS
-- ============================================================================
INSERT INTO post_tags (post_id, tag_id) VALUES
    ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000052'),
    ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000051'),
    ('00000000-0000-4000-8000-000000000062', '00000000-0000-4000-8000-000000000058'),
    ('00000000-0000-4000-8000-000000000062', '00000000-0000-4000-8000-000000000051'),
    ('00000000-0000-4000-8000-000000000063', '00000000-0000-4000-8000-000000000053'),
    ('00000000-0000-4000-8000-000000000064', '00000000-0000-4000-8000-000000000054'),
    ('00000000-0000-4000-8000-000000000065', '00000000-0000-4000-8000-000000000055'),
    ('00000000-0000-4000-8000-000000000065', '00000000-0000-4000-8000-000000000056'),
    ('00000000-0000-4000-8000-000000000066', '00000000-0000-4000-8000-000000000057')
ON CONFLICT (post_id, tag_id) DO NOTHING;

-- ============================================================================
-- 9. POST MEDIA
-- ============================================================================
INSERT INTO post_media (post_id, media_id, sort_order) VALUES
    ('00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000026', 0),
    ('00000000-0000-4000-8000-000000000062', '00000000-0000-4000-8000-000000000027', 0),
    ('00000000-0000-4000-8000-000000000064', '00000000-0000-4000-8000-000000000029', 0)
ON CONFLICT (post_id, media_id) DO NOTHING;

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================
INSERT INTO comments (id, post_id, author_id, parent_id, body, status, created_at) VALUES
    (
        '00000000-0000-4000-8000-000000000071',
        '00000000-0000-4000-8000-000000000061',
        '44444444-dddd-43f7-9abc-444444444444',
        NULL,
        'Bài phân tích rất sâu sắc về chu kỳ tiền tệ. Liệu với áp lực lạm phát dịch vụ tại Mỹ còn dai dẳng thì lộ trình giảm tiếp theo của Fed có bị kéo dài hơn không?',
        'VISIBLE',
        NOW() - INTERVAL '2 hours'
    ),
    (
        '00000000-0000-4000-8000-000000000072',
        '00000000-0000-4000-8000-000000000061',
        '22222222-bbbb-43f7-9abc-222222222222',
        '00000000-0000-4000-8000-000000000071',
        'Cảm ơn anh Hoàng. Quan sát biểu đồ Dot Plot mới nhất, các thành viên FOMC vẫn đang đặt trọng số lớn vào sự hạ nhiệt của thị trường lao động để duy trì lộ trình hạ từ từ.',
        'VISIBLE',
        NOW() - INTERVAL '1 hour'
    ),
    (
        '00000000-0000-4000-8000-000000000073',
        '00000000-0000-4000-8000-000000000064',
        '55555555-eeee-43f7-9abc-555555555555',
        NULL,
        'Rất mong chờ bài viết tiếp theo của chị Sarah về cách ước lượng Tỷ lệ tăng trưởng vĩnh viễn (Terminal Growth Rate g) trong bối cảnh lạm phát mục tiêu!',
        'VISIBLE',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 11. POST REACTIONS
-- ============================================================================
INSERT INTO post_reactions (user_id, post_id, reaction_type, created_at) VALUES
    ('33333333-cccc-43f7-9abc-333333333333', '00000000-0000-4000-8000-000000000061', 'LIKE', NOW() - INTERVAL '2 hours'),
    ('44444444-dddd-43f7-9abc-444444444444', '00000000-0000-4000-8000-000000000061', 'LIKE', NOW() - INTERVAL '2 hours'),
    ('55555555-eeee-43f7-9abc-555555555555', '00000000-0000-4000-8000-000000000061', 'LIKE', NOW() - INTERVAL '1 hour'),
    ('11111111-aaaa-43f7-9abc-111111111111', '00000000-0000-4000-8000-000000000064', 'LIKE', NOW() - INTERVAL '1 day'),
    ('33333333-cccc-43f7-9abc-333333333333', '00000000-0000-4000-8000-000000000064', 'LIKE', NOW() - INTERVAL '1 day')
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ============================================================================
-- 12. COMMENT REACTIONS
-- ============================================================================
INSERT INTO comment_reactions (user_id, comment_id, reaction_type, created_at) VALUES
    ('11111111-aaaa-43f7-9abc-111111111111', '00000000-0000-4000-8000-000000000071', 'LIKE', NOW() - INTERVAL '1 hour'),
    ('33333333-cccc-43f7-9abc-333333333333', '00000000-0000-4000-8000-000000000072', 'LIKE', NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id, comment_id) DO NOTHING;

-- ============================================================================
-- 13. FOLLOWS
-- ============================================================================
INSERT INTO follows (follower_id, following_id, created_at) VALUES
    ('33333333-cccc-43f7-9abc-333333333333', '22222222-bbbb-43f7-9abc-222222222222', NOW() - INTERVAL '15 days'),
    ('44444444-dddd-43f7-9abc-444444444444', '22222222-bbbb-43f7-9abc-222222222222', NOW() - INTERVAL '10 days'),
    ('55555555-eeee-43f7-9abc-555555555555', '33333333-cccc-43f7-9abc-333333333333', NOW() - INTERVAL '8 days'),
    ('44444444-dddd-43f7-9abc-444444444444', '11111111-aaaa-43f7-9abc-111111111111', NOW() - INTERVAL '5 days')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ============================================================================
-- 14. POST BOOKMARKS
-- ============================================================================
INSERT INTO post_bookmarks (user_id, post_id, created_at) VALUES
    ('33333333-cccc-43f7-9abc-333333333333', '00000000-0000-4000-8000-000000000064', NOW() - INTERVAL '2 days'),
    ('44444444-dddd-43f7-9abc-444444444444', '00000000-0000-4000-8000-000000000061', NOW() - INTERVAL '1 day'),
    ('55555555-eeee-43f7-9abc-555555555555', '00000000-0000-4000-8000-000000000063', NOW() - INTERVAL '12 hours')
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ============================================================================
-- 15. REPORTS
-- ============================================================================
INSERT INTO reports (id, reporter_id, reported_post_id, reported_comment_id, reported_user_id, reason, description, status, created_at) VALUES
    ('00000000-0000-4000-8000-000000000081', '55555555-eeee-43f7-9abc-555555555555', '00000000-0000-4000-8000-000000000066', NULL, NULL, 'Spam or Duplicate', 'Nội dung bài viết cần bổ sung thêm nguồn tham chiếu dữ liệu.', 'RESOLVED', NOW() - INTERVAL '3 days'),
    ('00000000-0000-4000-8000-000000000082', '44444444-dddd-43f7-9abc-444444444444', NULL, '00000000-0000-4000-8000-000000000071', NULL, 'Off-topic Discussion', 'Cần kiểm tra tính xác thực của câu hỏi thảo luận.', 'DISMISSED', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 16. MODERATION ACTIONS
-- ============================================================================
INSERT INTO moderation_actions (id, moderator_id, report_id, action_type, target_user_id, reason, metadata, created_at) VALUES
    ('00000000-0000-4000-8000-000000000091', '66666666-ffff-43f7-9abc-666666666666', '00000000-0000-4000-8000-000000000081', 'DISMISS', '33333333-cccc-43f7-9abc-333333333333', 'Nội dung bài viết hợp lệ, đạt tiêu chuẩn xuất bản.', '{"reviewed_by": "mod_team"}'::jsonb, NOW() - INTERVAL '2 days'),
    ('00000000-0000-4000-8000-000000000092', '66666666-ffff-43f7-9abc-666666666666', '00000000-0000-4000-8000-000000000082', 'DISMISS', '44444444-dddd-43f7-9abc-444444444444', 'Bình luận mang tính chất trao đổi học thuật, không vi phạm.', '{"action": "dismissed"}'::jsonb, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 17. NOTIFICATIONS
-- ============================================================================
INSERT INTO notifications (id, user_id, type, title, message, reference_post_id, reference_comment_id, reference_user_id, is_read, read_at, created_at) VALUES
    ('00000000-0000-4000-8000-0000000000a1', '44444444-dddd-43f7-9abc-444444444444', 'COMMENT_REPLY', 'Sarah Chen, CFA đã phản hồi bình luận của bạn', 'Sarah Chen đã trả lời bình luận của bạn trong bài phân tích Fed...', '00000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000072', '22222222-bbbb-43f7-9abc-222222222222', TRUE, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '1 hour'),
    ('00000000-0000-4000-8000-0000000000a2', '22222222-bbbb-43f7-9abc-222222222222', 'NEW_POST', 'Bài phân tích mới từ Ban Biên Tập', 'Fed chính thức hạ 25 điểm cơ bản lãi suất...', '00000000-0000-4000-8000-000000000061', NULL, '11111111-aaaa-43f7-9abc-111111111111', FALSE, NULL, NOW() - INTERVAL '3 hours'),
    ('00000000-0000-4000-8000-0000000000a3', '33333333-cccc-43f7-9abc-333333333333', 'POST_REACTION', 'Bài viết của bạn nhận được tương tác', 'Trần Minh Hoàng đã thích bài viết của bạn.', '00000000-0000-4000-8000-000000000062', NULL, '44444444-dddd-43f7-9abc-444444444444', TRUE, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 18. AUDIT LOGS
-- ============================================================================
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, ip_address, reason, created_at) VALUES
    ('00000000-0000-4000-8000-0000000000b1', '11111111-aaaa-43f7-9abc-111111111111', 'PUBLISH_SERIES', 'posts', '00000000-0000-4000-8000-000000000064', '{"title": "Mô hình DCF"}'::jsonb, '127.0.0.1', 'Xuất bản bài viết đào tạo định giá', NOW() - INTERVAL '2 days'),
    ('00000000-0000-4000-8000-0000000000b2', '66666666-ffff-43f7-9abc-666666666666', 'RESOLVE_REPORT', 'reports', '00000000-0000-4000-8000-000000000081', '{"status": "RESOLVED"}'::jsonb, '127.0.0.1', 'Hoàn tất rà soát tiêu chuẩn xuất bản', NOW() - INTERVAL '2 days'),
    ('00000000-0000-4000-8000-0000000000b3', '11111111-aaaa-43f7-9abc-111111111111', 'UPDATE_SETTINGS', 'system_settings', NULL, '{"key": "site_name"}'::jsonb, '127.0.0.1', 'Cập nhật cấu hình hệ thống', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 19. SYSTEM SETTINGS
-- ============================================================================
INSERT INTO system_settings (id, key, value, description, updated_at) VALUES
    ('00000000-0000-4000-8000-0000000000c1', 'site_name', '"Finance Pulse & Community"'::jsonb, 'Tên hiển thị chính thức của nền tảng tài chính', NOW()),
    ('00000000-0000-4000-8000-0000000000c2', 'editorial_policy', '{"require_review_for_series": true, "allow_community_posts": true}'::jsonb, 'Chính sách duyệt nội dung và xuất bản', NOW()),
    ('00000000-0000-4000-8000-0000000000c3', 'pagination_defaults', '{"feed_limit": 10, "comment_limit": 20}'::jsonb, 'Quy chuẩn phân trang dữ liệu', NOW()),
    ('00000000-0000-4000-8000-0000000000c4', 'maintenance_mode', 'false'::jsonb, 'Trạng thái bảo trì hệ thống', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- ============================================================================
-- 20. FEATURE FLAGS
-- ============================================================================
INSERT INTO feature_flags (id, key, is_enabled, description, updated_at) VALUES
    ('00000000-0000-4000-8000-0000000000d1', 'enable_series_masterclasses', true, 'Kích hoạt mục Series bài viết đào tạo chuyên sâu', NOW()),
    ('00000000-0000-4000-8000-0000000000d2', 'enable_community_discussions', true, 'Cho phép thành viên thảo luận và đăng bài cộng đồng', NOW()),
    ('00000000-0000-4000-8000-0000000000d3', 'enable_reading_bookmarks', true, 'Cho phép lưu bài viết vào danh sách Bookmarks', NOW()),
    ('00000000-0000-4000-8000-0000000000d4', 'enable_ai_sentiment_tagging', true, 'Tự động gắn tag phân loại tâm lý thị trường', NOW()),
    ('00000000-0000-4000-8000-0000000000d5', 'enable_dark_mode_theme', true, 'Hỗ trợ giao diện nền tối chuyên nghiệp', NOW())
ON CONFLICT (key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW();
