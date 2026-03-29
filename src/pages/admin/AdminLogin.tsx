import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import axios from 'axios';

const AdminLogin = () => {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', { emailId, password });
      
      if (data.role !== 'admin') {
        setError('Unauthorized: Contact an administrator to upgrade your account.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/admin/dashboard/staff');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Admin Login Failed.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🛡️</span>
            <span className="auth-logo-text">System Admin</span>
          </div>
          <h2 className="auth-title">Admin Portal Access</h2>
          <p className="auth-subtitle">Restricted to authorized personnel only.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="emailId">Admin Email</label>
            <input
              id="emailId"
              type="email"
              className="form-input"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              placeholder="admin@wishaw.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Security Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Gain Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
