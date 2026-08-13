import { navigate } from '../lib/router'
import type { Route } from '../types'

type BottomNavProps = {
  route: Route
}

export function BottomNav({ route }: BottomNavProps) {
  const current =
    route.name === 'saved' ? 'saved' : route.name === 'review' ? 'review' : 'home'

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      <button
        type="button"
        className={current === 'home' ? 'nav-item active' : 'nav-item'}
        onClick={() => navigate({ name: 'home' })}
      >
        <span className="nav-icon" aria-hidden="true">
          ⌂
        </span>
        Chủ đề
      </button>
      <button
        type="button"
        className={current === 'review' ? 'nav-item active' : 'nav-item'}
        onClick={() => navigate({ name: 'review' })}
      >
        <span className="nav-icon" aria-hidden="true">
          ✎
        </span>
        Ôn tập
      </button>
      <button
        type="button"
        className={current === 'saved' ? 'nav-item active' : 'nav-item'}
        onClick={() => navigate({ name: 'saved' })}
      >
        <span className="nav-icon" aria-hidden="true">
          ★
        </span>
        Đã lưu
      </button>
    </nav>
  )
}
