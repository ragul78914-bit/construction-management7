'use client';
import Link from 'next/link';
import { useState } from 'react';
import useStore from '@/store/useStore';
import { Building2, HardHat, Hammer, Map, Image as ImageIcon } from 'lucide-react';


export function SupervisorDashboard() {
  const { currentUser, sites, users, materials } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  const activeSites = assignedSites.filter(s => s.status === 'Active');
  
  const siteWorkers = users.filter(u => u.role === 'Worker' && assignedSites.map(s => s.id).includes(u.assignedSite));
  const siteMaterials = materials.filter(m => assignedSites.map(s => s.id).includes(m.siteId));

  return (
    <div>
      <div className="larkon-grid-container">
        <div>
          <div className="larkon-stats-grid">
            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Building2 size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Assigned Sites</div>
                   <div className="value">{assignedSites.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{activeSites.length} <span className="text-muted">Active Now</span></span>
                 <Link to="/supervisor/site-overview" className="view-more">View All</Link>
               </div>
            </div>

            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><HardHat size={24} /></div>
                 <div className="stat-info">
                   <div className="title">My Workers</div>
                   <div className="value">{siteWorkers.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{siteWorkers.filter(w => w.status === 'Active').length} <span className="text-muted">Active</span></span>
                 <Link to="/supervisor/workers" className="view-more">View All</Link>
               </div>
            </div>

            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Hammer size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Site Inventory</div>
                   <div className="value">{siteMaterials.length}</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="trend-up" style={{ color: '#34c38f' }}>{new Set(siteMaterials.map(m => m.category)).size} <span className="text-muted">Categories</span></span>
                 <Link to="/supervisor/materials" className="view-more">View All</Link>
               </div>
            </div>
            
            <div className="card stat-card-larkon">
               <div className="stat-header">
                 <div className="stat-icon-wrapper"><Map size={24} /></div>
                 <div className="stat-info">
                   <div className="title">Reports</div>
                   <div className="value">--</div>
                 </div>
               </div>
               <div className="stat-footer">
                 <span className="text-muted">No recent reports</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupervisorSiteOverview() {
  const { currentUser, sites, spendRecords, users, materials, attendanceEntries } = useStore();
  const assignedSitesIds = currentUser?.assignedSites || [];
  const assignedSites = sites.filter(s => assignedSitesIds.includes(s.id) || s.supervisorId === currentUser?.id);
  
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  if (assignedSites.length === 0) {
    return <div><div className="page-header"><h1>Site Overview</h1></div><p>No assigned sites found.</p></div>;
  }
  
  if (selectedSiteId) {
    const site = sites.find(s => s.id === selectedSiteId);
    const siteWorkers = users.filter(u => u.role === 'Worker' && u.assignedSite === site.id);
    const siteMaterials = materials.filter(m => m.siteId === site.id);
    const siteAttendance = attendanceEntries.filter(a => siteWorkers.map(w=>w.id).includes(a.workerId));
    
    return (
      <div className="animate-fade-in">
        <div className="page-header flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button className="btn btn-outline" onClick={() => setSelectedSiteId(null)} style={{ padding: '0.4rem 0.8rem' }}>Back</button>
            <h1 style={{ margin: 0 }}>{site.name}</h1>
          </div>
        </div>
        
        <div className="tabs mb-4">
          {['Overview', 'Workers', 'Materials', 'Attendance'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>
        
        {activeTab === 'Overview' && (
          <div className="card p-4">
             <h3>{site.name}</h3>
             <p className="text-muted">{site.location}</p>
             <div className="mt-3"><strong>Status:</strong> <span className="badge badge-primary">{site.status}</span></div>
          </div>
        )}
        
        {activeTab === 'Workers' && (
          <div className="table-container bg-secondary">
            <table className="table">
              <thead><tr><th>Name</th><th>Trade</th><th>Contact</th><th>Status</th></tr></thead>
              <tbody>
                {siteWorkers.map(w => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{w.trade}</td>
                    <td>{w.phone}</td>
                    <td>{w.status}</td>
                  </tr>
                ))}
                {siteWorkers.length === 0 && <tr><td colSpan={4} className="text-center text-muted">No workers assigned</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'Materials' && (
          <div className="table-container bg-secondary">
            <table className="table">
              <thead><tr><th>Item</th><th>Category</th><th>Quantity</th></tr></thead>
              <tbody>
                {siteMaterials.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.category}</td>
                    <td>{m.quantity}</td>
                  </tr>
                ))}
                {siteMaterials.length === 0 && <tr><td colSpan={3} className="text-center text-muted">No materials recorded</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        
        {activeTab === 'Attendance' && (
          <div className="card p-4 text-center text-muted">
             View the attendance dashboard to manage daily attendance.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Assigned Sites Overview</h1>
      </div>
      <div className="dashboard-grid">
        {assignedSites.map(site => {
          const siteSpend = spendRecords.filter(sp => sp.siteId === site.id);
          const totalSpendAmount = siteSpend.reduce((sum, sp) => sum + sp.amount, 0);
          const remainingBalance = site.totalBudget - totalSpendAmount;

          return (
            <div key={site.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setSelectedSiteId(site.id)} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              {site.image ? (
                <img src={site.image} alt={site.name} className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />
              ) : (
                <div className="card-img-top flex items-center justify-center bg-gray-200" style={{ height: 160, backgroundColor: 'var(--bg-tertiary)' }}>
                  <ImageIcon size={48} color="var(--text-secondary)" />
                </div>
              )}
              <div className="card-body">
                <h3>{site.name}</h3>
                <p className="text-muted text-small mb-2">{site.location}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="badge badge-primary">{site.status}</span>
                  <span className="text-small text-muted">{site.startDate} - {site.endDate || 'Present'}</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>View Details</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


