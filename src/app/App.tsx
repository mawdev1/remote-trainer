import React, { useEffect, useState, useCallback } from 'react'

import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'
import { exerciseStorage, ExerciseType, ExerciseStats } from '@/lib/storage'

type ViewMode = 'dashboard' | 'history'

interface DailyTotal {
  date: string
  pushups: number
  arm_curls: number
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TrainerApp />
    </ThemeProvider>
  )
}

const TrainerApp: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard')
  const [todayStats, setTodayStats] = useState<Record<ExerciseType, ExerciseStats>>({
    pushups: { totalReps: 0, setCount: 0 },
    arm_curls: { totalReps: 0, setCount: 0 },
  })
  const [weekStats, setWeekStats] = useState<Record<ExerciseType, ExerciseStats>>({
    pushups: { totalReps: 0, setCount: 0 },
    arm_curls: { totalReps: 0, setCount: 0 },
  })
  const [history, setHistory] = useState<DailyTotal[]>([])
  const [animatingCard, setAnimatingCard] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    const today = await exerciseStorage.getTodayStats()
    const week = await exerciseStorage.getWeekStats()
    const dailyHistory = await exerciseStorage.getDailyTotals(7)
    setTodayStats(today)
    setWeekStats(week)
    setHistory(dailyHistory)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleLogExercise = async (type: ExerciseType, reps: number) => {
    if (reps <= 0) return
    await exerciseStorage.logExercise(type, reps)
    setAnimatingCard(type)
    setTimeout(() => setAnimatingCard(null), 200)
    await loadStats()
  }

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all workout history? This cannot be undone.')) {
      await exerciseStorage.clearHistory()
      await loadStats()
    }
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="trainer-container">
      <Header dateString={dateString} />

      <ViewToggle view={view} setView={setView} />

      {view === 'dashboard' ? (
        <DashboardView
          todayStats={todayStats}
          weekStats={weekStats}
          onLogExercise={handleLogExercise}
          animatingCard={animatingCard}
        />
      ) : (
        <HistoryView history={history} onClearHistory={handleClearHistory} />
      )}

      <Footer />
    </div>
  )
}

interface HeaderProps {
  dateString: string
}

const Header: React.FC<HeaderProps> = ({ dateString }) => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      // system - toggle to opposite of current
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'light' : 'dark')
    }
  }

  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">Remote Trainer</h1>
        <p className="date-display">{dateString}</p>
      </div>
      <button className="settings-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )}
      </button>
    </header>
  )
}

interface ViewToggleProps {
  view: ViewMode
  setView: (v: ViewMode) => void
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => (
  <div className="view-toggle">
    <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
      Dashboard
    </button>
    <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
      History
    </button>
  </div>
)

interface DashboardViewProps {
  todayStats: Record<ExerciseType, ExerciseStats>
  weekStats: Record<ExerciseType, ExerciseStats>
  onLogExercise: (type: ExerciseType, reps: number) => void
  animatingCard: string | null
}

const DashboardView: React.FC<DashboardViewProps> = ({
  todayStats,
  weekStats,
  onLogExercise,
  animatingCard,
}) => {
  const totalToday = todayStats.pushups.totalReps + todayStats.arm_curls.totalReps
  const totalWeek = weekStats.pushups.totalReps + weekStats.arm_curls.totalReps
  const setsToday = todayStats.pushups.setCount + todayStats.arm_curls.setCount
  const setsWeek = weekStats.pushups.setCount + weekStats.arm_curls.setCount

  return (
    <>
      <div className="stats-summary">
        <div className="summary-card">
          <h4>Today</h4>
          <div className="summary-value">{totalToday}</div>
          <div className="summary-detail">{setsToday} sets completed</div>
        </div>
        <div className="summary-card">
          <h4>This Week</h4>
          <div className="summary-value">{totalWeek}</div>
          <div className="summary-detail">{setsWeek} sets completed</div>
        </div>
      </div>

      <ExerciseCard
        type="pushups"
        title="Push-ups"
        subtitle="Upper body strength"
        icon="💪"
        todayReps={todayStats.pushups.totalReps}
        todaySets={todayStats.pushups.setCount}
        weekReps={weekStats.pushups.totalReps}
        onLog={(reps) => onLogExercise('pushups', reps)}
        isAnimating={animatingCard === 'pushups'}
        quickOptions={[15, 20, 25, 30, 35]}
      />

      <ExerciseCard
        type="arm_curls"
        title="Arm Curls"
        subtitle="Bicep training with dumbbells"
        icon="🏋️"
        todayReps={todayStats.arm_curls.totalReps}
        todaySets={todayStats.arm_curls.setCount}
        weekReps={weekStats.arm_curls.totalReps}
        onLog={(reps) => onLogExercise('arm_curls', reps)}
        isAnimating={animatingCard === 'arm_curls'}
        quickOptions={[6, 8, 10, 12, 21]}
      />
    </>
  )
}

interface ExerciseCardProps {
  type: 'pushups' | 'arm_curls'
  title: string
  subtitle: string
  icon: string
  todayReps: number
  todaySets: number
  weekReps: number
  onLog: (reps: number) => void
  isAnimating: boolean
  quickOptions?: number[]
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  type,
  title,
  subtitle,
  icon,
  todayReps,
  todaySets,
  weekReps,
  onLog,
  isAnimating,
  quickOptions = [5, 10, 15],
}) => {
  const [customReps, setCustomReps] = useState('')

  const handleCustomSubmit = () => {
    const reps = parseInt(customReps, 10)
    if (reps > 0) {
      onLog(reps)
      setCustomReps('')
    }
  }

  const iconClass = type === 'pushups' ? 'pushups' : 'curls'

  return (
    <div className={`exercise-card ${isAnimating ? 'pop-animation' : ''}`}>
      <div className="exercise-header">
        <div className={`exercise-icon ${iconClass}`}>{icon}</div>
        <div>
          <h3 className="exercise-title">{title}</h3>
          <p className="exercise-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="exercise-stats">
        <div className="stat-item">
          <span className="stat-value">{todayReps}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{todaySets}</span>
          <span className="stat-label">Sets</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{weekReps}</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      <div className="exercise-actions">
        <div className="quick-btns-row">
          {quickOptions.map((value) => (
            <button key={value} className="quick-btn" onClick={() => onLog(value)}>
              +{value}
            </button>
          ))}
        </div>
        <div className="custom-rep-input">
          <input
            type="number"
            placeholder="Custom"
            value={customReps}
            onChange={(e) => setCustomReps(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
            min="1"
            max="999"
          />
          <button className="quick-btn primary" onClick={handleCustomSubmit} disabled={!customReps}>
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

interface HistoryViewProps {
  history: DailyTotal[]
  onClearHistory: () => void
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory }) => {
  const maxReps = Math.max(
    ...history.map((d) => Math.max(d.pushups, d.arm_curls)),
    1
  )

  const hasData = history.some((d) => d.pushups > 0 || d.arm_curls > 0)

  if (!hasData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-text">No workout history yet.</p>
        <p className="empty-state-text">Start logging exercises to see your progress!</p>
      </div>
    )
  }

  return (
    <>
      <div className="history-list">
        {history.map((day, idx) => (
          <div key={idx} className="history-item">
            <div className="history-date">{day.date}</div>
            <div className="history-bars">
              <div
                className="history-bar pushups"
                style={{ width: `${(day.pushups / maxReps) * 100}%`, minWidth: day.pushups > 0 ? '4px' : '0' }}
              />
              <div
                className="history-bar curls"
                style={{ width: `${(day.arm_curls / maxReps) * 100}%`, minWidth: day.arm_curls > 0 ? '4px' : '0' }}
              />
            </div>
            <div className="history-values">
              <span className="history-value pushups">{day.pushups}</span>
              <span className="history-value curls">{day.arm_curls}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Push-ups</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(90deg, #4ecdc4 0%, #44a08d 100%)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Arm Curls</span>
          </div>
        </div>
        <button
          className="quick-btn"
          onClick={onClearHistory}
          style={{ width: '100%', color: '#ef4444', borderColor: '#ef4444' }}
        >
          Clear All History
        </button>
      </div>
    </>
  )
}

const Footer: React.FC = () => (
  <footer className="app-footer">
    <span className="footer-text">🔒 All data stored locally in your browser</span>
  </footer>
)

// Icons
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export default App
