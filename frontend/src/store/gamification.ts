import { create } from 'zustand';

const ONE_DAY = 24 * 60 * 60 * 1000;
const LUCKY_DRAW_COOLDOWN = 4 * 60 * 60 * 1000;

export type RewardType = 'xp' | 'daily' | 'lucky' | 'badge' | 'level';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Reward {
  id: string;
  type: RewardType;
  label: string;
  amount?: number;
  badgeId?: string;
  rarity?: BadgeRarity;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string;
  earnedAt?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  icon: string;
  xpReward: number;
  badgeReward?: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  streak: number;
  lastDailyClaim: number | null;
  luckyDrawCooldownEnds: number | null;
  achievements: Achievement[];
  badges: Badge[];
  rewardHistory: Reward[];
  addXP: (amount: number, source?: string) => Reward;
  claimDailyReward: () => Reward | null;
  performLuckyDraw: () => Reward | null;
  updateAchievementProgress: (id: string, delta?: number) => Reward | null;
  reset: () => void;
}

const badgeCatalog: Badge[] = [
  { id: 'early-adopter', name: 'Early Adopter', description: 'Joined the marketplace early', rarity: 'common', icon: '🚀' },
  { id: 'streaker', name: 'Streak Master', description: 'Hit a 7-day streak', rarity: 'rare', icon: '🔥' },
  { id: 'collector', name: 'Collector', description: 'Unlocked five achievements', rarity: 'epic', icon: '💎' },
  { id: 'lucky-star', name: 'Lucky Star', description: 'Won a lucky draw', rarity: 'epic', icon: '⭐' },
  { id: 'legend', name: 'Marketplace Legend', description: 'Reached level 10', rarity: 'legendary', icon: '🏆' }
];

const baseAchievements: Achievement[] = [
  {
    id: 'first-trade',
    title: 'First Trade',
    description: 'Complete your first marketplace trade',
    target: 1,
    progress: 0,
    icon: '🎯',
    xpReward: 120,
    badgeReward: 'early-adopter',
    unlocked: false
  },
  {
    id: 'collector',
    title: 'Collection Builder',
    description: 'List or collect 5 NFTs',
    target: 5,
    progress: 0,
    icon: '🖼️',
    xpReward: 180,
    badgeReward: 'collector',
    unlocked: false
  },
  {
    id: 'streak',
    title: 'Streak Keeper',
    description: 'Maintain a 7-day daily reward streak',
    target: 7,
    progress: 0,
    icon: '🔥',
    xpReward: 200,
    badgeReward: 'streaker',
    unlocked: false
  },
  {
    id: 'lucky',
    title: 'Luck Is Real',
    description: 'Win a lucky draw reward',
    target: 1,
    progress: 0,
    icon: '⭐',
    xpReward: 150,
    badgeReward: 'lucky-star',
    unlocked: false
  },
  {
    id: 'legend',
    title: 'Marketplace Legend',
    description: 'Reach level 10',
    target: 10,
    progress: 1,
    icon: '🏆',
    xpReward: 300,
    badgeReward: 'legend',
    unlocked: false
  }
];

const levelFromXP = (xp: number) => {
  let level = 1;
  let remaining = xp;
  let xpForNext = 500;

  while (remaining >= xpForNext) {
    remaining -= xpForNext;
    level += 1;
    xpForNext = 500 + (level - 1) * 150;
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNext
  };
};

const randomId = () => Math.random().toString(36).slice(2, 10);

const buildDefaultState = (): Omit<GamificationState, 'addXP' | 'claimDailyReward' | 'performLuckyDraw' | 'updateAchievementProgress' | 'reset'> => {
  const level = levelFromXP(0);
  return {
    xp: 0,
    ...level,
    streak: 0,
    lastDailyClaim: null,
    luckyDrawCooldownEnds: null,
    achievements: baseAchievements.map((a) => ({ ...a })),
    badges: [{ ...badgeCatalog[0], earnedAt: Date.now() }],
    rewardHistory: []
  };
};

const persistState = (state: GamificationState) => {
  if (typeof window === 'undefined') return;
  const toSave = {
    xp: state.xp,
    level: state.level,
    xpIntoLevel: state.xpIntoLevel,
    xpForNext: state.xpForNext,
    streak: state.streak,
    lastDailyClaim: state.lastDailyClaim,
    luckyDrawCooldownEnds: state.luckyDrawCooldownEnds,
    achievements: state.achievements,
    badges: state.badges,
    rewardHistory: state.rewardHistory.slice(-30)
  };
  try {
    localStorage.setItem('gamification', JSON.stringify(toSave));
  } catch {
    // ignore write errors
  }
};

const loadState = () => {
  if (typeof window === 'undefined') return buildDefaultState();
  try {
    const raw = localStorage.getItem('gamification');
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw);
    return {
      ...buildDefaultState(),
      ...parsed,
      achievements: parsed.achievements ?? buildDefaultState().achievements,
      badges: parsed.badges ?? buildDefaultState().badges,
      rewardHistory: parsed.rewardHistory ?? []
    };
  } catch {
    return buildDefaultState();
  }
};

const applyAchievementProgress = (state: GamificationState, id: string, delta: number) => {
  let reward: Reward | null = null;
  let newBadges = state.badges;

  const updatedAchievements = state.achievements.map((ach) => {
    if (ach.id !== id) return ach;
    const nextProgress = Math.min(ach.target, ach.progress + delta);
    let unlocked = ach.unlocked;
    let unlockedAt = ach.unlockedAt;

    if (!unlocked && nextProgress >= ach.target) {
      unlocked = true;
      unlockedAt = Date.now();
      reward = {
        id: randomId(),
        type: 'badge',
        label: `${ach.title} unlocked`,
        amount: ach.xpReward,
        badgeId: ach.badgeReward,
        timestamp: unlockedAt
      };

      if (ach.badgeReward) {
        const badgeMeta = badgeCatalog.find((b) => b.id === ach.badgeReward);
        if (badgeMeta && !state.badges.some((b) => b.id === badgeMeta.id)) {
          newBadges = [...state.badges, { ...badgeMeta, earnedAt: unlockedAt }];
        }
      }
    }

    return { ...ach, progress: nextProgress, unlocked, unlockedAt };
  });

  const xpGain = reward?.amount ?? 0;
  const xpTotal = state.xp + xpGain;
  const levelInfo = levelFromXP(xpTotal);
  const rewardHistory = reward ? [...state.rewardHistory, reward] : state.rewardHistory;

  return {
    updatedAchievements,
    newBadges,
    xpTotal,
    levelInfo,
    reward,
    rewardHistory
  };
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  ...loadState(),

  addXP: (amount: number, source = 'activity') => {
    const now = Date.now();
    let levelUpReward: Reward | null = null;

    set((state) => {
      const totalXP = state.xp + amount;
      const levelInfo = levelFromXP(totalXP);
      if (levelInfo.level > state.level) {
        levelUpReward = {
          id: randomId(),
          type: 'level',
          label: `Level up to ${levelInfo.level}`,
          timestamp: now
        };
      }

      const baseReward: Reward = {
        id: randomId(),
        type: 'xp',
        label: `+${amount} XP (${source})`,
        amount,
        timestamp: now
      };

      const rewardHistory = [...state.rewardHistory, baseReward];
      if (levelUpReward) rewardHistory.push(levelUpReward);

      const nextState: GamificationState = {
        ...state,
        xp: totalXP,
        ...levelInfo,
        rewardHistory
      };

      persistState(nextState);
      return nextState;
    });

    return {
      id: randomId(),
      type: 'xp',
      label: `+${amount} XP (${source})`,
      amount,
      timestamp: now
    };
  },

  claimDailyReward: () => {
    const now = Date.now();
    const state = get();
    if (state.lastDailyClaim && now - state.lastDailyClaim < ONE_DAY) {
      return null;
    }

    const continuesStreak = state.lastDailyClaim && now - state.lastDailyClaim < ONE_DAY * 2;
    const nextStreak = continuesStreak ? state.streak + 1 : 1;
    const xpAmount = 80 + nextStreak * 10;
    const reward: Reward = {
      id: randomId(),
      type: 'daily',
      label: `Daily reward +${xpAmount} XP`,
      amount: xpAmount,
      timestamp: now
    };

    set((prev) => {
      const totalXP = prev.xp + xpAmount;
      const levelInfo = levelFromXP(totalXP);
      const rewardHistory = [...prev.rewardHistory, reward];
      const nextState: GamificationState = {
        ...prev,
        xp: totalXP,
        ...levelInfo,
        streak: nextStreak,
        lastDailyClaim: now,
        rewardHistory
      };

      persistState(nextState);
      return nextState;
    });

    get().updateAchievementProgress('streak', 1);
    return reward;
  },

  performLuckyDraw: () => {
    const now = Date.now();
    const state = get();
    if (state.luckyDrawCooldownEnds && now < state.luckyDrawCooldownEnds) {
      return null;
    }

    const pool: Reward[] = [
      { id: randomId(), type: 'lucky', label: '80 XP', amount: 80, rarity: 'common', timestamp: now },
      { id: randomId(), type: 'lucky', label: '150 XP', amount: 150, rarity: 'rare', timestamp: now },
      { id: randomId(), type: 'lucky', label: '300 XP', amount: 300, rarity: 'epic', timestamp: now },
      { id: randomId(), type: 'lucky', label: 'Lucky Star badge', badgeId: 'lucky-star', rarity: 'epic', timestamp: now }
    ];

    const prize = pool[Math.floor(Math.random() * pool.length)];

    set((prev) => {
      let xpAdded = prize.amount ?? 0;
      let newBadges = prev.badges;

      if (prize.badgeId) {
        const badgeMeta = badgeCatalog.find((b) => b.id === prize.badgeId);
        if (badgeMeta && !prev.badges.some((b) => b.id === badgeMeta.id)) {
          newBadges = [...prev.badges, { ...badgeMeta, earnedAt: now }];
        }
      }

      const totalXP = prev.xp + xpAdded;
      const levelInfo = levelFromXP(totalXP);
      const rewardHistory = [...prev.rewardHistory, { ...prize, timestamp: now }];

      const nextState: GamificationState = {
        ...prev,
        xp: totalXP,
        ...levelInfo,
        badges: newBadges,
        luckyDrawCooldownEnds: now + LUCKY_DRAW_COOLDOWN,
        rewardHistory
      };

      persistState(nextState);
      return nextState;
    });

    get().updateAchievementProgress('lucky', 1);
    return { ...prize, timestamp: now };
  },

  updateAchievementProgress: (id: string, delta: number = 1) => {
    let unlockedReward: Reward | null = null;

    set((state) => {
      const { updatedAchievements, newBadges, xpTotal, levelInfo, reward, rewardHistory } = applyAchievementProgress(state, id, delta);
      unlockedReward = reward;
      const nextState: GamificationState = {
        ...state,
        xp: xpTotal,
        ...levelInfo,
        achievements: updatedAchievements,
        badges: newBadges,
        rewardHistory
      };

      persistState(nextState);
      return nextState;
    });

    return unlockedReward;
  },

  reset: () => {
    const defaults = buildDefaultState();
    set((state) => {
      const nextState: GamificationState = { ...state, ...defaults };
      persistState(nextState);
      return nextState;
    });
  }
}));
