-- Dữ liệu mẫu cho các luồng bài viết công khai.
-- An toàn khi chạy nhiều lần: chỉ thêm bản ghi chưa tồn tại, không ghi đè dữ liệu hiện có.

DO $$
DECLARE
  demo_author_id uuid;
  general_domain_id uuid;
BEGIN
  SELECT id INTO demo_author_id FROM users WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1;
  IF demo_author_id IS NULL THEN
    RAISE EXCEPTION 'Cần có ít nhất một người dùng trước khi seed bài viết mẫu.';
  END IF;

  SELECT id INTO general_domain_id FROM domains WHERE code = 'GENERAL' LIMIT 1;

  INSERT INTO categories (name, slug, scope, domain_id, content_types, description, sort_order, is_active, is_promoted)
  VALUES
    ('Thảo luận đầu tư', 'thao-luan-dau-tu', 'COMMUNITY', general_domain_id, '["COMMUNITY"]'::jsonb, 'Góc trao đổi kiến thức và kinh nghiệm đầu tư.', 10, true, true),
    ('Quản lý tài chính', 'quan-ly-tai-chinh', 'COMMUNITY', general_domain_id, '["COMMUNITY"]'::jsonb, 'Chia sẻ thực hành quản lý tiền cá nhân.', 20, true, true)
  ON CONFLICT (scope, slug) DO NOTHING;

  INSERT INTO posts (author_id, content_type, title, slug, body, category_id, domain_id, status, editorial_status, moderation_status, meta_title, meta_description, view_count, published_at)
  SELECT demo_author_id, 'SERIES', v.title, v.slug, v.body, c.id, c.domain_id, 'PUBLISHED', 'PUBLISHED', 'APPROVED', v.title, v.meta_description, v.view_count, now() - v.age
  FROM (VALUES
    ('Lập ngân sách 50/30/20 cho người mới bắt đầu', 'lap-ngan-sach-50-30-20', 'Bắt đầu quản lý tiền bằng cách chia thu nhập thành ba nhóm: nhu cầu thiết yếu, mong muốn và tiết kiệm hoặc đầu tư. Bài học này hướng dẫn cách áp dụng tỷ lệ linh hoạt theo hoàn cảnh thực tế.', 'Kế hoạch chi tiêu đơn giản, dễ áp dụng.', 186, interval '6 days', 'tai-chinh-ca-nhan'),
    ('Xây dựng quỹ khẩn cấp từng bước', 'xay-dung-quy-khan-cap', 'Quỹ khẩn cấp giúp bạn không phải vay nóng hoặc bán tài sản vào lúc bất lợi. Hãy xác định mức chi tiêu thiết yếu, mục tiêu quỹ và lịch chuyển tiền định kỳ.', 'Cách chuẩn bị lớp đệm tài chính an toàn.', 154, interval '4 days', 'tai-chinh-ca-nhan'),
    ('Đặt mục tiêu tài chính theo mốc thời gian', 'dat-muc-tieu-tai-chinh-theo-moc-thoi-gian', 'Phân loại mục tiêu ngắn, trung và dài hạn để chọn công cụ tích lũy phù hợp. Mỗi mục tiêu cần số tiền, thời hạn và mức đóng góp hàng tháng rõ ràng.', 'Biến mong muốn thành kế hoạch có thể đo lường.', 121, interval '2 days', 'tai-chinh-ca-nhan'),
    ('Chứng khoán là gì và nhà đầu tư sở hữu điều gì?', 'chung-khoan-la-gi', 'Bài học giới thiệu cổ phiếu, trái phiếu, quỹ đầu tư và vai trò của thị trường vốn. Bạn sẽ hiểu quyền lợi và rủi ro cơ bản khi nắm giữ từng loại tài sản.', 'Nền tảng để bắt đầu tìm hiểu thị trường chứng khoán.', 248, interval '8 days', 'chung-khoan'),
    ('Đọc báo cáo tài chính từ ba chỉ số nền tảng', 'doc-bao-cao-tai-chinh-co-ban', 'Doanh thu, lợi nhuận và dòng tiền là ba điểm xuất phát để đánh giá một doanh nghiệp. Bài học minh họa cách đọc nhanh và những bẫy thường gặp.', 'Bắt đầu đọc báo cáo tài chính một cách có hệ thống.', 203, interval '5 days', 'chung-khoan'),
    ('Đa dạng hóa danh mục đầu tư', 'da-dang-hoa-danh-muc-dau-tu', 'Đa dạng hóa không chỉ là mua nhiều mã cổ phiếu. Hãy cân bằng theo mục tiêu, khẩu vị rủi ro, loại tài sản và thời gian nắm giữ.', 'Nguyên tắc giảm rủi ro tập trung cho người mới.', 167, interval '1 day', 'chung-khoan')
  ) AS v(title, slug, body, meta_description, view_count, age, category_slug)
  INNER JOIN categories c ON c.scope = 'SERIES' AND c.slug = v.category_slug
  ON CONFLICT (content_type, slug) DO NOTHING;

  INSERT INTO posts (author_id, content_type, title, slug, body, category_id, domain_id, status, editorial_status, moderation_status, meta_title, meta_description, view_count, published_at)
  SELECT demo_author_id, 'COMMUNITY', v.title, v.slug, v.body, c.id, c.domain_id, 'PUBLISHED', 'PUBLISHED', 'APPROVED', v.title, v.meta_description, v.view_count, now() - v.age
  FROM (VALUES
    ('Kế hoạch đầu tư định kỳ: bắt đầu từ đâu?', 'ke-hoach-dau-tu-dinh-ky-bat-dau-tu-dau', 'Tôi đang thiết lập khoản đầu tư định kỳ hàng tháng và muốn chia sẻ cách xác định số tiền phù hợp trước khi chọn sản phẩm. Mọi người thường đặt tỷ lệ tiết kiệm và đầu tư như thế nào?', 'Thảo luận về cách xây dựng thói quen đầu tư định kỳ.', 92, interval '3 days', 'thao-luan-dau-tu'),
    ('Kinh nghiệm theo dõi danh mục khi thị trường biến động', 'kinh-nghiem-theo-doi-danh-muc-khi-thi-truong-bien-dong', 'Khi thị trường biến động mạnh, tôi ưu tiên xem lại luận điểm đầu tư thay vì kiểm tra giá liên tục. Bài viết chia sẻ một checklist ngắn để giữ kỷ luật.', 'Một checklist giữ kỷ luật đầu tư khi thị trường biến động.', 134, interval '2 days', 'thao-luan-dau-tu'),
    ('Tối ưu chi tiêu mà không làm giảm chất lượng sống', 'toi-uu-chi-tieu-khong-giam-chat-luong-song', 'Tôi đã theo dõi chi tiêu trong ba tháng và nhận ra những khoản nhỏ lặp lại tạo khác biệt lớn. Đây là các nguyên tắc giúp tôi cắt giảm có chọn lọc.', 'Chia sẻ thực tế về quản lý chi tiêu cá nhân.', 117, interval '18 hours', 'quan-ly-tai-chinh'),
    ('Nên dùng ứng dụng nào để theo dõi ngân sách?', 'nen-dung-ung-dung-nao-de-theo-doi-ngan-sach', 'Bạn đang dùng bảng tính, ứng dụng ngân sách hay ghi chú thủ công? Hãy cùng chia sẻ tiêu chí chọn công cụ phù hợp với thói quen cá nhân.', 'Thảo luận về công cụ theo dõi ngân sách.', 76, interval '6 hours', 'quan-ly-tai-chinh')
  ) AS v(title, slug, body, meta_description, view_count, age, category_slug)
  INNER JOIN categories c ON c.scope = 'COMMUNITY' AND c.slug = v.category_slug
  ON CONFLICT (content_type, slug) DO NOTHING;
END $$;
