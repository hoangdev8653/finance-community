# SOURCE COLLECTION

## Mục tiêu
Thu thập tin mới từ các nguồn được cấu hình mà một nguồn lỗi không làm dừng toàn bộ pipeline.

## Nguồn ban đầu
### Việt Nam
- Vietstock
- CafeF
- VnEconomy
- Báo Đầu Tư

### Quốc tế
- Reuters Business
- CNBC
- Bloomberg khi có feed/quyền truy cập phù hợp

Danh sách phải cấu hình được, không hard-code.

## Ưu tiên phương thức
1. RSS chính thức.
2. API chính thức.
3. Website có quyền truy cập phù hợp.
4. Extractor/scraper khi phù hợp điều khoản sử dụng.

## Metadata
source_id, source_name, source_url, article_url, canonical_url, title, author, published_at, updated_at, excerpt, image_url, feed_guid, collected_at.

## Freshness
Kiểm tra published_at, updated_at và collected_at. Tin ngoài cửa sổ thời gian xử lý phải được bỏ qua hoặc đánh dấu phù hợp.

## Lịch
MVP có thể dùng 06:30, 11:30, 17:30. Schedule phải có khả năng cấu hình sau này.

## Failure isolation
CafeF lỗi không được làm Vietstock/VnEconomy dừng theo.

## Output
Mỗi item mới → raw_news_items với PENDING.
