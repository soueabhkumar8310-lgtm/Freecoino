export interface MockUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  coins_balance: number;
  streak_count: number;
  total_earned: number;
  referral_code: string;
  crypto_address: string;
  created_at: string;
  email_verified: boolean;
}

export interface MockCompletion {
  id: string;
  program_id: string;
  payout_decimal: number;
  coins_awarded: number;
  created_at: string;
  source: string;
}

export interface MockWithdrawal {
  id: string;
  requested_at: string;
  coins: number;
  amount_usd: number;
  status: string;
  tx_hash: string;
}

export interface MockLeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  monthly_earnings: number;
}

export interface MockReferral {
  id: string;
  masked_email: string;
  created_at: string;
}

export const mockUser: MockUser = {
  id: "demo-user-001",
  email: "demo@Freecoino.app",
  display_name: "Demo User",
  avatar_url: "",
  coins_balance: 5420,
  streak_count: 7,
  total_earned: 18500,
  referral_code: "DEMO123",
  crypto_address: "LTC-demo-address-xyz123",
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  email_verified: true,
};

export const mockCompletions: MockCompletion[] = [
  { id: "1", program_id: "MyLead Offer", payout_decimal: 2.50, coins_awarded: 2500, created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), source: "mylead" },
  { id: "2", program_id: "CPX Survey", payout_decimal: 3.20, coins_awarded: 3200, created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), source: "cpx" },
  { id: "3", program_id: "Notik - App Trial", payout_decimal: 1.00, coins_awarded: 1000, created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), source: "notik" },
  { id: "4", program_id: "GemiAd Survey", payout_decimal: 2.00, coins_awarded: 1400, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), source: "gemiad" },
  { id: "5", program_id: "Revtoo Offer", payout_decimal: 1.50, coins_awarded: 1500, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), source: "revtoo" },
  { id: "6", program_id: "TheoremReach Survey", payout_decimal: 4.00, coins_awarded: 4000, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), source: "theoremreach" },
  { id: "7", program_id: "CPX Screen-out", payout_decimal: 0.10, coins_awarded: -100, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), source: "cpx" },
  { id: "8", program_id: "MyLead - Game", payout_decimal: 5.00, coins_awarded: 5000, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), source: "mylead" },
];

export const mockWithdrawals: MockWithdrawal[] = [
  { id: "1", requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), coins: 2000, amount_usd: 2.00, status: "completed", tx_hash: "LTC-tx-abc123xyz" },
  { id: "2", requested_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), coins: 3500, amount_usd: 3.50, status: "completed", tx_hash: "LTC-tx-def456uvw" },
  { id: "3", requested_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), coins: 1500, amount_usd: 1.50, status: "completed", tx_hash: "LTC-tx-ghi789rst" },
];

export const mockLeaderboard: MockLeaderboardEntry[] = [
  { rank: 1, user_id: "lb-001", display_name: "CryptoKing99", monthly_earnings: 45000 },
  { rank: 2, user_id: "lb-002", display_name: "EarnMaster", monthly_earnings: 38200 },
  { rank: 3, user_id: "lb-003", display_name: "SurveyPro", monthly_earnings: 31500 },
  { rank: 4, user_id: "lb-004", display_name: "RewardHunter", monthly_earnings: 28400 },
  { rank: 5, user_id: "lb-005", display_name: "CoinCollector", monthly_earnings: 24100 },
  { rank: 6, user_id: "lb-006", display_name: "OfferKing", monthly_earnings: 21300 },
  { rank: 7, user_id: "lb-007", display_name: "TaskMaster", monthly_earnings: 19800 },
  { rank: 8, user_id: "lb-008", display_name: "GamePlayer", monthly_earnings: 17500 },
  { rank: 9, user_id: "lb-009", display_name: "SurveyLover", monthly_earnings: 15200 },
  { rank: 10, user_id: "lb-010", display_name: "DailyEarner", monthly_earnings: 12800 },
  { rank: 11, user_id: "lb-011", display_name: "CryptoFan", monthly_earnings: 11500 },
  { rank: 12, user_id: "lb-012", display_name: "OfferHunter", monthly_earnings: 10200 },
];

export const mockReferrals: MockReferral[] = [
  { id: "ref-001", masked_email: "jo***@gmail.com", created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "ref-002", masked_email: "sa***@outlook.com", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "ref-003", masked_email: "ma***@yahoo.com", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_OFFERS = [
  { id: "1", name: "Crypto Game - Level 10", payout: "$5.00", type: "game", provider: "MyLead" },
  { id: "2", name: "Finance Survey", payout: "$3.50", type: "survey", provider: "CPX" },
  { id: "3", name: "New App Trial", payout: "$2.00", type: "app", provider: "Notik" },
  { id: "4", name: "Consumer Survey", payout: "$4.00", type: "survey", provider: "GemiAd" },
  { id: "5", name: "Casino Game", payout: "$8.00", type: "game", provider: "Revtoo" },
  { id: "6", name: "Health Survey", payout: "$2.50", type: "survey", provider: "TheoremReach" },
  { id: "7", name: "Shopping App", payout: "$1.50", type: "app", provider: "MyLead" },
  { id: "8", name: "Travel Survey", payout: "$3.00", type: "survey", provider: "CPX" },
];
