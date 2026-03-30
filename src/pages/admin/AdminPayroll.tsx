import { useState, useEffect } from 'react';
import API from '../../services/api';

const getEventStatus = (e: any): 'YET_TO_START' | 'ONGOING' | 'COMPLETED' => {
  if (e.isManuallyCompleted) return 'COMPLETED';
  if (!e.date || !e.startTime || !e.endTime) return 'YET_TO_START';

  const now = new Date();
  const startObj = new Date(`${e.date}T${e.startTime}:00`);
  const endObj = new Date(`${e.date}T${e.endTime}:00`);

  if (now < startObj) return 'YET_TO_START';
  if (now > endObj) return 'COMPLETED';
  return 'ONGOING';
};

const getEventDuration = (e: any): number => {
  if (!e.startTime || !e.endTime) return 0;
  const startObj = new Date(`1970-01-01T${e.startTime}:00`);
  const endObj = new Date(`1970-01-01T${e.endTime}:00`);
  const diffHours = (endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 ? diffHours : 0;
};

// Helper to get week number
function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

const AdminPayroll = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [periodType, setPeriodType] = useState<'month' | 'week'>('month');
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentWeek = `${now.getFullYear()}-W${String(getISOWeek(now)).padStart(2, '0')}`;
  
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);

  useEffect(() => {
    // Switch default selector value when toggling type
    if (periodType === 'month') setSelectedPeriod(currentMonth);
    else setSelectedPeriod(currentWeek);
  }, [periodType, currentMonth, currentWeek]);

  useEffect(() => {
    Promise.all([
      API.get('/users'),
      API.get('/events')
    ]).then(([usersRes, eventsRes]) => {
      // Filter out only staff (role === 'user' normally, or by status)
      const staffList = usersRes.data.filter((u: any) => u.role !== 'admin' && u.status === 'APPROVED');
      setStaff(staffList);
      setEvents(eventsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load payroll data', err);
      setLoading(false);
    });
  }, []);

  // Filter events based on selected period
  const filteredEvents = events.filter((e) => {
    if (getEventStatus(e) !== 'COMPLETED') return false;
    
    if (periodType === 'month') {
      return e.date.startsWith(selectedPeriod); // 'YYYY-MM'
    } else {
      // week
      if (!selectedPeriod) return true; // fallback
      const [year, weekStr] = selectedPeriod.split('-W');
      if (!year || !weekStr) return true;
      
      const eDate = new Date(e.date);
      if (eDate.getFullYear().toString() !== year) return false;
      return getISOWeek(eDate).toString() === parseInt(weekStr).toString();
    }
  });

  const payrollData = staff.map(u => {
    // Find all completed events in period this user was assigned to
    const attendedEvents = filteredEvents.filter(e => 
      e.assignedStaff && e.assignedStaff.some((id: any) => {
        // ID could be populated object or string depending on controller, but generally it's string or _id
        const staffIdStr = typeof id === 'object' ? id._id : id;
        return staffIdStr === u._id;
      })
    );
    
    let totalHours = 0;
    attendedEvents.forEach(e => {
      totalHours += getEventDuration(e);
    });

    let pay = 0;
    if (u.employmentType === 'salaried') {
      // Fixed salary scaled by period type
      const fixed = Number(u.fixedSalary || 0);
      pay = periodType === 'week' ? fixed / 4 : fixed;
    } else {
      // contractual -> totalHours * hourlyRate
      pay = totalHours * Number(u.hourlyRate || 0);
    }

    return {
      _id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.roleType || 'Staff',
      empType: u.employmentType || 'contractual',
      rate: u.employmentType === 'salaried' ? u.fixedSalary || 0 : u.hourlyRate || 0,
      sessionsAttended: attendedEvents.length,
      totalHours,
      totalPay: pay
    };
  });

  const totalPayroll = payrollData.reduce((sum, item) => sum + item.totalPay, 0);

  if (loading) return <div style={{ padding: '24px' }}>Loading payroll data...</div>;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-document)', minHeight: '100%', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
          💸 Payroll Management
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="radio" value="month" checked={periodType === 'month'} onChange={() => setPeriodType('month')} />
              Monthly
            </label>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="radio" value="week" checked={periodType === 'week'} onChange={() => setPeriodType('week')} />
              Weekly
            </label>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          {periodType === 'month' ? (
            <input 
              type="month" 
              value={selectedPeriod} 
              onChange={e => setSelectedPeriod(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          ) : (
            <input 
              type="week" 
              value={selectedPeriod} 
              onChange={e => setSelectedPeriod(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            />
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>TOTAL PAYROLL ({periodType.toUpperCase()})</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>£{totalPayroll.toFixed(2)}</p>
        </div>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>COMPLETED SESSIONS</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{filteredEvents.length}</p>
        </div>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE COMPENSATED STAFF</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{payrollData.filter(d => d.totalPay > 0).length}</p>
        </div>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Employment Type</th>
              <th>Base Rate</th>
              <th>Sessions (Completed)</th>
              <th>Total Hours</th>
              <th style={{ textAlign: 'right' }}>Calculated Pay</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  No active staff found for this period.
                </td>
              </tr>
            ) : (
              payrollData.map(item => (
                <tr key={item._id}>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                      <br/>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.role}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      background: item.empType === 'salaried' ? 'rgba(99,102,241,0.1)' : 'rgba(234,179,8,0.1)',
                      color: item.empType === 'salaried' ? '#4f46e5' : '#ca8a04',
                      textTransform: 'uppercase'
                    }}>
                      {item.empType}
                    </span>
                  </td>
                  <td>
                    {item.empType === 'salaried' 
                      ? <span style={{ fontWeight: 600 }}>£{item.rate}/mo</span> 
                      : <span style={{ fontWeight: 600 }}>£{item.rate}/hr</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.sessionsAttended}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.totalHours.toFixed(1)} hrs</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '15px', color: '#10b981' }}>
                    £{item.totalPay.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayroll;
