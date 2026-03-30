import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '20px', right: '20px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '50%', width: '40px', height: '40px',
          cursor: 'pointer', fontSize: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)',
          zIndex: 10,
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)', pointerEvents: 'none' }} />

      {/* Logo icon */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '38px', marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
      }}>
        🌟
      </div>

      {/* Heading */}
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 'clamp(22px, 4vw, 36px)',
        fontWeight: 900,
        color: 'var(--text-primary)',
        textAlign: 'center',
        margin: '0 0 10px',
        letterSpacing: '-0.5px',
        lineHeight: 1.25,
        maxWidth: '640px',
      }}>
        Welcome to the{' '}
        <span style={{ background: 'linear-gradient(90deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Youth Ochilis Community
        </span>{' '}Program
      </h1>

      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginBottom: '8px',
        maxWidth: '460px',
        lineHeight: 1.6,
      }}>
        Empowering young people and dedicated volunteers across the community.
      </p>

      {/* Sub-label */}
      <p style={{
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        margin: '28px 0 20px',
        opacity: 0.7,
      }}>
        What would you like to do?
      </p>

      {/* Option cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '560px',
      }}>
        {/* Staff card */}
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px 24px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.25s ease',
            color: 'inherit',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.6)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(99,102,241,0.18)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧑‍💼</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Staff / Volunteer
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Register as a volunteer or log in to manage your profile and view event assignments.
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
            Get Started →
          </div>
        </button>

        {/* Student card */}
        <button
          onClick={() => navigate('/family/login')}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px 24px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.25s ease',
            color: 'inherit',
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(236,72,153,0.5)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(236,72,153,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧒</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Register a Child
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Register your child to participate in our community program activities and events.
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#ec4899' }}>
            Register Now →
          </div>
        </button>
      </div>

      {/* Admin link */}
      <p style={{ marginTop: '40px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        Are you an Admin?{' '}
        <span
          onClick={() => navigate('/admin/login')}
          style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
        >
          Admin Login →
        </span>
      </p>
    </div>
  );
};

export default LandingPage;
