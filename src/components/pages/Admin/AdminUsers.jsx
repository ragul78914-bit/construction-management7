'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { HardHat, Users, Plus, Trash2, X, File as FileIcon, UserX } from 'lucide-react';
import { fileToBase64 } from './AdminPages';

export function AdminWorkers() {
  const { users, sites, addUser, updateUser, deleteUser } = useStore();
  const workers = users.filter(u => u.role === 'Worker');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: 'Worker', trade: '', phone: '', email: '', password: '', assignedSite: '', status: 'Active', documents: [], dailyWage: 0
  });
  const [docUser, setDocUser] = useState(null);

  const handleDeleteWorker = (worker) => {
    deleteUser(worker.id);
    setDeleteConfirm(null);
  };

  const updateUserRole = (userId, newRole) => {
    useStore.getState().updateUser(userId, { role: newRole });
  };

  const handleUploadUserDoc = async (e, userId) => {
    const files = Array.from(e.target.files);
    const valid = await Promise.all(files.map(async f => {
      const base64 = await fileToBase64(f);
      const id = `doc_${Date.now()}_${Math.random()}`;
      return {
        id,
        fileName: f.name,
        fileType: f.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Admin',
        content: base64
      };
    }));
    const targetUser = users.find(u => u.id === userId);
    useStore.getState().updateUser(userId, { documents: [...(targetUser.documents || []), ...valid] });
    setDocUser(useStore.getState().users.find(u => u.id === userId)); // Refresh modal
  };

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = await Promise.all(files.map(async f => {
      const base64 = await fileToBase64(f);
      const id = `doc_${Date.now()}_${Math.random()}`;

      return {
        id,
        fileName: f.name,
        fileType: f.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Admin',
        content: base64
      };
    }));
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...valid] }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addUser({ ...formData });
    setShowModal(false);
    setFormData({ name: '', role: 'Worker', trade: '', phone: '', email: '', password: '', assignedSite: '', status: 'Active', documents: [], dailyWage: 0 });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Workers Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Worker</button>
      </div>

      <div className="table-container pt-2">
        <table className="table">
          <thead><tr><th>Name</th><th>Trade</th><th>Contact</th><th>Site</th><th>Status</th><th>Manage</th></tr></thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id}>
                <td><strong>{w.name}</strong></td>
                <td>{w.trade}</td>
                <td>{w.phone}</td>
                <td>{sites.find(s => s.id === w.assignedSite)?.name || 'Unassigned'}</td>
                <td><span className={`badge badge-${w.status==='Active'?'success':'danger'}`}>{w.status}</span></td>
                <td>
                  <div className="flex gap-1 items-center" style={{ flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ padding: '0.2rem 1.5rem 0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }} value={w.role} onChange={(e) => updateUserRole(w.id, e.target.value)}>
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Worker">Worker</option>
                    </select>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setDocUser(w)}>Docs</button>
                    <button title="Delete Worker" onClick={() => setDeleteConfirm(w)}
                      style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--danger-color)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--danger-color)' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {workers.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No workers found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay larkon-modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="larkon-modal-content" style={{ maxWidth: '800px' }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{ flexShrink:0 }}><h2>Add New Worker</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20}/></button></div>
            <div className="modal-body" style={{ overflowY:'auto', flex:1, minHeight:0, padding: '2rem' }}>
              <form id="wForm" onSubmit={handleAdd}>
                <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Role/Trade</label><input type="text" className="form-input" required value={formData.trade} onChange={e=>setFormData({...formData, trade: e.target.value})} /></div>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">Phone Number</label><input type="text" className="form-input" required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Email Address (Optional)</label><input type="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">Password</label><input type="password" minLength={8} className="form-input" required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Assigned Site</label>
                  <select className="form-select" required value={formData.assignedSite} onChange={e=>setFormData({...formData, assignedSite: e.target.value})}>
                      <option value="">Select Site</option>
                      {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Daily Wage (₹)</label>
                  <input type="number" className="form-input" min={0} required value={formData.dailyWage || ''} onChange={e=>setFormData({...formData, dailyWage: Number(e.target.value)})} />
                </div>
                <div className="form-group"><label className="form-label flex items-center gap-2"><FileIcon size={16}/> Upload Documents (Admin only)</label>
                  <input type="file" multiple className="form-input" onChange={handleDocUpload} />
                  {formData.documents.length > 0 && <div className="text-small text-muted mt-1">{formData.documents.length} files attached</div>}
                </div>
              </form>
            </div>
            <div className="modal-footer" style={{ flexShrink:0, padding: '1.5rem 2rem' }}><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button form="wForm" className="btn btn-primary" type="submit">Add Worker</button></div>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" style={{ backdropFilter:'blur(4px)' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:'var(--bg-secondary)', borderRadius:16, width:'100%', maxWidth:380, margin:'auto', padding:'2rem', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(244,106,106,0.1)', color:'var(--danger-color)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}><Trash2 size={26}/></div>
            <h2 style={{ margin:'0 0 0.5rem', fontSize:'1.1rem', fontWeight:700 }}>Delete Worker?</h2>
            <p style={{ margin:'0 0 1.5rem', color:'var(--text-secondary)', fontSize:'0.88rem' }}>This will permanently remove <strong>{deleteConfirm.name}</strong> from the application. This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'1px solid var(--border-color)', background:'transparent', cursor:'pointer', fontWeight:600, color:'var(--text-primary)' }}>Cancel</button>
              <button onClick={() => handleDeleteWorker(deleteConfirm)} style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'none', background:'var(--danger-color)', color:'white', cursor:'pointer', fontWeight:600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {docUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Documents: {docUser.name}</h2>
              <button className="close-btn" onClick={() => setDocUser(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <label className="form-label mb-2 flex items-center gap-2"><FileIcon size={16}/> Upload New Document</label>
                <input type="file" multiple className="form-input" onChange={(e) => handleUploadUserDoc(e, docUser.id)} />
              </div>
              <h4>Uploaded Files</h4>
              <ul className="mt-2" style={{listStyle: 'none', padding: 0}}>
                {docUser.documents?.length > 0 ? docUser.documents.map(d => (
                  <li key={d.id} className="p-2 bg-tertiary mb-2 border-rounded text-small flex justify-between">
                    <span>{d.fileName}</span> <span className="text-muted">{new Date(d.uploadDate).toLocaleDateString()}</span>
                  </li>
                )) : <li className="text-muted text-small">No documents found.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSupervisors() {
  const { users, sites, addUser, promoteToAdmin, updateUser, deleteUser } = useStore();
  const supervisors = users.filter(u => u.role === 'Supervisor');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: 'Supervisor', phone: '', email: '', password: '', assignedSites: [], status: 'Active', documents: []
  });
  const [docUser, setDocUser] = useState(null);

  const handleDeleteSupervisor = (sup) => {
    deleteUser(sup.id);
    setDeleteConfirm(null);
  };

  const updateUserRole = (userId, newRole) => {
    useStore.getState().updateUser(userId, { role: newRole });
  };

  const handleUploadUserDoc = async (e, userId) => {
    const files = Array.from(e.target.files);
    const valid = await Promise.all(files.map(async f => {
      const base64 = await fileToBase64(f);
      const id = `doc_${Date.now()}_${Math.random()}`;
      return {
        id,
        fileName: f.name,
        fileType: f.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Admin',
        content: base64
      };
    }));
    const targetUser = users.find(u => u.id === userId);
    useStore.getState().updateUser(userId, { documents: [...(targetUser.documents || []), ...valid] });
    setDocUser(useStore.getState().users.find(u => u.id === userId)); // Refresh modal
  };

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = await Promise.all(files.map(async f => {
      const base64 = await fileToBase64(f);
      const id = `doc_${Date.now()}_${Math.random()}`;

      return {
        id,
        fileName: f.name,
        fileType: f.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Admin',
        content: base64
      };
    }));
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...valid] }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addUser({ ...formData });
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Supervisors Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Supervisor</button>
      </div>

      <div className="table-container pt-2">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Manage</th></tr></thead>
          <tbody>
            {supervisors.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td><span className={`badge badge-${s.status==='Active'?'success':'danger'}`}>{s.status}</span></td>
                <td>
                  <div className="flex gap-1 items-center" style={{ flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ padding: '0.2rem 1.5rem 0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }} value={s.role} onChange={(e) => updateUserRole(s.id, e.target.value)}>
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Worker">Worker</option>
                    </select>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setDocUser(s)}>Docs</button>
                    <button title="Delete Supervisor" onClick={() => setDeleteConfirm(s)}
                      style={{ width:30, height:30, borderRadius:6, border:'1px solid var(--danger-color)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--danger-color)' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {supervisors.length === 0 && <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>No supervisors found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay larkon-modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="larkon-modal-content" style={{ maxWidth: '800px' }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{ flexShrink:0 }}><h2>Add New Supervisor</h2><button className="close-btn" onClick={() => setShowModal(false)}><X size={20}/></button></div>
            <div className="modal-body" style={{ overflowY:'auto', flex:1, minHeight:0, padding: '2rem' }}>
              <form id="sForm" onSubmit={handleAdd}>
                <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
                <div className="form-grid-2">
                   <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
                   <div className="form-group"><label className="form-label">Phone Number</label><input type="text" className="form-input" required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Password</label><input type="password" minLength={8} className="form-input" required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} /></div>
                <div className="form-group"><label className="form-label flex items-center gap-2"><FileIcon size={16}/> Upload Documents (Admin only)</label>
                  <input type="file" multiple className="form-input" onChange={handleDocUpload} />
                  {formData.documents.length > 0 && <div className="text-small text-muted mt-1">{formData.documents.length} files attached</div>}
                </div>
              </form>
            </div>
            <div className="modal-footer" style={{ flexShrink:0, padding: '1.5rem 2rem' }}><button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button><button form="sForm" className="btn btn-primary" type="submit">Add Supervisor</button></div>
          </div>
        </div>
      )}

      {/* Deactivate Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" style={{ backdropFilter:'blur(4px)' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:'var(--bg-secondary)', borderRadius:16, width:'100%', maxWidth:380, margin:'auto', padding:'2rem', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.18)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(244,106,106,0.1)', color:'var(--danger-color)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}><Trash2 size={26}/></div>
            <h2 style={{ margin:'0 0 0.5rem', fontSize:'1.1rem', fontWeight:700 }}>Delete Supervisor?</h2>
            <p style={{ margin:'0 0 1.5rem', color:'var(--text-secondary)', fontSize:'0.88rem' }}>This will permanently remove <strong>{deleteConfirm.name}</strong> from the application. This action cannot be undone.</p>
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'1px solid var(--border-color)', background:'transparent', cursor:'pointer', fontWeight:600, color:'var(--text-primary)' }}>Cancel</button>
              <button onClick={() => handleDeleteSupervisor(deleteConfirm)} style={{ flex:1, padding:'0.7rem', borderRadius:10, border:'none', background:'var(--danger-color)', color:'white', cursor:'pointer', fontWeight:600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {docUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Documents: {docUser.name}</h2>
              <button className="close-btn" onClick={() => setDocUser(null)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <label className="form-label mb-2 flex items-center gap-2"><FileIcon size={16}/> Upload New Document</label>
                <input type="file" multiple className="form-input" onChange={(e) => handleUploadUserDoc(e, docUser.id)} />
              </div>
              <h4>Uploaded Files</h4>
              <ul className="mt-2" style={{listStyle: 'none', padding: 0}}>
                {docUser.documents?.length > 0 ? docUser.documents.map(d => (
                  <li key={d.id} className="p-2 bg-tertiary mb-2 border-rounded text-small flex justify-between">
                    <span>{d.fileName}</span> <span className="text-muted">{new Date(d.uploadDate).toLocaleDateString()}</span>
                  </li>
                )) : <li className="text-muted text-small">No documents found.</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


