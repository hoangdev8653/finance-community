-- Sửa văn bản tiếng Việt của dữ liệu demo đã từng được nạp qua terminal không dùng UTF-8.
-- Chạy tệp này bằng psql với client_encoding=UTF8.

UPDATE categories
SET
  name = CASE slug
    WHEN 'thao-luan-dau-tu' THEN 'Thảo luận đầu tư'
    WHEN 'quan-ly-tai-chinh' THEN 'Quản lý tài chính'
  END,
  description = CASE slug
    WHEN 'thao-luan-dau-tu' THEN 'Góc trao đổi kiến thức và kinh nghiệm đầu tư.'
    WHEN 'quan-ly-tai-chinh' THEN 'Chia sẻ thực hành quản lý tiền cá nhân.'
  END
WHERE scope = 'COMMUNITY'
  AND slug IN ('thao-luan-dau-tu', 'quan-ly-tai-chinh');

UPDATE posts AS post
SET
  title = source.title,
  body = source.body,
  meta_title = source.title,
  meta_description = source.meta_description
FROM (
  VALUES
    ('lap-ngan-sach-50-30-20', 'Lập ngân sách 50/30/20 cho người mới bắt đầu', 'Bắt đầu quản lý tiền bằng cách chia thu nhập thành ba nhóm: nhu cầu thiết yếu, mong muốn và tiết kiệm hoặc đầu tư. Bài học này hướng dẫn cách áp dụng tỷ lệ linh hoạt theo hoàn cảnh thực tế.', 'Kế hoạch chi tiêu đơn giản, dễ áp dụng.'),
    ('xay-dung-quy-khan-cap', 'Xây dựng quỹ khẩn cấp từng bước', 'Quỹ khẩn cấp giúp bạn không phải vay nóng hoặc bán tài sản vào lúc bất lợi. Hãy xác định mức chi tiêu thiết yếu, mục tiêu quỹ và lịch chuyển tiền định kỳ.', 'Cách chuẩn bị lớp đệm tài chính an toàn.'),
    ('dat-muc-tieu-tai-chinh-theo-moc-thoi-gian', 'Đặt mục tiêu tài chính theo mốc thời gian', 'Phân loại mục tiêu ngắn, trung và dài hạn để chọn công cụ tích lũy phù hợp. Mỗi mục tiêu cần số tiền, thời hạn và mức đóng góp hàng tháng rõ ràng.', 'Biến mong muốn thành kế hoạch có thể đo lường.'),
    ('chung-khoan-la-gi', 'Chứng khoán là gì và nhà đầu tư sở hữu điều gì?', 'Bài học giới thiệu cổ phiếu, trái phiếu, quỹ đầu tư và vai trò của thị trường vốn. Bạn sẽ hiểu quyền lợi và rủi ro cơ bản khi nắm giữ từng loại tài sản.', 'Nền tảng để bắt đầu tìm hiểu thị trường chứng khoán.'),
    ('doc-bao-cao-tai-chinh-co-ban', 'Đọc báo cáo tài chính từ ba chỉ số nền tảng', 'Doanh thu, lợi nhuận và dòng tiền là ba điểm xuất phát để đánh giá một doanh nghiệp. Bài học minh họa cách đọc nhanh và những bẫy thường gặp.', 'Bắt đầu đọc báo cáo tài chính một cách có hệ thống.'),
    ('da-dang-hoa-danh-muc-dau-tu', 'Đa dạng hóa danh mục đầu tư', 'Đa dạng hóa không chỉ là mua nhiều mã cổ phiếu. Hãy cân bằng theo mục tiêu, khẩu vị rủi ro, loại tài sản và thời gian nắm giữ.', 'Nguyên tắc giảm rủi ro tập trung cho người mới.'),
    ('ke-hoach-dau-tu-dinh-ky-bat-dau-tu-dau', 'Kế hoạch đầu tư định kỳ: bắt đầu từ đâu?', 'Tôi đang thiết lập khoản đầu tư định kỳ hàng tháng và muốn chia sẻ cách xác định số tiền phù hợp trước khi chọn sản phẩm. Mọi người thường đặt tỷ lệ tiết kiệm và đầu tư như thế nào?', 'Thảo luận về cách xây dựng thói quen đầu tư định kỳ.'),
    ('kinh-nghiem-theo-doi-danh-muc-khi-thi-truong-bien-dong', 'Kinh nghiệm theo dõi danh mục khi thị trường biến động', 'Khi thị trường biến động mạnh, tôi ưu tiên xem lại luận điểm đầu tư thay vì kiểm tra giá liên tục. Bài viết chia sẻ một checklist ngắn để giữ kỷ luật.', 'Một checklist giữ kỷ luật đầu tư khi thị trường biến động.'),
    ('toi-uu-chi-tieu-khong-giam-chat-luong-song', 'Tối ưu chi tiêu mà không làm giảm chất lượng sống', 'Tôi đã theo dõi chi tiêu trong ba tháng và nhận ra những khoản nhỏ lặp lại tạo khác biệt lớn. Đây là các nguyên tắc giúp tôi cắt giảm có chọn lọc.', 'Chia sẻ thực tế về quản lý chi tiêu cá nhân.'),
    ('nen-dung-ung-dung-nao-de-theo-doi-ngan-sach', 'Nên dùng ứng dụng nào để theo dõi ngân sách?', 'Bạn đang dùng bảng tính, ứng dụng ngân sách hay ghi chú thủ công? Hãy cùng chia sẻ tiêu chí chọn công cụ phù hợp với thói quen cá nhân.', 'Thảo luận về công cụ theo dõi ngân sách.')
) AS source(slug, title, body, meta_description)
WHERE post.slug = source.slug
  AND post.content_type IN ('SERIES', 'COMMUNITY');
