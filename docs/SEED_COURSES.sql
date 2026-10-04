-- ============================================================================
-- Seed Domains and Foundational Learning Courses (Finance Domain)
-- ============================================================================

-- 1. Ensure Finance Domain exists and has slug 'tai-chinh'
UPDATE domains 
SET slug = 'tai-chinh', name = 'Tài chính' 
WHERE code = 'MONEY';

-- 2. Insert Foundational Courses (learning_series) without any dummy lessons
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
