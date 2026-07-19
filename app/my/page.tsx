'use client';

import {
  ChevronRight,
  Package,
  Heart,
  MessageCircle,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  BookOpen,
  ShoppingBag,
  Clock,
  MapPin,
} from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  badge?: string;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: '我的交易',
    items: [
      { icon: <Package size={20} />, label: '我发布的', href: '/my/published', badge: '3' },
      { icon: <ShoppingBag size={20} />, label: '我买入的', href: '/my/bought' },
      { icon: <Clock size={20} />, label: '浏览记录', href: '/my/history' },
    ],
  },
  {
    title: '我的互动',
    items: [
      { icon: <Heart size={20} />, label: '我的收藏', href: '/favorites' },
      { icon: <MessageCircle size={20} />, label: '我的消息', href: '/messages', badge: '5' },
      { icon: <Star size={20} />, label: '评价记录', href: '/my/reviews' },
    ],
  },
  {
    title: '设置',
    items: [
      { icon: <MapPin size={20} />, label: '收货地址', href: '/my/address' },
      { icon: <Settings size={20} />, label: '设置', href: '/my/settings' },
      { icon: <HelpCircle size={20} />, label: '帮助与反馈', href: '/my/help' },
    ],
  },
];

export default function MyPage() {
  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      window.location.href = '/';
    } else if (tab === 'favorites') {
      window.location.href = '/favorites';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #5B8C5A, #40916C, #2D6A4F)',
          paddingTop: 'calc(12px + var(--safe-area-top))',
          paddingBottom: 32,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-white">我的</h1>
          <button
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="设置"
          >
            <Settings size={18} color="#FFFFFF" />
          </button>
        </div>

        {/* User Info Card */}
        <div
          className="card-glass"
          style={{
            padding: 16,
            borderRadius: 'var(--radius-card)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            }}
          >
            <BookOpen size={24} color="#FFFFFF" strokeWidth={1.5} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-white mb-0.5">
              校书仓用户
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              点击登录账号
            </p>
          </div>

          <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
        </div>

        {/* Stats Row */}
        <div
          className="flex justify-around mt-4"
          style={{ padding: '0 20px' }}
        >
          {[
            { label: '发布', value: '3' },
            { label: '已售', value: '1' },
            { label: '收藏', value: '12' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Menu Sections */}
      <div className="px-4 -mt-4 space-y-3">
        {menuSections.map((section) => (
          <div key={section.title} className="card-glass" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            <div
              className="px-4 py-2"
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <span className="text-xs font-medium" style={{ color: '#999999' }}>
                {section.title}
              </span>
            </div>
            {section.items.map((item) => (
              <a
                key={item.label}
                href={item.href || '#'}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, rgba(91,140,90,0.12), rgba(91,140,90,0.06))',
                    color: '#5B8C5A',
                  }}
                >
                  {item.icon}
                </div>
                <span className="flex-1 text-sm" style={{ color: '#333333' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className="tag"
                    style={{
                      background: '#E8590C',
                      color: '#FFFFFF',
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      marginRight: 4,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} color="#CCCCCC" />
              </a>
            ))}
          </div>
        ))}

        {/* Logout */}
        <div className="card-glass mb-6" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <button
            className="flex items-center justify-center gap-2 w-full py-3"
            style={{
              background: 'none',
              border: 'none',
              color: '#999999',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="profile" onTabChange={handleTabChange} />
    </div>
  );
}
