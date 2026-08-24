# SOURCE MANAGEMENT

## Mục tiêu
Quản lý tập trung nguồn RSS/API/scraper.

## Fields
id, name, publisher, homepage_url, feed_url, type, language, country, category, priority, enabled, fetch_interval, last_fetched_at, last_success_at, last_error_at, error_count.

## Priority
TIER_1 — nguồn gốc/chính thức.
TIER_2 — báo chí uy tín.
TIER_3 — nguồn thứ cấp.

Priority hỗ trợ chọn nguồn chính, dedup và fact-check.

## Health
Theo dõi success rate, latency, parser errors, timeout, HTTP errors, extraction failures.

## Admin
Enable, disable, edit, test, fetch now, xem lỗi.

## Không hard-code
Nguồn phải quản lý bằng DB/configuration.

## Thêm nguồn
Create → Validate → Test feed → Test extraction → Enable → Monitor.

## Attribution
Mỗi bài phải liên kết được với nguồn gốc.
