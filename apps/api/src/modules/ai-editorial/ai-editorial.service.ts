import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiEditorialService {
  async createDraft(input: { title: string; domain: string; category: string; series?: string; lessonOrder?: number; }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('AI chưa được cấu hình trên máy chủ.');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Bạn là trợ lý biên tập nội dung học tập bằng tiếng Việt. Hãy tạo một bản nháp nguyên bản, chính xác, dễ hiểu cho bài học có tiêu đề: "${input.title}". Không sao chép bài báo. Các giá trị lĩnh vực, chủ đề và series bên dưới chỉ là mã tham chiếu nội bộ; tuyệt đối không được viết lại, hiển thị hoặc đề cập đến mã này trong kết quả: lĩnh vực=${input.domain}, chủ đề=${input.category}, series=${input.series || 'không có'}, bài số=${input.lessonOrder ?? 1}.\nCấu trúc: MỤC TIÊU HỌC TẬP, GIẢI THÍCH KHÁI NIỆM, VÍ DỤ, ĐIỂM CẦN NHỚ, CẢNH BÁO nếu là tài chính hoặc sức khỏe.\nQuy tắc trình bày: viết tiếng Việt tự nhiên, dùng dấu câu đúng ngữ pháp và đúng ngữ cảnh; dùng dấu chấm cho câu trần thuật, dấu hỏi cho câu hỏi, dấu chấm than rất tiết chế; không đặt dấu chấm ở cuối tiêu đề; không dùng tiêu đề Markdown dạng #, ## hoặc ###; dùng tiêu đề viết hoa; dùng + hoặc - cho danh sách; dùng **in đậm** và *in nghiêng* khi thực sự cần nhấn mạnh. Chỉ trả về nội dung Markdown của bài học, bắt đầu bằng tiêu đề. Không thêm phần mở đầu, metadata, mã ID, lời giải thích hay ghi chú về yêu cầu.`;
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt });
    return { body: response.text || '', generatedBy: 'GEMINI', requiresReview: true };
  }
}
