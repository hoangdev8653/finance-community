-- ============================================================================
-- Finance Community Platform — Seed Data for Demo & Development
-- ============================================================================

-- 1. Insert Demo Users
INSERT INTO users (id, email, status) VALUES
    ('987fcdeb-51a2-43f7-9abc-1234567890ab', 'joan.names@financepulse.internal', 'ACTIVE'),
    ('12345678-51a2-43f7-9abc-1234567890cd', 'antona.names@financepulse.internal', 'ACTIVE'),
    ('55556666-51a2-43f7-9abc-1234567890ef', 'analyst.senior@financepulse.internal', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert User Profiles
INSERT INTO profiles (id, user_id, username, display_name, bio) VALUES
    (gen_random_uuid(), '987fcdeb-51a2-43f7-9abc-1234567890ab', 'joan_names', 'Joan Names', 'Senior Macro & Quantitative Analyst at Finance Pulse.'),
    (gen_random_uuid(), '12345678-51a2-43f7-9abc-1234567890cd', 'antona_names', 'Antona Names', 'Valuation & Equities Lead with institutional research focus.'),
    (gen_random_uuid(), '55556666-51a2-43f7-9abc-1234567890ef', 'analyst_senior', 'Senior Analyst', 'Fixed income, derivatives, and liquidity modeling.')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, scope, description, sort_order) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Investing', 'investing', 'COMMUNITY', 'Investment theses, portfolio allocation, and strategies.', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Personal Finance', 'personal-finance', 'COMMUNITY', 'Wealth management, budgeting, and savings.', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Stock Market', 'stock-market', 'COMMUNITY', 'Equities, sector breakdown, and earnings analyses.', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Crypto', 'crypto', 'COMMUNITY', 'Digital assets, blockchain architecture, and tokenomics.', 4),
    ('c5555555-5555-5555-5555-555555555555', 'Macroeconomics', 'macroeconomics', 'COMMUNITY', 'Central bank policy, yield curve, and GDP growth.', 5),
    ('c6666666-6666-6666-6666-666666666666', 'Educational Series', 'educational-series', 'SERIES', 'Structured masterclasses and learning tracks.', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Tags
INSERT INTO tags (id, name, slug) VALUES
    (gen_random_uuid(), 'investing', 'investing'),
    (gen_random_uuid(), 'personal-finance', 'personal-finance'),
    (gen_random_uuid(), 'stock-market', 'stock-market'),
    (gen_random_uuid(), 'crypto', 'crypto'),
    (gen_random_uuid(), 'valuation', 'valuation'),
    (gen_random_uuid(), 'macroeconomics', 'macroeconomics'),
    (gen_random_uuid(), 'derivatives', 'derivatives')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert Posts
INSERT INTO posts (id, author_id, content_type, title, slug, body, category_id, status, meta_title, meta_description, view_count, published_at, created_at, updated_at) VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        '987fcdeb-51a2-43f7-9abc-1234567890ab',
        'COMMUNITY',
        'Financial Analysis and Market Intelligence',
        'financial-analysis-market-intelligence',
        'Comprehensive breakdown of macroeconomic trends, quantitative valuation models, and equity research. This analysis explores historical valuation spreads across technology and industrial sectors.',
        'c5555555-5555-5555-5555-555555555555',
        'PUBLISHED',
        'Financial Analysis and Market Intelligence',
        'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
        1200,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        '12345678-51a2-43f7-9abc-1234567890cd',
        'COMMUNITY',
        'Financial Analysis Pulls & Market Intelligence',
        'financial-analysis-pulls-market-intelligence',
        'Deep dive into market structure, liquidity flows, and quantitative equity valuation strategies across high-beta segments.',
        'c3333333-3333-3333-3333-333333333333',
        'PUBLISHED',
        'Financial Analysis Pulls & Market Intelligence',
        'Meta description excerpt tit amet, consectetur adipiscing elit. Restams store promotion and convenience hosts to export a notta line more.',
        30000,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        '55556666-51a2-43f7-9abc-1234567890ef',
        'COMMUNITY',
        'Fixed Income Multiples & Monetary Policy Shift',
        'fixed-income-multiples-monetary-policy-shift',
        'Comprehensive breakdown of historical treasury yield curve dynamics and central bank liquidity operations.',
        'c1111111-1111-1111-1111-111111111111',
        'PUBLISHED',
        'Fixed Income Multiples & Monetary Policy Shift',
        'Analyzing corporate debt spreads, duration sensitivity, and yield curve inversion indicators.',
        4500,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Foundational Learning Series (Courses)
INSERT INTO learning_series (
    id,
    title,
    slug,
    description,
    estimated_duration_minutes,
    learning_outcomes,
    domain_id,
    category_id,
    status,
    is_published,
    created_by
) VALUES
(
    '20000000-0000-4000-8000-000000000001',
    'Nhập môn Đầu tư Chứng khoán từ Nền tảng',
    'nhap-mon-chung-khoan-tu-nen-tang',
    'Hệ thống kiến thức nhập môn toàn diện cho nhà đầu tư mới (F0): hiểu bản chất thị trường, cách đọc bảng giá, các loại lệnh giao dịch và phương pháp chọn cổ phiếu an toàn.',
    NULL,
    '["Hiểu rõ cơ chế vận hành và tính thanh khoản của thị trường chứng khoán Việt Nam", "Đọc thông thạo bảng điện tử, các chỉ số VN-Index, VN30 và các bước giá", "Nắm vững chu kỳ thanh toán T+2.5 và cách sử dụng các loại lệnh (ATO, ATC, LO, MP)", "Xây dựng tư duy đầu tư giá trị và kiểm soát tâm lý trước biến động giá"]'::jsonb,
    '10000000-0000-4000-8000-000000000001',
    '7108bc14-e8fd-4b3b-a336-5db51071700f',
    'PUBLISHED',
    true,
    '18b11dbb-f398-4afd-aa94-61413757aeec'
),
(
    '20000000-0000-4000-8000-000000000002',
    'Quản lý Tài chính Cá nhân & Xây dựng Tự do Tài chính',
    'quan-ly-tai-chinh-ca-nhan',
    'Phương pháp thiết lập ngân sách thông minh, kiểm soát chi tiêu, tạo lập quỹ dự phòng khẩn cấp và tối ưu hóa sức mạnh của lãi kép trong tích lũy tài sản dài hạn.',
    NULL,
    '["Áp dụng nguyên tắc phân bổ thu nhập (Quy tắc 6 chiếc lọ hoặc 50/30/20)", "Xây dựng quỹ dự phòng tài chính từ 3 - 6 tháng chi phí sinh hoạt", "Phân biệt rõ nợ tốt và nợ xấu, chiến lược thanh toán nợ hiệu quả", "Tận dụng triệt để sức mạnh của lãi kép và đầu tư định kỳ có kỷ luật"]'::jsonb,
    '10000000-0000-4000-8000-000000000001',
    'ee68923d-8fb1-4f2a-b1da-486bd85d365f',
    'PUBLISHED',
    true,
    '18b11dbb-f398-4afd-aa94-61413757aeec'
),
(
    '20000000-0000-4000-8000-000000000003',
    'Đọc hiểu Báo cáo Tài chính & Phân tích Doanh nghiệp',
    'doc-hieu-bao-cao-tai-chinh',
    'Làm chủ 3 báo cáo tài chính cốt lõi: Bảng cân đối kế toán, Báo cáo kết quả kinh doanh và Báo cáo lưu chuyển tiền tệ để nắm bắt sức khỏe thực tế của doanh nghiệp.',
    NULL,
    '["Bóc tách và hiểu đúng các khoản mục then chốt trên Bảng cân đối kế toán", "Đánh giá chất lượng lợi nhuận và doanh thu qua Báo cáo kết quả kinh doanh", "Nhận diện dòng tiền thực thông qua Báo cáo lưu chuyển tiền tệ", "Tính toán và phân tích các chỉ số tài chính trọng yếu: ROE, ROA, P/E, P/B, Nợ/Vốn"]'::jsonb,
    '10000000-0000-4000-8000-000000000001',
    '6e6a4de8-ba01-414a-9e8e-1ca20ba2b04d',
    'PUBLISHED',
    true,
    '18b11dbb-f398-4afd-aa94-61413757aeec'
),
(
    '20000000-0000-4000-8000-000000000004',
    'Kinh tế Vĩ mô Ứng dụng & Chu kỳ Thị trường',
    'kinh-te-vi-mo-ung-dung',
    'Giải mã các biến số vĩ mô: lãi suất, lạm phát, tỷ giá, chính sách tiền tệ của Ngân hàng Nhà nước và FED để định vị đúng chu kỳ và luân chuyển tài sản đầu tư.',
    NULL,
    '["Hiểu tác động của chính sách tiền tệ nới lỏng và thắt chặt tới các lớp tài sản", "Đo lường mối tương quan giữa lạm phát, lãi suất và thị trường chứng khoán", "Xác định các pha trong chu kỳ kinh tế để luân chuyển dòng vốn phù hợp", "Theo dõi và phân tích các số liệu vĩ mô định kỳ từ Tổng cục Thống kê và NHNN"]'::jsonb,
    '10000000-0000-4000-8000-000000000001',
    '7a131b6a-f3f6-40c5-8bed-d91e9159ba5d',
    'PUBLISHED',
    true,
    '18b11dbb-f398-4afd-aa94-61413757aeec'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    learning_outcomes = EXCLUDED.learning_outcomes,
    domain_id = EXCLUDED.domain_id,
    category_id = EXCLUDED.category_id,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();

