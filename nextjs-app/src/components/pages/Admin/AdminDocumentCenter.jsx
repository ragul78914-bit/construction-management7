'use client';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { Search, FileText, FileImage, Download, Eye, X, Filter } from 'lucide-react';

function DocIcon({ fileType }) {
  const isImg = fileType?.startsWith('image/');
  return isImg ? <FileImage size={24} style={{ color: '#556ee6' }} /> : <FileText size={24} style={{ color: '#f1b44c' }} />;
}

export function AdminDocumentCenter() {
  const { sites, users, materials } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Sites, Clients, Workers, Supervisors, Materials
  const [viewDoc, setViewDoc] = useState(null);

  // Aggregate all documents
  const allDocs = [];

  // Site Docs
  sites.forEach(site => {
    (site.documents || []).forEach(doc => {
      allDocs.push({ ...doc, source: 'Site', sourceName: site.name, linkId: site.id });
    });
    (site.client?.documents || []).forEach(doc => {
      allDocs.push({ ...doc, source: 'Client', sourceName: site.client.name || 'Client', linkId: site.id });
    });
  });

  // User Docs
  users.forEach(user => {
    (user.documents || []).forEach(doc => {
      allDocs.push({ ...doc, source: user.role, sourceName: user.name, linkId: user.id });
    });
  });

  // Material Docs
  materials.forEach(material => {
    (material.photos || []).forEach((photo, idx) => {
      allDocs.push({
        id: `mat_${material.id}_${idx}`,
        fileName: `${material.name} - Photo ${idx + 1}`,
        fileType: 'image/jpeg',
        uploadDate: new Date().toISOString(), // Mock date as materials might not have upload date
        uploadedBy: 'System',
        content: photo,
        source: 'Material',
        sourceName: material.name,
        linkId: material.id
      });
    });
  });

  // Filter and Sort
  const filteredDocs = allDocs
    .filter(doc => filterType === 'All' || doc.source === filterType || (filterType === 'Workers' && doc.source === 'Worker') || (filterType === 'Supervisors' && doc.source === 'Supervisor'))
    .filter(doc => !search || doc.fileName.toLowerCase().includes(search.toLowerCase()) || doc.sourceName?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));

  const handleDownload = (doc) => {
    const a = document.createElement('a');
    a.href = doc.content;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0, background: 'linear-gradient(135deg, var(--primary-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>
            Document Center
          </h1>
          <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>A centralized view of all files across the platform</p>
        </div>
      </div>

      <div className="card p-4 mb-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="form-input" placeholder="Search files by name or source..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} className="text-muted" />
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
            <option value="All">All Documents</option>
            <option value="Site">Site Documents</option>
            <option value="Client">Client Documents</option>
            <option value="Worker">Worker Documents</option>
            <option value="Supervisor">Supervisor Documents</option>
            <option value="Material">Material Photos</option>
          </select>
        </div>
      </div>

      <div className="table-container bg-secondary border-rounded">
        <table className="table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Source</th>
              <th>Date</th>
              <th>Uploaded By</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted" style={{ padding: '3rem 1rem' }}>
                  <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                  <div>No documents found matching your criteria.</div>
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc, i) => (
                <tr key={doc.id || i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DocIcon fileType={doc.fileType} />
                      </div>
                      <div style={{ fontWeight: 600 }}>{doc.fileName}</div>
                    </div>
                  </td>
                  <td>
                    <div><span className={`badge`} style={{ backgroundColor: 'var(--primary-color)', opacity: 0.8 }}>{doc.source}</span></div>
                    <div className="text-small text-muted mt-1">{doc.sourceName}</div>
                  </td>
                  <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td>{doc.uploadedBy || 'System'}</td>
                  <td className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setViewDoc(doc)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Eye size={14} /> View
                      </button>
                      <button onClick={() => handleDownload(doc)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', flexDirection: 'column' }} onClick={e => { if (e.target === e.currentTarget) setViewDoc(null); }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DocIcon fileType={viewDoc.fileType} />
              <span style={{ color: '#fff', fontWeight: 600 }}>{viewDoc.fileName}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(viewDoc)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                <Download size={16} /> Download
              </button>
              <button onClick={() => setViewDoc(null)} style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflow: 'auto' }}>
            {viewDoc.fileType?.startsWith('image/') ? (
              <img src={viewDoc.content} alt={viewDoc.fileName} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
            ) : (
              <iframe src={viewDoc.content} title={viewDoc.fileName} style={{ width: '100%', height: '85vh', border: 'none', borderRadius: 8, backgroundColor: '#fff' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
