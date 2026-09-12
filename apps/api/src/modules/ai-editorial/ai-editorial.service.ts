import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { buildLearningDraftPrompt } from './prompts/learning-draft.prompt';

@Injectable()
export class AiEditorialService {
  async createDraft(input: { title: string; domain: string; category: string; series?: string; lessonOrder?: number; sources?: string }) {
    const maxTitleLength = Number(process.env.AI_MAX_TITLE_LENGTH || 300);
    if (input.title.length > maxTitleLength) throw new ServiceUnavailableException('Tiêu đề vượt quá giới hạn cho phép.');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ServiceUnavailableException('AI chưa được cấu hình trên máy chủ.');
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildLearningDraftPrompt(input);

    let response: any;
    try {
      // 1. Generate content with real-time Google Search Grounding
      response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
    } catch {
      // Fallback without search tools if network or region constraint applies
      response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: prompt,
      });
    }

    const body = response?.text || '';

    // 2. Extract verified grounding sources from Google Search
    const sources: Array<{ title: string; url: string }> = [];
    const candidates = response?.candidates;
    const groundingMetadata = candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        const web = chunk.web;
        if (web?.uri && web?.title) {
          if (!sources.some((s) => s.url === web.uri)) {
            sources.push({ title: web.title.trim(), url: web.uri });
          }
        }
      }
    }

    // 3. Concurrently generate Image Plan & SEO Metadata
    const [imagePlan, seoMeta] = await Promise.all([
      this.createImagePlan(ai, input.title, body),
      this.generateSeoMeta(ai, input.title, body),
    ]);

    return {
      body,
      imagePlan,
      sources,
      metaTitle: seoMeta.metaTitle,
      metaDescription: seoMeta.metaDescription,
      generatedBy: 'GEMINI',
      requiresReview: true,
    };
  }

  private async generateSeoMeta(ai: GoogleGenAI, title: string, body: string) {
    const cleanText = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500);
    const seoPrompt = `Dựa vào tiêu đề và nội dung bài viết tài chính sau, hãy tạo tiêu đề và mô tả SEO chuẩn:
1. metaTitle: Tiêu đề SEO hấp dẫn, chuẩn chuyên gia, tối đa 65 ký tự.
2. metaDescription: Tóm tắt 1 câu giá trị cốt lõi bài viết, chuẩn SEO, tối đa 150 ký tự.
Không dùng markdown. Chỉ trả về JSON thuần túy theo schema: {"metaTitle": string, "metaDescription": string}
Tiêu đề: ${title}
Nội dung: ${cleanText}`;

    try {
      const result = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: seoPrompt,
      });
      const raw = (result.text || '').replace(/^```json\s*|\s*```$/g, '').trim();
      const parsed = JSON.parse(raw);
      return {
        metaTitle: typeof parsed.metaTitle === 'string' ? parsed.metaTitle.slice(0, 70) : undefined,
        metaDescription: typeof parsed.metaDescription === 'string' ? parsed.metaDescription.slice(0, 160) : undefined,
      };
    } catch {
      return { metaTitle: undefined, metaDescription: undefined };
    }
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
