/**
 * UnlockCelebration Component
 * Shows celebration toast when unlocking exercises or achievements
 */

import React from 'react'
import { useProgressionStore } from '@/stores'

export const UnlockCelebration: React.FC = () => {
  const { unlockQueue, dismissUnlock } = useProgressionStore()

  // Get the first unlock in queue
  const currentUnlock = unlockQueue[0]

  if (!currentUnlock) return null

  const isAchievement = currentUnlock.type === 'achievement'
  const isLevelUp = currentUnlock.id.startsWith('levelup_')

  return (
    <>
      <div className="unlock-toast-backdrop" onClick={dismissUnlock} />
      <div className="unlock-toast">
        <div className="unlock-toast-icon">
          {currentUnlock.icon}
        </div>
        <h3 className="unlock-toast-title">
          {isLevelUp ? '⬆️ Level Up!' : isAchievement ? '🏆 Achievement!' : '🔓 Unlocked!'}
        </h3>
        <p className="unlock-toast-subtitle">
          {currentUnlock.name}
        </p>
        {currentUnlock.xpReward && (
          <p className="unlock-toast-xp">
            +{currentUnlock.xpReward} XP Bonus!
          </p>
        )}
        <button className="unlock-toast-btn" onClick={dismissUnlock}>
          {unlockQueue.length > 1 ? `Awesome! (${unlockQueue.length - 1} more)` : 'Awesome!'}
        </button>
      </div>
    </>
  )
}

