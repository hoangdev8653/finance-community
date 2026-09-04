import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { buildLearningDraftPrompt } from './prompts/learning-draft.prompt';

export interface GroundedSource {
  title: string;
  url: string;
}

@Injectable()
export class AiEditorialService {
  async createDraft(input: {
    title: string;
    domain: string;
    category: string;
    series?: string;
    lessonOrder?: number;
    sources?: string;
  }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('AI chưa được cấu hình trên máy chủ.');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildLearningDraftPrompt(input);

    let body = '';
    const sources: GroundedSource[] = [];
    let searchQueries: string[] = [];

    try {
      // 1. Sinh nội dung kết hợp Google Search Grounding thời gian thực
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      body = response.text || '';

      // Trích xuất metadata tìm kiếm và các nguồn web thực tế được đối chiếu
      const candidate = response.candidates?.[0];
      const groundingMeta = candidate?.groundingMetadata as any;

      if (groundingMeta) {
        if (Array.isArray(groundingMeta.webSearchQueries)) {
          searchQueries = groundingMeta.webSearchQueries;
        }

        if (Array.isArray(groundingMeta.groundingChunks)) {
          const seenUrls = new Set<string>();
          for (const chunk of groundingMeta.groundingChunks) {
            const uri = chunk?.web?.uri;
            if (uri && !seenUrls.has(uri)) {
              seenUrls.add(uri);
              sources.push({
                title: chunk?.web?.title || uri,
                url: uri,
              });
            }
          }
        }
      }
    } catch (searchError) {
      // Cơ chế dự phòng nếu công cụ tìm kiếm gặp lỗi kết nối
      const fallbackResponse = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
      });
      body = fallbackResponse.text || '';
    }

    const imagePlan = await this.createImagePlan(ai, input.title, body);

    return {
      body,
      imagePlan,
      sources,
      searchQueries,
      generatedBy: sources.length > 0 ? 'GEMINI_SEARCH_GROUNDED' : 'GEMINI',
      requiresReview: true,
    };
  }

  private async createImagePlan(ai: GoogleGenAI, title: string, body: string) {
    const planPrompt = `Phân tích bài viết HTML dưới đây và đề xuất kế hoạch hình ảnh bằng JSON hợp lệ.
Chỉ đề xuất ảnh thật sự cần thiết: bài ngắn tối đa 1 ảnh nội dung, bài vừa 1-2 ảnh, bài dài tối đa 3 ảnh. Không tạo ảnh cho các section trùng ý hoặc chỉ để trang trí.
Luôn trả về một ảnh cover 16:9. Ảnh nội dung phải ghi rõ sectionTitle, placement (before-section, after-section, left hoặc right), aspectRatio, prompt và reason.
Không dùng markdown. Schema: {"recommendedImageCount": number, "reason": string, "items": [{"key": string, "type": "cover"|"content", "sectionTitle": string|null, "placement": string, "aspectRatio": string, "prompt": string, "reason": string}]}
Tiêu đề: ${title}
Nội dung HTML: ${body}`;
    try {
      const result = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: planPrompt,
      });
      const raw = (result.text || '').replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(raw);
      return {
        recommendedImageCount: Number(parsed.recommendedImageCount || 0),
        reason: parsed.reason || '',
        items: Array.isArray(parsed.items) ? parsed.items.slice(0, 4) : [],
      };
    } catch {
      return { recommendedImageCount: 0, reason: 'Chưa thể tạo kế hoạch ảnh tự động.', items: [] };
    }
  }
}
