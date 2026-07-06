export interface Achievement {
  id: string;
  icon: string;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  requirement: (coins: number, totalEarned: number, streak: number, referrals: number, offersCompleted: number) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: "first_offer",
    icon: "🎯",
    title: "First Steps",
    titleHi: "पहला कदम",
    description: "Complete your first offer",
    descriptionHi: "अपना पहला ऑफर पूरा करें",
    requirement: (_c, _t, _s, _r, offers) => offers >= 1,
  },
  {
    id: "earn_100",
    icon: "🪙",
    title: "Coin Collector",
    titleHi: "सिक्का संग्रहकर्ता",
    description: "Earn 100 coins total",
    descriptionHi: "कुल 100 सिक्के कमाएं",
    requirement: (_c, total) => total >= 100,
  },
  {
    id: "earn_1000",
    icon: "💰",
    title: "Money Maker",
    titleHi: "पैसे कमाने वाला",
    description: "Earn 1,000 coins total",
    descriptionHi: "कुल 1,000 सिक्के कमाएं",
    requirement: (_c, total) => total >= 1000,
  },
  {
    id: "streak_3",
    icon: "🔥",
    title: "On Fire",
    titleHi: "आग की तरह",
    description: "Maintain a 3-day streak",
    descriptionHi: "3 दिन की स्ट्रीक बनाए रखें",
    requirement: (_c, _t, streak) => streak >= 3,
  },
  {
    id: "streak_7",
    icon: "⭐",
    title: "Week Warrior",
    titleHi: "सप्ताह योद्धा",
    description: "Maintain a 7-day streak",
    descriptionHi: "7 दिन की स्ट्रीक बनाए रखें",
    requirement: (_c, _t, streak) => streak >= 7,
  },
  {
    id: "referral_1",
    icon: "👥",
    title: "Social Butterfly",
    titleHi: "सामाजिक तितली",
    description: "Refer your first friend",
    descriptionHi: "अपने पहले दोस्त को रेफर करें",
    requirement: (_c, _t, _s, referrals) => referrals >= 1,
  },
  {
    id: "referral_5",
    icon: "🚀",
    title: "Influencer",
    titleHi: "प्रभावशाली",
    description: "Refer 5 friends",
    descriptionHi: "5 दोस्तों को रेफर करें",
    requirement: (_c, _t, _s, referrals) => referrals >= 5,
  },
  {
    id: "offers_10",
    icon: "🏆",
    title: "Offer Master",
    titleHi: "ऑफर मास्टर",
    description: "Complete 10 offers",
    descriptionHi: "10 ऑफर पूरे करें",
    requirement: (_c, _t, _s, _r, offers) => offers >= 10,
  },
  {
    id: "offers_50",
    icon: "👑",
    title: "Earning King",
    titleHi: "कमाई का राजा",
    description: "Complete 50 offers",
    descriptionHi: "50 ऑफर पूरे करें",
    requirement: (_c, _t, _s, _r, offers) => offers >= 50,
  },
  {
    id: "cashout_1",
    icon: "💸",
    title: "First Payout",
    titleHi: "पहला भुगतान",
    description: "Make your first withdrawal",
    descriptionHi: "अपनी पहली निकासी करें",
    requirement: (_c, _t, _s, _r) => true, // Checked externally
  },
];

export function checkAchievements(
  coins: number,
  totalEarned: number,
  streak: number,
  referrals: number,
  offersCompleted: number,
  completedIds: string[],
): Achievement[] {
  return achievements.filter(
    (a) => !completedIds.includes(a.id) && a.requirement(coins, totalEarned, streak, referrals, offersCompleted),
  );
}
