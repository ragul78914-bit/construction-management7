import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { 
  Menu, X, LogOut, Home, Building2, HardHat, 
  Users, KeyRound, PhoneCall, Hammer, FileText, ClipboardList, CheckSquare,
  Search, Bell, Settings, Moon, Sun, Globe, MessageCircle, CalendarCheck, FolderOpen
} from 'lucide-react';

export default function Layout({ children }) {
  const { currentUser, logout, sites, users, messages } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Compute search results
  const q = searchQuery.toLowerCase();
  const filteredSites = sites.filter(s => s.name?.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(q));
  
  // Deduplicate clients for search
  const clientsMap = new Map();
  sites.forEach(s => {
    if (s.client?.name && s.client.name.toLowerCase().includes(q)) {
      clientsMap.set(s.client.name, s.client);
    }
  });
  const filteredClients = Array.from(clientsMap.values());

  const toggleTheme = () => {
    document.body.classList.toggle('dark-theme');
    setIsDark(document.body.classList.contains('dark-theme'));
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Compute unread message counts with new readBy schema
  const role = currentUser?.role;
  const uid = currentUser?.id;

  const unreadForAdmin = role === 'Admin'
    ? messages.filter(m => m.type === 'direct' && m.toId === uid && !m.readBy.includes(uid)).length
    : 0;
  const unreadForSupervisor = role === 'Supervisor'
    ? messages.filter(m =>
        ((m.type === 'direct' && m.toId === uid) ||
         (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Supervisor')))
        && !m.readBy.includes(uid)
      ).length
    : 0;
  const unreadForWorker = role === 'Worker'
    ? messages.filter(m =>
        ((m.type === 'direct' && m.toId === uid) ||
         (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Worker')))
        && !m.readBy.includes(uid)
      ).length
    : 0;
  const totalUnread = unreadForAdmin + unreadForSupervisor + unreadForWorker;

  // Recent messages for the notification dropdown (role-specific)
  const recentMessages = (() => {
    if (role === 'Admin') return messages.filter(m => m.type === 'direct' && m.toId === uid).slice(0, 5);
    if (role === 'Supervisor') return messages.filter(m =>
      (m.type === 'direct' && m.toId === uid) ||
      (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Supervisor'))
    ).slice(0, 5);
    if (role === 'Worker') return messages.filter(m =>
      (m.type === 'direct' && m.toId === uid) ||
      (m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Worker'))
    ).slice(0, 5);
    return [];
  })();

  const handleNotifClick = () => {
    setNotifOpen(o => !o);
  };

  const handleNotifMsgClick = (msg) => {
    setNotifOpen(false);
    if (role === 'Admin') navigate('/admin/messages');
    else if (role === 'Supervisor') navigate('/supervisor/contact-admin');
    else navigate('/worker/messages');
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink 
      to={to} 
      end={to === `/admin` || to === `/supervisor` || to === `/worker`}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      onClick={() => setSidebarOpen(false)}
    >
      <Icon size={18} />
      <span>{t(label)}</span>
      <span className="arrow-icon"></span>
    </NavLink>
  );

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand flex justify-between items-center">
          <div className="flex items-center gap-2" style={{color: '#ffffff'}}>
            <Building2 size={24} color="#ff7f50" />
            <span style={{ fontSize: '1.1rem' }}>Construction Management</span>
          </div>
          {sidebarOpen && (
            <button className="close-btn d-md-none" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">{t('GENERAL')}</div>
          {role === 'Admin' && (
            <>
              <NavItem to="/admin" icon={Home} label="Dashboard" />
              <NavItem to="/admin/sites" icon={Building2} label="Sites" />
              <NavItem to="/admin/materials" icon={Hammer} label="Materials" />
              <NavItem to="/admin/document-center" icon={FolderOpen} label="Document Center" />
              <NavItem to="/admin/reports" icon={FileText} label="Reports" />
              <NavItem to="/admin/billing" icon={FileText} label="Billing Documents" />
              <NavItem to="/admin/attendance" icon={CalendarCheck} label="Attendance" />
              <NavItem to="/admin/messages" icon={MessageCircle} label="Messages" />
            </>
          )}

          {role === 'Supervisor' && (
            <>
              <NavItem to="/supervisor" icon={Home} label="Dashboard" />
              <NavItem to="/supervisor/site-overview" icon={Building2} label="Assigned Site" />
              <NavItem to="/supervisor/materials" icon={Hammer} label="Materials" />
              <NavItem to="/supervisor/attendance" icon={CalendarCheck} label="Attendance" />
              <NavItem to="/supervisor/billing" icon={FileText} label="Billing Report" />
              <NavItem to="/supervisor/progress" icon={ClipboardList} label="Progress Updates" />
            </>
          )}

          {role === 'Worker' && (
            <>
              <NavItem to="/worker" icon={Home} label="Dashboard" />
              <NavItem to="/worker/tasks" icon={CheckSquare} label="Assigned Tasks" />
              <NavItem to="/worker/attendance" icon={ClipboardList} label="Attendance" />
              <NavItem to="/worker/messages" icon={MessageCircle} label="Messages" />
            </>
          )}

          <div className="sidebar-section-title mt-3">{t('USERS')}</div>
          
          {role === 'Admin' && (
            <>
              <NavItem to="/admin/workers" icon={HardHat} label="Workers" />
              <NavItem to="/admin/supervisors" icon={Users} label="Supervisors" />
              <NavItem to="/admin/contact-details" icon={PhoneCall} label="Contact Details" />
              <NavItem to="/admin/change-password" icon={KeyRound} label="Settings" />
            </>
          )}

          {role === 'Supervisor' && (
             <>
               <NavItem to="/supervisor/workers" icon={HardHat} label="Workers" />
               <NavItem to="/supervisor/contact-admin" icon={PhoneCall} label="Contact Admin" />
               <NavItem to="/supervisor/change-password" icon={KeyRound} label="Settings" />
             </>
          )}

          {role === 'Worker' && (
            <NavItem to="/worker/change-password" icon={KeyRound} label="Settings" />
          )}

        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* Top Navbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
             <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
               <Menu size={24} />
             </button>
             <h2 className="topbar-title">{t('WELCOME!')}</h2>
          </div>
          
          <div className="topbar-right flex items-center gap-3">
             <div className="search-bar hidden-mobile">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder={t('Search...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => searchQuery.trim().length > 0 && setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                
                {searchOpen && (
                  <div className="search-dropdown">
                     {filteredSites.length > 0 && (
                       <>
                         <div className="search-dropdown-section">Sites</div>
                         {filteredSites.map(s => (
                           <div key={s.id} className="search-item" style={{cursor: 'pointer'}} onClick={() => { navigate(role === 'Admin' ? `/admin/sites/${s.id}` : `/supervisor/site-overview`); setSearchOpen(false); }}>
                             {s.name} <span className="text-muted text-small ml-1">({s.location})</span>
                           </div>
                         ))}
                       </>
                     )}
                     {filteredUsers.length > 0 && (
                       <>
                         <div className="search-dropdown-section">Users</div>
                         {filteredUsers.map(u => (
                           <div key={u.id} className="search-item" style={{cursor: 'pointer'}} onClick={() => { navigate(role === 'Admin' ? `/admin/${u.role.toLowerCase()}s` : `/supervisor/workers`); setSearchOpen(false); }}>
                             {u.name} <span className="text-muted text-small ml-1">({u.role})</span>
                           </div>
                         ))}
                       </>
                     )}
                     {filteredClients.length > 0 && (
                       <>
                         <div className="search-dropdown-section">Clients</div>
                         {filteredClients.map((c, i) => (
                           <div key={i} className="search-item" style={{cursor: 'pointer'}} onClick={() => { navigate('/admin/sites'); setSearchOpen(false); }}>
                             {c.name} <span className="text-muted text-small ml-1">({c.phone})</span>
                           </div>
                         ))}
                       </>
                     )}
                     {filteredSites.length === 0 && filteredUsers.length === 0 && filteredClients.length === 0 && (
                        <div className="search-item text-muted">No results found</div>
                     )}
                  </div>
                )}
             </div>
             <div className="topbar-icons flex items-center gap-2">
               <button className="btn-icon header-icon flex flex-col items-center justify-center p-1" onClick={toggleLanguage} title={t(language === 'en' ? 'Switch to Tamil' : 'Switch to English')}>
                 <Globe size={16} />
                 <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{language === 'en' ? 'EN' : 'TA'}</span>
               </button>
               <button className="btn-icon header-icon" onClick={toggleTheme} title={t('Toggle Theme')}>
                 {isDark ? <Sun size={20} /> : <Moon size={20} />}
               </button>
              <button className="btn-icon header-icon" style={{position:'relative'}} ref={notifRef} onClick={handleNotifClick}>
                 <Bell size={20} />
                 {totalUnread > 0 && <span className="badge-notification">{totalUnread}</span>}
                 {notifOpen && (
                   <div className="notif-dropdown" onClick={e => e.stopPropagation()}>
                     <div className="notif-header">
                       <span>Notifications</span>
                       {totalUnread > 0 && <span className="badge badge-primary">{totalUnread} new</span>}
                     </div>
                     {recentMessages.length === 0 && (
                       <div className="notif-empty">No messages</div>
                     )}
                     {recentMessages.map(m => (
                       <div key={m.id} className={`notif-item ${(!m.readByAdmin && role === 'Admin') || (!m.readBySupervisor && role === 'Supervisor') ? 'unread' : ''}`} onClick={() => handleNotifMsgClick(m)}>
                         <div className="notif-item-icon"><MessageCircle size={16} /></div>
                         <div className="notif-item-content">
                           <div className="notif-item-title">{m.subject}</div>
                           <div className="notif-item-sub">From: {m.fromName} · {new Date(m.timestamp).toLocaleDateString()}</div>
                         </div>
                         {((!m.readByAdmin && role === 'Admin') || (!m.readBySupervisor && role === 'Supervisor')) && <span className="notif-dot" />}
                       </div>
                     ))}
                     <div className="notif-footer" onClick={() => { navigate(role === 'Admin' ? '/admin/messages' : '/supervisor/contact-admin'); setNotifOpen(false); }}>
                       View All Messages
                     </div>
                   </div>
                 )}
               </button>
               <button className="btn-icon header-icon" onClick={() => navigate('/admin/change-password')} title={t('Settings')}><Settings size={20} /></button>
               <div className="avatar header-avatar cursor-pointer" onClick={handleLogout} title={t('Logout')}>
                 {currentUser?.name?.charAt(0) || role?.charAt(0)}
               </div>
             </div>
          </div>
        </header>

        <div className="main-inner-content">
          <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
