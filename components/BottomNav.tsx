import { Home, Plus, Heart, User } from 'lucide-react';

interface BottomNavProps {
  activeTab?: string;
}

const navItems = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'publish', label: '发布', icon: Plus, isCenter: true, href: '/publish' },
  { id: 'favorites', label: '收藏', icon: Heart, href: '/my/favorites' },
  { id: 'profile', label: '我的', icon: User, href: '/my' },
];

export default function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div className="flex items-end justify-around max-w-[480px] mx-auto" style={{ paddingTop: 8, paddingBottom: 8 }}>
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  marginTop: -20,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5E6D0 0%, #E0C9A8 100%)',
                  boxShadow: '0 4px 16px rgba(245,230,208,0.5)',
                  color: '#5D4E37',
                }}
              >
                <Plus size={26} strokeWidth={2.5} />
              </a>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <a
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center py-1"
              style={{
                color: isActive ? '#8B6914' : '#999',
                textDecoration: 'none',
                minWidth: 60,
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span style={{ fontSize: 10, marginTop: 2, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              {isActive && (
                <div style={{
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  background: '#8B6914',
                  marginTop: 2,
                }} />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
