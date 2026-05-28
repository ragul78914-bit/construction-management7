'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import useStore from '@/store/useStore';
import {
  Hammer, Plus, Trash2, X, Upload, Edit2, Search,
  Package, Filter, ChevronDown, Eye, FileText, CheckCircle
} from 'lucide-react';
import { fileToBase64 } from './AdminPages';

const CATEGORIES = ['Cement', 'Steel', 'Wood', 'Electrical', 'Plumbing', 'Sand', 'Bricks', 'Other'];

const CAT_COLORS = {
  Cement:     { bg: '#fff3e0', color: '#e65100' },
  Steel:      { bg: '#e8eaf6', color: '#3949ab' },
  Wood:       { bg: '#e8f5e9', color: '#2e7d32' },
  Electrical: { bg: '#fce4ec', color: '#c62828' },
  Plumbing:   { bg: '#e3f2fd', color: '#1565c0' },
  Sand:       { bg: '#f3e5f5', color: '#6a1b9a' },
  Bricks:     { bg: '#fff8e1', color: '#f57f17' },
  Other:      { bg: '#f5f5f5', color: '#424242' },
};

export function AdminMaterials() {
  const { materials, sites, addMaterial, deleteMaterial } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: 'Cement', customCategory: '', quantity: 0, unit: '', siteId: '', notes: '', photos: []
  });
  const [submitDone, setSubmitDone] = useState(false);

  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchSearch = !searchQ || m.name.toLowerCase().includes(searchQ.toLowerCase());
      const matchSite = !filterSite || m.siteId === filterSite;
      const matchCat = !filterCat || m.category === filterCat;
      return matchSearch && matchSite && matchCat;
    });
  }, [materials, searchQ, filterSite, filterCat]);

  const stats = useMemo(() => {
    const byCat = {};
    materials.forEach(m => { byCat[m.category] = (byCat[m.category] || 0) + 1; });
    const topCat = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';
    return { total: materials.length, topCat, sites: new Set(materials.map(m=>m.siteId)).size };
  }, [materials]);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.size <= 5*1024*1024);
    const encoded = await Promise.all(files.map(f => fileToBase64(f)));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...encoded] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCat = formData.category === 'Other' && formData.customCategory ? formData.customCategory : formData.category;
    addMaterial({ ...formData, category: finalCat, dateAdded: new Date().toISOString(), addedBy: 'Admin' });
    setSubmitDone(true);
    setTimeout(() => { setSubmitDone(false); setShowModal(false); setFormData({ name:'',category:'Cement',customCategory:'',quantity:0,unit:'',siteId:'',notes:'',photos:[] }); }, 900);
  };

  const catStyle = (cat) => CAT_COLORS[cat] || CAT_COLORS.Other;

  return (
    <div style={{ animation: 'pageFadeIn 0.4s ease' }}>

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, background: 'linear-gradient(135deg,#556ee6,#6f86ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight: 700 }}>
            Materials
          </h1>
          <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>
            Manage inventory across all construction sites
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ gap: 8, padding: '0.65rem 1.4rem', borderRadius: 10, boxShadow: '0 4px 14px rgba(85,110,230,0.35)', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
        >
          <Plus size={17} /> Add Material
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:20 }}>
        {[
          { label:'Total Materials', value: stats.total, color:'var(--primary-color)', icon:<Package size={20}/> },
          { label:'Sites Covered',   value: stats.sites,  color:'#34c38f',             icon:<Hammer size={20}/> },
          { label:'Top Category',    value: stats.topCat, color:'#f1b44c',             icon:<Filter size={20}/> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:14, borderTop:`3px solid ${s.color}`, transition:'box-shadow 0.2s', cursor:'default' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.09)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow=''}>
            <div style={{ width:42, height:42, borderRadius:10, background:`${s.color}18`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize:'0.78rem', marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card" style={{ marginBottom:20, padding:'0.9rem 1.25rem' }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:'1 1 220px' }}>
            <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
            <input type="text" className="form-input" placeholder="Search materials…" value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{ paddingLeft:36, borderRadius:8 }} />
          </div>
          <select className="form-select" style={{ flex:'1 1 150px', borderRadius:8 }} value={filterSite} onChange={e=>setFilterSite(e.target.value)}>
            <option value="">All Sites</option>
            {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="form-select" style={{ flex:'1 1 150px', borderRadius:8 }} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {(searchQ||filterSite||filterCat) && (
            <button className="btn btn-secondary" style={{ padding:'0.45rem 0.9rem', borderRadius:8, fontSize:'0.82rem' }}
              onClick={()=>{setSearchQ('');setFilterSite('');setFilterCat('');}}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Materials Table ── */}
      <div className="table-container" style={{ borderRadius:12 }}>
        <div style={{ padding:'1rem 1.4rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <strong style={{ fontSize:'0.95rem' }}>All Materials <span className="text-muted" style={{fontWeight:400}}>({filtered.length})</span></strong>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Material Name</th><th>Category</th><th>Quantity</th>
              <th>Site</th><th>Bills</th><th>Date Added</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mat, idx) => {
              const siteName = sites.find(s=>s.id===mat.siteId)?.name || 'Unknown';
              const cs = catStyle(mat.category);
              return (
                <tr key={mat.id} style={{ animation:`rowSlideIn 0.25s ease ${idx*0.03}s both`, transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-tertiary)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ color:'var(--text-tertiary)', fontSize:'0.82rem' }}>{idx+1}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:8,background:cs.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <Package size={15} style={{ color:cs.color }} />
                      </div>
                      <strong style={{ fontSize:'0.88rem' }}>{mat.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ padding:'0.22rem 0.65rem', borderRadius:20, fontSize:'0.76rem', fontWeight:600, background:cs.bg, color:cs.color }}>
                      {mat.category}
                    </span>
                  </td>
                  <td><strong>{mat.quantity}</strong> <span className="text-muted" style={{fontSize:'0.8rem'}}>{mat.unit}</span></td>
                  <td style={{ color:'var(--primary-color)', fontWeight:500, fontSize:'0.85rem' }}>{siteName}</td>
                  <td>
                    {mat.photos?.length > 0
                      ? <span style={{ display:'flex', alignItems:'center', gap:4, color:'#34c38f', fontSize:'0.82rem', fontWeight:600 }}>
                          <FileText size={13} /> {mat.photos.length} bill{mat.photos.length>1?'s':''}
                        </span>
                      : <span className="text-muted" style={{fontSize:'0.82rem'}}>None</span>}
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                    {new Date(mat.dateAdded || Date.now()).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {mat.photos?.length > 0 && (
                        <button title="View Bills"
                          onClick={()=>setViewModal(mat)}
                          style={{ width:32,height:32,borderRadius:8,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',color:'var(--primary-color)' }}
                          onMouseEnter={e=>{e.currentTarget.style.background='var(--primary-light)';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                          <Eye size={14}/>
                        </button>
                      )}
                      <button title="Delete"
                        onClick={()=>setDeleteConfirm(mat)}
                        style={{ width:32,height:32,borderRadius:8,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',color:'var(--danger-color)' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(244,106,106,0.1)';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign:'center', padding:'3rem', color:'var(--text-secondary)' }}>
                  <Package size={36} style={{ margin:'0 auto 0.75rem', opacity:0.3, display:'block' }} />
                  No materials found. Add your first material!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── View Bills Modal ── */}
      {viewModal && (
        <div className="modal-overlay" onClick={()=>setViewModal(null)} style={{ backdropFilter:'blur(6px)' }}>
          <div className="modal-content" style={{ maxWidth:620, borderRadius:16 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header" style={{ borderRadius:'16px 16px 0 0' }}>
              <h2 style={{ fontSize:'1rem' }}>Bills — {viewModal.name}</h2>
              <button className="close-btn" onClick={()=>setViewModal(null)}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                {viewModal.photos.map((p, i) => (
                  p.startsWith('data:image') ? (
                    <img key={i} src={p} alt={`bill-${i}`} style={{ width:'100%', borderRadius:10, objectFit:'cover', height:140 }}/>
                  ) : (
                    <a key={i} href={p} download={`bill-${i}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', height:140, borderRadius:10, background:'var(--bg-tertiary)', color:'var(--primary-color)', gap:6, textDecoration:'none', fontWeight:500 }}>
                      <FileText size={24}/> PDF {i+1}
                    </a>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Material Modal ── */}
      {showModal && (
        <div className="modal-overlay mat-modal-overlay"
          onClick={e=>{ if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="mat-modal-box"
            onClick={e=>e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'18px 18px 0 0', background:'linear-gradient(135deg,rgba(85,110,230,0.08),transparent)', flexShrink:0 }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>Add New Material</h2>
                <p className="text-muted" style={{ margin:'2px 0 0', fontSize:'0.8rem' }}>Fill in details to add to inventory</p>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ width:34,height:34,borderRadius:8,border:'1px solid var(--border-color)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)', flexShrink:0 }}>
                <X size={17}/>
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div style={{ overflowY:'auto', flex:1, minHeight:0 }}>
              <form id="matForm" onSubmit={handleSubmit} style={{ padding:'1.25rem 1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Material Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Portland Cement 53 Grade" required
                    style={{ borderRadius:8 }}
                    value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" style={{ borderRadius:8 }} value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})}>
                      {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    {formData.category==='Other' && (
                      <input type="text" className="form-input" style={{ marginTop:8, borderRadius:8 }} placeholder="Specify category" required
                        value={formData.customCategory} onChange={e=>setFormData({...formData,customCategory:e.target.value})} />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Site *</label>
                    <select className="form-select" style={{ borderRadius:8 }} required value={formData.siteId} onChange={e=>setFormData({...formData,siteId:e.target.value})}>
                      <option value="">Select a site</option>
                      {sites.filter(s=>s.status!=='Completed').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input type="number" className="form-input" style={{ borderRadius:8 }} placeholder="0" required min={1}
                      value={formData.quantity||''} onChange={e=>setFormData({...formData,quantity:Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit *</label>
                    <input type="text" className="form-input" style={{ borderRadius:8 }} placeholder="kg / bags / pcs / m³"
                      required value={formData.unit} onChange={e=>setFormData({...formData,unit:e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea className="form-input" style={{ borderRadius:8, minHeight:72, resize:'vertical' }} rows={3}
                    placeholder="Additional notes…"
                    value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} />
                </div>

                {/* Upload */}
                <div className="form-group">
                  <label className="form-label">Bill / Receipt Images (Optional)</label>
                  <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'1rem', borderRadius:10, border:'2px dashed var(--border-color)', cursor:'pointer', fontSize:'0.88rem', color:'var(--text-secondary)', transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--primary-color)';e.currentTarget.style.color='var(--primary-color)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-color)';e.currentTarget.style.color='var(--text-secondary)';}}>
                    <Upload size={16}/> Click to upload bills/receipts
                    <input type="file" multiple accept="image/*,application/pdf" style={{ display:'none' }} onChange={handlePhotoUpload}/>
                  </label>
                  {formData.photos.length > 0 && (
                    <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', alignItems:'center', gap:8 }}>
                      <span style={{ background:'rgba(52,195,143,0.12)', color:'#34c38f', padding:'0.25rem 0.75rem', borderRadius:20, fontSize:'0.78rem', fontWeight:600 }}>
                        ✓ {formData.photos.length} file{formData.photos.length>1?'s':''} attached
                      </span>
                      <button type="button" onClick={()=>setFormData({...formData,photos:[]})} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--danger-color)', fontSize:'0.8rem' }}>Remove all</button>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
                  <button type="submit" form="matForm"
                    style={{ flex:'1 1 140px', padding:'0.75rem', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.92rem', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                      background: submitDone ? '#34c38f' : 'var(--primary-color)', color:'white', boxShadow: submitDone ? '0 4px 14px rgba(52,195,143,0.4)' : '0 4px 14px rgba(85,110,230,0.35)' }}>
                    {submitDone ? <><CheckCircle size={16}/> Saved!</> : <><Plus size={16}/> Add Material</>}
                  </button>
                  <button type="button" onClick={()=>setShowModal(false)}
                    style={{ flex:'0 1 auto', padding:'0.75rem 1.25rem', borderRadius:10, border:'1px solid var(--border-color)', background:'transparent', cursor:'pointer', fontWeight:500, color:'var(--text-primary)', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-tertiary)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
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
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Delete Material?</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteMaterial(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: 'var(--danger-color)', color: 'white', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 14px rgba(244,106,106,0.35)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Animations + Mobile Modal Fix ── */}
      <style>{`
        @keyframes pageFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes rowSlideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:none} }

        .mat-modal-overlay {
          backdrop-filter: blur(6px);
          align-items: flex-start;
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }
        .mat-modal-box {
          background: var(--bg-secondary);
          border-radius: 18px;
          width: 100%;
          max-width: 640px;
          margin: auto;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          animation: modalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 3rem);
        }
        @media (max-width: 640px) {
          .mat-modal-overlay {
            padding: 0.75rem 0.5rem;
            align-items: flex-start;
          }
          .mat-modal-box {
            border-radius: 14px;
            max-height: calc(100dvh - 1.5rem);
          }
        }
      `}</style>
    </div>
  );
}


