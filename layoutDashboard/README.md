# Finance Community — Admin Dashboard UI Specification

Bộ specification này mô tả giao diện **Admin Dashboard light theme** dựa trên hình reference `reference/dashboard-reference.png`.

## Mục tiêu

- Codex/agent có thể dùng tài liệu này để triển khai dashboard gần giống reference.
- Ưu tiên giao diện desktop 1536×1024 nhưng phải responsive.
- Không tự đổi brand, layout, hierarchy hoặc màu chủ đạo nếu chưa được yêu cầu.
- Dashboard dành cho ADMIN/SUPER_ADMIN; Learning là nội dung biên tập nội bộ, Community là nội dung người dùng.

## Cấu trúc tài liệu

- `01-layout.md`: cấu trúc tổng thể, grid, dimensions, spacing.
- `02-design-tokens.md`: màu sắc, typography, radius, shadow, border, icon.
- `03-components.md`: mô tả chi tiết từng component trong ảnh.
- `04-responsive-and-states.md`: responsive, hover, focus, loading, empty, error.
- `05-codex-implementation.md`: hướng dẫn triển khai vào repo Finance Community hiện tại.
- `reference/dashboard-reference.png`: ảnh gốc dùng làm visual reference.

## Nguyên tắc quan trọng

1. Đây là **admin dashboard sáng**, nền trắng/off-white, không dùng dark card.
2. Visual hierarchy phải nhẹ, sạch, nhiều whitespace.
3. Border rất mảnh, shadow rất nhẹ; tránh UI nặng.
4. Typography sử dụng heading rõ ràng nhưng không quá đậm.
5. Accent chính là xanh lá thương hiệu; secondary accents dùng xanh dương, tím, cam cho data visualization.
6. Icon ưu tiên Lucide React và nét 2px.
7. Spacing tuân thủ hệ 4pt/4px của repo.
8. Dashboard không hiển thị News/RSS ingestion; sidebar tập trung Learning, Community, Moderation, Users, AI Editorial và quản trị.
