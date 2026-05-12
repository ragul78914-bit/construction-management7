'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import useStore from '@/store/useStore';
import { ArrowLeft, Map, Image as ImageIcon, Plus, Trash2, Edit2, X, Navigation, Eye, Download } from 'lucide-react';
import { fileToBase64 } from './AdminPages'; // reusing the helper

export function AdminSiteDetail() {
  const { id } = useParams();
  const { sites, materials, spendRecords, users, updateSite, addSpend, deleteSpend, addMaterial, updateUser, addUser } = useStore();
  const site = sites.find(s => s.id === id);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [spendForm, setSpendForm] = useState({ description: '', amount: 0, date: '' });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [showAssignWorkerModal, setShowAssignWorkerModal] = useState(false);
  const [workerIdsToAssign, setWorkerIdsToAssign] = useState([]);
  const [workerSearch, setWorkerSearch] = useState('');
  
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: '', role: 'Worker', trade: '', phone: '', email: '', password: '', assignedSite: site.id, status: 'Active', documents: [], dailyWage: 0
  });
  if (!site) return <div>Site not found</div>;

  const siteSpend = spendRecords.filter(sp => sp.siteId === site.id);
  const totalSpend = siteSpend.reduce((sum, sp) => sum + sp.amount, 0);
  const remainingBalance = site.totalBudget - totalSpend;

  const siteMaterials = materials.filter(m => m.siteId === site.id);
  const siteWorkers = users.filter(u => u.role === 'Worker' && u.assignedSite === site.id);
  const siteSupervisors = users.filter(u => u.role === 'Supervisor' && (u.assignedSites?.includes(site.id) || u.assignedSite === site.id || u.id === site.supervisorId));
  const allSupervisors = users.filter(u => u.role === 'Supervisor');

  const handleDownload = (e, d) => {
    e.preventDefault();
    const a = document.createElement('a');
    a.href = d.content;
    a.download = d.fileName || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleView = (e, d) => {
    e.preventDefault();
    setViewDoc(d);
  };

  const handleAddSpend = (e) => {
    e.preventDefault();
    addSpend({ ...spendForm, siteId: site.id, recordedBy: 'Admin' });
    setShowSpendModal(false);
  };

  const openEditModal = () => {
    setEditForm({
      name: site.name,
      location: site.location,
      status: site.status,
      startDate: site.startDate,
      endDate: site.endDate || '',
      supervisorId: site.supervisorId || '',
      advanceAmount: site.advanceAmount,
      totalBudget: site.totalBudget,
      image: site.image || null,
      mapImage: site.mapImage || null,
      clientName: site.client?.name || '',
      clientPhone: site.client?.phone || '',
      siteDocs: site.documents || [],
    });
    setShowEditModal(true);
  };

  const handleEditSiteDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploadingDoc(true);
    try {
      const newDocs = await Promise.all(files.map(async f => {
         const base64 = await fileToBase64(f);
         const id = `doc_${Date.now()}_${Math.random()}`;
         
         return {
             id,
             fileName: f.name,
             fileType: f.type,
             uploadDate: new Date().toISOString(),
             uploadedBy: 'Admin',
             content: base64
         }
      }));
      setEditForm(prev => ({ ...prev, siteDocs: [...(prev.siteDocs || []), ...newDocs] }));
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleEditSite = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const { clientName, clientPhone, siteDocs, ...siteInfo } = editForm;
      updateSite(site.id, {
        ...siteInfo,
        documents: siteDocs || [],
        client: {
          ...(site.client || {}),
          name: clientName,
          phone: clientPhone
        }
      });
      setSaving(false);
      setShowEditModal(false);
    }, 600);
  };

  const handleEditImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload a valid image file.');
    const base64 = await fileToBase64(file);
    setEditForm(prev => ({ ...prev, [field]: base64 }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const address = data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
          setEditForm(prev => ({ ...prev, location: address }));
        } catch (error) {
          setEditForm(prev => ({ ...prev, location: `${lat.toFixed(6)}, ${lon.toFixed(6)}` }));
        }
        setGettingLocation(false);
      },
      (error) => {
        alert('Unable to retrieve your location.');
        setGettingLocation(false);
      }
    );
  };

  const handleExportBilling = () => {
    alert('Billing report exported to Google Sheets (Mocked)');
  };

  return (
    <div>
      <div className="mb-3">
        <Link to="/admin/sites" className="flex items-center text-muted" style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Sites
        </Link>
      </div>

      {/* Overview Header */}
      <div className="card mb-4">
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ height: '300px', backgroundColor: 'var(--bg-tertiary)', position: 'relative' }}>
             {site.image ? <img src={site.image} alt="Site" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="flex items-center justify-center" style={{ height: '100%' }}><ImageIcon size={48} color="var(--text-secondary)" /></div>}
             <div className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Site Image</div>
          </div>
          <div style={{ height: '300px', backgroundColor: 'var(--bg-tertiary)', position: 'relative', borderLeft: '1px solid var(--border-color)' }}>
             {site.mapImage ? <img src={site.mapImage} alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="flex items-center justify-center" style={{ height: '100%' }}><Map size={48} color="var(--text-secondary)" /></div>}
             <div className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Map Location</div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex justify-between items-center mb-3">
            <h2>{site.name}</h2>
            <div className="flex gap-2 items-center">
              <span className={`badge badge-${site.status === 'Active' ? 'success' : 'warning'}`}>{site.status}</span>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={openEditModal}>
                <Edit2 size={14} /> Edit Site
              </button>
            </div>
          </div>
          <p className="text-muted">{site.location}</p>
          <div className="mt-4 flex gap-4 text-small">
            <div><span className="text-muted">Start Date:</span> {site.startDate}</div>
            <div><span className="text-muted">End Date:</span> {site.endDate || 'Not set'}</div>
          </div>
        </div>
        <div className="card-footer flex justify-between bg-darker">
          <div className="text-center">
            <div className="text-small text-muted">Advance Amount</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>${site.advanceAmount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-small text-muted">Total Spend</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger-color)' }}>${totalSpend.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-small text-muted">Remaining Balance</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success-color)' }}>${remainingBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="tabs">
        {['Overview', 'Documents', 'Materials', 'Workers', 'Supervisors', 'Financials', 'Billing Report', 'Client'].map(tab => (
          <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 'Financials' && (
        <div className="animate-fade-in mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3>Spend Records</h3>
            <button className="btn btn-primary" onClick={() => setShowSpendModal(true)}><Plus size={16}/> Add Spend</button>
          </div>
          <div className="table-container bg-secondary border-rounded">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Recorded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {siteSpend.map(sp => (
                  <tr key={sp.id}>
                    <td>{sp.date}</td>
                    <td>{sp.description}</td>
                    <td>${sp.amount.toLocaleString()}</td>
                    <td>{sp.recordedBy}</td>
                    <td>
                      <button className="btn-icon text-muted" onClick={() => deleteSpend(sp.id)}><Trash2 size={16} color="var(--danger-color)"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Materials' && (
        <div className="animate-fade-in mb-4">
          <h3>Site Materials</h3>
          <div className="table-container bg-secondary mt-3">
            <table className="table">
              <thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Photos</th></tr></thead>
              <tbody>
                {siteMaterials.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.category}</td>
                    <td>{m.quantity}</td>
                    <td>{m.unit}</td>
                    <td>
                      {m.photos && m.photos.length > 0 ? (
                        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                          {m.photos.map((p, idx) => {
                            const d = { content: p, fileName: `Material Doc ${idx + 1}` };
                            return (
                              <div key={idx} className="flex gap-1">
                                <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                  <Eye size={12} /> Read
                                </button>
                                <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                  <Download size={12} /> Download
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted text-small">No documents</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Workers' && (
        <div className="animate-fade-in mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3>Workers Assigned</h3>
            <div className="flex gap-2">
              <button className="btn btn-outline" onClick={() => setShowCreateWorkerModal(true)}>
                <Plus size={16}/> Register New Worker
              </button>
              <button className="btn btn-primary" onClick={() => {
                setWorkerIdsToAssign(siteWorkers.map(w => w.id));
                setShowAssignWorkerModal(true);
              }}>
                <Plus size={16}/> Assign Existing
              </button>
            </div>
          </div>
          <div className="table-container bg-secondary mt-3">
            <table className="table">
              <thead><tr><th>Name</th><th>Trade</th><th>Contact</th><th>Status</th><th>Documents</th></tr></thead>
              <tbody>
                {siteWorkers.map(w => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{w.trade}</td>
                    <td>{w.phone}</td>
                    <td>{w.status}</td>
                    <td>
                      {w.documents && w.documents.length > 0 ? (
                        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                          {w.documents.map((d, idx) => (
                            <div key={idx} className="flex gap-1">
                              <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                <Eye size={12} /> Read
                              </button>
                              <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                <Download size={12} /> Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted text-small">No documents</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Supervisors' && (
        <div className="animate-fade-in mb-4">
          <h3>Supervisors Assigned</h3>
          <div className="table-container bg-secondary mt-3">
            <table className="table">
              <thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Status</th><th>Documents</th></tr></thead>
              <tbody>
                {siteSupervisors.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.phone}</td>
                    <td>{s.email}</td>
                    <td>{s.status}</td>
                    <td>
                      {s.documents && s.documents.length > 0 ? (
                        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                          {s.documents.map((d, idx) => (
                            <div key={idx} className="flex gap-1">
                              <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                <Eye size={12} /> Read
                              </button>
                              <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '12px' }}>
                                <Download size={12} /> Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted text-small">No documents</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Billing Report' && (
        <div className="animate-fade-in mb-4 card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2>Billing Summary</h2>
              <button className="btn btn-success" onClick={handleExportBilling}>Export to Google Sheets</button>
            </div>
            <div className="dashboard-grid mb-4">
              <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="text-small text-muted">Total Budget</div>
                <div>${site.totalBudget.toLocaleString()}</div>
              </div>
              <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="text-small text-muted">Total Spend</div>
                <div style={{ color: 'var(--danger-color)' }}>${totalSpend.toLocaleString()}</div>
              </div>
              <div className="p-3 border-rounded" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="text-small text-muted">Remaining Balance</div>
                <div style={{ color: 'var(--success-color)' }}>${remainingBalance.toLocaleString()}</div>
              </div>
            </div>
            {totalSpend > site.totalBudget && (
              <div className="toast warning mb-4" style={{ position: 'relative', bottom: 'auto', right: 'auto', width: '100%', borderColor: 'var(--warning-color)', animation: 'none' }}>
                Warning: Total spend has exceeded the site budget
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Client' && (
        <div className="animate-fade-in mb-4">
          <div className="card p-4">
            <div className="flex items-center gap-4 mb-4">
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                {site.client?.image ? (
                  <img src={site.client.image} alt="Client" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="flex items-center justify-center" style={{ height: '100%' }}><ImageIcon color="var(--text-secondary)" /></div>
                )}
              </div>
              <div>
                <h3 className="mb-1">{site.client?.name || 'No Client Assigned'}</h3>
                {site.client?.phone && <p className="text-muted">{site.client.phone}</p>}
              </div>
            </div>
            
            <hr className="mb-3" style={{ borderColor: 'var(--border-color)' }}/>
            <div className="mt-2">
               <div className="mb-4">
                 <label className="form-label mb-2 flex items-center gap-2"><ImageIcon size={16}/> Upload New Client Document</label>
                 <input type="file" multiple className="form-input" onChange={async (e) => {
                   const files = Array.from(e.target.files);
                   const { storage } = await import('@/lib/firebase');
                   const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
                   
                   const valid = await Promise.all(files.map(async f => {
                     const base64 = await fileToBase64(f);
                     const id = `doc_${Date.now()}_${Math.random()}`;
                     
                     const storageRef = ref(storage, `sites/${site.id}/client_documents/${id}_${f.name}`);
                     await uploadString(storageRef, base64, 'data_url');
                     const downloadURL = await getDownloadURL(storageRef);

                     return {
                       id,
                       fileName: f.name,
                       fileType: f.type,
                       uploadDate: new Date().toISOString(),
                       uploadedBy: 'Admin',
                       content: downloadURL
                     };
                   }));
                   const updatedClient = {
                     ...(site.client || {}),
                     documents: [...(site.client?.documents || []), ...valid]
                   };
                   updateSite(site.id, { client: updatedClient });
                 }} />
               </div>

               <h4>Uploaded Files</h4>
               {site.client?.documents && site.client.documents.length > 0 ? (
                 <ul style={{ listStyle: 'none', padding: 0 }} className="mt-2">
                   {site.client.documents.map((d, idx) => (
                     <li key={d.id || idx} className="flex justify-between items-center p-3 bg-tertiary mb-2 border-rounded transition-all hover:bg-opacity-80">
                       <div className="flex flex-column">
                         <span style={{ fontWeight: 600 }}>{d.fileName || `Document ${idx+1}`}</span>
                         <span className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(d.uploadDate).toLocaleDateString()}</span>
                       </div>
                       <div className="flex gap-2">
                         <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                           <Eye size={14} /> Read
                         </button>
                         <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                           <Download size={14} /> Download
                         </button>
                         <button onClick={() => {
                           const updatedDocs = site.client.documents.filter(doc => doc.id !== d.id);
                           updateSite(site.id, { client: { ...site.client, documents: updatedDocs } });
                         }} className="btn-icon" style={{ color: 'var(--danger-color)' }}>
                           <Trash2 size={16}/>
                         </button>
                       </div>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-muted text-small p-2">No documents uploaded.</p>
               )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="animate-fade-in mb-4">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2>Site Documents</h2>
            </div>
            <div className="mb-4">
              <label className="form-label mb-2 flex items-center gap-2"><ImageIcon size={16}/> Upload New Site Document</label>
              <input type="file" multiple className="form-input" disabled={isUploadingDoc} onChange={async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                setIsUploadingDoc(true);
                try {
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
                  updateSite(site.id, { documents: [...(site.documents || []), ...valid] });
                } catch (err) {
                  console.error(err);
                  alert("Failed to process document: " + err.message);
                } finally {
                  setIsUploadingDoc(false);
                  e.target.value = '';
                }
              }} />
              {isUploadingDoc && <div className="text-small text-muted mt-2">Uploading documents, please wait...</div>}
            </div>
            <ul className="mt-2" style={{listStyle: 'none', padding: 0}}>
              {site.documents?.length > 0 ? site.documents.map(d => (
                <li key={d.id} className="flex justify-between items-center p-3 bg-tertiary mb-2 border-rounded transition-all hover:bg-opacity-80 text-small">
                  <div className="flex flex-column">
                    <span style={{ fontWeight: 600 }}>{d.fileName}</span> 
                    <span className="text-muted">{new Date(d.uploadDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={(e) => { e.preventDefault(); setViewDoc(d); }} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                      <Eye size={14} /> Read
                    </button>
                    <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                      <Download size={14} /> Download
                    </button>
                    <button onClick={() => {
                      const updatedDocs = site.documents.filter(doc => doc.id !== d.id);
                      updateSite(site.id, { documents: updatedDocs });
                    }} className="btn-icon" style={{ color: 'var(--danger-color)' }}>
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </li>
              )) : <li className="text-muted text-small p-2">No site documents found.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Spend Modal */ }
      {showSpendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Spend</h2>
              <button className="close-btn" onClick={() => setShowSpendModal(false)}>X</button>
            </div>
            <div className="modal-body">
              <form id="spendForm" onSubmit={handleAddSpend}>
                <div className="form-group"><label className="form-label">Description</label>
                  <input type="text" className="form-input" required value={spendForm.description} onChange={e => setSpendForm({...spendForm, description: e.target.value})} />
                </div>
                <div className="form-group"><label className="form-label">Amount</label>
                  <input type="number" className="form-input" required min="1" value={spendForm.amount} onChange={e => setSpendForm({...spendForm, amount: Number(e.target.value)})} />
                </div>
                <div className="form-group"><label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={spendForm.date} onChange={e => setSpendForm({...spendForm, date: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setShowSpendModal(false)}>Cancel</button>
               <button form="spendForm" className="btn btn-primary" type="submit">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Site Modal */}
      {showEditModal && editForm && (
        <div className="modal-overlay larkon-modal-overlay"
          onClick={e=>{ if(e.target===e.currentTarget) setShowEditModal(false); }}>
          <div className="larkon-modal-content"
            onClick={e=>e.stopPropagation()}>

            <div style={{ padding:'1.5rem 1.75rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,rgba(85,110,230,0.08),transparent)', borderRadius:'18px 18px 0 0', position:'sticky', top:0, zIndex:10, backdropFilter:'blur(8px)' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700 }}>Edit Site</h2>
                <p className="text-muted" style={{ margin:'2px 0 0', fontSize:'0.82rem' }}>Update site details below</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ width:34,height:34,borderRadius:8,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)' }}>
                <X size={17}/>
              </button>
            </div>

            <form id="editSiteForm" onSubmit={handleEditSite} style={{ padding:'1.5rem 1.75rem', display:'flex', flexDirection:'column', gap:0 }}>
              <div className="form-group">
                <label className="form-label">Site Name *</label>
                <input type="text" className="form-input" style={{ borderRadius:8 }} required placeholder="e.g. Downtown Highrise Phase 2"
                  value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" style={{ borderRadius:8, flex: 1 }} required placeholder="e.g. 123 Main Street, Chennai"
                    value={editForm.location} onChange={e=>setEditForm({...editForm,location:e.target.value})}/>
                  <button type="button" onClick={handleGetLocation} disabled={gettingLocation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0 1rem', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', cursor: gettingLocation ? 'wait' : 'pointer', fontWeight: 600, transition: 'all 0.2s', minWidth: '130px' }}>
                    {gettingLocation ? <span style={{ width: 14, height: 14, border: '2px solid var(--primary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />}
                    {gettingLocation ? 'Locating...' : 'Get Live'}
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" style={{ borderRadius:8 }} value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                    {['Active','On Hold','Completed','Inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supervisor</label>
                  <select className="form-select" style={{ borderRadius:8 }} value={editForm.supervisorId} onChange={e=>setEditForm({...editForm,supervisorId:e.target.value})}>
                    <option value="">Select Supervisor</option>
                    {allSupervisors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" style={{ borderRadius:8 }} value={editForm.startDate} onChange={e=>setEditForm({...editForm,startDate:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" style={{ borderRadius:8 }} value={editForm.endDate} onChange={e=>setEditForm({...editForm,endDate:e.target.value})}/>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Advance Amount (₹)</label>
                  <input type="number" className="form-input" style={{ borderRadius:8 }} min={0} required placeholder="0"
                    value={editForm.advanceAmount||''} onChange={e=>setEditForm({...editForm,advanceAmount:Number(e.target.value)})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget (₹)</label>
                  <input type="number" className="form-input" style={{ borderRadius:8 }} min={0} required placeholder="0"
                    value={editForm.totalBudget||''} onChange={e=>setEditForm({...editForm,totalBudget:Number(e.target.value)})}/>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem', marginBottom:'1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Client Name</label>
                  <input type="text" className="form-input" style={{ borderRadius:8 }} placeholder="e.g. Acme Corp"
                    value={editForm.clientName||''} onChange={e=>setEditForm({...editForm,clientName:e.target.value})}/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Client Phone</label>
                  <input type="text" className="form-input" style={{ borderRadius:8 }} placeholder="e.g. +1 234 567 890"
                    value={editForm.clientPhone||''} onChange={e=>setEditForm({...editForm,clientPhone:e.target.value})}/>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Site Documents</label>
                <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 8, background: 'var(--bg-tertiary)' }}>
                  <input type="file" multiple onChange={handleEditSiteDocUpload} style={{ marginBottom: editForm.siteDocs?.length > 0 ? '0.5rem' : 0 }} />
                  {editForm.siteDocs?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {editForm.siteDocs.map(d => (
                        <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <span>{d.fileName}</span>
                          <div className="flex gap-2">
                            <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                              <Eye size={14} /> Read
                            </button>
                            <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                              <Download size={14} /> Download
                            </button>
                            <button type="button" onClick={() => setEditForm(prev => ({...prev, siteDocs: prev.siteDocs.filter(doc => doc.id !== d.id)}))} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.6rem' }}>Remove</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Image Uploads */}
              <div className="form-grid-2">
                {[['image','Site Image'],['mapImage','Map Image']].map(([field,label])=>(
                  <div key={field} className="form-group">
                    <label className="form-label">{label}</label>
                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'1rem', borderRadius:10, border:`2px dashed ${editForm[field]?'#34c38f':'var(--border-color)'}`, cursor:'pointer', fontSize:'0.82rem', color: editForm[field]?'#34c38f':'var(--text-secondary)', transition:'all 0.2s', background: editForm[field]?'rgba(52,195,143,0.06)':'transparent' }}>
                      {editForm[field]
                        ? <><img src={editForm[field]} alt={label} style={{ height:52, borderRadius:6, objectFit:'cover' }}/> <span style={{fontSize:'0.75rem'}}>✓ Uploaded</span></>
                        : <><ImageIcon size={20}/><span>Upload {label}</span></>
                      }
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleEditImageUpload(e,field)}/>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="submit" form="editSiteForm"
                  disabled={saving}
                  style={{ flex:1, padding:'0.75rem', borderRadius:10, border:'none', cursor:saving?'not-allowed':'pointer', fontWeight:600, fontSize:'0.92rem', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    background: saving ? '#34c38f' : 'var(--primary-color)', color:'white', boxShadow: saving?'0 4px 14px rgba(52,195,143,0.4)':'0 4px 14px rgba(85,110,230,0.35)' }}>
                  {saving ? '✓ Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)}
                  style={{ padding:'0.75rem 1.25rem', borderRadius:10, border:'1px solid var(--border-color)', background:'transparent', cursor:'pointer', fontWeight:500, color:'var(--text-primary)', transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-tertiary)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Workers Bulk Modal */}
      {showAssignWorkerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Assign Workers to Site</h2>
              <button className="close-btn" onClick={() => setShowAssignWorkerModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <p className="text-muted text-small mb-3">Select the workers you want to assign to this site. Unchecking a currently assigned worker will remove them from the site.</p>
              
              {users.filter(u => u.role === 'Worker').length === 0 ? (
                <div className="text-center text-muted p-4">No workers found in the system.</div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3" style={{ gap: 10 }}>
                    <input 
                      type="text" 
                      placeholder="Search workers..." 
                      className="form-input" 
                      style={{ flex: 1, padding: '0.4rem 0.8rem', borderRadius: 8 }}
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                    />
                    <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => {
                      const allWorkerIds = users.filter(u => u.role === 'Worker').map(w => w.id);
                      if (workerIdsToAssign.length === allWorkerIds.length) {
                        setWorkerIdsToAssign([]); // Deselect all
                      } else {
                        setWorkerIdsToAssign(allWorkerIds); // Select all
                      }
                    }}>
                      {workerIdsToAssign.length === users.filter(u => u.role === 'Worker').length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {users.filter(u => u.role === 'Worker' && u.name.toLowerCase().includes(workerSearch.toLowerCase())).map(w => (
                      <label key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                        <input type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--primary-color)' }}
                          checked={workerIdsToAssign.includes(w.id)}
                          onChange={(e) => {
                            if (e.target.checked) setWorkerIdsToAssign([...workerIdsToAssign, w.id]);
                            else setWorkerIdsToAssign(workerIdsToAssign.filter(id => id !== w.id));
                          }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{w.name}</div>
                          <div className="text-small text-muted">{w.trade} {w.assignedSite && w.assignedSite !== site.id ? `(Currently at ${sites.find(s=>s.id===w.assignedSite)?.name || 'another site'})` : ''}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowAssignWorkerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const allWorkers = users.filter(u => u.role === 'Worker');
                
                // For each worker in the system...
                allWorkers.forEach(w => {
                  const shouldBeAssigned = workerIdsToAssign.includes(w.id);
                  const isAssigned = w.assignedSite === site.id;
                  
                  if (shouldBeAssigned && !isAssigned) {
                    updateUser(w.id, { assignedSite: site.id });
                  } else if (!shouldBeAssigned && isAssigned) {
                    updateUser(w.id, { assignedSite: '' }); // Unassign them
                  }
                });
                
                setShowAssignWorkerModal(false);
              }}>Save Assignments</button>
            </div>
          </div>
        </div>
      )}
      {viewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}
          onClick={e => { if (e.target === e.currentTarget) setViewDoc(null); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>{viewDoc.fileName || 'Document'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={(e) => handleDownload(e, viewDoc)}
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
            {viewDoc.content?.startsWith('data:image/') || viewDoc.fileType?.startsWith('image/') ? (
              <img src={viewDoc.content} alt={viewDoc.fileName}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
            ) : (
              <iframe src={viewDoc.content} title={viewDoc.fileName}
                style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 8, background: '#fff' }} />
            )}
          </div>
        </div>
      )}

      {/* Create New Worker Modal */}
      {showCreateWorkerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Register New Worker for this Site</h2>
              <button className="close-btn" onClick={() => setShowCreateWorkerModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <form id="newWorkerForm" onSubmit={(e) => {
                e.preventDefault();
                addUser({ ...newWorkerForm, assignedSite: site.id });
                setShowCreateWorkerModal(false);
                setNewWorkerForm({ name: '', role: 'Worker', trade: '', phone: '', email: '', password: '', assignedSite: site.id, status: 'Active', documents: [], dailyWage: 0 });
              }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={newWorkerForm.name} onChange={e=>setNewWorkerForm({...newWorkerForm, name: e.target.value})} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Trade / Role</label>
                    <input type="text" className="form-input" required placeholder="e.g. Carpenter, Plumber" value={newWorkerForm.trade} onChange={e=>setNewWorkerForm({...newWorkerForm, trade: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Daily Wage (₹)</label>
                    <input type="number" className="form-input" min={0} required value={newWorkerForm.dailyWage || ''} onChange={e=>setNewWorkerForm({...newWorkerForm, dailyWage: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-input" required value={newWorkerForm.phone} onChange={e=>setNewWorkerForm({...newWorkerForm, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" minLength={8} className="form-input" required value={newWorkerForm.password} onChange={e=>setNewWorkerForm({...newWorkerForm, password: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" className="form-input" value={newWorkerForm.email} onChange={e=>setNewWorkerForm({...newWorkerForm, email: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="modal-footer" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateWorkerModal(false)}>Cancel</button>
              <button className="btn btn-primary" type="submit" form="newWorkerForm">Save Worker</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}


