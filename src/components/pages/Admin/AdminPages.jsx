'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  Building2, HardHat, Users, Hammer, Plus, 
  Trash2, Image as ImageIcon, MapPin, X, Navigation, Eye, Download
} from 'lucide-react';

// Helper for converting file to base64
export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

// --- Admin Dashboard ---
export function AdminDashboard() {
  const { sites, users, materials } = useStore();
  const activeSites = sites.filter(s => s.status === 'Active');
  const workers = users.filter(u => u.role === 'Worker');
  const supervisors = users.filter(u => u.role === 'Supervisor');
  const [timeRange, setTimeRange] = useState('ALL');

  return (
    <div>

      <div className="larkon-grid-container">
        {/* Left Stats Block */}
        <div>
          <div className="larkon-stats-grid">
            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Building2 size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Total Sites</div>
                   <div className="value">{sites.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{activeSites.length} <span className="text-muted">Active Now</span></span>
                 <Link href="/admin/sites" className="view-more">View All</Link>
               </div>
            </div>

            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><HardHat size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Total Workers</div>
                   <div className="value">{workers.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{workers.filter(w => w.status === 'Active').length} <span className="text-muted">Active</span></span>
                 <Link href="/admin/workers" className="view-more">View All</Link>
               </div>
            </div>

            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Users size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Supervisors</div>
                   <div className="value">{supervisors.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{supervisors.filter(s => s.status === 'Active').length} <span className="text-muted">Online</span></span>
                 <Link href="/admin/supervisors" className="view-more">View All</Link>
               </div>
            </div>

            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Hammer size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Inventory Items</div>
                   <div className="value">{materials.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{new Set(materials.map(m => m.category)).size} <span className="text-muted">Categories</span></span>
                 <Link href="/admin/materials" className="view-more">View All</Link>
               </div>
            </div>
          </div>
          
          <div className="larkon-stats-grid mt-4">
             <div className="card p-4">
                 <h4 className="mb-2" style={{color: 'var(--text-primary)'}}>Conversions</h4>
                 <div style={{height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>Radial Chart Placeholder</div>
             </div>
             <div className="card p-4">
                 <h4 className="mb-2" style={{color: 'var(--text-primary)'}}>Sessions by Country</h4>
                 <div style={{height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>Map Placeholder</div>
             </div>
          </div>
        </div>

        {/* Right Chart Block */}
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
             <h4 style={{color: 'var(--text-primary)'}}>Performance</h4>
             <div className="flex gap-1">
               {['ALL', '1M', '6M', '1Y'].map(range => (
                 <button 
                   key={range}
                   onClick={() => setTimeRange(range)}
                   className={`badge ${timeRange === range ? 'badge-primary' : ''}`} 
                   style={timeRange === range ? {} : {background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer'}}
                 >
                   {range}
                 </button>
               ))}
             </div>
          </div>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid var(--border-color)', borderLeft: '1px solid var(--border-color)', margin: '1rem'}}>
             {/* Fake Bar/Line Chart background */}
             <div style={{ width: '100%', height: '250px', backgroundImage: 'linear-gradient(rgba(255,127,80,0.2) 2px, transparent 2px)', backgroundSize: '100% 40px', backgroundPosition: '0 -2px' }}>
                <svg width="100%" height="100%" preserveAspectRatio="none">
                  {/* Fake Line Chart */}
                  <path fill="rgba(52, 195, 143, 0.1)" stroke="var(--success-color)" strokeWidth="3" d="M0,200 C50,180 80,190 120,150 S180,180 200,100 S250,90 280,120 S350,80 400,20 L400,250 L0,250 Z" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      <div className="card mt-4 p-4" style={{ borderRadius: 16 }}>
        <div className="flex justify-between items-center mb-4">
          <h4 style={{ margin: 0, fontWeight: 700 }}>Recent Sites</h4>
          <Link href="/admin/sites" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>View All</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.slice(0, 5).map(site => (
                <tr key={site.id}>
                  <td><strong>{site.name}</strong></td>
                  <td>{site.location}</td>
                  <td>
                    <span className="badge" style={{ 
                      background: STATUS_META[site.status]?.bg || 'var(--bg-tertiary)', 
                      color: STATUS_META[site.status]?.color || 'var(--text-secondary)' 
                    }}>
                      {site.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/sites/${site.id}`} style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>Manage</Link>
                  </td>
                </tr>
              ))}
              {sites.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted p-4">No sites added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Admin Sites List ---
const STATUS_META = {
  Active:    { color: '#34c38f', bg: 'rgba(52,195,143,0.12)',  dot: '#34c38f' },
  'On Hold': { color: '#f1b44c', bg: 'rgba(241,180,76,0.15)', dot: '#f1b44c' },
  Completed: { color: '#556ee6', bg: 'rgba(85,110,230,0.12)', dot: '#556ee6' },
  Inactive:  { color: '#a6b0cf', bg: 'rgba(166,176,207,0.12)',dot: '#a6b0cf' },
};

export function AdminSites() {
  const { sites, deleteSite, addSite, users, spendRecords } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '', location: '', status: 'Active', startDate: '', endDate: '',
    supervisorId: '', advanceAmount: 0, totalBudget: 0, image: null, mapImage: null,
    clientName: '', clientPhone: '', siteDocs: []
  });

  const supervisors = users.filter(u => u.role === 'Supervisor');

  const filtered = filterStatus ? sites.filter(s => s.status === filterStatus) : sites;

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload a valid image file.');
    const base64 = await fileToBase64(file);
    setFormData(prev => ({ ...prev, [field]: base64 }));
  };

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
    if (d.content && d.content.startsWith('data:')) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${d.content}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        alert('Please allow popups for this site');
      }
    } else {
      window.open(d.content, '_blank');
    }
  };

  const handleSiteDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newDocs = await Promise.all(files.map(async f => {
       const base64 = await fileToBase64(f);
       return {
           id: `doc_${Date.now()}_${Math.random()}`,
           fileName: f.name,
           fileType: f.type,
           uploadDate: new Date().toISOString(),
           uploadedBy: 'Admin',
           content: base64
       }
    }));
    setFormData(prev => ({ ...prev, siteDocs: [...(prev.siteDocs || []), ...newDocs] }));
  };

  const [gettingLocation, setGettingLocation] = useState(false);

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
          setFormData(prev => ({ ...prev, location: address }));
        } catch (error) {
          setFormData(prev => ({ ...prev, location: `${lat.toFixed(6)}, ${lon.toFixed(6)}` }));
        }
        setGettingLocation(false);
      },
      (error) => {
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setGettingLocation(false);
      }
    );
  };

  const handleAddSite = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const { clientName, clientPhone, siteDocs, ...siteInfo } = formData;
      const newSiteData = {
        ...siteInfo,
        documents: siteDocs || [],
        client: {
          name: clientName,
          phone: clientPhone,
          image: null,
          documents: []
        }
      };
      addSite(newSiteData);
      setSaving(false);
      setShowModal(false);
      setFormData({ name:'', location:'', status:'Active', startDate:'', endDate:'', supervisorId:'', advanceAmount:0, totalBudget:0, image:null, mapImage:null, clientName:'', clientPhone:'', siteDocs:[] });
    }, 600);
  };

  const resetAndClose = () => {
    setShowModal(false);
    setFormData({ name:'', location:'', status:'Active', startDate:'', endDate:'', supervisorId:'', advanceAmount:0, totalBudget:0, image:null, mapImage:null, clientName:'', clientPhone:'', siteDocs:[] });
  };

  return (
    <div style={{ animation: 'pageFadeIn 0.35s ease' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ margin:0, background:'linear-gradient(135deg,#556ee6,#6f86ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:700 }}>
            Sites Management
          </h1>
          <p className="text-muted" style={{ margin:'2px 0 0', fontSize:'0.88rem' }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''} total · {sites.filter(s=>s.status==='Active').length} active
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap: 'wrap' }}>
          {/* Status filter pills */}
          <div style={{ display:'flex', gap:6, flexWrap: 'wrap' }}>
            {['', 'Active', 'On Hold', 'Completed'].map(st => (
              <button key={st}
                onClick={() => setFilterStatus(st)}
                style={{ padding:'0.35rem 0.85rem', borderRadius:20, fontSize:'0.78rem', fontWeight:600, cursor:'pointer', border:'1px solid var(--border-color)', transition:'all 0.15s',
                  background: filterStatus === st ? 'var(--primary-color)' : 'transparent',
                  color: filterStatus === st ? '#fff' : 'var(--text-secondary)' }}>
                {st || 'All'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ gap:8, padding:'0.65rem 1.4rem', borderRadius:10, boxShadow:'0 4px 14px rgba(85,110,230,0.35)', fontWeight:600, transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <Plus size={17} /> Add New Site
          </button>
        </div>
      </div>

      {/* Sites Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-secondary)' }}>
          <Building2 size={48} style={{ margin:'0 auto 1rem', opacity:0.25, display:'block' }} />
          <p style={{ fontWeight:500 }}>No sites found. Add your first site!</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:20 }}>
          {filtered.map((site, idx) => {
            const spend = spendRecords.filter(sp=>sp.siteId===site.id).reduce((s,sp)=>s+sp.amount,0);
            const budget = site.totalBudget || 0;
            const pct = budget > 0 ? Math.min(100, Math.round((spend/budget)*100)) : 0;
            const sm = STATUS_META[site.status] || STATUS_META.Inactive;
            const sup = supervisors.find(s=>s.id===site.supervisorId);
            return (
              <div key={site.id}
                className="site-card-larkon"
                style={{ animation:`cardPop 0.35s ease ${idx*0.05}s both` }}>

                {/* Image */}
                <div style={{ height:180, position:'relative', overflow:'hidden', background:'var(--bg-tertiary)' }}>
                  {site.image
                    ? <img src={site.image} alt={site.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'} />
                    : <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <Building2 size={40} color="var(--text-tertiary)" />
                        <span style={{ fontSize:'0.78rem', color:'var(--text-tertiary)' }}>No image uploaded</span>
                      </div>
                  }
                  {/* Status badge overlay */}
                  <span style={{ position:'absolute', top:12, left:12, padding:'0.25rem 0.75rem', borderRadius:20, fontSize:'0.75rem', fontWeight:700, background:sm.bg, color:sm.color, backdropFilter:'blur(6px)', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:sm.dot, display:'inline-block' }} />
                    {site.status}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding:'1.1rem 1.25rem', flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                  <div>
                    <h3 style={{ margin:0, fontSize:'1rem', fontWeight:700 }}>{site.name}</h3>
                    <p style={{ margin:'3px 0 0', fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                      <MapPin size={12} /> {site.location}
                    </p>
                  </div>

                  {/* Budget Progress */}
                  {budget > 0 && (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:5 }}>
                        <span>Budget Used</span>
                        <span style={{ fontWeight:600, color: pct>80 ? '#f46a6a' : 'var(--text-primary)' }}>{pct}%</span>
                      </div>
                      <div style={{ height:5, borderRadius:10, background:'var(--border-color)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:10, width:`${pct}%`, transition:'width 0.8s ease',
                          background: pct>80 ? '#f46a6a' : pct>50 ? '#f1b44c' : '#34c38f' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { label:'Budget', value: budget > 0 ? `₹${budget.toLocaleString()}` : '—' },
                      { label:'Spent',  value: spend > 0  ? `₹${spend.toLocaleString()}`  : '₹0', color: spend>0?'#f46a6a':'' },
                    ].map(item => (
                      <div key={item.label} style={{ background:'var(--bg-tertiary)', borderRadius:8, padding:'0.5rem 0.75rem', textAlign:'center' }}>
                        <div style={{ fontSize:'0.88rem', fontWeight:700, color:item.color||'var(--text-primary)' }}>{item.value}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:1 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {sup && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0.5rem 0.75rem', background:'var(--bg-tertiary)', borderRadius:8 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'var(--primary-color)' }}>
                        {sup.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1 }}>Supervisor</div>
                        <div style={{ fontSize:'0.85rem', fontWeight:600 }}>{sup.name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding:'0.85rem 1.25rem', borderTop:'1px solid var(--border-color)', display:'flex', gap:8 }}>
                  <Link href={`/admin/sites/${site.id}`}
                    style={{ flex:1, padding:'0.55rem', borderRadius:8, textAlign:'center', fontSize:'0.84rem', fontWeight:600, color:'var(--primary-color)', border:'1px solid var(--primary-color)', textDecoration:'none', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--primary-color)';e.currentTarget.style.color='#fff';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--primary-color)';}}>
                    View Details
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(site)}
                    style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--border-color)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--danger-color)', transition:'all 0.15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(244,106,106,0.1)';e.currentTarget.style.borderColor='var(--danger-color)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='var(--border-color)';}}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Site Modal ── */}
      {showModal && (
        <div className="modal-overlay larkon-modal-overlay"
          onClick={e=>{ if(e.target===e.currentTarget) resetAndClose(); }}>
          <div className="larkon-modal-content"
            onClick={e=>e.stopPropagation()}>

            <div style={{ padding:'1.5rem 1.75rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,rgba(85,110,230,0.08),transparent)', borderRadius:'18px 18px 0 0', position:'sticky', top:0, zIndex:10, backdropFilter:'blur(8px)' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700 }}>Add New Site</h2>
                <p className="text-muted" style={{ margin:'2px 0 0', fontSize:'0.82rem' }}>Fill in site details below</p>
              </div>
              <button onClick={resetAndClose} style={{ width:34,height:34,borderRadius:8,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)' }}>
                <X size={17}/>
              </button>
            </div>

            <form id="addSiteForm" onSubmit={handleAddSite} style={{ padding:'1.5rem 1.75rem', display:'flex', flexDirection:'column', gap:0 }}>
              <div className="form-group">
                <label className="form-label">Site Name *</label>
                <input type="text" className="form-input" style={{ borderRadius:8 }} required placeholder="e.g. Downtown Highrise Phase 2"
                  value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/>
              </div>

              <div className="form-group">
                <label className="form-label">Location *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" style={{ borderRadius:8, flex: 1 }} required placeholder="e.g. 123 Main Street, Chennai"
                    value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})}/>
                  <button type="button" onClick={handleGetLocation} disabled={gettingLocation} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0 1rem', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', cursor: gettingLocation ? 'wait' : 'pointer', fontWeight: 600, transition: 'all 0.2s', minWidth: '130px' }}>
                    {gettingLocation ? <span style={{ width: 14, height: 14, border: '2px solid var(--primary-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Navigation size={16} />}
                    {gettingLocation ? 'Locating...' : 'Get Live'}
                  </button>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" style={{ borderRadius:8 }} value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>
                    {['Active','On Hold','Completed','Inactive'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supervisor</label>
                  <select className="form-select" style={{ borderRadius:8 }} value={formData.supervisorId} onChange={e=>setFormData({...formData,supervisorId:e.target.value})}>
                    <option value="">Select Supervisor</option>
                    {supervisors.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" style={{ borderRadius:8 }} value={formData.startDate} onChange={e=>setFormData({...formData,startDate:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" style={{ borderRadius:8 }} value={formData.endDate} onChange={e=>setFormData({...formData,endDate:e.target.value})}/>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Advance Amount (₹)</label>
                  <input type="number" className="form-input" style={{ borderRadius:8 }} min={0} required placeholder="0"
                    value={formData.advanceAmount||''} onChange={e=>setFormData({...formData,advanceAmount:Number(e.target.value)})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget (₹)</label>
                  <input type="number" className="form-input" style={{ borderRadius:8 }} min={0} required placeholder="0"
                    value={formData.totalBudget||''} onChange={e=>setFormData({...formData,totalBudget:Number(e.target.value)})}/>
                </div>
              </div>

              <div className="form-grid-2" style={{ borderTop:'1px solid var(--border-color)', paddingTop:'1rem', marginTop:'0.5rem', marginBottom:'1rem' }}>
                <div className="form-group mb-0">
                  <label className="form-label">Client Name</label>
                  <input type="text" className="form-input" style={{ borderRadius:8 }} placeholder="e.g. Acme Corp"
                    value={formData.clientName||''} onChange={e=>setFormData({...formData,clientName:e.target.value})}/>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Client Phone</label>
                  <input type="text" className="form-input" style={{ borderRadius:8 }} placeholder="e.g. +1 234 567 890"
                    value={formData.clientPhone||''} onChange={e=>setFormData({...formData,clientPhone:e.target.value})}/>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Site Documents</label>
                <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 8, background: 'var(--bg-tertiary)' }}>
                  <input type="file" multiple onChange={handleSiteDocUpload} style={{ marginBottom: formData.siteDocs?.length > 0 ? '0.5rem' : 0 }} />
                  {formData.siteDocs?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {formData.siteDocs.map(d => (
                        <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                          <span>{d.fileName}</span>
                          <div className="flex gap-2">
                            <button type="button" onClick={(e) => handleView(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                              <Eye size={14} /> Read
                            </button>
                            <button type="button" onClick={(e) => handleDownload(e, d)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}>
                              <Download size={14} /> Download
                            </button>
                            <button type="button" onClick={() => setFormData(prev => ({...prev, siteDocs: prev.siteDocs.filter(doc => doc.id !== d.id)}))} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0.6rem' }}>Remove</button>
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
                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'1rem', borderRadius:10, border:`2px dashed ${formData[field]?'#34c38f':'var(--border-color)'}`, cursor:'pointer', fontSize:'0.82rem', color: formData[field]?'#34c38f':'var(--text-secondary)', transition:'all 0.2s', background: formData[field]?'rgba(52,195,143,0.06)':'transparent' }}>
                      {formData[field]
                        ? <><img src={formData[field]} alt={label} style={{ height:52, borderRadius:6, objectFit:'cover' }}/> <span style={{fontSize:'0.75rem'}}>✓ Uploaded</span></>
                        : <><ImageIcon size={20}/><span>Upload {label}</span></>
                      }
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handleImageUpload(e,field)}/>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button type="submit" form="addSiteForm"
                  disabled={saving}
                  style={{ flex:1, padding:'0.75rem', borderRadius:10, border:'none', cursor:saving?'not-allowed':'pointer', fontWeight:600, fontSize:'0.92rem', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    background: saving ? '#34c38f' : 'var(--primary-color)', color:'white', boxShadow: saving?'0 4px 14px rgba(52,195,143,0.4)':'0 4px 14px rgba(85,110,230,0.35)' }}>
                  {saving ? '✓ Saving…' : <><Plus size={16}/> Save Site</>}
                </button>
                <button type="button" onClick={resetAndClose}
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

      {/* ── Custom Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="modal-overlay" style={{ backdropFilter:'blur(6px)', zIndex: 9999 }} onClick={()=>setDeleteConfirm(null)}>
          <div style={{ background:'var(--bg-secondary)', borderRadius:18, width:'100%', maxWidth:400, margin:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.18)', animation:'modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)', padding: '2rem', textAlign: 'center' }} onClick={e=>e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(244,106,106,0.1)', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={28} />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Delete Site?</h2>
            
            {(() => {
              const hasWorkers = users.some(u => u.role === 'Worker' && u.assignedSite === deleteConfirm.id && u.status === 'Active');
              return (
                <>
                  <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {hasWorkers 
                      ? <><span style={{color:'var(--danger-color)', fontWeight:600}}>Warning:</span> This site has active workers assigned.<br/>Are you sure you want to forcefully delete <strong>{deleteConfirm.name}</strong>?</>
                      : <>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</>
                    }
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => setDeleteConfirm(null)}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        deleteSite(deleteConfirm.id, true);
                        setDeleteConfirm(null);
                      }}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'var(--danger-color)', color: 'white', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 14px rgba(244,106,106,0.35)' }}>
                      {hasWorkers ? 'Force Delete' : 'Yes, Delete'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pageFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes cardPop { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:none} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Re-export out of other files
export * from './AdminSiteDetail';
export * from './AdminMaterials';
export * from './AdminUsers';
export * from './AdminContactDetails';
export * from './AdminMessages';
export * from './AdminBilling';
export * from './AdminDocumentCenter';
export * from './AdminAttendance';

// --- Admin Reports ---
export function AdminReports() {
  const { sites, users, spendRecords, wageEntries, attendanceEntries, materials } = useStore();
  const workers = users.filter(u => u.role === 'Worker');
  const supervisors = users.filter(u => u.role === 'Supervisor');
  const totalBudget = sites.reduce((s, site) => s + (site.totalBudget || 0), 0);
  const totalSpent = spendRecords.reduce((s, sp) => s + (sp.amount || 0), 0);
  const totalWages = wageEntries.reduce((s, w) => s + (w.amount || 0), 0);

  const STAT_COLORS = ['#556ee6', '#34c38f', '#f1b44c', '#f46a6a', '#50a5f1', '#74788d'];

  return (
    <div style={{ animation: 'pageFadeIn 0.35s ease' }}>
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, background: 'linear-gradient(135deg,#556ee6,#6f86ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
            Reports & Analytics
          </h1>
          <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>
            Overview of all sites, budgets, attendance and personnel
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Sites', value: sites.length, sub: `${sites.filter(s => s.status === 'Active').length} active`, color: '#556ee6' },
          { label: 'Total Budget', value: `₹${totalBudget.toLocaleString()}`, sub: 'across all sites', color: '#34c38f' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, sub: `${totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0}% of budget`, color: '#f46a6a' },
          { label: 'Total Wages', value: `₹${totalWages.toLocaleString()}`, sub: `${workers.length} workers`, color: '#f1b44c' },
          { label: 'Workers', value: workers.length, sub: `${workers.filter(w=>w.status==='Active').length} active`, color: '#50a5f1' },
          { label: 'Materials', value: materials.length, sub: `${new Set(materials.map(m=>m.category)).size} categories`, color: '#74788d' },
        ].map((item, i) => (
          <div key={item.label} className="card" style={{ padding: '1.25rem', borderTop: `3px solid ${item.color}` }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Sites Budget Table */}
      <div className="card mb-4" style={{ borderRadius: 16 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Site Budget Report</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Site</th><th>Status</th><th>Budget</th><th>Spent</th><th>Remaining</th><th>Usage</th></tr>
            </thead>
            <tbody>
              {sites.map(site => {
                const spent = spendRecords.filter(sp => sp.siteId === site.id).reduce((s, sp) => s + sp.amount, 0);
                const budget = site.totalBudget || 0;
                const pct = budget > 0 ? Math.min(100, Math.round((spent/budget)*100)) : 0;
                const remaining = budget - spent;
                const sm = { Active: '#34c38f', 'On Hold': '#f1b44c', Completed: '#556ee6', Inactive: '#a6b0cf' };
                return (
                  <tr key={site.id}>
                    <td><strong>{site.name}</strong><div className="text-small text-muted">{site.location}</div></td>
                    <td><span className="badge" style={{ background: `${sm[site.status] || '#a6b0cf'}22`, color: sm[site.status] || '#a6b0cf' }}>{site.status}</span></td>
                    <td>{budget > 0 ? `₹${budget.toLocaleString()}` : '—'}</td>
                    <td style={{ color: spent > 0 ? '#f46a6a' : 'inherit' }}>{spent > 0 ? `₹${spent.toLocaleString()}` : '₹0'}</td>
                    <td style={{ color: remaining < 0 ? '#f46a6a' : '#34c38f', fontWeight: 600 }}>{budget > 0 ? `₹${remaining.toLocaleString()}` : '—'}</td>
                    <td style={{ minWidth: 120 }}>
                      {budget > 0 ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                            <span>{pct}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 10, background: 'var(--border-color)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: pct > 80 ? '#f46a6a' : pct > 50 ? '#f1b44c' : '#34c38f', transition: 'width 0.6s ease' }} />
                          </div>
                        </>
                      ) : <span className="text-muted text-small">No budget set</span>}
                    </td>
                  </tr>
                );
              })}
              {sites.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No sites found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="card" style={{ borderRadius: 16 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Attendance Summary</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Worker</th><th>Site</th><th>Days Present</th><th>Wages Earned</th><th>Status</th></tr>
            </thead>
            <tbody>
              {workers.map(w => {
                const entries = attendanceEntries.filter(a => a.workerId === w.id);
                const present = entries.filter(a => a.status === 'Present').length;
                const wages = entries.reduce((s, a) => s + (a.wageAmount || 0), 0);
                const site = sites.find(s => s.id === w.assignedSite);
                return (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong><div className="text-small text-muted">{w.trade || '—'}</div></td>
                    <td>{site?.name || 'Unassigned'}</td>
                    <td>{present} / {entries.length}</td>
                    <td style={{ fontWeight: 600, color: wages > 0 ? '#34c38f' : 'inherit' }}>{wages > 0 ? `₹${wages.toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${w.status === 'Active' ? 'success' : 'danger'}`}>{w.status}</span></td>
                  </tr>
                );
              })}
              {workers.length === 0 && <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>No workers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pageFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}
