import { useState, useEffect } from 'react';
import API from '../../services/api';

const AdminAttendance = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // Default date range: Current week (Mon-Sun)
  const getStartOfWeek = () => {
    const d = new Date();
    const day = d.getDay() === 0 ? 7 : d.getDay(); // Make Sunday 7 instead of 0
    d.setDate(d.getDate() - day + 1);
    return d.toISOString().split('T')[0];
  };
  const getEndOfWeek = () => {
    const d = new Date();
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - day + 7);
    return d.toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState(getStartOfWeek());
  const [toDate, setToDate] = useState(getEndOfWeek());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to load events', err);
      }
    };
    fetchEvents();
  }, []);

  const categories = [
    { id: 'previous', label: 'Previous Events', icon: '⏪', color: '#6366f1' },
    { id: 'current', label: 'Current Events', icon: '▶️', color: '#22c55e' },
    { id: 'upcoming', label: 'Upcoming Events', icon: '⏭️', color: '#f59e0b' },
  ];

  // Map and sort events with their computed status
  const processedEvents = events.map(e => {
    const d = new Date(e.startDate);
    const start = new Date(fromDate); start.setHours(0,0,0,0);
    const end = new Date(toDate); end.setHours(23,59,59,999);

    let status = 'current';
    if (d.getTime() < start.getTime()) status = 'previous';
    else if (d.getTime() > end.getTime()) status = 'upcoming';

    return { ...e, computedStatus: status };
  }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Filter if a category is selected on left, else show all
  const displayEvents = selectedCategory 
    ? processedEvents.filter(e => e.computedStatus === selectedCategory)
    : processedEvents;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 350px', gap: '20px', height: '100%', alignItems: 'start' }}>
      
      {/* ── LEFT PANEL: Overview & Details ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
        
        {/* Blank Attendance View */}
        <div className="admin-table-card" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Attendance Details
          </h2>
          
          <div style={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--bg-input)', 
            borderRadius: '12px', 
            border: '1px dashed var(--border)',
            minHeight: '300px'
          }}>
            {!selectedCategory ? (
              <>
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>👆</span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 600 }}>
                  Select an event from the tracker on the right
                </p>
              </>
            ) : (
              <>
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>📋</span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedCategory} Events Attendance
                </p>
                <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  (Detailed attendance list, PI charts, and metrics will be populated here)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Date Picker & Event List ── */}
      <div className="admin-table-card" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Event Tracker</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>From</label>
              <input 
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '13px'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>To</label>
              <input 
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                style={{
                  padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '13px'
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div 
               onClick={() => setSelectedCategory(null)}
               style={{
                  padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  background: !selectedCategory ? 'var(--accent)' : 'var(--bg-card)',
                  color: !selectedCategory ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease'
               }}
            >
               All
            </div>
            {categories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                style={{ 
                  padding: '4px 10px', 
                  cursor: 'pointer', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRadius: '8px',
                  border: selectedCategory === cat.id ? `1px solid ${cat.color}` : '1px solid var(--border)',
                  background: selectedCategory === cat.id ? `${cat.color}15` : 'var(--bg-card)',
                  color: selectedCategory === cat.id ? cat.color : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  fontSize: '11px', fontWeight: 700
                }}
              >
                {cat.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayEvents.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '20px' }}>No events found.</p>
          ) : (
            displayEvents.map(event => {
              // Badge color assignment
              let badgeColor = '#6b7280'; // grey for previous
              if (event.computedStatus === 'current') badgeColor = '#22c55e'; // green 
              else if (event.computedStatus === 'upcoming') badgeColor = '#3b82f6'; // blue 

              return (
                <div 
                  key={event._id}
                  style={{ 
                    padding: '14px', 
                    borderRadius: '10px', 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover-card-effect"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.eventName}
                    </h4>
                    <span style={{ 
                      padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                      background: `${badgeColor}22`, color: badgeColor, border: `1px solid ${badgeColor}40`,
                      textTransform: 'uppercase'
                    }}>
                      {event.computedStatus}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      📍 {event.location}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                      📅 {new Date(event.startDate).toLocaleDateString('en-GB')} ({event.startTime} - {event.endTime})
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminAttendance;
