import { Home, Plus, Heart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onPublish?: () => void;
}

const tabs = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'publish', label: '发布', icon: Plus, isCenter: true },
  { id: 'favorites', label: '收藏', icon: Heart },
  { id: 'profile', label: '我的', icon: User },
];

export default function BottomNav({ activeTab = 'home', onTabChange, onPublish }: BottomNavProps) {
  const handleTabClick = (tabId: string) => {
    if (tabId === 'publish') {
      onPublish?.();
      return;
    }
    onTabChange?.(tabId);
  };

  return (
    <nav className="nav-glass">
      <div
        className="flex items-end justify-around"
        style={{ paddingTop: 8, paddingBottom: 'calc(8px + var(--safe-area-bottom))' }}
      >
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="nav-publish-btn"
                aria-label="发布"
              >
                <Plus size={26} strokeWidth={2.5} />
              </button>
            );
          }

          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              aria-label={tab.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
