export interface CompoundYear {
  year: number;
  contributed: number;
  interest: number;
  balance: number;
}

export interface CompoundCalculationResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  yearly: CompoundYear[];
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  annualRatePercent: number,
  years: number,
): CompoundCalculationResult {
  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.max(0, annualRatePercent) / 100 / 12;
  let balance = Math.max(0, principal);
  const yearly: CompoundYear[] = [];

  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + Math.max(0, monthlyContribution);
    if (month % 12 === 0 || month === months) {
      const completedYears = Math.ceil(month / 12);
      const contributed = Math.max(0, principal) + Math.max(0, monthlyContribution) * month;
      yearly.push({
        year: completedYears,
        contributed,
        interest: Math.max(0, balance - contributed),
        balance,
      });
    }
  }

  const totalContributed = Math.max(0, principal) + Math.max(0, monthlyContribution) * months;
  return {
    finalBalance: balance,
    totalContributed,
    totalInterest: Math.max(0, balance - totalContributed),
    yearly,
  };
}

export type LoanMethod = 'REDUCING_BALANCE' | 'FIXED_PAYMENT';

export interface LoanMonthItem {
  month: number;
  principalPayment: number;
  interestPayment: number;
  totalMonthlyPayment: number;
  remainingBalance: number;
}

export interface LoanYearItem {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  remainingBalance: number;
  months: LoanMonthItem[];
}

export interface LoanCalculationResult {
  monthlyPaymentFirst: number;
  monthlyPaymentMin: number;
  monthlyPaymentMax: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  yearlySchedule: LoanYearItem[];
  monthlySchedule: LoanMonthItem[];
}

export function calculateLoanSchedule(
  principal: number,
  annualRatePercent: number,
  years: number,
  method: LoanMethod = 'REDUCING_BALANCE',
): LoanCalculationResult {
  const validPrincipal = Math.max(0, principal);
  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = Math.max(0, annualRatePercent) / 100 / 12;

  let remaining = validPrincipal;
  const monthlySchedule: LoanMonthItem[] = [];

  if (method === 'REDUCING_BALANCE') {
    const fixedPrincipalMonthly = validPrincipal / totalMonths;

    for (let m = 1; m <= totalMonths; m += 1) {
      const interestPayment = remaining * monthlyRate;
      const principalPayment = Math.min(remaining, fixedPrincipalMonthly);
      remaining = Math.max(0, remaining - principalPayment);
      monthlySchedule.push({
        month: m,
        principalPayment,
        interestPayment,
        totalMonthlyPayment: principalPayment + interestPayment,
        remainingBalance: remaining,
      });
    }
  } else {
    // FIXED_PAYMENT (Annuity / Trả góp đều)
    let fixedTotalMonthly: number;
    if (monthlyRate === 0) {
      fixedTotalMonthly = validPrincipal / totalMonths;
    } else {
      fixedTotalMonthly =
        (validPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    for (let m = 1; m <= totalMonths; m += 1) {
      const interestPayment = remaining * monthlyRate;
      const principalPayment = Math.min(remaining, fixedTotalMonthly - interestPayment);
      remaining = Math.max(0, remaining - principalPayment);
      monthlySchedule.push({
        month: m,
        principalPayment,
        interestPayment,
        totalMonthlyPayment: principalPayment + interestPayment,
        remainingBalance: remaining,
      });
    }
  }

  // Aggregate into yearly items
  const yearlySchedule: LoanYearItem[] = [];
  let currentYearMonths: LoanMonthItem[] = [];
  let yearIndex = 1;

  for (let i = 0; i < monthlySchedule.length; i += 1) {
    currentYearMonths.push(monthlySchedule[i]);
    if ((i + 1) % 12 === 0 || i === monthlySchedule.length - 1) {
      const principalPaid = currentYearMonths.reduce((sum, item) => sum + item.principalPayment, 0);
      const interestPaid = currentYearMonths.reduce((sum, item) => sum + item.interestPayment, 0);
      const totalPaid = principalPaid + interestPaid;
      const lastMonth = currentYearMonths[currentYearMonths.length - 1];

      yearlySchedule.push({
        year: yearIndex,
        principalPaid,
        interestPaid,
        totalPaid,
        remainingBalance: lastMonth.remainingBalance,
        months: [...currentYearMonths],
      });

      yearIndex += 1;
      currentYearMonths = [];
    }
  }

  const payments = monthlySchedule.map((m) => m.totalMonthlyPayment);
  const totalInterest = monthlySchedule.reduce((sum, m) => sum + m.interestPayment, 0);
  const totalPrincipal = monthlySchedule.reduce((sum, m) => sum + m.principalPayment, 0);

  return {
    monthlyPaymentFirst: payments[0] || 0,
    monthlyPaymentMin: payments.length > 0 ? Math.min(...payments) : 0,
    monthlyPaymentMax: payments.length > 0 ? Math.max(...payments) : 0,
    totalPrincipal,
    totalInterest,
    totalPayment: totalPrincipal + totalInterest,
    yearlySchedule,
    monthlySchedule,
  };
}

export function calculatePeValue(eps: number, peMultiple: number): number {
  return Math.max(0, eps) * Math.max(0, peMultiple);
}

export function calculateGordonValue(
  dividendPerShare: number,
  growthPercent: number,
  discountPercent: number,
): number {
  const growth = growthPercent / 100;
  const discount = discountPercent / 100;
  if (discount <= growth || dividendPerShare < 0) return 0;
  return (dividendPerShare * (1 + growth)) / (discount - growth);
}

export function calculateMarginOfSafety(fairValue: number, discountPercent = 20): number {
  return Math.max(0, fairValue) * (1 - Math.max(0, discountPercent) / 100);
}
