import { useState } from 'react';
import useStore from '../../store/useStore';
import { FileText, MessageCircle } from 'lucide-react';

export function AdminBilling() {
  const { messages, markMessageRead, currentUser } = useStore();
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Filter messages that have isBilling flag
  const billingMsgs = messages.filter(m => m.isBilling === true);
  const unreadCount = billingMsgs.filter(m => !m.readBy.includes(currentUser.id)).length;

  const handleOpenMsg = (msg) => {
    setSelectedMsg(msg);
    markMessageRead(msg.id, currentUser.id);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Billing Documents</h1>
        {unreadCount > 0 && <span className="badge badge-primary">{unreadCount} New</span>}
      </div>

      <div className="msg-layout">
        <div className="msg-sidebar card">
          <div className="msg-sidebar-header">
            <span style={{ fontWeight: 600 }}>Received Billing Reports</span>
          </div>
          {billingMsgs.length === 0 && (
            <div className="msg-empty">
              No billing documents received yet.
            </div>
          )}
          {billingMsgs.map(m => {
            const isUnread = !m.readBy.includes(currentUser.id);
            return (
              <div key={m.id}
                className={`msg-item ${selectedMsg?.id === m.id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => handleOpenMsg(m)}>
                <div className="msg-item-top">
                  <span className="msg-subject">{m.subject}</span>
                  <span className="msg-time">{formatTime(m.timestamp)}</span>
                </div>
                <div className="msg-preview">
                  {m.body.substring(0, 60)}…
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {isUnread && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>New</span>}
                  {m.attachmentName && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}><FileText size={10} /> Doc</span>}
                  <span className="text-small text-muted" style={{ fontSize: '0.65rem' }}>From: {m.fromName}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="msg-main card">
          {!selectedMsg && (
            <div className="msg-placeholder">
              <FileText size={48} color="var(--text-tertiary)" />
              <p className="text-muted mt-2">Select a billing document to read</p>
            </div>
          )}

          {selectedMsg && (
            <div className="msg-thread">
              <div className="msg-thread-header">
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-small text-muted">
                      From: {selectedMsg.fromName} ({selectedMsg.fromRole}) · {formatTime(selectedMsg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="msg-thread-body">
                <div className="msg-bubble supervisor">
                  <div className="msg-bubble-name">{selectedMsg.fromName} ({selectedMsg.fromRole})</div>
                  <div className="msg-bubble-text" style={{ whiteSpace: 'pre-wrap' }}>{selectedMsg.body}</div>
                  {selectedMsg.attachmentName && (
                    <a href={selectedMsg.attachmentData} download={selectedMsg.attachmentName} className="msg-attachment mt-3">
                      <FileText size={14} /> {selectedMsg.attachmentName}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
