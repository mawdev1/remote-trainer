/**
 * Achievement Definitions
 * All unlockable achievements in the game
 */

import { Achievement } from '@/types/progression'

/**
 * All achievements in the game
 */
export const ACHIEVEMENTS: Achievement[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GETTING STARTED
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'first_rep',
    name: 'First Rep',
    description: 'Log your first exercise',
    icon: '🎯',
    category: 'getting_started',
    condition: { type: 'first_exercise' },
    xpReward: 10,
  },
  {
    id: 'first_unlock',
    name: 'New Challenger',
    description: 'Unlock your first new exercise',
    icon: '🔓',
    category: 'getting_started',
    condition: { type: 'exercises_unlocked', value: 2 },
    xpReward: 25,
  },
  {
    id: 'five_unlocked',
    name: 'Building Arsenal',
    description: 'Unlock 5 exercises',
    icon: '🏗️',
    category: 'getting_started',
    condition: { type: 'exercises_unlocked', value: 5 },
    xpReward: 50,
  },
  {
    id: 'ten_unlocked',
    name: 'Well Equipped',
    description: 'Unlock 10 exercises',
    icon: '🎒',
    category: 'getting_started',
    condition: { type: 'exercises_unlocked', value: 10 },
    xpReward: 100,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEVELING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'level_2',
    name: 'Warming Up',
    description: 'Reach Level 2 in any exercise',
    icon: '📈',
    category: 'leveling',
    condition: { type: 'exercise_level', value: 2 },
    xpReward: 15,
  },
  {
    id: 'level_3',
    name: 'Getting Stronger',
    description: 'Reach Level 3 in any exercise',
    icon: '💪',
    category: 'leveling',
    condition: { type: 'exercise_level', value: 3 },
    xpReward: 25,
  },
  {
    id: 'level_5',
    name: 'Halfway Hero',
    description: 'Reach Level 5 in any exercise',
    icon: '⭐',
    category: 'leveling',
    condition: { type: 'exercise_level', value: 5 },
    xpReward: 50,
  },
  {
    id: 'level_7',
    name: 'Expert Form',
    description: 'Reach Level 7 in any exercise',
    icon: '🔥',
    category: 'leveling',
    condition: { type: 'exercise_level', value: 7 },
    xpReward: 75,
  },
  {
    id: 'level_10',
    name: 'Mastery Achieved',
    description: 'Reach Level 10 (Master) in any exercise',
    icon: '👑',
    category: 'mastery',
    condition: { type: 'max_level' },
    xpReward: 200,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEDICATION (Total XP) - Scaled for difficulty
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'xp_500',
    name: 'Getting Started',
    description: 'Earn 500 total XP',
    icon: '🌱',
    category: 'dedication',
    condition: { type: 'total_xp', value: 500 },
    xpReward: 25,
  },
  {
    id: 'xp_1000',
    name: 'Centurion',
    description: 'Earn 1,000 total XP',
    icon: '💯',
    category: 'dedication',
    condition: { type: 'total_xp', value: 1000 },
    xpReward: 50,
  },
  {
    id: 'xp_2500',
    name: 'Dedicated',
    description: 'Earn 2,500 total XP',
    icon: '🏆',
    category: 'dedication',
    condition: { type: 'total_xp', value: 2500 },
    xpReward: 100,
  },
  {
    id: 'xp_5000',
    name: 'Committed',
    description: 'Earn 5,000 total XP',
    icon: '🎖️',
    category: 'dedication',
    condition: { type: 'total_xp', value: 5000 },
    xpReward: 150,
  },
  {
    id: 'xp_10000',
    name: 'Iron Will',
    description: 'Earn 10,000 total XP',
    icon: '⚔️',
    category: 'dedication',
    condition: { type: 'total_xp', value: 10000 },
    xpReward: 250,
  },
  {
    id: 'xp_25000',
    name: 'Legendary',
    description: 'Earn 25,000 total XP',
    icon: '🌟',
    category: 'dedication',
    condition: { type: 'total_xp', value: 25000 },
    xpReward: 500,
  },
  {
    id: 'xp_50000',
    name: 'Transcendent',
    description: 'Earn 50,000 total XP',
    icon: '✨',
    category: 'dedication',
    condition: { type: 'total_xp', value: 50000 },
    xpReward: 1000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIETY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'variety_3',
    name: 'Mix It Up',
    description: 'Do 3 different exercises in one day',
    icon: '🎨',
    category: 'variety',
    condition: { type: 'exercises_in_day', value: 3 },
    xpReward: 25,
  },
  {
    id: 'variety_5',
    name: 'Full Rotation',
    description: 'Do 5 different exercises in one day',
    icon: '🔄',
    category: 'variety',
    condition: { type: 'exercises_in_day', value: 5 },
    xpReward: 50,
  },
  {
    id: 'variety_8',
    name: 'Completionist',
    description: 'Do 8 different exercises in one day',
    icon: '🌈',
    category: 'variety',
    condition: { type: 'exercises_in_day', value: 8 },
    xpReward: 100,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY INTENSITY - Scaled for difficulty
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'daily_100',
    name: 'Active Day',
    description: 'Earn 100 XP in a single day',
    icon: '📅',
    category: 'dedication',
    condition: { type: 'daily_xp', value: 100 },
    xpReward: 25,
  },
  {
    id: 'daily_250',
    name: 'Power Day',
    description: 'Earn 250 XP in a single day',
    icon: '⚡',
    category: 'dedication',
    condition: { type: 'daily_xp', value: 250 },
    xpReward: 50,
  },
  {
    id: 'daily_500',
    name: 'Beast Mode',
    description: 'Earn 500 XP in a single day',
    icon: '🦁',
    category: 'dedication',
    condition: { type: 'daily_xp', value: 500 },
    xpReward: 100,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MASTERY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'all_unlocked',
    name: 'Collector',
    description: 'Unlock all exercises',
    icon: '🏛️',
    category: 'mastery',
    condition: { type: 'all_unlocked' },
    xpReward: 300,
  },
  {
    id: 'triple_master',
    name: 'Triple Threat',
    description: 'Reach Level 10 in 3 exercises',
    icon: '🥇',
    category: 'mastery',
    condition: { type: 'multi_max_level', value: 3 },
    xpReward: 500,
  },
  {
    id: 'five_master',
    name: 'Quintuple Master',
    description: 'Reach Level 10 in 5 exercises',
    icon: '💎',
    category: 'mastery',
    condition: { type: 'multi_max_level', value: 5 },
    xpReward: 1000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIFIC EXERCISE MASTERY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pushup_master',
    name: 'Push-up Pro',
    description: 'Reach Level 10 in Push-ups',
    icon: '💪',
    category: 'mastery',
    condition: { type: 'specific_level', exerciseId: 'pushups', value: 10 },
    xpReward: 150,
  },
  {
    id: 'plank_master',
    name: 'Plank Perfectionist',
    description: 'Reach Level 10 in Plank',
    icon: '🧘',
    category: 'mastery',
    condition: { type: 'specific_level', exerciseId: 'plank', value: 10 },
    xpReward: 150,
  },
  {
    id: 'squat_master',
    name: 'Squat Sovereign',
    description: 'Reach Level 10 in Squats',
    icon: '🦵',
    category: 'mastery',
    condition: { type: 'specific_level', exerciseId: 'squats', value: 10 },
    xpReward: 150,
  },
]

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

/**
 * Get all achievement IDs
 */
export function getAllAchievementIds(): string[] {
  return ACHIEVEMENTS.map(a => a.id)
}

/**
 * Category display names and icons
 */
export const ACHIEVEMENT_CATEGORIES = {
  getting_started: { name: 'Getting Started', icon: '🚀' },
  leveling: { name: 'Leveling Up', icon: '📈' },
  dedication: { name: 'Dedication', icon: '💪' },
  variety: { name: 'Variety', icon: '🎨' },
  mastery: { name: 'Mastery', icon: '👑' },
} as const

