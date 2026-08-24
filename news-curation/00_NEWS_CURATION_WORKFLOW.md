# HỆ THỐNG TỰ ĐỘNG THU THẬP & AI BIÊN TẬP TIN TỨC TÀI CHÍNH

## Mục đích
Tự động thu thập tin tài chính mới mỗi ngày, lọc, loại trùng, trích xuất dữ kiện, AI phân tích và viết thành bài mới, kiểm tra chất lượng, tạo DRAFT để Biên tập viên duyệt và xuất bản.

Đây là DAILY NEWS PIPELINE, không phải quy trình sản xuất bài học/series.

## Pipeline
SOURCE → COLLECT → FILTER → DEDUPLICATE → EXTRACT → ANALYZE → WRITE → FACT CHECK → QUALITY CHECK → DRAFT → HUMAN REVIEW → PUBLISH

## Nguyên tắc
1. Ưu tiên tính mới và chính xác.
2. Không bịa dữ kiện, số liệu, quote hoặc nguồn.
3. Không chỉ thay từ đồng nghĩa từ bài gốc.
4. Viết dựa trên facts và nguồn đã thu thập.
5. Luôn giữ source attribution/provenance.
6. Không tạo nhiều bài cho cùng một news event.
7. Tin không đủ quan trọng có thể bỏ qua.
8. Tin chưa xác minh phải được đánh dấu.
9. Mọi bài AI tạo ra mặc định là DRAFT.
10. AI không có quyền publish cuối cùng trong MVP.
11. BTV là người duyệt cuối.
12. Toàn bộ pipeline phải có log và AI generation history.

## Trạng thái
Raw news: PENDING, PROCESSING, PROCESSED, IGNORED, FAILED, DUPLICATE.
AI job: QUEUED, RUNNING, COMPLETED, FAILED, NEEDS_REVIEW.
Article: DRAFT, PUBLISHED, REJECTED, ARCHIVED.

## Output bắt buộc
- title
- slug
- excerpt
- content
- category
- tags
- source references
- source URL
- source published time
- AI generation metadata
- fact-check status
- editorial status
