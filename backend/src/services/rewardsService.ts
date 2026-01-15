import { DailyReward, LuckyDrawEntry, LuckyDrawPrize, LuckyDrawPrizeConfig } from '../types/gamification';

const LUCKY_DRAW_PRIZES: LuckyDrawPrizeConfig[] = [
  { id: 'xp_100', type: LuckyDrawPrize.XP_100, label: '100 XP', probability: 0.30, icon: '⭐', color: '#3B82F6' },
  { id: 'xp_250', type: LuckyDrawPrize.XP_250, label: '250 XP', probability: 0.25, icon: '✨', color: '#8B5CF6' },
  { id: 'xp_500', type: LuckyDrawPrize.XP_500, label: '500 XP', probability: 0.15, icon: '💎', color: '#EC4899' },
  { id: 'xp_1000', type: LuckyDrawPrize.XP_1000, label: '1000 XP', probability: 0.08, icon: '👑', color: '#F59E0B' },
  { id: 'badge_rare', type: LuckyDrawPrize.BADGE_RARE, label: 'Rare Badge', probability: 0.10, icon: '🎖️', color: '#EC4899' },
  { id: 'badge_epic', type: LuckyDrawPrize.BADGE_EPIC, label: 'Epic Badge', probability: 0.07, icon: '🏆', color: '#EF4444' },
  { id: 'nft_discount', type: LuckyDrawPrize.NFT_DISCOUNT, label: '10% Discount', probability: 0.04, icon: '🎁', color: '#10B981' },
  { id: 'feature_boost', type: LuckyDrawPrize.FEATURE_BOOST, label: 'Feature Boost', probability: 0.01, icon: '🚀', color: '#06B6D4' }
];

const dailyRewards = new Map<string, DailyReward[]>();
const luckyDraws = new Map<string, LuckyDrawEntry[]>();

export const rewardsService = {
  async getDailyReward(userId: string): Promise<DailyReward> {
    const userRewards = dailyRewards.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let todayReward = userRewards.find(r => {
      const rewardDate = new Date(r.date);
      return rewardDate.getTime() === today.getTime();
    });

    if (!todayReward) {
      let streak = 0;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayReward = userRewards.find(r => {
        const rewardDate = new Date(r.date);
        return rewardDate.getTime() === yesterday.getTime();
      });

      if (yesterdayReward?.claimed) {
        streak = yesterdayReward.streak + 1;
      }

      const xpAmount = 50 + (streak * 10);
      todayReward = {
        id: `reward_${userId}_${today.toISOString().split('T')[0]}`,
        userId,
        date: today,
        xpAmount,
        claimed: false,
        streak
      };

      userRewards.push(todayReward);
      dailyRewards.set(userId, userRewards);
    }

    return todayReward;
  },

  async claimDailyReward(userId: string): Promise<DailyReward | null> {
    const reward = await this.getDailyReward(userId);
    if (reward.claimed) return null;

    reward.claimed = true;
    reward.claimedAt = new Date();

    const userRewards = dailyRewards.get(userId) || [];
    const index = userRewards.findIndex(r => r.id === reward.id);
    if (index !== -1) {
      userRewards[index] = reward;
      dailyRewards.set(userId, userRewards);
    }

    return reward;
  },

  drawPrize(): LuckyDrawPrizeConfig {
    const rand = Math.random();
    let cumulative = 0;

    for (const prize of LUCKY_DRAW_PRIZES) {
      cumulative += prize.probability;
      if (rand <= cumulative) {
        return prize;
      }
    }

    return LUCKY_DRAW_PRIZES[0];
  },

  async createLuckyDrawEntry(userId: string): Promise<LuckyDrawEntry> {
    const userDraws = luckyDraws.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayEntry = userDraws.find(d => {
      if (!d.drawnAt) return false;
      const drawnDate = new Date(d.drawnAt);
      return drawnDate.getTime() === today.getTime();
    });

    if (todayEntry && todayEntry.drawnAt) {
      return todayEntry;
    }

    const prizeConfig = this.drawPrize();
    const entry: LuckyDrawEntry = {
      id: `draw_${userId}_${Date.now()}`,
      userId,
      drawnAt: new Date(),
      prizeType: prizeConfig.type,
      prizeValue: this.getPrizeValue(prizeConfig.type),
      claimed: false,
      eligibleAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    userDraws.push(entry);
    luckyDraws.set(userId, userDraws);
    return entry;
  },

  async claimLuckyDrawPrize(userId: string, drawId: string): Promise<LuckyDrawEntry | null> {
    const userDraws = luckyDraws.get(userId) || [];
    const entry = userDraws.find(d => d.id === drawId);

    if (!entry || entry.claimed) return null;

    entry.claimed = true;
    entry.claimedAt = new Date();

    const index = userDraws.findIndex(d => d.id === drawId);
    if (index !== -1) {
      userDraws[index] = entry;
      luckyDraws.set(userId, userDraws);
    }

    return entry;
  },

  async canUserDraw(userId: string): Promise<boolean> {
    const userDraws = luckyDraws.get(userId) || [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayEntry = userDraws.find(d => {
      if (!d.drawnAt) return false;
      const drawnDate = new Date(d.drawnAt);
      return drawnDate.getTime() === today.getTime();
    });

    return !todayEntry;
  },

  getPrizeValue(prizeType: LuckyDrawPrize): number {
    switch (prizeType) {
      case LuckyDrawPrize.XP_100: return 100;
      case LuckyDrawPrize.XP_250: return 250;
      case LuckyDrawPrize.XP_500: return 500;
      case LuckyDrawPrize.XP_1000: return 1000;
      case LuckyDrawPrize.NFT_DISCOUNT: return 10;
      default: return 0;
    }
  }
};
