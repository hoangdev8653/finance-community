export interface SafetyEvaluationResult {
  isSuspicious: boolean;
  isSevereSpam: boolean;
  reasons: string[];
  suggestedStatus: 'PUBLISHED' | 'HIDDEN';
}

export class ContentSafetyUtil {
  // High-risk financial scam / deceptive investment patterns
  private static readonly DECEPTIVE_PATTERNS = [
    /cam\s*kết\s*(lợi\s*nhuận|lãi|x\d+|nhân\s*tài\s*khoản)/i,
    /bao\s*lỗ\s*(100%|hoàn\s*toàn)?/i,
    /kéo\s*(1-1|1\s*kèm\s*1|về\s*bờ)/i,
    /phím\s*hàng\s*vip\s*(chắc\s*ăn|bao\s*ăn|tất\s*tay)/i,
    /ủy\s*thác\s*đầu\s*tư\s*lãi\s*suất\s*khủng/i,
    /nạp\s*tiền\s*rút\s*thưởng\s*hoa\s*hồng/i,
  ];

  // External group invites known for financial phishing scams
  private static readonly GROUP_INVITE_PATTERNS = [
    /(https?:\/\/)?(www\.)?zalo\.me\/g\/[a-zA-Z0-9_-]+/i,
    /(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_+-]+/i,
  ];

  // Phone number spam pattern embedded in content
  private static readonly PHONE_SPAM_PATTERN = /(zalo|tele|sđt|hotline|liên\s*hệ|lh|inbox)[:\s]*(\+?84|0)[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/i;

  public static evaluate(text: string): SafetyEvaluationResult {
    if (!text || text.trim().length === 0) {
      return {
        isSuspicious: false,
        isSevereSpam: false,
        reasons: [],
        suggestedStatus: 'PUBLISHED',
      };
    }

    const reasons: string[] = [];
    let isSevereSpam = false;

    // Check deceptive patterns
    for (const pattern of this.DECEPTIVE_PATTERNS) {
      if (pattern.test(text)) {
        reasons.push('Nội dung chứa từ khóa cam kết lợi nhuận bất thường hoặc dấu hiệu lừa đảo tài chính.');
        isSevereSpam = true;
        break;
      }
    }

    // Check group invite links
    for (const pattern of this.GROUP_INVITE_PATTERNS) {
      if (pattern.test(text)) {
        reasons.push('Nội dung chứa liên kết mời vào nhóm kín Zalo/Telegram chưa được xác thực.');
        isSevereSpam = true;
        break;
      }
    }

    // Check phone spam with solicitation
    if (this.PHONE_SPAM_PATTERN.test(text)) {
      reasons.push('Nội dung chứa thông tin mời chào/liên hệ cá nhân đáng ngờ.');
    }

    const isSuspicious = reasons.length > 0;
    const suggestedStatus = isSevereSpam ? 'HIDDEN' : 'PUBLISHED';

    return {
      isSuspicious,
      isSevereSpam,
      reasons,
      suggestedStatus,
    };
  }
}
