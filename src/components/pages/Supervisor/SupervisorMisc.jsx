'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { FileText, ClipboardList, PhoneCall, KeyRound, MessageCircle } from 'lucide-react';

export function SupervisorBilling() {
  const { currentUser, sites, spendRecords, users, materials, wageEntries } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites.length > 0 ? assignedSites[0].id : '');

  const site = sites.find(s => s.id === selectedSiteId);

  const handleExport = () => {
    alert('Billing report exported to Google Sheets (Mocked)');
  };

  const { sendDirectMessage } = useStore();
  const [form, setForm] = useState({ subject: 'Billing Report - ', body: '', attachmentName: '', attachmentData: '' });
  const [fileLabel, setFileLabel] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileLabel(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, attachmentName: file.name, attachmentData: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSendBilling = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) return;
    sendDirectMessage({
      fromId: currentUser.id,
      fromName: currentUser.name,
      fromRole: 'Supervisor',
      toId: 'admin_1',
      toName: 'System Admin',
      toRole: 'Admin',
      subject: form.subject,
      body: form.body,
      attachmentName: form.attachmentName,
      attachmentData: form.attachmentData,
      isBilling: true
    });
    setForm({ subject: 'Billing Report - ', body: '', attachmentName: '', attachmentData: '' });
    setFileLabel('');
    setSuccessMsg('Billing document sent to Admin successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (assignedSites.length === 0) return <div><div className="page-header"><h1>Billing Report</h1></div><p>No assigned sites</p></div>;

  const siteSpend = spendRecords.filter(sp => sp.siteId === site?.id);
  const totalSpend = siteSpend.reduce((sum, sp) => sum + sp.amount, 0);
  const remBalance = site ? site.totalBudget - totalSpend : 0;
  
  const siteWorkers = users.filter(u => u.role === 'Worker' && u.assignedSite === site?.id);
  const siteMaterials = materials.filter(m => m.siteId === site?.id);

  return (
    <div>
      <div className="page-header">
        <h1>Billing Report</h1>
        {assignedSites.length > 1 && (
          <select className="form-select w-auto" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
            {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {site && (
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2>{site.name} - Billing Summary</h2>
              <button className="btn btn-success" onClick={handleExport}><FileText size={16}/> Export Sheet</button>
            </div>

            {successMsg && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{successMsg}</div>}
            
            <div className="card p-4 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="mb-3">Send Billing Document to Admin</h3>
              <form onSubmit={handleSendBilling}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" required value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Billing Report - Site Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Message / Details</label>
                  <textarea className="form-textarea" required rows={4} value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    placeholder="Include details of client, materials, workers, etc." />
                </div>
                <div className="form-group">
                  <label className="form-label">Attach Billing Document (PDF / Image)</label>
                  <div className="file-upload-wrapper">
                    <label className="file-upload-label">
                      <FileText size={16} /> {fileLabel || 'Choose File'}
                      <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                    {fileLabel && <span className="file-name-tag">{fileLabel}</span>}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-2"><MessageCircle size={16} /> Send to Admin</button>
              </form>
            </div>
            <div className="dashboard-grid mb-4">
               <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                 <div className="text-small text-muted">Advance Amount</div>
                 <div>${site.advanceAmount.toLocaleString()}</div>
               </div>
               <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                 <div className="text-small text-muted">Total Spend Record</div>
                 <div style={{ color: 'var(--danger-color)' }}>${totalSpend.toLocaleString()}</div>
               </div>
               <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                 <div className="text-small text-muted">Remaining Balance</div>
                 <div style={{ color: 'var(--success-color)' }}>${remBalance.toLocaleString()}</div>
               </div>
            </div>

            <h3 className="mb-2">Worker Wages Summary</h3>
            <div className="table-container bg-secondary border-rounded mb-4">
               <table className="table">
                 <thead><tr><th>Worker</th><th>Trade</th><th>Total Entries</th><th>Total Wage Amount</th></tr></thead>
                 <tbody>
                   {siteWorkers.map(w => {
                     const myWages = wageEntries.filter(we => we.workerId === w.id);
                     const total = myWages.reduce((s, we) => s + we.amount, 0);
                     return (
                       <tr key={w.id}>
                         <td>{w.name}</td>
                         <td>{w.trade}</td>
                         <td>{myWages.length}</td>
                         <td>${total.toLocaleString()}</td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
            </div>

            <h3 className="mb-2">Materials Summary</h3>
            <div className="table-container bg-secondary border-rounded">
               <table className="table">
                 <thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th>Photos Attached</th></tr></thead>
                 <tbody>
                   {siteMaterials.map(m => (
                       <tr key={m.id}>
                         <td>{m.name}</td>
                         <td>{m.quantity}</td>
                         <td>{m.unit}</td>
                         <td>{m.photos?.length || 0}</td>
                       </tr>
                     ))}
                 </tbody>
               </table>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export function SupervisorProgress() {
  const { currentUser, sites, progressUpdates, addProgress } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites.length > 0 ? assignedSites[0].id : '');
  const [form, setForm] = useState({ date: '', description: '', issues: '' });

  const siteUpdates = progressUpdates.filter(p => p.siteId === selectedSiteId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSiteId) return alert('No site selected');
    addProgress({ ...form, siteId: selectedSiteId, recordedBy: currentUser.id });
    setForm({ date: '', description: '', issues: '' });
  };

  if (assignedSites.length === 0) return <div><div className="page-header"><h1>Progress Updates</h1></div><p>No assigned sites</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Progress Updates</h1>
        {assignedSites.length > 1 && (
          <select className="form-select w-auto" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
            {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      <div className="responsive-image-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card p-4">
          <h3 className="mb-3">Add Update</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Date</label><input type="date" required className="form-input" value={form.date} onChange={e=>setForm({...form, date: e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Progress Description</label><textarea required className="form-textarea" value={form.description} onChange={e=>setForm({...form, description: e.target.value})}></textarea></div>
            <div className="form-group"><label className="form-label">Issues Encountered (Optional)</label><textarea className="form-textarea" style={{minHeight:'60px'}} value={form.issues} onChange={e=>setForm({...form, issues: e.target.value})}></textarea></div>
            <button className="btn btn-primary w-full" type="submit">Save Update</button>
          </form>
        </div>
        
        <div className="card p-0">
          <div className="p-4 border-bottom">
            <h3 className="mb-0">History</h3>
          </div>
          <div className="table-container">
            <table className="table">
               <thead><tr><th>Date</th><th>Description</th><th>Issues</th></tr></thead>
               <tbody>
                 {siteUpdates.map(u => (
                   <tr key={u.id}>
                     <td style={{whiteSpace: 'nowrap'}}>{u.date}</td>
                     <td>{u.description}</td>
                     <td className="text-muted">{u.issues || '-'}</td>
                   </tr>
                 ))}
                 {siteUpdates.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No updates recorded</td></tr>}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupervisorContactAdmin() {
  const { currentUser, messages, sendDirectMessage, replyMessage, markMessageRead, markAllRead } = useStore();
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'sent' | 'announcements' | 'compose'
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ subject: '', body: '', attachmentName: '', attachmentData: '' });
  const [fileLabel, setFileLabel] = useState('');

  const uid = currentUser?.id;

  // Admin → this supervisor (direct)
  const inboxMsgs = messages.filter(m =>
    m.type === 'direct' && m.toId === uid
  );

  // This supervisor → admin (direct)
  const sentMsgs = messages.filter(m =>
    m.type === 'direct' && m.fromId === uid
  );

  // Broadcasts visible to supervisors: audience 'all' or 'Supervisor'
  const broadcastMsgs = messages.filter(m =>
    m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Supervisor')
  );

  const unreadInbox = inboxMsgs.filter(m => !m.readBy.includes(uid)).length;
  const unreadBroadcast = broadcastMsgs.filter(m => !m.readBy.includes(uid)).length;
  const totalUnread = unreadInbox + unreadBroadcast;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Find admin user for sending
  const adminUser = messages.find(m => m.fromRole === 'Admin') || { toId: 'admin_1', toName: 'System Admin' };

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    setReplyText('');
    markMessageRead(msg.id, uid);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileLabel(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, attachmentName: file.name, attachmentData: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) return;
    sendDirectMessage({
      fromId: uid,
      fromName: currentUser.name,
      fromRole: 'Supervisor',
      toId: 'admin_1',
      toName: 'System Admin',
      toRole: 'Admin',
      subject: form.subject,
      body: form.body,
      attachmentName: form.attachmentName,
      attachmentData: form.attachmentData,
    });
    setForm({ subject: '', body: '', attachmentName: '', attachmentData: '' });
    setFileLabel('');
    setTab('sent');
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const replyData = {
      fromId: uid,
      fromRole: 'Supervisor',
      fromName: currentUser.name,
      body: replyText,
    };
    replyMessage(selectedMsg.id, replyData);
    setSelectedMsg(prev => ({
      ...prev,
      replies: [...prev.replies, { id: `local_${Date.now()}`, ...replyData, timestamp: new Date().toISOString() }],
    }));
    setReplyText('');
  };

  const msgList = tab === 'inbox' ? inboxMsgs : tab === 'sent' ? sentMsgs : broadcastMsgs;

  const catColor = (cat) => ({
    Announcement: 'var(--primary-color)',
    Report: 'var(--warning-color)',
    Event: 'var(--success-color)',
    General: 'var(--text-secondary)',
  }[cat] || 'var(--text-secondary)');

  return (
    <div>
      <div className="page-header">
        <h1>Messages</h1>
        <button className="btn btn-primary" onClick={() => { setTab('compose'); setSelectedMsg(null); }}>
          <MessageCircle size={16} /> Message Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-msg-tabs">
        {[
          { key: 'inbox', label: 'From Admin', badge: unreadInbox },
          { key: 'sent', label: 'Sent' },
          { key: 'announcements', label: 'Announcements', badge: unreadBroadcast },
        ].map(t => (
          <button key={t.key} className={`admin-msg-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setSelectedMsg(null); }}>
            {t.label}
            {t.badge > 0 && <span className="msg-unread-badge" style={{ marginLeft: 6 }}>{t.badge}</span>}
          </button>
        ))}
        {tab === 'compose' && <button className="admin-msg-tab active">New Message</button>}
        {totalUnread > 0 && tab !== 'compose' && (
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => markAllRead(uid)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>✓✓ Mark All Read</span>
          </button>
        )}
      </div>

      {/* Compose */}
      {tab === 'compose' && (
        <div className="card p-4" style={{ maxWidth: 640 }}>
          <h3 className="mb-3">New Message to Admin</h3>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" required value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Site Report – Week 18" />
            </div>
            <div className="form-group">
              <label className="form-label">Message / Report</label>
              <textarea className="form-textarea" required rows={5} value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Describe the issue, report, or request…" />
            </div>
            <div className="form-group">
              <label className="form-label">Attach Document (PDF / Image)</label>
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <FileText size={16} /> {fileLabel || 'Choose File'}
                  <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
                {fileLabel && <span className="file-name-tag">{fileLabel}</span>}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary"><MessageCircle size={16} /> Send</button>
              <button type="button" className="btn btn-secondary" onClick={() => setTab('inbox')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List + Thread panel */}
      {tab !== 'compose' && (
        <div className="msg-layout">
          <div className="msg-sidebar card">
            <div className="msg-sidebar-header">
              <span style={{ fontWeight: 600 }}>
                {tab === 'inbox' ? 'From Admin' : tab === 'sent' ? 'Your Messages' : 'Announcements'}
              </span>
              {(tab === 'inbox' ? unreadInbox : tab === 'announcements' ? unreadBroadcast : 0) > 0 &&
                <span className="msg-unread-badge">{tab === 'inbox' ? unreadInbox : unreadBroadcast}</span>}
            </div>
            {msgList.length === 0 && (
              <div className="msg-empty">
                {tab === 'inbox' ? 'No messages from admin yet.' : tab === 'sent' ? 'No messages sent yet. Click "Message Admin".' : 'No announcements yet.'}
              </div>
            )}
            {msgList.map(m => {
              const isUnread = !m.readBy.includes(uid);
              return (
                <div key={m.id}
                  className={`msg-item ${selectedMsg?.id === m.id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                  onClick={() => handleOpenMsg(m)}>
                  <div className="msg-item-top">
                    <span className="msg-subject">{m.subject}</span>
                    <span className="msg-time">{formatTime(m.timestamp)}</span>
                  </div>
                  <div className="msg-preview">
                    {m.type === 'broadcast'
                      ? <span style={{ color: catColor(m.category), fontWeight: 600, fontSize: '0.78rem' }}>📢 {m.category}</span>
                      : <>{m.body.substring(0, 60)}…</>
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isUnread && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>New</span>}
                    {m.type === 'broadcast' && (
                      <span className="admin-msg-badge category" style={{ fontSize: '0.65rem', color: catColor(m.category) }}>{m.category}</span>
                    )}
                    {m.attachmentName && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}><FileText size={10} /> Doc</span>}
                    {m.replies.length > 0 && <span className="msg-reply-count">{m.replies.length} repl{m.replies.length > 1 ? 'ies' : 'y'}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="msg-main card">
            {!selectedMsg && (
              <div className="msg-placeholder">
                <MessageCircle size={48} color="var(--text-tertiary)" />
                <p className="text-muted mt-2">Select a message to read</p>
              </div>
            )}

            {selectedMsg && (
              <div className="msg-thread">
                <div className="msg-thread-header">
                  <div>
                    <h3 style={{ marginBottom: '0.2rem' }}>{selectedMsg.subject}</h3>
                    <div className="flex items-center gap-2">
                      {selectedMsg.type === 'broadcast' && (
                        <span className="admin-msg-badge broadcast">📢 {selectedMsg.category}</span>
                      )}
                      <span className="text-small text-muted">
                        {selectedMsg.type === 'direct'
                          ? (selectedMsg.fromId === uid ? `To: Admin` : `From: Admin`)
                          : `From Admin · Broadcast`
                        } · {formatTime(selectedMsg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="msg-thread-body">
                  <div className={`msg-bubble ${selectedMsg.fromRole === 'Admin' || selectedMsg.type === 'broadcast' ? 'admin' : 'supervisor'}`}>
                    <div className="msg-bubble-name">
                      {selectedMsg.type === 'broadcast' ? 'Admin (Broadcast)' : selectedMsg.fromId === uid ? `You (${currentUser.name})` : `Admin`}
                    </div>
                    <div className="msg-bubble-text">{selectedMsg.body}</div>
                    {selectedMsg.attachmentName && (
                      <a href={selectedMsg.attachmentData} download={selectedMsg.attachmentName} className="msg-attachment">
                        <FileText size={14} /> {selectedMsg.attachmentName}
                      </a>
                    )}
                  </div>

                  {selectedMsg.replies.map(r => (
                    <div key={r.id} className={`msg-bubble ${r.fromRole === 'Admin' ? 'admin' : 'supervisor'}`}>
                      <div className="msg-bubble-name">{r.fromName} ({r.fromRole}) · {formatTime(r.timestamp)}</div>
                      <div className="msg-bubble-text">{r.body}</div>
                    </div>
                  ))}
                </div>

                {/* Reply only on messages that aren't broadcasts and involve this supervisor */}
                {(selectedMsg.type === 'direct') && (
                  <form className="msg-reply-box" onSubmit={handleReply}>
                    <textarea className="form-textarea" rows={2}
                      placeholder="Write a reply…"
                      value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <button type="submit" className="btn btn-primary mt-2">
                      <MessageCircle size={14} /> Reply
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export function SupervisorSettings() {
  const { currentUser, changePassword, updateUser, addDocumentToUser, deleteDocumentFromUser } = useStore();
  const [activeTab, setActiveTab] = useState('Profile');

  // Password State
  const [currentP, setCurrentP] = useState('');
  const [newP, setNewP] = useState('');
  const [confirmP, setConfirmP] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Profile State
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '' });
  const [profSuccess, setProfSuccess] = useState('');

  // Document State
  const [uploading, setUploading] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess('');
    if (newP !== confirmP) return setPwdError('Passwords do not match');
    if (newP.length < 8) return setPwdError('Password must be at least 8 characters');
    const res = changePassword(currentUser.id, currentP, newP);
    if (res.success) {
      setPwdSuccess('Your password has been changed successfully.');
      setCurrentP(''); setNewP(''); setConfirmP('');
    } else setPwdError(res.error);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfSuccess('');
    updateUser(currentUser.id, profileForm);
    setProfSuccess('Profile updated successfully.');
    setTimeout(() => setProfSuccess(''), 3000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setDocSuccess('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.readAsDataURL(file);
        r.onload = () => resolve(r.result);
        r.onerror = error => reject(error);
      });
      await addDocumentToUser(currentUser.id, {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: currentUser.name,
        content: base64
      });
      setDocSuccess('Document uploaded successfully.');
      setTimeout(() => setDocSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDownload = (doc) => {
    const a = document.createElement('a');
    a.href = doc.content;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="page-header"><h1>Settings & Profile</h1></div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['Profile', 'Documents', 'Password'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: activeTab === tab ? 'bold' : 'normal', color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)', borderBottom: activeTab === tab ? '3px solid var(--primary-color)' : 'none', cursor: 'pointer', marginBottom: '-10px' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Profile' && (
        <form onSubmit={handleProfileSubmit} className="card p-4 card-body">
          <h2 className="mb-4" style={{fontSize: '1.1rem'}}>Contact Details</h2>
          {profSuccess && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{profSuccess}</div>}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" required className="form-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" required className="form-input" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" disabled className="form-input" value={currentUser?.email || ''} style={{opacity: 0.7, cursor: 'not-allowed'}} />
            <small className="text-muted">Email cannot be changed.</small>
          </div>
          <button type="submit" className="btn btn-primary mt-2">Update Profile</button>
        </form>
      )}

      {activeTab === 'Documents' && (
        <div className="card p-4 card-body">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{fontSize: '1.1rem', margin: 0}}>My Documents</h2>
            <label className="btn btn-primary" style={{cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1}}>
              {uploading ? 'Uploading...' : 'Upload Document'}
              <input type="file" style={{display: 'none'}} onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          
          {docSuccess && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{docSuccess}</div>}
          
          {(!currentUser?.documents || currentUser.documents.length === 0) ? (
            <p className="text-muted text-center" style={{padding: '2rem 0'}}>No documents uploaded yet.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {currentUser.documents.map(doc => (
                <div key={doc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px'}}>
                  <div style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem', fontWeight: 500}}>
                    {doc.fileName}
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>{new Date(doc.uploadDate).toLocaleDateString()}</div>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button className="btn btn-secondary" style={{padding: '0.4rem 0.8rem'}} onClick={() => handleDownload(doc)}>Download</button>
                    <button className="btn" style={{padding: '0.4rem 0.8rem', background: 'var(--danger-color)', color: 'white'}} onClick={() => deleteDocumentFromUser(currentUser.id, doc.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Password' && (
        <form onSubmit={handlePasswordSubmit} className="card p-4 card-body">
          <h2 className="mb-4" style={{fontSize: '1.1rem'}}>Change Password</h2>
          {pwdError && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{pwdError}</div>}
          {pwdSuccess && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{pwdSuccess}</div>}
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" required className="form-input" value={currentP} onChange={e => setCurrentP(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" required className="form-input" value={newP} onChange={e => setNewP(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" required className="form-input" value={confirmP} onChange={e => setConfirmP(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary mt-2">Update Password</button>
        </form>
      )}
    </div>
  );
}


