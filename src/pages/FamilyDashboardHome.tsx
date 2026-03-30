const FamilyDashboardHome = () => {
  const familyStr = localStorage.getItem('family');
  const family = familyStr ? JSON.parse(familyStr) : null;

  const stats = [
    { icon: '👤', label: 'Guardian', value: family?.guardianName || '—' },
    { icon: '🧒', label: 'Child', value: family ? `${family.childFirstName} ${family.childLastName}` : '—' },
    { icon: '🪪', label: 'Family ID', value: family?.familyId || '—', mono: true },
    { icon: '✅', label: 'Status', value: 'Active' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
        borderRadius: '16px', padding: '28px 32px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', fontSize: '80px', opacity: 0.15, pointerEvents: 'none' }}>🌟</div>
        <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '22px', fontWeight: 800 }}>
          Welcome back, {family?.guardianName?.split(' ')[0] || 'Guardian'}!
        </h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5 }}>
          Youth Ochilis Community Program · Family Portal
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {stats.map(s => (
          <div key={s.label} className="admin-table-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '22px' }}>{s.icon}</span>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </p>
            </div>
            <p style={{
              margin: 0, fontSize: '15px', fontWeight: 700, color: s.label === 'Status' ? '#16a34a' : 'var(--text-primary)',
              fontFamily: (s as any).mono ? 'monospace' : 'inherit',
              letterSpacing: (s as any).mono ? '0.06em' : 'normal',
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h3 className="section-title">📅 Upcoming Events</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Head over to the <strong>Event Calendar</strong> from the sidebar to browse upcoming sessions and activities at the Youth Ochilis Community Program.
          </p>
        </div>
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h3 className="section-title">✏️ Keep Details Up-to-Date</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Visit <strong>Edit Profile</strong> to update your child's medical needs, emergency contacts, or participation preferences at any time.
          </p>
        </div>
      </div>

      {/* Family ID reminder */}
      <div style={{ padding: '16px 20px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>📋</span>
        <div>
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
            Your Family ID: <span style={{ fontFamily: 'monospace', color: '#6366f1', letterSpacing: '0.06em' }}>{family?.familyId}</span>
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            Keep this safe — you'll need it to contact us about your child or log in again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboardHome;
