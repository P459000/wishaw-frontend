import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import API from '../../services/api';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#ef4444', '#0ea5e9'];

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

const AdminDashboardHome = () => {
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  
  // Chart Data State
  const [roleData, setRoleData] = useState<{name: string, value: number}[]>([]);
  const [eventStatusData, setEventStatusData] = useState<{name: string, value: number}[]>([]);
  const [payrollTypeData, setPayrollTypeData] = useState<{name: string, value: number}[]>([]);

  useEffect(() => {
    Promise.all([
      API.get('/users'),
      API.get('/events')
    ]).then(([usersRes, eventsRes]) => {
      const users = usersRes.data;
      const events = eventsRes.data;

      // Filter staff only
      const staffList = users.filter((u: any) => u.role !== 'admin' && u.status === 'APPROVED');
      setTotalStaff(staffList.length);
      setTotalEvents(events.length);

      // --- 1. Staff by Role ---
      const roleMap: Record<string, number> = {};
      staffList.forEach((s: any) => {
        const role = s.roleType || 'Unknown Role';
        roleMap[role] = (roleMap[role] || 0) + 1;
      });
      setRoleData(Object.entries(roleMap).map(([name, value]) => ({ name, value })));

      // --- 2. Events by Status ---
      const statusMap: Record<string, number> = {
        'Completed': 0, 'Ongoing': 0, 'Yet to Start': 0
      };
      
      const completedEvents: any[] = [];
      events.forEach((e: any) => {
        const status = getEventStatus(e);
        if (status === 'COMPLETED') { statusMap['Completed']++; completedEvents.push(e); }
        else if (status === 'ONGOING') statusMap['Ongoing']++;
        else statusMap['Yet to Start']++;
      });
      setEventStatusData(
        Object.entries(statusMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
      );

      // --- 3. Payroll Allocation by Employment Type ---
      let salariedTotal = 0;
      let contractualTotal = 0;

      staffList.forEach((u: any) => {
        if (u.employmentType === 'salaried') {
          salariedTotal += Number(u.fixedSalary || 0);
        } else {
          // calculate contractual pay off completed events
          const attended = completedEvents.filter(e => 
            e.assignedStaff && e.assignedStaff.some((id: any) => {
              const staffIdStr = typeof id === 'object' ? id._id : id;
              return staffIdStr === u._id;
            })
          );
          let hours = 0;
          attended.forEach(ev => { hours += getEventDuration(ev); });
          contractualTotal += (hours * Number(u.hourlyRate || 0));
        }
      });

      setPayrollTypeData([
        { name: 'Salaried Base Pay', value: salariedTotal },
        { name: 'Contractual Payout', value: contractualTotal }
      ]);

      setLoading(false);
    }).catch(err => {
      console.error('Failed to load dashboard data', err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '24px' }}>Loading real-time statistics...</div>;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-document)', minHeight: '100%', borderRadius: '12px' }}>
      <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
        📊 Charity Operations Dashboard
      </h2>

      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE STAFF</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalStaff}</p>
        </div>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>SCHEDULED EVENTS</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalEvents}</p>
        </div>
        <div className="admin-table-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>PAYROLL LIABILITIES</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
            £{(payrollTypeData.reduce((acc, curr) => acc + curr.value, 0)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Staff Role Breakdown */}
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Staff Allocation by Sub-Role
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={roleData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" cy="50%" 
                  outerRadius={100} 
                  fill="#8884d8" 
                  label 
                >
                  {roleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Members`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Event Timeline */}
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Global Event Pipeline
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={eventStatusData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  fill="#82ca9d" 
                  label 
                >
                  {eventStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Sessions`, 'Events']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payroll Distribution Bar */}
        <div className="admin-table-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Payroll Expenditure Estimate (Completed Flow)
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={payrollTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `£${value}`} />
                <Tooltip formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Expenditure']} cursor={{fill: 'var(--bg-input)'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {payrollTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardHome;
