import { useState, useEffect } from 'react';
import API from '../../services/api';

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 1) date.setHours(-24 * (day - 1));
  return date.toISOString().split('T')[0];
};

const getSunday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay() || 7;
  if (day !== 7) date.setHours(24 * (7 - day));
  return date.toISOString().split('T')[0];
};

const getWeekDates = () => {
  const dates = [];
  const today = new Date();
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day - 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const StaffManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyAvailableThisWeek, setShowOnlyAvailableThisWeek] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPendingUserId, setSelectedPendingUserId] = useState<string | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  const currentMondayISO = getMonday(new Date());
  const currentSundayISO = getSunday(new Date());
  const weekDates = getWeekDates();
  const todayISO = new Date().toISOString().split('T')[0];

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      // Filter out admins from the list so they just see standard users/staff
      setUsers(data.filter((u: any) => u.role !== 'admin'));
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events catalog', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
  }, []);

  const handleStatusUpdate = async (userId: string, status: string, assignedEventIds: string[] = []) => {
    if (!window.confirm(`Are you sure you want to change user status to ${status}?`)) return;

    try {
      setLoading(true);
      await API.patch(`/users/${userId}/status`, { status, assignedEventIds });
      await fetchUsers();
    } catch (err) {
      alert('Failed to update user status.');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading staff directory...</div>;

  const checkOverlapsThisWeek = (u: any) => {
    return u.availableTo >= currentMondayISO && u.availableFrom <= currentSundayISO;
  };

  const filteredUsers = users.filter((u) => {
    if (!showOnlyAvailableThisWeek) return true;
    if (!u.availableFrom || !u.availableTo) return false;
    
    if (selectedDate) {
      // Must encompass the selected day explicitly
      return u.availableFrom <= selectedDate && u.availableTo >= selectedDate;
    }
    
    // Default Week logic
    return checkOverlapsThisWeek(u);
  });

  const activeThisWeekCount = users.filter((u) => u.availableFrom && u.availableTo && checkOverlapsThisWeek(u)).length;

  const toggleDate = (isoStr: string) => {
    if (!showOnlyAvailableThisWeek) setShowOnlyAvailableThisWeek(true);
    setSelectedDate(prev => prev === isoStr ? null : isoStr);
  };

  const openApprovalModal = (userId: string) => {
    setSelectedPendingUserId(userId);
    setSelectedEventIds([]);
    setIsModalOpen(false); // Reset to ensure animation triggers nicely if needed, though strictly we just set true
    setTimeout(() => setIsModalOpen(true), 10);
  };

  // ─── Capacity Math ───
  const pendingUser = selectedPendingUserId ? users.find(u => u._id === selectedPendingUserId) : null;

  // Compute allowed events for the Modal dynamically based on the pending user's qualifications
  let matchingEvents = events;
  if (pendingUser) {
    const userQuals = pendingUser.qualifications || [];
    matchingEvents = events.filter((e) => {
      if (!e.qualifications || e.qualifications.length === 0) return true;
      return e.qualifications.some((q: string) => userQuals.includes(q));
    });
  }

  // User's total weekly hour capacity
  const userTotalHours: number = pendingUser?.hoursPerWeek || 0;

  // Hours already consumed by events currently checked in the modal
  const checkedHoursConsumed: number = selectedEventIds.reduce((sum, eid) => {
    const ev = events.find((e: any) => e._id === eid);
    return sum + (ev?.hours || 0);
  }, 0);

  // Remaining hours for candidate after currently selected events
  const remainingUserHours: number = userTotalHours - checkedHoursConsumed;

  // Helper: remaining slots for a given event
  const getRemainingSlots = (e: any): number => {
    const assigned = Array.isArray(e.assignedStaff) ? e.assignedStaff.length : 0;
    return Math.max(0, (e.personsNeeded || 0) - assigned);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ─── Massive Toggle Banner ─── */}
      <div style={{ 
        background: 'var(--bg-card)', 
        padding: '24px 32px', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Staff Roster Display Mode</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Toggle between viewing specifically active staff, or all registered personnel globally.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: showOnlyAvailableThisWeek ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {showOnlyAvailableThisWeek ? 'Active Filter ON' : 'Global Filter OFF'}
            </span>
            <label className="toggle-switch" style={{ transform: 'scale(1.2)' }}>
              <input 
                type="checkbox"
                checked={showOnlyAvailableThisWeek}
                onChange={(e) => setShowOnlyAvailableThisWeek(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
        </div>
      </div>

      <div className="staff-management staff-split-layout">
        {/* ─── Left Panel: Calendar ─── */}
      <div className="calendar-panel">
        <div className="calendar-header">
          <h3>Current Week Overview</h3>
          <p>Displaying exact availability blocks</p>
        </div>

        <div className="day-block-list">
          {weekDates.map((dateObj, i) => {
            const isoStr = dateObj.toISOString().split('T')[0];
            const isToday = isoStr === todayISO;
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div
                key={i}
                className={`day-block ${isToday ? 'today' : ''} ${selectedDate === isoStr ? 'selected' : ''}`}
                onClick={() => toggleDate(isoStr)}
              >
                <span className="day-name">{dayName}</span>
                <span className="day-date">{shortDate}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>{activeThisWeekCount}</strong> total staff verified for this week.
          </p>
          {selectedDate && (
            <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '8px', fontWeight: 600 }}>
              Viewing filters for: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* ─── Right Panel: Data Table ─── */}
      <div className="admin-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Verified Available Personnel</h3>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Availability (Weekly)</th>
                <th>Hours</th>
                <th>Qualifications</th>
                <th>Volunteering?</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.emailId}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.gender}</td>
                  <td style={{ fontSize: '13px' }}>
                    {u.availableFrom && u.availableTo
                      ? `${u.availableFrom} to ${u.availableTo}`
                      : '—'}
                  </td>
                  <td>{u.hoursPerWeek || '—'}</td>
                  <td>
                    {u.qualifications && u.qualifications.length > 0
                      ? u.qualifications.join(', ')
                      : 'None'}
                  </td>
                  <td>{u.willingToVolunteer ? '✅ Yes' : '—'}</td>
                  <td>
                    <span className={`status-badge ${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {u.status === 'PENDING' && (
                      <>
                        <button className="btn-approve" onClick={() => openApprovalModal(u._id)}>
                          Approve
                        </button>
                        <button className="btn-reject" onClick={() => handleStatusUpdate(u._id, 'REJECTED')}>
                          Reject
                        </button>
                      </>
                      )}
                      {u.status !== 'PENDING' && (
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusUpdate(u._id, u.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                        >
                          {u.status === 'APPROVED' ? 'Reject' : 'Approve'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px' }}>
                    {showOnlyAvailableThisWeek && selectedDate
                      ? `No staff members are natively available on ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.`
                      : showOnlyAvailableThisWeek
                        ? "No staff members are scheduled as available for the entire current week."
                        : "No users have registered yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* ─── Approval Modal Overlay ─── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Review & Assign Events Before Approval</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {pendingUser?.firstName} {pendingUser?.lastName}
                </p>
              </div>
              <button 
                 onClick={() => setIsModalOpen(false)} 
                 style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {/* Candidate Capacity Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: remainingUserHours < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(var(--accent-rgb, 99,102,241),0.08)',
                border: `1px solid ${remainingUserHours < 0 ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Candidate Weekly Capacity</p>
                  <p style={{ margin: '2px 0 0', fontSize: '22px', fontWeight: 800,
                    color: remainingUserHours < 0 ? '#ef4444' : remainingUserHours === 0 ? 'var(--text-secondary)' : 'var(--accent)'
                  }}>
                    {remainingUserHours} <span style={{ fontSize: '14px', fontWeight: 500 }}>hrs remaining</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <p style={{ margin: 0 }}>Total: <strong>{userTotalHours} hrs/week</strong></p>
                  <p style={{ margin: '2px 0 0' }}>Assigned: <strong>{checkedHoursConsumed} hrs</strong></p>
                </div>
              </div>
              
              <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Assign</th>
                      <th>Event Name</th>
                      <th>Dates</th>
                      <th>Duration (Hrs)</th>
                      <th>Remaining Slots</th>
                      <th>Skill Logic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingEvents.map((e) => {
                      const remainingSlots = getRemainingSlots(e);
                      const isChecked = selectedEventIds.includes(e._id);
                      // Disable if: event is full, OR adding this event would exceed user hours (and it's not already checked)
                      const wouldExceed = !isChecked && (checkedHoursConsumed + (e.hours || 0)) > userTotalHours && userTotalHours > 0;
                      const isFull = remainingSlots === 0;
                      const isDisabled = (isFull && !isChecked) || wouldExceed;

                      return (
                        <tr key={e._id} style={{ opacity: isDisabled ? 0.5 : 1 }}>
                          <td>
                            <input 
                               type="checkbox"
                               checked={isChecked}
                               disabled={isDisabled}
                               onChange={(ev) => {
                                 if (ev.target.checked) setSelectedEventIds([...selectedEventIds, e._id]);
                                 else setSelectedEventIds(selectedEventIds.filter(id => id !== e._id));
                               }}
                               style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            />
                            {isFull && <span style={{ fontSize: '10px', color: '#ef4444', display: 'block', marginTop: '2px' }}>FULL</span>}
                            {wouldExceed && <span style={{ fontSize: '10px', color: '#f59e0b', display: 'block', marginTop: '2px' }}>NO HRS</span>}
                          </td>
                          <td style={{ fontWeight: 600 }}>{e.eventName}</td>
                          <td style={{ fontSize: '13px' }}>
                            {e.startDate && e.endDate ? `${e.startDate} → ${e.endDate}` : '—'}
                          </td>
                          <td>{e.hours} hrs</td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              color: remainingSlots === 0 ? '#ef4444' : remainingSlots <= 2 ? '#f59e0b' : 'var(--accent)'
                            }}>
                              {remainingSlots} / {e.personsNeeded}
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
                    {matchingEvents.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No event templates are active, or the candidate fails to meet existing skill requirements.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="modal-footer">
               <button 
                 className="btn-secondary" 
                 onClick={() => setIsModalOpen(false)} 
                 style={{ padding: '8px 24px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
               >
                 Cancel
               </button>
               <button 
                  className="btn-approve" 
                  onClick={() => {
                     if (selectedPendingUserId) {
                       handleStatusUpdate(selectedPendingUserId, 'APPROVED', selectedEventIds);
                       setIsModalOpen(false);
                     }
                  }}
                  style={{ padding: '8px 24px' }}
               >
                 Confirm Final Approval
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
