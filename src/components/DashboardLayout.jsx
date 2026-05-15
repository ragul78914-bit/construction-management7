'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import useStore from '@/store/useStore';
import {
  Menu, X, LogOut, Home, Building2, HardHat,
  Users, KeyRound, PhoneCall, Hammer, FileText, ClipboardList, CheckSquare,
  Search, Bell, Settings, Moon, Sun, Globe, MessageCircle, CalendarCheck,
  FolderOpen, ChevronRight, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Ripple hook
function useRipple() {
  const createRipple = useCallback((e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.cssText = `
      width:${diameter}px;height:${diameter}px;
      left:${e.clientX - rect.left - radius}px;
      top:${e.clientY - rect.top - radius}px;
      position:absolute;border-radius:50%;
      background:rgba(255,255,255,0.35);
      transform:scale(0);animation:rippleAnim 0.55s linear;
      pointer-events:none;
    `;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  }, []);
  return createRipple;
}

export default function DashboardLayout({ children }) {
  const { currentUser, logout, sites, users, messages, initializeData } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const ripple = useRipple();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeData();
  }, [initializeData]);

  // ✅ This hook MUST be before any early returns (Rules of Hooks)
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted) return null;

  const q = searchQuery.toLowerCase();
  const filteredSites = (sites || []).filter(s => s.name?.toLowerCase().includes(q));
  const filteredUsers = (users || []).filter(u => u.name?.toLowerCase().includes(q));

  const toggleTheme = () => { document.body.classList.toggle('dark-theme'); setIsDark(d => !d); };
  const toggleLanguage = () => { const next = language === 'en' ? 'ta' : 'en'; setLanguage(next); i18n.changeLanguage(next); };
  const handleLogout = () => { logout(); router.push('/login'); };

  const role = currentUser?.role;
  const uid = currentUser?.id;

  const unread = (() => {
    if (!uid || !messages) return 0;
    return messages.filter(m => {
      if (m.type === 'direct' && m.toId === uid && !m.readBy?.includes(uid)) return true;
      if (m.type === 'broadcast' && !m.readBy?.includes(uid)) {
        if (role === 'Supervisor' && (m.audience === 'all' || m.audience === 'Supervisor')) return true;
        if (role === 'Worker' && (m.audience === 'all' || m.audience === 'Worker')) return true;
      }
      return false;
    }).length;
  })();

  const recentMessages = (messages || []).filter(m => {
    if (role === 'Admin') return m.type === 'direct' && m.toId === uid;
    if (role === 'Supervisor') return (m.type === 'direct' && m.toId === uid) || (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Supervisor'));
    if (role === 'Worker') return (m.type === 'direct' && m.toId === uid) || (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Worker'));
    return false;
  }).slice(0, 5);

  const NavItem = ({ href, icon: Icon, label }) => {
    const isActive = pathname === href || (href !== `/${role?.toLowerCase()}` && pathname.startsWith(href));
    return (
      <motion.div whileTap={{ scale: 0.97 }} style={{ position: 'relative' }}>
        <Link
          href={href}
          className={`nav-item ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
          style={{ textDecoration: 'none' }}
        >
          <motion.span
            animate={{ color: isActive ? 'var(--primary-color)' : 'var(--sidebar-text)' }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={18} />
          </motion.span>
          <span style={{ flex: 1 }}>{t(label)}</span>
          {isActive && (
            <motion.span
              layoutId={`nav-indicator-${role}`}
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }}
            />
          )}
        </Link>
      </motion.div>
    );
  };

  const msgRoute = role === 'Admin' ? '/admin/messages' : role === 'Supervisor' ? '/supervisor/contact-admin' : '/worker/messages';

  const roleColors = { Admin: '#6366f1', Supervisor: '#10b981', Worker: '#f59e0b' };
  const roleColor = roleColors[role] || '#6366f1';

  return (
    <div className="app-container">
      {/* Ripple keyframe injected once */}
      <style>{`
        @keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }
        .nav-item { position: relative; overflow: hidden; }
      `}</style>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            style={{ color: 'white', flex: 1 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={24} color="#fff" />
            </motion.div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.3px' }}>Construction Management</span>
          </motion.div>
          {sidebarOpen && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{ color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </motion.button>
          )}
        </div>

        {/* User pill */}
        {currentUser && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${roleColor}12`, borderRadius: 12, border: `1px solid ${roleColor}25` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.72rem', color: roleColor, fontWeight: 600 }}>{role}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav" style={{ padding: '8px 0' }}>
          <div className="sidebar-section-title">{t('GENERAL')}</div>
          {role === 'Admin' && (<>
            <NavItem href="/admin" icon={Home} label="Dashboard" />
            <NavItem href="/admin/sites" icon={Building2} label="Sites" />
            <NavItem href="/admin/materials" icon={Hammer} label="Materials" />
            <NavItem href="/admin/document-center" icon={FolderOpen} label="Document Center" />
            <NavItem href="/admin/reports" icon={FileText} label="Reports" />
            <NavItem href="/admin/billing" icon={FileText} label="Billing Documents" />
            <NavItem href="/admin/attendance" icon={CalendarCheck} label="Attendance" />
            <NavItem href="/admin/messages" icon={MessageCircle} label="Messages" />
          </>)}
          {role === 'Supervisor' && (<>
            <NavItem href="/supervisor" icon={Home} label="Dashboard" />
            <NavItem href="/supervisor/site-overview" icon={Building2} label="Assigned Site" />
            <NavItem href="/supervisor/materials" icon={Hammer} label="Materials" />
            <NavItem href="/supervisor/attendance" icon={CalendarCheck} label="Attendance" />
            <NavItem href="/supervisor/billing" icon={FileText} label="Billing Report" />
            <NavItem href="/supervisor/progress" icon={ClipboardList} label="Progress Updates" />
          </>)}
          {role === 'Worker' && (<>
            <NavItem href="/worker" icon={Home} label="Dashboard" />
            <NavItem href="/worker/tasks" icon={CheckSquare} label="Assigned Tasks" />
            <NavItem href="/worker/attendance" icon={ClipboardList} label="Attendance" />
            <NavItem href="/worker/messages" icon={MessageCircle} label="Messages" />
          </>)}

          <div className="sidebar-section-title mt-3">{t('USERS')}</div>
          {role === 'Admin' && (<>
            <NavItem href="/admin/workers" icon={HardHat} label="Workers" />
            <NavItem href="/admin/supervisors" icon={Users} label="Supervisors" />
            <NavItem href="/admin/contact-details" icon={PhoneCall} label="Contact Details" />
            <NavItem href="/admin/change-password" icon={KeyRound} label="Settings" />
          </>)}
          {role === 'Supervisor' && (<>
            <NavItem href="/supervisor/workers" icon={HardHat} label="Workers" />
            <NavItem href="/supervisor/contact-admin" icon={PhoneCall} label="Contact Admin" />
            <NavItem href="/supervisor/change-password" icon={KeyRound} label="Settings" />
          </>)}
          {role === 'Worker' && <NavItem href="/worker/change-password" icon={KeyRound} label="Settings" />}
        </nav>

        {/* Logout at bottom */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            onMouseDown={ripple}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', position: 'relative', overflow: 'hidden' }}
          >
            <LogOut size={16} /> Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10 }}
            >
              <Menu size={22} />
            </motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: roleColor, boxShadow: `0 0 8px ${roleColor}` }} />
              <h2 className="topbar-title" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                {t('WELCOME!')}&nbsp;<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentUser?.name}</span>
              </h2>
            </div>
          </div>

          <div className="topbar-right flex items-center gap-3">
            {/* Search */}
            <div className="search-bar hidden-mobile">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder={t('Search...')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(e.target.value.trim().length > 0); }}
                onFocus={() => searchQuery.trim().length > 0 && setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    className="search-dropdown"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {filteredSites.length > 0 && (<><div className="search-dropdown-section">Sites</div>{filteredSites.map(s => <div key={s.id} className="search-item" style={{ cursor: 'pointer' }} onClick={() => { router.push(role === 'Admin' ? `/admin/sites/${s.id}` : `/supervisor/site-overview`); setSearchOpen(false); }}>{s.name} <span className="text-muted text-small">({s.location})</span></div>)}</>)}
                    {filteredUsers.length > 0 && (<><div className="search-dropdown-section">Users</div>{filteredUsers.map(u => <div key={u.id} className="search-item" style={{ cursor: 'pointer' }} onClick={() => { router.push(role === 'Admin' ? `/admin/${u.role.toLowerCase()}s` : `/supervisor/workers`); setSearchOpen(false); }}>{u.name} <span className="text-muted text-small">({u.role})</span></div>)}</>)}
                    {filteredSites.length === 0 && filteredUsers.length === 0 && <div className="search-item text-muted">No results</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Icon buttons */}
            <div className="topbar-icons flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.88 }} className="btn-icon header-icon" onClick={toggleLanguage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={16} /><span style={{ fontSize: 9, fontWeight: 700 }}>{language === 'en' ? 'EN' : 'TA'}</span>
              </motion.button>

              <motion.button whileTap={{ scale: 0.88 }} className="btn-icon header-icon" onClick={toggleTheme}>
                <AnimatePresence mode="wait">
                  <motion.span key={isDark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <motion.button whileTap={{ scale: 0.88 }} className="btn-icon header-icon" onClick={() => setNotifOpen(o => !o)}>
                  <motion.span animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}>
                    <Bell size={18} />
                  </motion.span>
                  {unread > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="badge-notification"
                    >{unread}</motion.span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      className="notif-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="notif-header"><span>Notifications</span>{unread > 0 && <span className="badge badge-primary">{unread} new</span>}</div>
                      {recentMessages.length === 0 && <div className="notif-empty">No messages</div>}
                      {recentMessages.map(m => (
                        <div key={m.id} className="notif-item" onClick={() => { setNotifOpen(false); router.push(msgRoute); }}>
                          <div className="notif-item-icon"><MessageCircle size={14} /></div>
                          <div className="notif-item-content">
                            <div className="notif-item-title">{m.subject}</div>
                            <div className="notif-item-sub">From: {m.fromName}</div>
                          </div>
                        </div>
                      ))}
                      <div className="notif-footer" onClick={() => { router.push(msgRoute); setNotifOpen(false); }}>View All Messages</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button whileTap={{ scale: 0.88 }} className="btn-icon header-icon" onClick={() => router.push(`/${role?.toLowerCase()}/change-password`)}>
                <Settings size={18} />
              </motion.button>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="avatar header-avatar cursor-pointer"
                onClick={handleLogout}
                title="Logout"
                style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`, boxShadow: `0 2px 8px ${roleColor}55` }}
              >
                {currentUser?.name?.charAt(0).toUpperCase() || role?.charAt(0)}
              </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="main-inner-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
