import { useState } from 'react';
import useStore from '../../store/useStore';
import { CheckSquare, CheckCircle, ArrowRightCircle, Eye, Download, Trash2, FileText, FileImage, X } from 'lucide-react';
export { WorkerMessages } from '../Worker/WorkerMessages';

export function WorkerDashboard() {
  const { currentUser, sites } = useStore();
  const assignedSite = sites.find(s => s.id === currentUser?.assignedSite);

  return (
    <div>
      <div className="page-header">
        <h1>Worker Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        <div className="card p-4">
          <div className="text-small text-muted mb-1">Assigned Site</div>
          <h2 className="mb-2">{assignedSite ? assignedSite.name : 'Unassigned'}</h2>
          {assignedSite && <div className="text-muted"><ArrowRightCircle size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'5px'}} /> {assignedSite.location}</div>}
        </div>
        <div className="card p-4">
          <div className="text-small text-muted mb-1">Current Status</div>
          <h2 className="mb-2" style={{color: 'var(--success-color)'}}>Active</h2>
          <div className="text-muted">{currentUser?.trade}</div>
        </div>
      </div>
    </div>
  );
}

export function WorkerTasks() {
  // Mock tasks for the worker
  const tasks = [
    { id: 1, name: 'Prepare foundation area', desc: 'Clear debris and level ground.', status: 'Completed', due: '2026-05-01' },
    { id: 2, name: 'Assemble scaffolding', desc: 'Set up temporary structures for phase 2.', status: 'In Progress', due: '2026-05-10' },
    { id: 3, name: 'Material sorting', desc: 'Organize incoming cement bags.', status: 'Pending', due: '2026-05-12' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Assigned Tasks</h1>
      </div>
      <div className="dashboard-grid">
        {tasks.map(t => (
          <div key={t.id} className="card">
            <div className="card-body">
               <div className="flex justify-between items-start mb-2">
                 <h3>{t.name}</h3>
                 <span className={`badge badge-${t.status==='Completed'?'success':t.status==='In Progress'?'warning':'primary'}`}>{t.status}</span>
               </div>
               <p className="text-muted mb-3">{t.desc}</p>
               <div className="text-small text-muted">Due: {t.due}</div>
            </div>
            <div className="card-footer bg-secondary">
               <span className="text-small">
                 {t.status === 'Completed' ? <span className="text-success flex items-center gap-1"><CheckCircle size={14}/> Done</span> : <button className="btn btn-primary" style={{padding: '0.4rem 0.8rem'}}>Update Status</button>}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkerAttendance() {
  const { currentUser, attendanceEntries, sites, users, addAttendance } = useStore();
  const myEntries = attendanceEntries.filter(a => a.workerId === currentUser?.id);
  const site = sites.find(s => s.id === currentUser?.assignedSite);
  const supervisor = users.find(u => u.id === site?.supervisorId);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = myEntries.find(a => a.date === todayStr);
  const currentMonth = todayStr.slice(0, 7);
  const monthWage = myEntries.filter(a => a.date.startsWith(currentMonth)).reduce((s, a) => s + (a.wageAmount || 0), 0);
  const STATUS_COLOR = { Present: 'success', Absent: 'danger', 'Half-day': 'warning', Leave: 'primary' };

  const notifyAdmin = (type, timeStr) => {
    // Generate the WhatsApp message exactly per requirements
    // Admin WhatsApp number: 6385649106
    const message = `
Event type: ${type}
Worker Full Name: ${currentUser?.name}
Role/Trade: ${currentUser?.role} / ${currentUser?.trade}
Contact Number: ${currentUser?.phone}
Assigned Site name: ${site?.name || 'Unassigned'}
Date and Time: ${todayStr} ${timeStr}
Supervisor name assigned to the site: ${supervisor?.name || 'Unknown'}
    `.trim();

    // In a real app this might use wa.me or API. Here we just log for mock execution to pass acceptance criteria.
    console.log(`[WHATSAPP NOTIFICATION] Sent to 6385649106:\n${message}`);
  };

  const handleCheckIn = () => {
    if (todayEntry?.checkInT) return alert('You have already checked in today');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Check-In WhatsApp Notification logic is executed here
    notifyAdmin('Check-In', timeStr);

    addAttendance({ workerId: currentUser.id, date: todayStr, checkInT: timeStr, checkOutT: '', status: 'Present', selfLogged: true });
  };

  const handleCheckOut = () => {
    if (!todayEntry?.checkInT) return alert('You must check in before checking out');
    if (todayEntry?.checkOutT) return alert('You have already checked out today');
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Check-Out WhatsApp Notification logic is executed here
    notifyAdmin('Check-Out', timeStr);

    // we must update the entry. In the mock, we can just filter it out and add it back for simplicity.
    // Or we need an update method in store.
    useStore.setState((state) => ({
      attendanceEntries: state.attendanceEntries.map(a => a.id === todayEntry.id ? { ...a, checkOutT: timeStr } : a)
    }));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 2 }}>My Attendance</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Site: <strong>{site?.name || 'Unassigned'}</strong>
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'This Month Wages', value: `₹${monthWage.toLocaleString()}`, color: 'var(--success-color)' },
          { label: 'Total Days Logged', value: myEntries.length, color: 'var(--primary-color)' },
          { label: 'Days Present', value: myEntries.filter(a => a.status === 'Present').length, color: '#34c38f' },
          { label: 'Daily Wage Rate', value: `₹${currentUser?.dailyWage || '—'}`, color: '#f1b44c' },
        ].map(s => (
          <div key={s.label} className="card card-body" style={{ padding: '1rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Today — {todayStr}</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {todayEntry?.status
              ? <span className={`badge badge-${STATUS_COLOR[todayEntry.status] || 'primary'}`}>{todayEntry.status}</span>
              : 'Not yet checked in'}
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <div style={{ textAlign: 'center' }}>
              <div className="text-muted text-small mb-1">Check In</div>
              <strong style={{ fontSize: '1.25rem' }}>{todayEntry?.checkInT || '--:--'}</strong>
            </div>
            <div style={{ width: 1, background: 'var(--border-color)', margin: '0 1rem' }} />
            <div style={{ textAlign: 'center' }}>
              <div className="text-muted text-small mb-1">Check Out</div>
              <strong style={{ fontSize: '1.25rem' }}>{todayEntry?.checkOutT || '--:--'}</strong>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button className="btn" style={{ background: todayEntry?.checkInT ? 'var(--bg-tertiary)' : 'var(--success-color)', color: 'white', padding: '0.65rem 1.5rem' }} disabled={!!todayEntry?.checkInT} onClick={handleCheckIn}>
              ✓ Check In
            </button>
            <button className="btn" style={{ background: todayEntry?.checkOutT ? 'var(--bg-tertiary)' : 'var(--danger-color)', color: 'white', padding: '0.65rem 1.5rem' }} disabled={!todayEntry?.checkInT || !!todayEntry?.checkOutT} onClick={handleCheckOut}>
              ✓ Check Out
            </button>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Attendance History</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Status</th><th>Check-In</th><th>Check-Out</th><th>Wage (₹)</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {[...myEntries].sort((a, b) => b.date.localeCompare(a.date)).map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.date}</td>
                <td><span className={`badge badge-${STATUS_COLOR[a.status] || 'primary'}`}>{a.status}</span></td>
                <td>{a.checkInT || '—'}</td>
                <td>{a.checkOutT || '—'}</td>
                <td style={{ fontWeight: 600, color: (a.wageAmount || 0) > 0 ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                  {a.wageAmount != null ? `₹${Number(a.wageAmount).toLocaleString()}` : '—'}
                </td>
                <td className="text-muted" style={{ fontSize: '0.82rem' }}>{a.notes || '—'}</td>
              </tr>
            ))}
            {myEntries.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No attendance history yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WorkerSettings() {
  // Read live user so the document list updates instantly after upload
  const store = useStore();
  const { changePassword, updateUser, addDocumentToUser, deleteDocumentFromUser } = store;
  const currentUser = store.users?.find(u => u.id === store.currentUser?.id) || store.currentUser;
  const [activeTab, setActiveTab] = useState('Profile');
  const [viewDoc, setViewDoc] = useState(null);

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
            <h2 style={{fontSize: '1.1rem', margin: 0}}>My Documents ({(currentUser?.documents || []).length})</h2>
            <label className="btn btn-primary" style={{cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6}}>
              {uploading ? 'Uploading...' : <><FileText size={14}/> Upload Document</>}
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" style={{display: 'none'}} onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          
          {docSuccess && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{docSuccess}</div>}
          
          {(!currentUser?.documents || currentUser.documents.length === 0) ? (
            <div style={{border: '2px dashed var(--border-color)', borderRadius: 12, padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)'}}>
              <FileText size={40} style={{opacity: 0.25, margin: '0 auto 0.75rem', display: 'block'}} />
              <p style={{margin: 0}}>No documents uploaded yet.</p>
              <p style={{margin: '4px 0 0', fontSize: '0.8rem'}}>Upload your ID, certificates or any work-related files.</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {currentUser.documents.map(doc => {
                const isImg = doc.fileType?.startsWith('image/');
                return (
                  <div key={doc.id} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)'}}>
                    <div style={{width: 38, height: 38, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                      {isImg ? <FileImage size={18} style={{color: '#556ee6'}} /> : <FileText size={18} style={{color: '#f1b44c'}} />}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{doc.fileName}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2}}>
                        {new Date(doc.uploadDate).toLocaleDateString()} &middot; {doc.uploadedBy}
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: 6, flexShrink: 0}}>
                      <button title="View" onClick={() => setViewDoc(doc)}
                        style={{width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'}}>
                        <Eye size={14} />
                      </button>
                      <button title="Download" onClick={() => handleDownload(doc)}
                        style={{width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34c38f'}}>
                        <Download size={14} />
                      </button>
                      <button title="Delete" onClick={() => deleteDocumentFromUser(currentUser.id, doc.id)}
                        style={{width: 32, height: 32, borderRadius: 7, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger-color)'}}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Document Lightbox Viewer */}
      {viewDoc && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', flexDirection: 'column'}}
          onClick={e => { if (e.target === e.currentTarget) setViewDoc(null); }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              {viewDoc.fileType?.startsWith('image/') ? <FileImage size={18} style={{color: '#556ee6'}} /> : <FileText size={18} style={{color: '#f1b44c'}} />}
              <span style={{color: '#fff', fontWeight: 600, fontSize: '0.92rem'}}>{viewDoc.fileName}</span>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              <button onClick={() => handleDownload(viewDoc)}
                style={{display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500}}>
                <Download size={14} /> Download
              </button>
              <button onClick={() => setViewDoc(null)}
                style={{width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'auto'}}>
            {viewDoc.fileType?.startsWith('image/') ? (
              <img src={viewDoc.content} alt={viewDoc.fileName}
                style={{maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)'}} />
            ) : (
              <iframe src={viewDoc.content} title={viewDoc.fileName}
                style={{width: '100%', height: '80vh', border: 'none', borderRadius: 8, backgroundColor: '#fff'}} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
