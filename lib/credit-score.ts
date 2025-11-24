export interface CreditProfile {
    paymentHistory: number; // 0-100
    creditUtilization: number; // 0-100 percentage
    creditAge: number; // months
    accountMix: number; // 0-5 (number of different account types)
    hardInquiries: number; // count in last 2 years
    creditLimit: number; // total credit limit
    currentDebt: number; // total current debt
    missedPayments: number; // count
  }
  
  export interface Scenario {
    id: string;
    name: string;
    description: string;
    category: 'payment' | 'debt' | 'credit' | 'inquiry' | 'account';
    icon: string;
    action: (profile: CreditProfile) => CreditProfile;
    impactRange: { min: number; max: number };
    timeframe: string;
    riskLevel: 'low' | 'medium' | 'high';
  }
  
  export interface ScoreBreakdown {
    paymentHistory: number; // 35%
    creditUtilization: number; // 30%
    creditAge: number; // 15%
    creditMix: number; // 10%
    newCredit: number; // 10%
  }
  
  export const SCORE_WEIGHTS = {
    paymentHistory: 0.35,
    creditUtilization: 0.30,
    creditAge: 0.15,
    creditMix: 0.10,
    newCredit: 0.10,
  };
  
  export function calculateCreditScore(profile: CreditProfile): number {
    const breakdown = calculateScoreBreakdown(profile);
    
    const totalScore = 
      breakdown.paymentHistory * SCORE_WEIGHTS.paymentHistory +
      breakdown.creditUtilization * SCORE_WEIGHTS.creditUtilization +
      breakdown.creditAge * SCORE_WEIGHTS.creditAge +
      breakdown.creditMix * SCORE_WEIGHTS.creditMix +
      breakdown.newCredit * SCORE_WEIGHTS.newCredit;
    
    // FICO scores range from 300-850
    return Math.round(300 + (totalScore / 100) * 550);
  }
  
  export function calculateScoreBreakdown(profile: CreditProfile): ScoreBreakdown {
    // Payment History (35%) - Based on payment reliability
    const paymentHistoryScore = Math.max(0, Math.min(100, 
      profile.paymentHistory - (profile.missedPayments * 15)
    ));
    
    // Credit Utilization (30%) - Lower is better
    const utilizationScore = Math.max(0, 100 - profile.creditUtilization);
    
    // Credit Age (15%) - Older is better
    const ageScore = Math.min(100, (profile.creditAge / 120) * 100); // 10 years = 100%
    
    // Credit Mix (10%) - More variety is better
    const mixScore = Math.min(100, (profile.accountMix / 5) * 100);
    
    // New Credit (10%) - Fewer inquiries is better
    const newCreditScore = Math.max(0, 100 - (profile.hardInquiries * 20));
    
    return {
      paymentHistory: paymentHistoryScore,
      creditUtilization: utilizationScore,
      creditAge: ageScore,
      creditMix: mixScore,
      newCredit: newCreditScore,
    };
  }
  
  export const scenarios: Scenario[] = [
    {
      id: 'pay-on-time',
      name: 'Make On-Time Payment',
      description: 'Pay your credit card bill on time for the next 6 months',
      category: 'payment',
      icon: 'CheckCircle2',
      impactRange: { min: 10, max: 30 },
      timeframe: '6 months',
      riskLevel: 'low',
      action: (profile) => ({
        ...profile,
        paymentHistory: Math.min(100, profile.paymentHistory + 10),
      }),
    },
    {
      id: 'miss-payment',
      name: 'Miss a Payment',
      description: 'What if you miss a credit card payment by 30+ days?',
      category: 'payment',
      icon: 'XCircle',
      impactRange: { min: -60, max: -100 },
      timeframe: 'Immediate',
      riskLevel: 'high',
      action: (profile) => ({
        ...profile,
        paymentHistory: Math.max(0, profile.paymentHistory - 20),
        missedPayments: profile.missedPayments + 1,
      }),
    },
    {
      id: 'pay-down-debt',
      name: 'Pay Down 50% of Balance',
      description: 'Reduce your credit card balance by half',
      category: 'debt',
      icon: 'TrendingDown',
      impactRange: { min: 20, max: 50 },
      timeframe: '1-2 months',
      riskLevel: 'low',
      action: (profile) => ({
        ...profile,
        currentDebt: profile.currentDebt * 0.5,
        creditUtilization: (profile.currentDebt * 0.5 / profile.creditLimit) * 100,
      }),
    },
    {
      id: 'max-out-card',
      name: 'Max Out Credit Card',
      description: 'Use 90%+ of your available credit',
      category: 'debt',
      icon: 'AlertTriangle',
      impactRange: { min: -30, max: -60 },
      timeframe: '1 month',
      riskLevel: 'high',
      action: (profile) => ({
        ...profile,
        creditUtilization: 95,
        currentDebt: profile.creditLimit * 0.95,
      }),
    },
    {
      id: 'increase-limit',
      name: 'Request Credit Limit Increase',
      description: 'Ask for a higher credit limit on existing card',
      category: 'credit',
      icon: 'ArrowUpCircle',
      impactRange: { min: -5, max: 15 },
      timeframe: 'Immediate',
      riskLevel: 'low',
      action: (profile) => {
        const newLimit = profile.creditLimit * 1.3;
        return {
          ...profile,
          creditLimit: newLimit,
          creditUtilization: (profile.currentDebt / newLimit) * 100,
          hardInquiries: profile.hardInquiries + 0.5, // Soft inquiry in most cases
        };
      },
    },
    {
      id: 'open-new-card',
      name: 'Open New Credit Card',
      description: 'Apply for and open a new credit card account',
      category: 'account',
      icon: 'CreditCard',
      impactRange: { min: -10, max: 5 },
      timeframe: '3-6 months',
      riskLevel: 'medium',
      action: (profile) => ({
        ...profile,
        hardInquiries: profile.hardInquiries + 1,
        accountMix: Math.min(5, profile.accountMix + 1),
        creditAge: profile.creditAge * 0.95, // Average age decreases
        creditLimit: profile.creditLimit + 5000,
        creditUtilization: (profile.currentDebt / (profile.creditLimit + 5000)) * 100,
      }),
    },
    {
      id: 'close-old-card',
      name: 'Close Oldest Credit Card',
      description: 'Cancel your oldest credit card account',
      category: 'account',
      icon: 'Trash2',
      impactRange: { min: -20, max: -40 },
      timeframe: '1-3 months',
      riskLevel: 'high',
      action: (profile) => ({
        ...profile,
        creditAge: profile.creditAge * 0.8,
        creditLimit: profile.creditLimit * 0.8,
        creditUtilization: (profile.currentDebt / (profile.creditLimit * 0.8)) * 100,
        accountMix: Math.max(1, profile.accountMix - 1),
      }),
    },
    {
      id: 'apply-auto-loan',
      name: 'Apply for Auto Loan',
      description: 'Submit application for a car loan',
      category: 'inquiry',
      icon: 'Car',
      impactRange: { min: -5, max: 10 },
      timeframe: '6-12 months',
      riskLevel: 'medium',
      action: (profile) => ({
        ...profile,
        hardInquiries: profile.hardInquiries + 1,
        accountMix: Math.min(5, profile.accountMix + 1),
      }),
    },
    {
      id: 'debt-consolidation',
      name: 'Consolidate Debt',
      description: 'Move all balances to a single loan with lower rate',
      category: 'debt',
      icon: 'Layers',
      impactRange: { min: -10, max: 20 },
      timeframe: '3-12 months',
      riskLevel: 'medium',
      action: (profile) => ({
        ...profile,
        hardInquiries: profile.hardInquiries + 1,
        accountMix: Math.min(5, profile.accountMix + 1),
        creditUtilization: 30, // Often lowers utilization
      }),
    },
    {
      id: 'become-authorized-user',
      name: 'Become Authorized User',
      description: 'Get added to someone else\'s credit card with good history',
      category: 'account',
      icon: 'UserPlus',
      impactRange: { min: 10, max: 40 },
      timeframe: '1-2 months',
      riskLevel: 'low',
      action: (profile) => ({
        ...profile,
        paymentHistory: Math.min(100, profile.paymentHistory + 15),
        creditAge: profile.creditAge + 12, // Can add to age
        creditUtilization: profile.creditUtilization * 0.9,
      }),
    },
  ];
  
  export function getDefaultProfile(): CreditProfile {
    return {
      paymentHistory: 75,
      creditUtilization: 35,
      creditAge: 48, // 4 years
      accountMix: 3,
      hardInquiries: 2,
      creditLimit: 10000,
      currentDebt: 3500,
      missedPayments: 0,
    };
  }
  
  export function getScoreRating(score: number): {
    rating: string;
    color: string;
    description: string;
  } {
    if (score >= 800) {
      return {
        rating: 'Exceptional',
        color: 'text-green-600',
        description: 'Well above average. Excellent credit.',
      };
    } else if (score >= 740) {
      return {
        rating: 'Very Good',
        color: 'text-green-500',
        description: 'Above average. Most lenders consider this good credit.',
      };
    } else if (score >= 670) {
      return {
        rating: 'Good',
        color: 'text-blue-600',
        description: 'Near or slightly above average. Most lenders approve.',
      };
    } else if (score >= 580) {
      return {
        rating: 'Fair',
        color: 'text-yellow-600',
        description: 'Below average. May have trouble getting credit.',
      };
    } else {
      return {
        rating: 'Poor',
        color: 'text-red-600',
        description: 'Well below average. Will have difficulty getting credit.',
      };
    }
  }
  
  export function generateScoreTimeline(
    profile: CreditProfile,
    appliedScenarios: Scenario[]
  ): { month: number; score: number }[] {
    const timeline: { month: number; score: number }[] = [];
    let currentProfile = { ...profile };
    
    // Initial score
    timeline.push({ month: 0, score: calculateCreditScore(currentProfile) });
    
    // Project 12 months into the future
    for (let month = 1; month <= 12; month++) {
      // Apply scenarios gradually over time
      appliedScenarios.forEach((scenario) => {
        const months = parseInt(scenario.timeframe) || 1;
        if (month % Math.max(1, Math.floor(months / 2)) === 0) {
          currentProfile = scenario.action(currentProfile);
        }
      });
      
      // Natural improvement over time with good behavior
      if (appliedScenarios.some(s => s.riskLevel === 'low')) {
        currentProfile.paymentHistory = Math.min(100, currentProfile.paymentHistory + 0.5);
      }
      
      timeline.push({ month, score: calculateCreditScore(currentProfile) });
    }
    
    return timeline;
  }
  