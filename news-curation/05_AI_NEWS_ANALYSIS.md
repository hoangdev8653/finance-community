# AI NEWS ANALYSIS

## Mục tiêu
AI phải hiểu sự kiện và trích xuất facts trước khi viết. Đây là ANALYSIS, chưa phải WRITING.

## AI phải xác định
event, headline, summary, entities, people, companies, stock tickers, numbers, dates, market indicators, key claims, market impact, source, confidence.

## Phân loại
FACT — dữ kiện kiểm chứng được.
CLAIM — phát biểu từ nguồn.
ANALYSIS — phân tích.
OPINION — quan điểm.
PREDICTION — dự đoán.

Không biến OPINION/PREDICTION thành FACT.

## Confidence
HIGH, MEDIUM, LOW.
LOW confidence không được tự động viết thành khẳng định chắc chắn.

## Structured output
Ưu tiên JSON/schema để backend validate.

Ví dụ:
{
  "event": "...",
  "category": "MARKET",
  "facts": [],
  "entities": [],
  "claims": [],
  "confidence": "HIGH"
}

## Cấm
- tự bổ sung số liệu;
- tạo quote;
- tạo nguồn;
- tự tạo mã cổ phiếu;
- suy đoán dữ kiện chưa có căn cứ.
