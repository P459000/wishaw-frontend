import { useState, useEffect } from 'react';
import API from '../../services/api';

interface EventForm {
  eventName: string;
  location: string;
  hours: number | '';
  personsNeeded: number | '';
  qualifications: string[];
  startDate: string;
  endDate: string;
}

const ALL_QUALIFICATIONS = [
  'sportsactivity',
  'yogatraining',
  'volunteering',
  'mentorship training'
];

// ── Fulfilment helpers ────────────────────────────────────────────────────────
const getAssignedPersons = (e: any): number =>
  Array.isArray(e.assignedStaff) ? e.assignedStaff.length : 0;

const getTotalAssignedHours = (e: any, allUsers: any[]): number => {
  if (!Array.isArray(e.assignedStaff)) return 0;
  return e.assignedStaff.reduce((sum: number, staffId: string) => {
    const user = allUsers.find((u: any) =>
      u._id === staffId || u._id?.toString() === staffId?.toString()
    );
    return sum + (user?.hoursPerWeek || 0);
  }, 0);
};

const isPersonsFulfilled = (e: any): boolean =>
  getAssignedPersons(e) >= (e.personsNeeded || 0);

const isHoursFulfilled = (e: any, allUsers: any[]): boolean =>
  getTotalAssignedHours(e, allUsers) >= (e.hours || 0);

const isFullyFulfilled = (e: any, allUsers: any[]): boolean =>
  isPersonsFulfilled(e) && isHoursFulfilled(e, allUsers);

// ─────────────────────────────────────────────────────────────────────────────

const EventCreation = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [form, setForm] = useState<EventForm>({
    eventName: '',
    location: '',
    hours: '',
    personsNeeded: '',
    qualifications: [],
    startDate: '',
    endDate: '',
  });
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayISO = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      const [evRes, usrRes] = await Promise.all([
        API.get('/events'),
        API.get('/users'),
      ]);
      setEvents(evRes.data);
      setAllUsers(usrRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setApiError('');
    setSuccessMsg('');
  };

  const handleQualificationToggle = (q: string) => {
    setForm((prev) => {
      const isSelected = prev.qualifications.includes(q);
      const updated = isSelected
        ? prev.qualifications.filter((item) => item !== q)
        : [...prev.qualifications, q];
      return { ...prev, qualifications: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventName || !form.location || !form.hours || !form.personsNeeded || !form.startDate || !form.endDate) {
      setApiError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post('/events', form);
      setSuccessMsg('Event Template created successfully!');
      setForm({
        eventName: '',
        location: '',
        hours: '',
        personsNeeded: '',
        qualifications: [],
        startDate: '',
        endDate: '',
      });
      fetchData();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Sidebar event counts ───────────────────────────────────────────────────
  const fulfilledCount  = events.filter(e => isFullyFulfilled(e, allUsers)).length;
  const pendingCount    = events.length - fulfilledCount;

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* ── LEFT SIDEBAR: Event Status Overview ────────────────────────────── */}
      <div style={{
        width: '300px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Summary Pills */}
        <div className="admin-table-card" style={{ padding: '20px' }}>
          <h3 className="section-title" style={{ marginBottom: '16px', fontSize: '15px' }}>
            📅 Event Status Overview
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              flex: 1, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>{fulfilledCount}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>FULFILLED</p>
            </div>
            <div style={{
              flex: 1, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
              borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#eab308' }}>{pendingCount}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>NEEDS STAFF</p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Click an event below to view full details.
          </p>
        </div>

        {/* Event Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No events created yet.
            </div>
          ) : (
            events.map((e) => {
              const fulfilled = isFullyFulfilled(e, allUsers);
              const personsFilled = isPersonsFulfilled(e);
              const hoursFilled = isHoursFulfilled(e, allUsers);
              const assignedPersons = getAssignedPersons(e);
              const assignedHours = getTotalAssignedHours(e, allUsers);
              const isSelected = selectedEvent?._id === e._id;

              return (
                <div
                  key={e._id}
                  onClick={() => setSelectedEvent(isSelected ? null : e)}
                  style={{
                    background: isSelected ? 'var(--bg-input)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : fulfilled ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.3)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Status stripe */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                    background: fulfilled ? '#22c55e' : '#eab308',
                  }} />

                  <div style={{ paddingLeft: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {e.eventName}
                      </p>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                        borderRadius: '99px',
                        background: fulfilled ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                        color: fulfilled ? '#16a34a' : '#ca8a04',
                        whiteSpace: 'nowrap', marginLeft: '6px'
                      }}>
                        {fulfilled ? '✓ FULL' : '⚠ OPEN'}
                      </span>
                    </div>

                    {/* Mini progress bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {/* Persons */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>People</span>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: personsFilled ? '#16a34a' : 'var(--text-secondary)' }}>
                            {assignedPersons}/{e.personsNeeded}
                          </span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (assignedPersons / (e.personsNeeded || 1)) * 100)}%`,
                            background: personsFilled ? '#22c55e' : 'var(--accent)',
                            borderRadius: '99px',
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>

                      {/* Hours */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Hours</span>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: hoursFilled ? '#16a34a' : 'var(--text-secondary)' }}>
                            {assignedHours}/{e.hours}
                          </span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, (assignedHours / (e.hours || 1)) * 100)}%`,
                            background: hoursFilled ? '#22c55e' : '#8b5cf6',
                            borderRadius: '99px',
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      📍 {e.location} · {e.startDate} → {e.endDate}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <div className="event-creation" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

        {/* Detail drawer — shown when an event card is clicked */}
        {selectedEvent && (() => {
          const e = selectedEvent;
          const assignedPersons = getAssignedPersons(e);
          const assignedHours = getTotalAssignedHours(e, allUsers);
          const personsFilled = isPersonsFulfilled(e);
          const hoursFilled = isHoursFulfilled(e, allUsers);
          const fulfilled = personsFilled && hoursFilled;

          return (
            <div className="admin-table-card" style={{
              border: `1px solid ${fulfilled ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.35)'}`,
              background: fulfilled ? 'rgba(34,197,94,0.03)' : 'rgba(234,179,8,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>{e.eventName}</h3>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '99px',
                      background: fulfilled ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                      color: fulfilled ? '#16a34a' : '#ca8a04'
                    }}>
                      {fulfilled ? '✓ Fully Fulfilled' : '⚠ Needs Staff'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    📍 {e.location} · {e.startDate} → {e.endDate}
                  </p>
                </div>
                <button onClick={() => setSelectedEvent(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {[
                  {
                    label: 'Personnel', current: assignedPersons, required: e.personsNeeded,
                    filled: personsFilled, unit: 'people',
                    bar: Math.min(100, (assignedPersons / (e.personsNeeded || 1)) * 100)
                  },
                  {
                    label: 'Hour Coverage', current: assignedHours, required: e.hours,
                    filled: hoursFilled, unit: 'hrs',
                    bar: Math.min(100, (assignedHours / (e.hours || 1)) * 100)
                  },
                ].map(({ label, current, required, filled, unit, bar }) => (
                  <div key={label} style={{
                    padding: '16px', borderRadius: 'var(--radius-sm)',
                    background: filled ? 'rgba(34,197,94,0.08)' : 'rgba(234,179,8,0.08)',
                    border: `1px solid ${filled ? 'rgba(34,197,94,0.25)' : 'rgba(234,179,8,0.25)'}`,
                  }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</p>
                    <p style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: filled ? '#16a34a' : '#ca8a04' }}>
                      {current} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {required} {unit}</span>
                    </p>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${bar}%`,
                        background: filled ? '#22c55e' : '#eab308',
                        borderRadius: '99px', transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {e.qualifications && e.qualifications.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>REQUIRED QUALIFICATIONS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {e.qualifications.map((q: string) => (
                      <span key={q} style={{
                        padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                        background: 'rgba(99,102,241,0.12)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.2)'
                      }}>
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Creation Form */}
        <div className="admin-table-card">
          <h3 className="section-title">Establish Event Template</h3>
          <p className="read-only-text" style={{ marginBottom: '24px' }}>
            Templates act as foundational prerequisites for staff. They remain invisible to standard users.
          </p>

          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}
          {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="eventName">Event Title <span className="required">*</span></label>
                <input id="eventName" name="eventName" type="text" className="form-input"
                  value={form.eventName} onChange={handleChange} placeholder="e.g. Annual Charity Gala" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Geographic Location <span className="required">*</span></label>
                <input id="location" name="location" type="text" className="form-input"
                  value={form.location} onChange={handleChange} placeholder="e.g. City Conference Center" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="hours">Duration (Hours) <span className="required">*</span></label>
                <input id="hours" name="hours" type="number" min="1" className="form-input"
                  value={form.hours} onChange={handleChange} placeholder="Estimated hours" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="personsNeeded">Volunteers Needed <span className="required">*</span></label>
                <input id="personsNeeded" name="personsNeeded" type="number" min="1" className="form-input"
                  value={form.personsNeeded} onChange={handleChange} placeholder="Target personnel count" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Event Start Date <span className="required">*</span></label>
                <input id="startDate" name="startDate" type="date" min={todayISO} className="form-input"
                  value={form.startDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="endDate">Event End Date <span className="required">*</span></label>
                <input id="endDate" name="endDate" type="date" min={form.startDate || todayISO} className="form-input"
                  value={form.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: '12px' }}>
              <label className="form-label">Required Staff Qualifications</label>
              <div className="pill-group">
                {ALL_QUALIFICATIONS.map((q) => (
                  <button key={q} type="button" onClick={() => handleQualificationToggle(q)}
                    className={`pill-btn ${form.qualifications.includes(q) ? 'selected' : ''}`}>
                    {q.replace('activity', ' Activity').replace('training', ' Training')}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}
              style={{ marginTop: '20px', maxWidth: '300px' }}>
              {isSubmitting ? 'Deploying Template...' : 'Deploy Event Template'}
            </button>
          </form>
        </div>

        {/* Events Table */}
        <div className="admin-table-card">
          <h3 className="section-title">Active Database Templates</h3>
          <div className="table-wrapper">
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading template registry...
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Event Name</th>
                    <th>Location</th>
                    <th>Duration</th>
                    <th>Date Boundaries</th>
                    <th>Personnel</th>
                    <th>Hours Coverage</th>
                    <th>Qualifications</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const fulfilled = isFullyFulfilled(e, allUsers);
                    const assignedPersons = getAssignedPersons(e);
                    const assignedHours = getTotalAssignedHours(e, allUsers);
                    return (
                      <tr key={e._id}>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                            background: fulfilled ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                            color: fulfilled ? '#16a34a' : '#ca8a04'
                          }}>
                            {fulfilled ? '✓ Fulfilled' : '⚠ Open'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{e.eventName}</td>
                        <td>{e.location}</td>
                        <td>{e.hours} hrs</td>
                        <td style={{ fontSize: '13px' }}>
                          {e.startDate && e.endDate ? `${e.startDate} → ${e.endDate}` : '—'}
                        </td>
                        <td>
                          <span style={{ color: assignedPersons >= e.personsNeeded ? '#16a34a' : '#ca8a04', fontWeight: 600 }}>
                            {assignedPersons}/{e.personsNeeded}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: assignedHours >= e.hours ? '#16a34a' : '#ca8a04', fontWeight: 600 }}>
                            {assignedHours}/{e.hours} hrs
                          </span>
                        </td>
                        <td>
                          {e.qualifications && e.qualifications.length > 0
                            ? e.qualifications.join(', ')
                            : 'Any'}
                        </td>
                      </tr>
                    );
                  })}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
                        No event templates have been provisioned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreation;
