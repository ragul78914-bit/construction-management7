'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { MessageCircle, FileText } from 'lucide-react';

export function WorkerMessages() {
  const { currentUser, messages, replyMessage, markMessageRead, markAllRead } = useStore();
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'announcements'
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');

  const uid = currentUser?.id;

  // Direct messages from admin to this worker
  const inboxMsgs = messages.filter(m =>
    m.type === 'direct' && m.toId === uid
  );

  // Broadcasts visible to workers: audience 'all' or 'Worker'
  const broadcastMsgs = messages.filter(m =>
    m.type === 'broadcast' && (m.audience === 'all' || m.audience === 'Worker')
  );

  const unreadInbox = inboxMsgs.filter(m => !m.readBy.includes(uid)).length;
  const unreadBroadcast = broadcastMsgs.filter(m => !m.readBy.includes(uid)).length;
  const totalUnread = unreadInbox + unreadBroadcast;

  const msgList = tab === 'inbox' ? inboxMsgs : broadcastMsgs;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const catColor = (cat) => ({
    Announcement: 'var(--primary-color)',
    Report: 'var(--warning-color)',
    Event: 'var(--success-color)',
    General: 'var(--text-secondary)',
  }[cat] || 'var(--text-secondary)');

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    setReplyText('');
    markMessageRead(msg.id, uid);
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const replyData = {
      fromId: uid,
      fromRole: 'Worker',
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

  return (
    <div>
      <div className="page-header">
        <h1>My Messages</h1>
        {totalUnread > 0 && (
          <button className="btn btn-secondary" onClick={() => markAllRead(uid)}>
            ✓✓ Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-msg-tabs">
        {[
          { key: 'inbox', label: 'From Admin', badge: unreadInbox },
          { key: 'announcements', label: 'Announcements', badge: unreadBroadcast },
        ].map(t => (
          <button key={t.key} className={`admin-msg-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setSelectedMsg(null); }}>
            {t.label}
            {t.badge > 0 && <span className="msg-unread-badge" style={{ marginLeft: 6 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <div className="msg-layout">
        {/* List */}
        <div className="msg-sidebar card">
          <div className="msg-sidebar-header">
            <span style={{ fontWeight: 600 }}>{tab === 'inbox' ? 'Messages from Admin' : 'Announcements'}</span>
            {(tab === 'inbox' ? unreadInbox : unreadBroadcast) > 0 && (
              <span className="msg-unread-badge">{tab === 'inbox' ? unreadInbox : unreadBroadcast}</span>
            )}
          </div>
          {msgList.length === 0 && (
            <div className="msg-empty">
              {tab === 'inbox' ? 'No messages from admin yet.' : 'No announcements yet.'}
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
                  {m.type === 'broadcast' && <span className="admin-msg-badge category" style={{ fontSize: '0.65rem', color: catColor(m.category) }}>{m.category}</span>}
                  {m.attachmentName && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}><FileText size={10} /> Doc</span>}
                  {m.replies.length > 0 && <span className="msg-reply-count">{m.replies.length} repl{m.replies.length > 1 ? 'ies' : 'y'}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Thread */}
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
                      <span className="admin-msg-badge broadcast" style={{ color: catColor(selectedMsg.category) }}>
                        📢 {selectedMsg.category}
                      </span>
                    )}
                    <span className="text-small text-muted">
                      From: Admin · {formatTime(selectedMsg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="msg-thread-body">
                <div className="msg-bubble admin">
                  <div className="msg-bubble-name">
                    {selectedMsg.type === 'broadcast' ? 'Admin (Broadcast)' : 'Admin'}
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

              {/* Only direct messages can be replied to */}
              {selectedMsg.type === 'direct' && (
                <form className="msg-reply-box" onSubmit={handleReply}>
                  <textarea className="form-textarea" rows={2}
                    placeholder="Write a reply to Admin…"
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
    </div>
  );
}


