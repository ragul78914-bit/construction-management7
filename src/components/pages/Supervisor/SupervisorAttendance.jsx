'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import useStore from '@/store/useStore';
import {
  CalendarDays, CheckCircle2, XCircle, Clock4,
  DollarSign, Users, ChevronLeft, ChevronRight, Save
} from 'lucide-react';

const STATUS_OPTIONS = ['Present', 'Absent', 'Half-day', 'Leave'];

const STATUS_COLORS = {
  Present:  { bg: 'rgba(52,195,143,0.12)', color: '#34c38f', border: '1px solid rgba(52,195,143,0.3)' },
  Absent:   { bg: 'rgba(244,106,106,0.12)', color: '#f46a6a', border: '1px solid rgba(244,106,106,0.3)' },
  'Half-day':{ bg: 'rgba(241,180,76,0.15)', color: '#f1b44c', border: '1px solid rgba(241,180,76,0.3)' },
  Leave:    { bg: 'rgba(166,176,207,0.12)', color: '#a6b0cf', border: '1px solid rgba(166,176,207,0.3)' },
};

function dateStr(d) { return d.toISOString().split('T')[0]; }

export function SupervisorAttendance() {
  const { currentUser, sites, users, attendanceEntries, upsertAttendance } = useStore();

  const assignedSites = sites.filter(
    s => (currentUser?.assignedSites || []).includes(s.id) || s.supervisorId === currentUser?.id
  );

  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(dateStr(new Date()));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const siteWorkers = users.filter(
    u => u.role === 'Worker' && u.assignedSite === selectedSiteId
  );

  // Build local editable state: { workerId: { status, wageOverride } }
  const existingForDate = useMemo(
    () => attendanceEntries.filter(a => a.siteId === selectedSiteId && a.date === selectedDate),
    [attendanceEntries, selectedSiteId, selectedDate]
  );

  const [rows, setRows] = useState({});

  // Sync rows when date/site/workers change
  const getRow = (worker) => {
    const key = `${selectedSiteId}_${selectedDate}_${worker.id}`;
    if (rows[key]) return rows[key];
    const existing = existingForDate.find(a => a.workerId === worker.id);
    return {
      status: existing?.status || 'Present',
      wageOverride: existing?.wageAmount ?? worker.dailyWage ?? 0,
      notes: existing?.notes || '',
    };
  };

  const setRow = (workerId, field, value) => {
    const key = `${selectedSiteId}_${selectedDate}_${workerId}`;
    setRows(prev => ({
      ...prev,
      [key]: { ...getRow(siteWorkers.find(w => w.id === workerId)), [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    siteWorkers.forEach(worker => {
      const row = getRow(worker);
      const wage = row.status === 'Absent' ? 0
        : row.status === 'Half-day' ? (Number(row.wageOverride) / 2)
        : Number(row.wageOverride);
      upsertAttendance({
        workerId: worker.id,
        workerName: worker.name,
        siteId: selectedSiteId,
        date: selectedDate,
        status: row.status,
        wageAmount: wage,
        notes: row.notes,
        markedBy: currentUser?.id,
        markedByName: currentUser?.name,
      });
    });
    setTimeout(() => { setSaving(false); setSaved(true); }, 400);
  };

  // Navigate dates
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(dateStr(d));
    setSaved(false);
  };

  // Summary stats for selected date
  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, 'Half-day': 0, Leave: 0 };
    let totalWage = 0;
    siteWorkers.forEach(w => {
      const row = getRow(w);
      counts[row.status] = (counts[row.status] || 0) + 1;
      if (row.status !== 'Absent') {
        totalWage += row.status === 'Half-day' ? Number(row.wageOverride) / 2 : Number(row.wageOverride);
      }
    });
    return { counts, totalWage };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, siteWorkers, selectedDate, selectedSiteId, existingForDate]);

  if (assignedSites.length === 0) {
    return (
      <div>
        <div className="page-header"><h1>Attendance</h1></div>
        <p className="text-muted">No assigned sites found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 2 }}>Attendance & Wages</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Mark daily attendance and wages for your site workers
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || siteWorkers.length === 0}
          style={{ gap: 8, minWidth: 120 }}
        >
          {saving ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="spinner-sm" />Saving…
            </span>
          ) : saved ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} />Saved!
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={16} />Save Attendance
            </span>
          )}
        </button>
      </div>

      {/* Controls Bar */}
      <div className="card card-body" style={{ marginBottom: 20, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Site selector */}
          {assignedSites.length > 1 && (
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" style={{ marginBottom: 4 }}>Site</label>
              <select
                className="form-select"
                value={selectedSiteId}
                onChange={e => { setSelectedSiteId(e.target.value); setSaved(false); }}
              >
                {assignedSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Date navigator */}
          <div style={{ flex: '1 1 260px' }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Date</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.7rem' }}
                onClick={() => shiftDate(-1)}
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                className="form-input"
                style={{ flex: 1 }}
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSaved(false); }}
              />
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.7rem' }}
                onClick={() => shiftDate(1)}
                disabled={selectedDate >= dateStr(new Date())}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 16, marginBottom: 20 }}>
        {Object.entries(STATUS_COLORS).map(([status, style]) => (
          <div key={status} className="card card-body"
            style={{ padding: '1rem', textAlign: 'center', borderTop: `3px solid ${style.color}` }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: style.color }}>
              {summary.counts[status] || 0}
            </div>
            <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 2 }}>{status}</div>
          </div>
        ))}
        <div className="card card-body"
          style={{ padding: '1rem', textAlign: 'center', borderTop: '3px solid var(--primary-color)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            ₹{summary.totalWage.toLocaleString()}
          </div>
          <div className="text-muted" style={{ fontSize: '0.82rem', marginTop: 2 }}>Total Wages Today</div>
        </div>
      </div>

      {/* Attendance Table */}
      {siteWorkers.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
          <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No workers assigned to this site yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Worker</th>
                <th>Trade</th>
                <th>Status</th>
                <th>Daily Wage (₹)</th>
                <th>Payable (₹)</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {siteWorkers.map((worker, idx) => {
                const row = getRow(worker);
                const st = STATUS_COLORS[row.status] || {};
                const payable = row.status === 'Absent' ? 0
                  : row.status === 'Half-day' ? Number(row.wageOverride) / 2
                  : Number(row.wageOverride);
                return (
                  <tr key={worker.id}>
                    <td style={{ color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{worker.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{worker.phone}</div>
                    </td>
                    <td><span className="badge badge-primary">{worker.trade || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRow(worker.id, 'status', s)}
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: 20,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              background: row.status === s ? STATUS_COLORS[s]?.bg : 'transparent',
                              color: row.status === s ? STATUS_COLORS[s]?.color : 'var(--text-secondary)',
                              border: row.status === s ? STATUS_COLORS[s]?.border : '1px solid var(--border-color)',
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 100, padding: '0.4rem 0.6rem' }}
                        min={0}
                        value={row.wageOverride}
                        onChange={e => setRow(worker.id, 'wageOverride', e.target.value)}
                        disabled={row.status === 'Absent'}
                      />
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: payable > 0 ? 'var(--success-color)' : 'var(--danger-color)',
                        fontSize: '1rem',
                      }}>
                        ₹{payable.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: 160, padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                        placeholder="Optional note"
                        value={row.notes}
                        onChange={e => setRow(worker.id, 'notes', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


