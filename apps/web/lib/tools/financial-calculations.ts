export interface CompoundYear {
  year: number;
  contributed: number;
  interest: number;
  balance: number;
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number,
): { finalBalance: number; totalContributed: number; totalInterest: number; yearly: CompoundYear[] } {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.max(0, annualRatePercent) / 100 / 12;
  let balance = Math.max(0, principal);
  const yearly: CompoundYear[] = [];

  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + Math.max(0, monthlyContribution);
    if (month % 12 === 0 || month === months) {
      const completedYears = Math.ceil(month / 12);
      const contributed = Math.max(0, principal) + Math.max(0, monthlyContribution) * month;
      yearly.push({ year: completedYears, contributed, interest: Math.max(0, balance - contributed), balance });
    }
  }

  const totalContributed = Math.max(0, principal) + Math.max(0, monthlyContribution) * months;
  return { finalBalance: balance, totalContributed, totalInterest: Math.max(0, balance - totalContributed), yearly };
}

export function calculatePeValue(eps: number, peMultiple: number): number {
  return Math.max(0, eps) * Math.max(0, peMultiple);
}

export function calculateGordonValue(dividendPerShare: number, growthPercent: number, discountPercent: number): number {
  const growth = growthPercent / 100;
  const discount = discountPercent / 100;
  if (discount <= growth || dividendPerShare < 0) return 0;
  return (dividendPerShare * (1 + growth)) / (discount - growth);
}

export function calculateMarginOfSafety(fairValue: number, discountPercent = 20): number {
  return Math.max(0, fairValue) * (1 - Math.max(0, discountPercent) / 100);
}
