'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { Hammer, Plus, Trash2, Camera, X } from 'lucide-react';
import { fileToBase64 } from '@/components/pages/Admin/AdminPages';

export function SupervisorMaterials() {
  const { currentUser, materials, sites, addMaterial, deleteMaterial, updateMaterial } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  const myAssignedSiteIds = assignedSites.map(s => s.id);
  
  const myMaterials = materials.filter(m => myAssignedSiteIds.includes(m.siteId));

  const [showModal, setShowModal] = useState(false);
  const defaultSiteId = assignedSites.length === 1 ? assignedSites[0].id : '';
  const [formData, setFormData] = useState({
    name: '', category: 'Cement', customCategory: '', quantity: 0, unit: '', siteId: defaultSiteId, notes: '', photos: []
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Please upload a valid image file (JPG, PNG, or GIF)');
    }
    const encoded = await Promise.all(validFiles.map(f => fileToBase64(f)));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...encoded] }));
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      newPhotos.splice(index, 1);
      return { ...prev, photos: newPhotos };
    });
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!formData.siteId) return alert('Please select a site');
    const finalCategory = formData.category === 'Other' && formData.customCategory ? formData.customCategory : formData.category;
    addMaterial({ ...formData, category: finalCategory, dateAdded: new Date().toISOString(), addedBy: currentUser.id });
    setFormData({ name: '', category: 'Cement', customCategory: '', quantity: 0, unit: '', siteId: defaultSiteId, notes: '', photos: [] });
    setShowModal(false);
  };

  const handleDelete = (mat) => {
    if (mat.addedBy !== currentUser.id) {
       return alert('You can only edit or delete materials you have added');
    }
    deleteMaterial(mat.id);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Materials Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="table-container pt-2">
        <table className="table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Category</th>
              <th>Quantity/Unit</th>
              <th>Site</th>
              <th>Photos</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myMaterials.map(mat => {
              const siteName = sites.find(s => s.id === mat.siteId)?.name || 'Unknown';
              const canEdit = mat.addedBy === currentUser.id;
              return (
                <tr key={mat.id}>
                  <td><strong>{mat.name}</strong></td>
                  <td><span className="badge badge-primary">{mat.category}</span></td>
                  <td>{mat.quantity} {mat.unit}</td>
                  <td>{siteName}</td>
                  <td>
                    {mat.photos?.length > 0 ? (
                      <div className="flex gap-1">
                        <img src={mat.photos[0]} alt="preview" style={{width: '32px', height: '32px', objectFit:'cover', borderRadius: '4px'}} />
                        {mat.photos.length > 1 && <span className="text-small text-muted">+{mat.photos.length - 1}</span>}
                      </div>
                    ) : 'None'}
                  </td>
                  <td>
                    {canEdit ? (
                      <button className="btn-icon" onClick={() => handleDelete(mat)}><Trash2 size={16} color="var(--danger-color)"/></button>
                    ) : (
                      <span className="text-small text-muted" title="Added by Admin">Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {myMaterials.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No materials added for your assigned site(s)</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Material</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
               <form id="sMatForm" onSubmit={handleAddMaterial}>
                <div className="form-group"><label className="form-label">Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">Category</label>
                    <select className="form-select" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {['Cement', 'Steel', 'Wood', 'Electrical', 'Plumbing', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formData.category === 'Other' && (
                      <input type="text" className="form-input mt-2" placeholder="Enter other category" required value={formData.customCategory || ''} onChange={e => setFormData({...formData, customCategory: e.target.value})} />
                    )}
                  </div>
                  <div className="form-group"><label className="form-label">Assigned Site</label>
                    {assignedSites.length === 1 ? (
                      <input type="text" readOnly className="form-input bg-tertiary" value={assignedSites[0].name} />
                    ) : (
                      <select className="form-select" required value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})}>
                        <option value="">Select Site</option>
                        {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">Quantity</label>
                    <input type="number" className="form-input" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                  </div>
                  <div className="form-group"><label className="form-label">Unit (e.g. bags, tons)</label>
                    <input type="text" className="form-input" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Notes (Optional)</label>
                  <input type="text" className="form-input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><Camera size={16}/> Upload Photos</label>
                  <input type="file" multiple accept="image/png, image/jpeg, image/gif" className="form-input" onChange={handlePhotoUpload} />
                  {formData.photos.length > 0 && (
                    <div className="photo-grid mt-2">
                       {formData.photos.map((p, i) => (
                         <div key={i} style={{position: 'relative'}}>
                           <img src={p} alt="upload" className="photo-thumb" />
                           <button type="button" onClick={() => removePhoto(i)} style={{position:'absolute', top: 2, right: 2, background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', cursor:'pointer'}}><X size={12}/></button>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
               <button form="sMatForm" className="btn btn-primary" type="submit">Save Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


