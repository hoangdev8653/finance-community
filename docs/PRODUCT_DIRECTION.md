# Product Direction — Knowledge & Learning Platform

## Quyết định sản phẩm

Finance Community được định hướng thành nền tảng học kiến thức thực tế qua các series bài học ngắn. Tài chính là một nhóm chủ đề quan trọng, không phải giới hạn của sản phẩm.

Mục tiêu là giúp người dùng học, luyện tập và áp dụng kiến thức trong các lĩnh vực như:

- Tài chính cá nhân và đầu tư cơ bản
- Kỹ năng sống và phát triển bản thân
- Sức khỏe và lối sống lành mạnh
- Công việc, giao tiếp và kỹ năng số
- Kiến thức đời sống

## Phạm vi nội dung

### Nội dung cốt lõi: LEARNING

Learning là nội dung do nền tảng tự biên soạn hoặc có quyền sử dụng rõ ràng. Mỗi bài học cần có mục tiêu, giải thích, ví dụ, bài tập/quiz và nguồn tham khảo khi phù hợp.

### COMMUNITY

Community là nội dung do người dùng tạo: câu hỏi, thảo luận và kinh nghiệm cá nhân. Nội dung này cần moderation riêng và không được coi là kiến thức đã kiểm chứng.


## Mô hình dữ liệu lõi

```text
Category -> Series -> Lesson -> Quiz -> Question
                         |
                    Source references

User -> Progress / Bookmark / Quiz attempt
```

Taxonomy Learning khởi đầu với các nhóm: Tài chính cá nhân, Sức khỏe cơ bản, Kỹ năng sống, Kỹ năng nghề nghiệp và Kỹ năng số. Có thể thêm nhóm mới bằng category/domain hiện có, không cần module riêng.

Các bảng và service phải dùng tên tổng quát, không hard-code Finance:

- `categories`
- `series`
- `lessons` hoặc learning posts hiện có
- `quizzes`, `questions`
- `user_progress`, `bookmarks`
- `sources` / `source_references`

## Nguyên tắc biên soạn

1. Không sao chép toàn văn hoặc viết lại quá sát một nguồn.
2. AI chỉ hỗ trợ nghiên cứu, dàn ý, bản nháp và kiểm tra; không phải nguồn sự thật duy nhất.
3. Dữ kiện, công thức, quy định và tuyên bố sức khỏe phải được kiểm tra trước khi xuất bản.
4. Hình ảnh phải do nền tảng tạo, tự sở hữu hoặc có giấy phép phù hợp.
5. Mỗi bài có trạng thái `DRAFT`, `REVIEW`, `PUBLISHED`, `NEEDS_UPDATE`, `ARCHIVED`.
6. Nội dung tài chính, sức khỏe và pháp luật phải có cảnh báo phạm vi phù hợp.

## Trải nghiệm người dùng

MVP cần hỗ trợ:

- Khám phá theo category và series
- Đọc bài học theo thứ tự
- Đánh dấu hoàn thành và theo dõi tiến độ
- Quiz cơ bản
- Tìm kiếm bài học và thuật ngữ
- Bookmark
- Công cụ tương tác ưu tiên: lãi kép, ngân sách, khoản vay

## Mở rộng và kiếm tiền

Khi nội dung gốc và quyền sử dụng đã rõ ràng, nền tảng có thể mở rộng bằng quảng cáo, series nâng cao, thành viên, khóa học và công cụ trả phí. Không xây mô hình doanh thu dựa trên việc đăng lại nội dung báo chí.

## Phạm vi kỹ thuật giai đoạn đầu

- Giữ lại auth, users, moderation, media, search và các phần community đang dùng được.
- Tái sử dụng Series hiện có và tổng quát hóa lesson/post thay vì tạo hệ thống nội dung thứ hai.
- Không xóa database hoặc migration cũ một cách phá hủy.
- Ưu tiên migration tăng dần và tương thích ngược.

## Tiêu chí hoàn thành hướng mới

Một developer mới có thể hiểu rằng sản phẩm là nền tảng Learning đa chủ đề; Finance chỉ là category. Việc thêm category như `HEALTH`, `LIFE_SKILLS` hoặc `CAREER` không cần tạo frontend/backend/database riêng.
