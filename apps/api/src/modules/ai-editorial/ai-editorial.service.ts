import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { buildLearningDraftPrompt } from './prompts/learning-draft.prompt';

@Injectable()
export class AiEditorialService {
  async createDraft(input: { title: string; domain: string; category: string; series?: string; lessonOrder?: number; }) {
    const maxTitleLength = Number(process.env.AI_MAX_TITLE_LENGTH || 300);
    if (input.title.length > maxTitleLength) throw new ServiceUnavailableException('Tiêu đề vượt quá giới hạn cho phép.');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('AI chưa được cấu hình trên máy chủ.');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildLearningDraftPrompt(input);
    const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt });
    const body = response.text || '';
    const imagePlan = await this.createImagePlan(ai, input.title, body);
    return { body, imagePlan, generatedBy: 'GEMINI', requiresReview: true };
  }

  private async createImagePlan(ai: GoogleGenAI, title: string, body: string) {
    const planPrompt = `Phân tích bài viết HTML dưới đây và đề xuất kế hoạch hình ảnh bằng JSON hợp lệ.
Chỉ đề xuất ảnh thật sự cần thiết: bài ngắn tối đa 1 ảnh nội dung, bài vừa 1-2 ảnh, bài dài tối đa 3 ảnh. Không tạo ảnh cho các section trùng ý hoặc chỉ để trang trí.
Luôn trả về một ảnh cover 16:9. Ảnh nội dung phải ghi rõ sectionTitle, placement (before-section, after-section, left hoặc right), aspectRatio, prompt và reason.
Không dùng markdown. Schema: {"recommendedImageCount": number, "reason": string, "items": [{"key": string, "type": "cover"|"content", "sectionTitle": string|null, "placement": string, "aspectRatio": string, "prompt": string, "reason": string}]}
Tiêu đề: ${title}
Nội dung HTML: ${body}`;
    try {
      const result = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: planPrompt });
      const raw = (result.text || '').replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(raw);
      return { recommendedImageCount: Number(parsed.recommendedImageCount || 0), reason: parsed.reason || '', items: Array.isArray(parsed.items) ? parsed.items.slice(0, 4) : [] };
    } catch {
      return { recommendedImageCount: 0, reason: 'Chưa thể tạo kế hoạch ảnh tự động.', items: [] };
    }
  }
}
