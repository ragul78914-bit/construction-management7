import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import {
  Users, Building2, DollarSign, CalendarDays,
  TrendingUp, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

const STATUS_COLORS = {
  Present:   { bg: 'rgba(52,195,143,0.12)',  color: '#34c38f' },
  Absent:    { bg: 'rgba(244,106,106,0.12)', color: '#f46a6a' },
  'Half-day':{ bg: 'rgba(241,180,76,0.15)',  color: '#f1b44c' },
  Leave:     { bg: 'rgba(166,176,207,0.12)', color: '#a6b0cf' },
};

function dateStr(d) { return d.toISOString().split('T')[0]; }

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0);
  return { start: dateStr(start), end: dateStr(end), days: end.getDate() };
}

export function AdminAttendance() {
  const { sites, users, attendanceEntries } = useStore();

  const today = new Date();
  const [view, setView]               = useState('daily');   // 'daily' | 'monthly' | 'summary'
  const [selectedDate, setSelectedDate] = useState(dateStr(today));
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [monthYear, setMonthYear]     = useState({ year: today.getFullYear(), month: today.getMonth() });

  const workers    = users.filter(u => u.role === 'Worker');
  const supervisors = users.filter(u => u.role === 'Supervisor');

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(dateStr(d));
  };

  const shiftMonth = (delta) => {
    setMonthYear(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0)  { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── DAILY VIEW DATA ──────────────────────────────────────────────
  const dailyEntries = useMemo(() => {
    return attendanceEntries.filter(a =>
      a.date === selectedDate &&
      (selectedSiteId ? a.siteId === selectedSiteId : true)
    );
  }, [attendanceEntries, selectedDate, selectedSiteId]);

  const dailyStats = useMemo(() => {
    const counts = { Present: 0, Absent: 0, 'Half-day': 0, Leave: 0, Unmarked: 0 };
    let totalWage = 0;
    const relevantWorkers = selectedSiteId
      ? workers.filter(w => w.assignedSite === selectedSiteId)
      : workers;

    relevantWorkers.forEach(w => {
      const entry = dailyEntries.find(a => a.workerId === w.id);
      if (!entry) { counts.Unmarked++; return; }
      counts[entry.status] = (counts[entry.status] || 0) + 1;
      totalWage += entry.wageAmount || 0;
    });
    return { counts, totalWage, total: relevantWorkers.length };
  }, [dailyEntries, workers, selectedSiteId]);

  // ── MONTHLY VIEW DATA ─────────────────────────────────────────────
  const { start: mStart, end: mEnd, days: mDays } = getMonthRange(monthYear.year, monthYear.month);

  const monthlyEntries = useMemo(() => {
    return attendanceEntries.filter(a =>
      a.date >= mStart && a.date <= mEnd &&
      (selectedSiteId ? a.siteId === selectedSiteId : true)
    );
  }, [attendanceEntries, mStart, mEnd, selectedSiteId]);

  const monthlyWorkerStats = useMemo(() => {
    const relevantWorkers = selectedSiteId
      ? workers.filter(w => w.assignedSite === selectedSiteId)
      : workers;

    return relevantWorkers.map(w => {
      const wEntries = monthlyEntries.filter(a => a.workerId === w.id);
      const present  = wEntries.filter(a => a.status === 'Present').length;
      const halfDay  = wEntries.filter(a => a.status === 'Half-day').length;
      const absent   = wEntries.filter(a => a.status === 'Absent').length;
      const leave    = wEntries.filter(a => a.status === 'Leave').length;
      const totalWage = wEntries.reduce((s, a) => s + (a.wageAmount || 0), 0);
      const site = sites.find(s => s.id === w.assignedSite);
      const supervisor = supervisors.find(s => s.id === site?.supervisorId);
      return { ...w, present, halfDay, absent, leave, totalWage, siteName: site?.name || '—', supervisorName: supervisor?.name || '—' };
    });
  }, [monthlyEntries, workers, sites, supervisors, selectedSiteId]);

  const monthlyTotal = monthlyWorkerStats.reduce((s, w) => s + w.totalWage, 0);

  // ── SITE SUMMARY ─────────────────────────────────────────────────
  const siteSummary = useMemo(() => {
    return sites.map(site => {
      const siteWorkers = workers.filter(w => w.assignedSite === site.id);
      const siteEntries = monthlyEntries.filter(a => a.siteId === site.id);
      const totalWage   = siteEntries.reduce((s, a) => s + (a.wageAmount || 0), 0);
      const presentDays = siteEntries.filter(a => a.status === 'Present').length;
      const supervisor  = supervisors.find(s => s.id === site.supervisorId);
      return { ...site, workerCount: siteWorkers.length, totalWage, presentDays, supervisorName: supervisor?.name || '—' };
    });
  }, [sites, workers, monthlyEntries, supervisors]);

  const handleExport = () => {
    const rows = [
      ['Worker', 'Trade', 'Site', 'Supervisor', 'Present', 'Half-day', 'Absent', 'Leave', 'Total Wage (₹)'],
      ...monthlyWorkerStats.map(w => [w.name, w.trade, w.siteName, w.supervisorName, w.present, w.halfDay, w.absent, w.leave, w.totalWage]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${monthNames[monthYear.month]}_${monthYear.year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 2 }}>Attendance Monitor</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            View and track worker attendance and wages across all sites
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {view === 'monthly' && (
            <button className="btn btn-secondary" style={{ gap: 6, display: 'flex', alignItems: 'center' }} onClick={handleExport}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* View Tabs + Filters */}
      <div className="card card-body" style={{ marginBottom: 20, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* View Toggle */}
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>View</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['daily', 'monthly', 'summary'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={v === view ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Site Filter */}
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Filter by Site</label>
            <select className="form-select" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)}>
              <option value="">All Sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Date / Month Navigator */}
          {view === 'daily' && (
            <div style={{ flex: '1 1 240px' }}>
              <label className="form-label" style={{ marginBottom: 4 }}>Date</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => shiftDate(-1)}>
                  <ChevronLeft size={16} />
                </button>
                <input type="date" className="form-input" style={{ flex: 1 }} value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)} />
                <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }}
                  onClick={() => shiftDate(1)} disabled={selectedDate >= dateStr(new Date())}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          {(view === 'monthly' || view === 'summary') && (
            <div>
              <label className="form-label" style={{ marginBottom: 4 }}>Month</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => shiftMonth(-1)}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontWeight: 600, minWidth: 90, textAlign: 'center' }}>
                  {monthNames[monthYear.month]} {monthYear.year}
                </span>
                <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => shiftMonth(1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DAILY VIEW ─────────────────────────────────────────── */}
      {view === 'daily' && (
        <>
          {/* Daily Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Workers', value: dailyStats.total, color: 'var(--primary-color)' },
              { label: 'Present',  value: dailyStats.counts.Present,    color: '#34c38f' },
              { label: 'Absent',   value: dailyStats.counts.Absent,     color: '#f46a6a' },
              { label: 'Half-day', value: dailyStats.counts['Half-day'], color: '#f1b44c' },
              { label: 'Unmarked', value: dailyStats.counts.Unmarked,   color: '#a6b0cf' },
            ].map(s => (
              <div key={s.label} className="card card-body"
                style={{ padding: '1rem', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
            <div className="card card-body"
              style={{ padding: '1rem', textAlign: 'center', borderTop: '3px solid var(--primary-color)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                ₹{dailyStats.totalWage.toLocaleString()}
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>Wages Today</div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="table-container">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <strong>Daily Attendance — {selectedDate}</strong>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th><th>Trade</th><th>Site</th><th>Supervisor</th>
                  <th>Status</th><th>Check In</th><th>Check Out</th><th>Wage (₹)</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(selectedSiteId ? workers.filter(w => w.assignedSite === selectedSiteId) : workers).map(worker => {
                  const entry = dailyEntries.find(a => a.workerId === worker.id);
                  const site = sites.find(s => s.id === worker.assignedSite);
                  const sup  = supervisors.find(s => s.id === site?.supervisorId);
                  const sc   = STATUS_COLORS[entry?.status] || {};
                  return (
                    <tr key={worker.id}>
                      <td><strong>{worker.name}</strong><br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{worker.phone}</span>
                      </td>
                      <td><span className="badge badge-primary">{worker.trade || '—'}</span></td>
                      <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{site?.name || '—'}</td>
                      <td className="text-muted">{sup?.name || '—'}</td>
                      <td>
                        {entry ? (
                          <span style={{
                            padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.78rem',
                            fontWeight: 600, background: sc.bg, color: sc.color,
                          }}>{entry.status}</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Not marked</span>
                        )}
                      </td>
                      <td>{entry?.checkInT  || '—'}</td>
                      <td>{entry?.checkOutT || '—'}</td>
                      <td style={{ fontWeight: 600, color: entry?.wageAmount > 0 ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                        {entry ? `₹${(entry.wageAmount || 0).toLocaleString()}` : '—'}
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.82rem' }}>{entry?.notes || '—'}</td>
                    </tr>
                  );
                })}
                {workers.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted">No workers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── MONTHLY VIEW ─────────────────────────────────────────── */}
      {view === 'monthly' && (
        <>
          <div className="table-container">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Monthly Summary — {monthNames[monthYear.month]} {monthYear.year}</strong>
              <span className="badge badge-primary">Total Wages: ₹{monthlyTotal.toLocaleString()}</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th><th>Trade</th><th>Site</th><th>Supervisor</th>
                  <th style={{ color: '#34c38f' }}>Present</th>
                  <th style={{ color: '#f1b44c' }}>Half-day</th>
                  <th style={{ color: '#f46a6a' }}>Absent</th>
                  <th style={{ color: '#a6b0cf' }}>Leave</th>
                  <th style={{ color: 'var(--primary-color)' }}>Total Wage (₹)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyWorkerStats.map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong><br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.phone}</span>
                    </td>
                    <td><span className="badge badge-primary">{w.trade || '—'}</span></td>
                    <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{w.siteName}</td>
                    <td className="text-muted">{w.supervisorName}</td>
                    <td><span style={{ fontWeight: 700, color: '#34c38f' }}>{w.present}</span></td>
                    <td><span style={{ fontWeight: 700, color: '#f1b44c' }}>{w.halfDay}</span></td>
                    <td><span style={{ fontWeight: 700, color: '#f46a6a' }}>{w.absent}</span></td>
                    <td><span style={{ fontWeight: 700, color: '#a6b0cf' }}>{w.leave}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--success-color)', fontSize: '1rem' }}>
                      ₹{w.totalWage.toLocaleString()}
                    </span></td>
                  </tr>
                ))}
                {monthlyWorkerStats.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-muted">No attendance data for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── SITE SUMMARY VIEW ─────────────────────────────────── */}
      {view === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
          {siteSummary.map(site => (
            <div key={site.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{site.name}</h3>
                    <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 2 }}>
                      Supervisor: {site.supervisorName}
                    </div>
                  </div>
                  <span className={`badge badge-${site.status === 'Active' ? 'success' : site.status === 'On Hold' ? 'warning' : 'primary'}`}>
                    {site.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Workers',        value: site.workerCount,   color: 'var(--primary-color)' },
                    { label: 'Present Days',   value: site.presentDays,   color: '#34c38f' },
                    { label: `Wages (${monthNames[monthYear.month]})`, value: `₹${site.totalWage.toLocaleString()}`, color: 'var(--success-color)' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'var(--bg-tertiary)', borderRadius: 8,
                      padding: '0.6rem 0.85rem', textAlign: 'center',
                    }}>
                      <div style={{ fontWeight: 700, color: s.color, fontSize: '1.1rem' }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
