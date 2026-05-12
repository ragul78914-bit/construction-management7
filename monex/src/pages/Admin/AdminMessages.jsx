import { useState } from 'react';
import useStore from '../../store/useStore';
import {
  MessageCircle, FileText, Trash2, CheckCheck,
  Send, Megaphone, Users, HardHat, User, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['Announcement', 'Report', 'Event', 'General'];

const audienceLabel = (a) => {
  if (a === 'all') return { label: 'All (Supervisors + Workers)', color: 'var(--primary-color)', icon: <Users size={12} /> };
  if (a === 'Supervisor') return { label: 'Supervisors Only', color: 'var(--success-color)', icon: <Users size={12} /> };
  if (a === 'Worker') return { label: 'Workers Only', color: 'var(--warning-color)', icon: <HardHat size={12} /> };
  return { label: a, color: 'var(--text-secondary)', icon: null };
};

export function AdminMessages() {
  const { currentUser, messages, users, sendDirectMessage, sendBroadcast, replyMessage, markMessageRead, markAllRead, deleteMessage } = useStore();

  const [tab, setTab] = useState('inbox');       // 'inbox' | 'broadcast' | 'compose'
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ---- Compose Direct ----
  const [directForm, setDirectForm] = useState({
    toId: '', subject: '', body: '', attachmentName: '', attachmentData: '',
  });
  const [directFileLabel, setDirectFileLabel] = useState('');

  // ---- Compose Broadcast ----
  const [broadForm, setBroadForm] = useState({
    audience: 'all', category: 'Announcement', subject: '', body: '',
    attachmentName: '', attachmentData: '',
  });
  const [broadFileLabel, setBroadFileLabel] = useState('');

  const supervisors = users.filter(u => u.role === 'Supervisor');
  const workers = users.filter(u => u.role === 'Worker');
  const allRecipients = [...supervisors, ...workers];

  const adminId = currentUser?.id;

  // Inbox: direct messages sent TO admin (from supervisors or workers)
  const inboxMsgs = messages.filter(m =>
    m.type === 'direct' && m.toId === adminId
  );

  // Sent: direct messages sent FROM admin to specific user
  const sentMsgs = messages.filter(m =>
    m.type === 'direct' && m.fromId === adminId
  );

  // Broadcasts
  const broadcastMsgs = messages.filter(m => m.type === 'broadcast');

  const unreadInbox = inboxMsgs.filter(m => !m.readBy.includes(adminId)).length;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    setReplyText('');
    markMessageRead(msg.id, adminId);
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const replyData = {
      fromId: adminId,
      fromRole: 'Admin',
      fromName: currentUser.name || 'Admin',
      body: replyText,
    };
    replyMessage(selectedMsg.id, replyData);
    setSelectedMsg(prev => ({
      ...prev,
      replies: [...prev.replies, { id: `local_${Date.now()}`, ...replyData, timestamp: new Date().toISOString() }],
    }));
    setReplyText('');
  };

  const handleDirectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDirectFileLabel(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setDirectForm(f => ({ ...f, attachmentName: file.name, attachmentData: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleBroadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBroadFileLabel(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setBroadForm(f => ({ ...f, attachmentName: file.name, attachmentData: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSendDirect = (e) => {
    e.preventDefault();
    if (!directForm.toId || !directForm.subject.trim() || !directForm.body.trim()) return;
    const recipient = allRecipients.find(u => u.id === directForm.toId);
    sendDirectMessage({
      fromId: adminId,
      fromName: currentUser.name || 'Admin',
      fromRole: 'Admin',
      toId: directForm.toId,
      toName: recipient?.name || '',
      toRole: recipient?.role || '',
      subject: directForm.subject,
      body: directForm.body,
      attachmentName: directForm.attachmentName,
      attachmentData: directForm.attachmentData,
    });
    setDirectForm({ toId: '', subject: '', body: '', attachmentName: '', attachmentData: '' });
    setDirectFileLabel('');
    setTab('inbox');
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadForm.subject.trim() || !broadForm.body.trim()) return;
    sendBroadcast({
      fromId: adminId,
      fromName: currentUser.name || 'Admin',
      fromRole: 'Admin',
      audience: broadForm.audience,
      category: broadForm.category,
      subject: broadForm.subject,
      body: broadForm.body,
      attachmentName: broadForm.attachmentName,
      attachmentData: broadForm.attachmentData,
    });
    setBroadForm({ audience: 'all', category: 'Announcement', subject: '', body: '', attachmentName: '', attachmentData: '' });
    setBroadFileLabel('');
    setTab('broadcast');
  };

  const msgList = tab === 'inbox' ? inboxMsgs : tab === 'sent' ? sentMsgs : broadcastMsgs;

  const renderThread = () => {
    if (!selectedMsg) return (
      <div className="msg-placeholder">
        <MessageCircle size={48} color="var(--text-tertiary)" />
        <p className="text-muted mt-2">Select a message to view</p>
      </div>
    );

    const isBroadcast = selectedMsg.type === 'broadcast';
    const aud = isBroadcast ? audienceLabel(selectedMsg.audience) : null;

    return (
      <div className="msg-thread">
        <div className="msg-thread-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ marginBottom: '0.2rem' }}>{selectedMsg.subject}</h3>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {isBroadcast ? (
                <>
                  <span className="admin-msg-badge broadcast"><Megaphone size={11} /> Broadcast</span>
                  <span style={{ fontSize: '0.75rem', color: aud.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {aud.icon} {aud.label}
                  </span>
                  <span className="admin-msg-badge category">{selectedMsg.category}</span>
                </>
              ) : (
                <>
                  <span className="admin-msg-badge direct"><User size={11} /> Direct</span>
                  <span className="text-small text-muted">
                    {selectedMsg.fromId === adminId
                      ? `To: ${selectedMsg.toName} (${selectedMsg.toRole})`
                      : `From: ${selectedMsg.fromName} (${selectedMsg.fromRole})`}
                  </span>
                </>
              )}
              <span className="text-small text-muted">· {formatTime(selectedMsg.timestamp)}</span>
            </div>
          </div>
          <button className="btn-icon" style={{ color: 'var(--danger-color)', flexShrink: 0 }}
            title="Delete" onClick={() => { deleteMessage(selectedMsg.id); setSelectedMsg(null); }}>
            <Trash2 size={18} />
          </button>
        </div>

        <div className="msg-thread-body">
          {/* Original message bubble */}
          <div className={`msg-bubble ${selectedMsg.fromRole === 'Admin' ? 'admin' : 'supervisor'}`}>
            <div className="msg-bubble-name">
              {selectedMsg.fromRole === 'Admin' ? `You (Admin)` : `${selectedMsg.fromName} (${selectedMsg.fromRole})`}
            </div>
            <div className="msg-bubble-text">{selectedMsg.body}</div>
            {selectedMsg.attachmentName && (
              <a href={selectedMsg.attachmentData} download={selectedMsg.attachmentName} className="msg-attachment">
                <FileText size={14} /> {selectedMsg.attachmentName}
              </a>
            )}
          </div>

          {/* Replies */}
          {selectedMsg.replies.map(r => (
            <div key={r.id} className={`msg-bubble ${r.fromRole === 'Admin' ? 'admin' : 'supervisor'}`}>
              <div className="msg-bubble-name">{r.fromName} ({r.fromRole}) · {formatTime(r.timestamp)}</div>
              <div className="msg-bubble-text">{r.body}</div>
            </div>
          ))}
        </div>

        {/* Reply box — only for direct messages FROM others to admin */}
        {selectedMsg.type === 'direct' && selectedMsg.toId === adminId && (
          <form className="msg-reply-box" onSubmit={handleReply}>
            <textarea className="form-textarea" rows={2}
              placeholder={`Reply to ${selectedMsg.fromName}…`}
              value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button type="submit" className="btn btn-primary mt-2">
              <Send size={14} /> Send Reply
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Messages</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => { setTab('compose-direct'); setSelectedMsg(null); }}>
            <User size={15} /> New Direct Message
          </button>
          <button className="btn btn-primary" onClick={() => { setTab('compose-broadcast'); setSelectedMsg(null); }}>
            <Megaphone size={15} /> New Broadcast
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-msg-tabs">
        {[
          { key: 'inbox', label: 'Inbox', badge: unreadInbox },
          { key: 'sent', label: 'Sent (Direct)' },
          { key: 'broadcast', label: 'Broadcasts' },
        ].map(t => (
          <button key={t.key} className={`admin-msg-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setSelectedMsg(null); }}>
            {t.label}
            {t.badge > 0 && <span className="msg-unread-badge" style={{ marginLeft: 6 }}>{t.badge}</span>}
          </button>
        ))}
        {(tab === 'compose-direct' || tab === 'compose-broadcast') && (
          <button className="admin-msg-tab active">
            {tab === 'compose-direct' ? 'New Direct Message' : 'New Broadcast'}
          </button>
        )}
        {unreadInbox > 0 && tab === 'inbox' && (
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            onClick={() => markAllRead(adminId)}>
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* ---- COMPOSE DIRECT ---- */}
      {tab === 'compose-direct' && (
        <div className="card p-4" style={{ maxWidth: 640 }}>
          <h3 className="mb-3">Send Direct Message</h3>
          <form onSubmit={handleSendDirect}>
            <div className="form-group">
              <label className="form-label">Recipient</label>
              <select className="form-select" required value={directForm.toId}
                onChange={e => setDirectForm({ ...directForm, toId: e.target.value })}>
                <option value="">-- Select Supervisor or Worker --</option>
                <optgroup label="Supervisors">
                  {supervisors.map(u => <option key={u.id} value={u.id}>{u.name} (Supervisor)</option>)}
                </optgroup>
                <optgroup label="Workers">
                  {workers.map(u => <option key={u.id} value={u.id}>{u.name} (Worker)</option>)}
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" required value={directForm.subject}
                onChange={e => setDirectForm({ ...directForm, subject: e.target.value })}
                placeholder="Message subject…" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" rows={4} required value={directForm.body}
                onChange={e => setDirectForm({ ...directForm, body: e.target.value })}
                placeholder="Write your message…" />
            </div>
            <div className="form-group">
              <label className="form-label">Attachment (optional)</label>
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <FileText size={16} /> {directFileLabel || 'Choose File'}
                  <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleDirectFile} />
                </label>
                {directFileLabel && <span className="file-name-tag">{directFileLabel}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary"><Send size={15} /> Send</button>
              <button type="button" className="btn btn-secondary" onClick={() => setTab('inbox')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ---- COMPOSE BROADCAST ---- */}
      {tab === 'compose-broadcast' && (
        <div className="card p-4" style={{ maxWidth: 640 }}>
          <h3 className="mb-3">Send Broadcast Message</h3>
          <form onSubmit={handleSendBroadcast}>
            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              {[
                { val: 'all', label: 'All (Supervisors + Workers)', color: 'var(--primary-color)' },
                { val: 'Supervisor', label: 'Supervisors Only', color: 'var(--success-color)' },
                { val: 'Worker', label: 'Workers Only', color: 'var(--warning-color)' },
              ].map(opt => (
                <button type="button" key={opt.val}
                  onClick={() => setBroadForm({ ...broadForm, audience: opt.val })}
                  className={`admin-audience-btn ${broadForm.audience === opt.val ? 'selected' : ''}`}
                  style={broadForm.audience === opt.val ? { borderColor: opt.color, color: opt.color, background: opt.color + '18' } : {}}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button type="button" key={cat}
                    onClick={() => setBroadForm({ ...broadForm, category: cat })}
                    className={`admin-category-btn ${broadForm.category === cat ? 'selected' : ''}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" required value={broadForm.subject}
                onChange={e => setBroadForm({ ...broadForm, subject: e.target.value })}
                placeholder="e.g. Safety Briefing – Week 20" />
            </div>
            <div className="form-group">
              <label className="form-label">Message / Content</label>
              <textarea className="form-textarea" rows={5} required value={broadForm.body}
                onChange={e => setBroadForm({ ...broadForm, body: e.target.value })}
                placeholder="Write the announcement, report, or event details…" />
            </div>
            <div className="form-group">
              <label className="form-label">Attachment (optional)</label>
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <FileText size={16} /> {broadFileLabel || 'Choose File'}
                  <input type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleBroadFile} />
                </label>
                {broadFileLabel && <span className="file-name-tag">{broadFileLabel}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary"><Megaphone size={15} /> Broadcast</button>
              <button type="button" className="btn btn-secondary" onClick={() => setTab('broadcast')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ---- MESSAGE LIST + THREAD ---- */}
      {(tab === 'inbox' || tab === 'sent' || tab === 'broadcast') && (
        <div className="msg-layout">
          {/* Left sidebar */}
          <div className="msg-sidebar card">
            <div className="msg-sidebar-header">
              <span style={{ fontWeight: 600 }}>
                {tab === 'inbox' ? 'Received' : tab === 'sent' ? 'Sent' : 'Broadcasts'}
              </span>
              {tab === 'inbox' && unreadInbox > 0 && <span className="msg-unread-badge">{unreadInbox}</span>}
            </div>

            {msgList.length === 0 && (
              <div className="msg-empty">
                {tab === 'inbox' ? 'No messages received.' : tab === 'sent' ? 'No direct messages sent yet.' : 'No broadcasts sent yet.'}
              </div>
            )}

            {msgList.map(m => {
              const isUnread = !m.readBy.includes(adminId);
              const aud = m.type === 'broadcast' ? audienceLabel(m.audience) : null;
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
                      ? <span style={{ color: aud.color, fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 3 }}>{aud.icon} {aud.label}</span>
                      : <><strong style={{ color: 'var(--primary-color)' }}>{m.fromId === adminId ? `To: ${m.toName}` : `From: ${m.fromName}`}</strong>: {m.body.substring(0, 45)}…</>
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isUnread && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>New</span>}
                    {m.type === 'broadcast' && <span className="admin-msg-badge category" style={{ fontSize: '0.65rem' }}>{m.category}</span>}
                    {m.attachmentName && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}><FileText size={10} /> Doc</span>}
                    {m.replies.length > 0 && <span className="msg-reply-count">{m.replies.length} repl{m.replies.length > 1 ? 'ies' : 'y'}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right thread panel */}
          <div className="msg-main card">
            {renderThread()}
          </div>
        </div>
      )}
    </div>
  );
}
