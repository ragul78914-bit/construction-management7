'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import {
  Eye, Download, Upload, Trash2, X, FileText, User, Phone,
  Mail, MapPin, Briefcase, Shield, ChevronRight, FileImage,
  Search, Lock
} from 'lucide-react';
import { fileToBase64 } from './AdminPages';

const roleColor = { Worker: '#556ee6', Supervisor: '#34c38f' };
const statusColor = { Active: '#34c38f', Inactive: '#f46a6a' };

function Avatar({ name, role, size = 52 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const bg = roleColor[role] || '#74788d';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${bg}22`, border: `2px solid ${bg}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.34, color: bg, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function DocIcon({ fileType }) {
  const isImg = fileType?.startsWith('image/');
  return isImg ? <FileImage size={18} style={{ color: '#556ee6' }} /> : <FileText size={18} style={{ color: '#f1b44c' }} />;
}

export function AdminContactDetails() {
  const { users, sites, addDocumentToUser, deleteDocumentFromUser } = useStore();
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null); // { type: 'success'|'error', text }
  const [viewDoc, setViewDoc] = useState(null);

  const filtered = users.filter(u => {
    if (u.role === 'Admin') return false;
    if (tab === 'Workers') return u.role === 'Worker';
    if (tab === 'Supervisors') return u.role === 'Supervisor';
    return true;
  }).filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));

  // Always read from live store so docs update immediately
  const activeUser = selected ? users.find(u => u.id === selected.id) : null;

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      for (const f of files) {
        const base64 = await fileToBase64(f);
        await addDocumentToUser(selected.id, {
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          fileName: f.name,
          fileType: f.type,
          uploadDate: new Date().toISOString(),
          uploadedBy: 'Admin',
          content: base64
        });
      }
      setUploadMsg({ type: 'success', text: `${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully` });
      setTimeout(() => setUploadMsg(null), 3500);
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Upload failed. Please try again.' });
      setTimeout(() => setUploadMsg(null), 4000);
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

  const handleView = (doc) => setViewDoc(doc);

  const getSiteName = (u) => {
    if (u.role === 'Worker') return sites.find(s => s.id === u.assignedSite)?.name || 'Unassigned';
    if (u.role === 'Supervisor') {
      const siteNames = (u.assignedSites || []).map(id => sites.find(s => s.id === id)?.name).filter(Boolean);
      return siteNames.length ? siteNames.join(', ') : 'Unassigned';
    }
    return '—';
  };

  return (
    <div style={{ animation: 'pageFadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, background: 'linear-gradient(135deg,#556ee6,#6f86ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
            Contact Details
          </h1>
          <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>View profiles, documents & info for all staff</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="form-input" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Workers', 'Supervisors'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '0.42rem 1rem', borderRadius: 20, border: `1.5px solid ${tab === t ? 'var(--primary-color)' : 'var(--border-color)'}`, background: tab === t ? 'var(--primary-color)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {filtered.map(u => {
          const docCount = (u.documents || []).length;
          const rc = roleColor[u.role] || '#74788d';
          return (
            <div key={u.id} className="card" onClick={() => setSelected(u)}
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', borderTop: `3px solid ${rc}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name={u.name} role={u.role} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ fontSize: '0.78rem', color: rc, fontWeight: 600 }}>{u.role}{u.trade ? ` · ${u.trade}` : ''}</div>
                </div>
                <span style={{ padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: `${statusColor[u.status] || '#74788d'}18`, color: statusColor[u.status] || '#74788d' }}>
                  {u.status || 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Phone size={13} /> {u.phone || '—'}</div>
                {u.email && <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Mail size={13} /> {u.email}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><MapPin size={13} /> {getSiteName(u)}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <FileText size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {docCount} document{docCount !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  View Profile <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <User size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.25, display: 'block' }} />
            No staff found
          </div>
        )}
      </div>

      {/* Profile Panel Modal */}
      {selected && activeUser && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(6px)', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 18, width: '100%', maxWidth: 720, margin: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden', animation: 'modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, background: `linear-gradient(135deg, ${roleColor[activeUser.role]}10, transparent)` }}>
              <Avatar name={activeUser.name} role={activeUser.role} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{activeUser.name}</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: roleColor[activeUser.role] || 'var(--text-secondary)', fontWeight: 600 }}>
                  {activeUser.role}{activeUser.trade ? ` · ${activeUser.trade}` : ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>
                <X size={17} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)', gap: 0 }}>

                {/* Left: Info */}
                <div style={{ padding: '1.5rem', borderRight: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 700 }}>Profile Info</h3>
                  {[
                    { icon: <Shield size={14} />, label: 'Role', val: activeUser.role },
                    { icon: <Phone size={14} />, label: 'Phone', val: activeUser.phone || '—' },
                    { icon: <Mail size={14} />, label: 'Email', val: activeUser.email || '—' },
                    { icon: <Lock size={14} />, label: 'Status', val: <span style={{ color: statusColor[activeUser.status] || '#74788d', fontWeight: 600 }}>{activeUser.status || 'Active'}</span> },
                    { icon: <MapPin size={14} />, label: 'Site', val: getSiteName(activeUser) },
                    ...(activeUser.role === 'Worker' ? [
                      { icon: <Briefcase size={14} />, label: 'Trade', val: activeUser.trade || '—' },
                      { icon: <span style={{ fontSize: 12, fontWeight: 700 }}>₹</span>, label: 'Daily Wage', val: activeUser.dailyWage ? `₹${activeUser.dailyWage}/day` : '—' },
                    ] : []),
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500, marginTop: 1 }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Documents */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                      Documents ({(activeUser.documents || []).length})
                    </h3>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem', borderRadius: 8, border: `1.5px solid ${uploading ? 'var(--border-color)' : 'var(--primary-color)'}`, color: uploading ? 'var(--text-tertiary)' : 'var(--primary-color)', fontWeight: 600, fontSize: '0.8rem', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', opacity: uploading ? 0.6 : 1 }}
                      onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <Upload size={13} /> {uploading ? 'Uploading…' : 'Upload'}
                      <input type="file" multiple style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>
                  {uploadMsg && (
                    <div style={{ marginBottom: 12, padding: '0.6rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500, background: uploadMsg.type === 'success' ? 'rgba(52,195,143,0.12)' : 'rgba(244,106,106,0.1)', color: uploadMsg.type === 'success' ? '#34c38f' : 'var(--danger-color)', border: `1px solid ${uploadMsg.type === 'success' ? 'rgba(52,195,143,0.3)' : 'rgba(244,106,106,0.3)'}` }}>
                      {uploadMsg.type === 'success' ? '✓ ' : '✗ '}{uploadMsg.text}
                    </div>
                  )}

                  {(!activeUser.documents || activeUser.documents.length === 0) ? (
                    <div style={{ border: '2px dashed var(--border-color)', borderRadius: 12, padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <FileText size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.3 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {activeUser.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', transition: 'box-shadow 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DocIcon fileType={doc.fileType} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</div>
                            <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', marginTop: 1 }}>
                              {new Date(doc.uploadDate).toLocaleDateString()} · by {doc.uploadedBy}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button title="View" onClick={() => handleView(doc)}
                              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', transition: 'all 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <Eye size={14} />
                            </button>
                            <button title="Download" onClick={() => handleDownload(doc)}
                              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34c38f', transition: 'all 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,195,143,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <Download size={14} />
                            </button>
                            <button title="Delete" onClick={() => deleteDocumentFromUser(activeUser.id, doc.id)}
                              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)', transition: 'all 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,106,106,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Lightbox */}
      {viewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
          onClick={e => { if (e.target === e.currentTarget) setViewDoc(null); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DocIcon fileType={viewDoc.fileType} />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>{viewDoc.fileName}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(viewDoc)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                <Download size={14} /> Download
              </button>
              <button onClick={() => setViewDoc(null)}
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'auto' }}>
            {viewDoc.fileType?.startsWith('image/') ? (
              <img src={viewDoc.content} alt={viewDoc.fileName}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
            ) : (
              <iframe src={viewDoc.content} title={viewDoc.fileName}
                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:none} }
        @media (max-width: 600px) {
          .contact-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export function AdminChangePassword() {
  const [currentP, setCurrentP] = useState('');
  const [newP, setNewP] = useState('');
  const [confirmP, setConfirmP] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser, changePassword } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newP !== confirmP) return setError('Passwords do not match');
    if (newP.length < 8) return setError('Password must be at least 8 characters');
    const res = changePassword(currentUser.id, currentP, newP);
    if (res.success) {
      setSuccess('Your password has been changed successfully.');
      setCurrentP(''); setNewP(''); setConfirmP('');
    } else setError(res.error);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div className="page-header"><h1>Change Password</h1></div>
      {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}
      {success && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{success}</div>}
      <form onSubmit={handleSubmit} className="card p-4 card-body">
        <div className="form-group"><label className="form-label">Current Password</label><input type="password" required className="form-input" value={currentP} onChange={e => setCurrentP(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">New Password</label><input type="password" required className="form-input" value={newP} onChange={e => setNewP(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" required className="form-input" value={confirmP} onChange={e => setConfirmP(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary mt-2">Update Password</button>
      </form>
    </div>
  );
}


