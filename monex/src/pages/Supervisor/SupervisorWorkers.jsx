import { useState } from 'react';
import useStore from '../../store/useStore';
import { UserPlus, UserCheck, Trash2, X, Clock, DollarSign, File as FileIcon } from 'lucide-react';
import { fileToBase64 } from '../Admin/AdminPages';

export function SupervisorWorkers() {
  const { currentUser, users, sites, addUser, updateUser, assignWorkerToSite, addWageEntry, addAttendance, attendanceEntries, wageEntries } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  const myAssignedSiteIds = assignedSites.map(s => s.id);
  
  const siteWorkers = users.filter(u => u.role === 'Worker' && myAssignedSiteIds.includes(u.assignedSite));
  const otherWorkers = users.filter(u => u.role === 'Worker' && !myAssignedSiteIds.includes(u.assignedSite));

  const [activeTab, setActiveTab] = useState('Workers');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);

  const defaultSiteId = assignedSites.length === 1 ? assignedSites[0].id : '';

  const [createData, setCreateData] = useState({
    name: '', trade: '', phone: '', email: '', password: '', assignedSite: defaultSiteId, dailyWage: 0, documents: []
  });
  
  const [assignData, setAssignData] = useState({ workerId: '', assignedSite: defaultSiteId });
  const [wageData, setWageData] = useState({ workerId: '', date: '', amount: 0, notes: '' });
  const [attData, setAttData] = useState({ workerId: '', date: '', checkInT: '', checkOutT: '', status: 'Present' });

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    const valid = await Promise.all(files.map(async f => ({
      id: `doc_${Date.now()}_${Math.random()}`,
      fileName: f.name,
      fileType: f.type,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Supervisor',
      content: await fileToBase64(f)
    })));
    setCreateData(prev => ({ ...prev, documents: [...prev.documents, ...valid] }));
  };

  const handleCreateWorker = (e) => {
    e.preventDefault();
    if (!createData.assignedSite) return alert('Please select an assigned site for this worker');
    addUser({ ...createData, role: 'Worker', status: 'Active' });
    setShowCreateModal(false);
  };

  const handleAssignWorker = (e) => {
    e.preventDefault();
    if (!assignData.assignedSite) return alert('Please select an assigned site for this worker');
    const worker = users.find(u => u.id === assignData.workerId);
    if (worker && worker.assignedSite && worker.assignedSite !== 'unassigned') {
      if (!window.confirm('This worker is currently assigned to another site. Reassigning will remove them from their current site. Continue?')) return;
    }
    assignWorkerToSite(assignData.workerId, assignData.assignedSite);
    setShowAssignModal(false);
  };

  const handleWageSubmit = (e) => {
    e.preventDefault();
    addWageEntry({ ...wageData });
    setShowWageModal(false);
  };

  const handleAttSubmit = (e) => {
    e.preventDefault();
    addAttendance({ ...attData });
    setShowAttModal(false);
  };

  const myAttEntries = attendanceEntries.filter(a => siteWorkers.find(w => w.id === a.workerId));
  const myWageEntries = wageEntries.filter(w => siteWorkers.find(wk => wk.id === w.workerId));

  if (assignedSites.length === 0) {
    return <div><div className="page-header"><h1>Workers List</h1></div><div className="toast error" style={{position:'static'}}>You must be assigned to a site before adding workers</div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Workers Management</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><UserPlus size={18}/> Add / Create Worker</button>
          <button className="btn btn-secondary" onClick={() => setShowAssignModal(true)}><UserCheck size={18}/> Assign Existing</button>
        </div>
      </div>

      <div className="tabs">
        {['Workers', 'Attendance', 'Daily Wages'].map(t => (
          <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</div>
        ))}
      </div>

      {activeTab === 'Workers' && (
        <div className="table-container pt-2">
          <table className="table">
            <thead><tr><th>Name</th><th>Role/Trade</th><th>Contact</th><th>Site</th><th>Daily Wage</th><th>Status</th></tr></thead>
            <tbody>
              {siteWorkers.map(w => (
                <tr key={w.id}>
                  <td><strong>{w.name}</strong></td>
                  <td>{w.trade}</td>
                  <td>{w.phone || w.email}</td>
                  <td>{sites.find(s => s.id === w.assignedSite)?.name}</td>
                  <td>${w.dailyWage || 0}/day</td>
                  <td><span className={`badge badge-${w.status==='Active'?'success':'danger'}`}>{w.status}</span></td>
                </tr>
              ))}
              {siteWorkers.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No workers assigned to your site(s) yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="animate-fade-in pt-2">
          <div className="mb-3 flex justify-end">
            <button className="btn btn-primary" onClick={() => setShowAttModal(true)}><Clock size={16}/> Record Attendance</button>
          </div>
          <div className="table-container">
             <table className="table">
               <thead><tr><th>Date</th><th>Worker</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
               <tbody>
                 {myAttEntries.map(a => (
                   <tr key={a.id}>
                     <td>{a.date}</td>
                     <td>{users.find(u => u.id === a.workerId)?.name}</td>
                     <td>{a.checkInT || '-'}</td>
                     <td>{a.checkOutT || '-'}</td>
                     <td>{a.status}</td>
                   </tr>
                 ))}
                 {myAttEntries.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No attendance recorded</td></tr>}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {activeTab === 'Daily Wages' && (
        <div className="animate-fade-in pt-2">
          <div className="mb-3 flex justify-end">
            <button className="btn btn-primary" onClick={() => setShowWageModal(true)}><DollarSign size={16}/> Record Wage</button>
          </div>
          <div className="table-container">
             <table className="table">
               <thead><tr><th>Date</th><th>Worker</th><th>Amount</th><th>Notes</th></tr></thead>
               <tbody>
                 {myWageEntries.map(w => (
                   <tr key={w.id}>
                     <td>{w.date}</td>
                     <td>{users.find(u => u.id === w.workerId)?.name}</td>
                     <td>${w.amount}</td>
                     <td>{w.notes}</td>
                   </tr>
                 ))}
                 {myWageEntries.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No wages recorded</td></tr>}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Modals... */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content"><div className="modal-header"><h2>Create Worker Account</h2><button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20}/></button></div>
          <div className="modal-body">
            <form id="wCForm" onSubmit={handleCreateWorker}>
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" required value={createData.name} onChange={e=>setCreateData({...createData, name: e.target.value})}/></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Role/Trade</label><input type="text" className="form-input" required value={createData.trade} onChange={e=>setCreateData({...createData, trade: e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Daily Wage</label><input type="number" min="1" className="form-input" required value={createData.dailyWage} onChange={e=>setCreateData({...createData, dailyWage: Number(e.target.value)})}/></div>
              </div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Phone Number / Email</label><input type="text" className="form-input" required value={createData.phone} onChange={e=>setCreateData({...createData, phone: e.target.value})}/></div>
                <div className="form-group"><label className="form-label">Initial Password</label><input type="password" minLength={8} className="form-input" required value={createData.password} onChange={e=>setCreateData({...createData, password: e.target.value})}/></div>
              </div>
              <div className="form-group"><label className="form-label">Assigned Site</label>
                 {assignedSites.length === 1 ? (
                   <input type="text" readOnly className="form-input bg-tertiary" value={assignedSites[0].name} />
                 ) : (
                   <select className="form-select" required value={createData.assignedSite} onChange={e=>setCreateData({...createData, assignedSite: e.target.value})}>
                     <option value="">Select Site</option>
                     {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                 )}
              </div>
              <div className="form-group"><label className="form-label flex items-center gap-2"><FileIcon size={16}/> Upload Documents (Worker docs, admin view only)</label>
                <input type="file" multiple className="form-input" onChange={handleDocUpload} />
                {createData.documents.length > 0 && <div className="text-small text-muted mt-1">{createData.documents.length} files attached</div>}
              </div>
            </form>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowCreateModal(false)}>Cancel</button><button form="wCForm" className="btn btn-primary" type="submit">Create</button></div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content"><div className="modal-header"><h2>Assign Existing Worker</h2><button className="close-btn" onClick={() => setShowAssignModal(false)}><X size={20}/></button></div>
          <div className="modal-body">
            <form id="wAForm" onSubmit={handleAssignWorker}>
              <div className="form-group"><label className="form-label">Worker</label>
                <select className="form-select" required value={assignData.workerId} onChange={e=>setAssignData({...assignData, workerId: e.target.value})}>
                  <option value="">Select Worker</option>
                  {otherWorkers.map(w => <option key={w.id} value={w.id}>{w.name} - {w.trade}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Assigned Site</label>
                 {assignedSites.length === 1 ? (
                   <input type="text" readOnly className="form-input bg-tertiary" value={assignedSites[0].name} />
                 ) : (
                   <select className="form-select" required value={assignData.assignedSite} onChange={e=>setAssignData({...assignData, assignedSite: e.target.value})}>
                     <option value="">Select Site</option>
                     {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                 )}
              </div>
            </form>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowAssignModal(false)}>Cancel</button><button form="wAForm" className="btn btn-primary" type="submit">Assign</button></div>
          </div>
        </div>
      )}

      {showWageModal && (
        <div className="modal-overlay">
          <div className="modal-content"><div className="modal-header"><h2>Record Wage</h2><button className="close-btn" onClick={() => setShowWageModal(false)}><X size={20}/></button></div>
          <div className="modal-body">
            <form id="wgForm" onSubmit={handleWageSubmit}>
              <div className="form-group"><label className="form-label">Worker</label>
                <select className="form-select" required value={wageData.workerId} onChange={e=>setWageData({...wageData, workerId: e.target.value})}>
                  <option value="">Select Worker</option>
                  {siteWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Date</label><input type="date" required className="form-input" value={wageData.date} onChange={e=>setWageData({...wageData, date: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Amount</label><input type="number" min="1" required className="form-input" value={wageData.amount} onChange={e=>setWageData({...wageData, amount: Number(e.target.value)})} /></div>
              <div className="form-group"><label className="form-label">Notes</label><input type="text" className="form-input" value={wageData.notes} onChange={e=>setWageData({...wageData, notes: e.target.value})} /></div>
            </form>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowWageModal(false)}>Cancel</button><button form="wgForm" className="btn btn-primary" type="submit">Save</button></div>
          </div>
        </div>
      )}

      {showAttModal && (
        <div className="modal-overlay">
          <div className="modal-content"><div className="modal-header"><h2>Record Attendance</h2><button className="close-btn" onClick={() => setShowAttModal(false)}><X size={20}/></button></div>
          <div className="modal-body">
            <form id="atForm" onSubmit={handleAttSubmit}>
              <div className="form-group"><label className="form-label">Worker</label>
                <select className="form-select" required value={attData.workerId} onChange={e=>setAttData({...attData, workerId: e.target.value})}>
                  <option value="">Select Worker</option>
                  {siteWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Date</label><input type="date" required className="form-input" value={attData.date} onChange={e=>setAttData({...attData, date: e.target.value})} /></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Check-In</label><input type="time" required className="form-input" value={attData.checkInT} onChange={e=>setAttData({...attData, checkInT: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Check-Out</label><input type="time" className="form-input" value={attData.checkOutT} onChange={e=>setAttData({...attData, checkOutT: e.target.value})} /></div>
              </div>
            </form>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowAttModal(false)}>Cancel</button><button form="atForm" className="btn btn-primary" type="submit">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
