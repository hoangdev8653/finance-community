# NEWS DEDUPLICATION

## Mục tiêu
Ngăn tạo nhiều bài cho cùng một nội dung hoặc cùng một sự kiện.

## Các lớp
1. URL/canonical URL.
2. Content hash.
3. Title similarity.
4. Content similarity.
5. Event similarity.

## Ví dụ
CafeF: VN-Index tăng 30 điểm.
Vietstock: Chứng khoán Việt Nam bứt phá.
VnEconomy: VN-Index tăng mạnh.

Có thể là một event → không tạo 3 bài.

## Trạng thái
EXACT_DUPLICATE
NEAR_DUPLICATE
SAME_EVENT
UNIQUE

## Same event
Giữ các source liên quan, chọn nguồn chính phù hợp, có thể dùng nhiều nguồn để fact-check và tạo một bài tổng hợp.

## Output
Duplicate → lưu record và đánh dấu DUPLICATE.
Same event → liên kết event/article đã tồn tại và bổ sung source nếu cần.
