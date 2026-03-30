import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const FamilyLoginPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [familyId, setFamilyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !password) {
      setError('Please enter your Family ID and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/students/login', {
        familyId: familyId.toUpperCase(),
        password,
      });
      localStorage.setItem('familyToken', data.token);
      localStorage.setItem('family', JSON.stringify(data.family));
      navigate('/family/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Decorative blob */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Back link */}
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
          ← Back to Home
        </button>

        <div className="admin-table-card" style={{ padding: '40px 36px' }}>
          {/* Icon + heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(236,72,153,0.3)' }}>
              🧒
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Family Portal
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Youth Ochilis Community Program
            </p>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="familyId">
                Family ID <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="familyId"
                type="text"
                className="form-input"
                value={familyId}
                onChange={e => setFamilyId(e.target.value.toUpperCase())}
                placeholder="e.g. FAM-00001"
                style={{ fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Provided in your confirmation email after registration
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="familyPassword">
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="familyPassword"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your registration password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', width: '100%', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing In…' : '🔓 Sign In to Family Portal'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Not registered yet?{' '}
              <span
                onClick={() => navigate('/student-registration')}
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Register your child →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyLoginPage;
