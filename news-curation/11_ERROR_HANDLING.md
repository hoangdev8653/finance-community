# ERROR HANDLING

## Mục tiêu
Một nguồn hoặc một bài lỗi không được làm sập toàn bộ hệ thống.

## Source errors
RSS timeout, HTTP 403/429, malformed feed, parser error, content unavailable.
→ log → retry giới hạn → backoff → cập nhật health → tiếp tục nguồn khác.

## AI errors
Timeout, rate limit, invalid JSON, empty response, token limit, schema failure.
→ retry giới hạn → validate structured output → FAILED/NEEDS_REVIEW nếu vẫn lỗi.

## Database
Không đánh dấu PROCESSED trước khi transaction thành công. Phải tránh mất dữ liệu và duplicate.

## Idempotency
Trigger cùng job nhiều lần không tạo nhiều bài giống nhau.

## Retry fields
retry_count, last_error, next_retry_at, status.

## Failed queue
Job thất bại nhiều lần → FAILED. Admin/BTV có thể retry, ignore hoặc inspect.

## Observability
Log source, raw item, job id, AI run id, duration, status, error.

## Kill switch
Có thể disable toàn bộ AI processing, một source hoặc cron.

## Không nuốt lỗi
Mọi exception phải được log và có trạng thái xử lý rõ.
