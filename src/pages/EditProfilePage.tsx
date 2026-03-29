import { useState, useEffect } from 'react';
import API from '../services/api';
import axios from 'axios';

interface ProfileForm {
  qualifications: string[];
  hoursPerWeek: number | '';
  availableFrom: string;
  availableTo: string;
  willingToVolunteer: boolean;
}

const todayISO = new Date().toISOString().split('T')[0];

const QUALIFICATION_OPTIONS = [
  { value: 'sportsactivity', label: 'Sports Activity' },
  { value: 'yogatraining', label: 'Yoga Training' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'mentorship training', label: 'Mentorship Training' },
];

const EditProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>({ 
    qualifications: [], 
    hoursPerWeek: '', 
    availableFrom: '',
    availableTo: '',
    willingToVolunteer: false 
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/users/profile');
        setUser(data);
        setForm({
          qualifications: data.qualifications || [],
          hoursPerWeek: data.hoursPerWeek ?? '',
          availableFrom: data.availableFrom || '',
          availableTo: data.availableTo || '',
          willingToVolunteer: data.willingToVolunteer || false,
        });

        const token = localStorage.getItem('token');
        if (token) {
          localStorage.setItem('user', JSON.stringify({ ...data, token }));
        }
      } catch (err) {
        console.error('Failed to fetch robust profile:', err);
        // Fallback to local user
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
          setForm({
            qualifications: parsedUser.qualifications || [],
            hoursPerWeek: parsedUser.hoursPerWeek ?? '',
            availableFrom: parsedUser.availableFrom || '',
            availableTo: parsedUser.availableTo || '',
            willingToVolunteer: parsedUser.willingToVolunteer || false,
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const toggleQualification = (val: string) => {
    setForm((prev) => {
      const exists = prev.qualifications.includes(val);
      if (exists) {
        return { ...prev, qualifications: prev.qualifications.filter((q) => q !== val) };
      } else {
        return { ...prev, qualifications: [...prev.qualifications, val] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    setSuccess('');

    try {
      const { data } = await API.put('/users/profile', {
        qualifications: form.qualifications,
        hoursPerWeek: form.hoursPerWeek === '' ? undefined : Number(form.hoursPerWeek),
        availableFrom: form.availableFrom,
        availableTo: form.availableTo,
        willingToVolunteer: form.willingToVolunteer,
      });
      // Update local storage
      const token = localStorage.getItem('token'); // preserve token
      data.token = token;
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(err.response?.data?.message ?? 'Failed to update profile.');
      } else {
        setApiError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="loading-state">Loading profiling data…</div>;

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">
        <h3 className="section-title">Personal Details</h3>
        <p className="read-only-text">
          Name: <strong>{user.firstName} {user.lastName}</strong>
        </p>
        <p className="read-only-text">
          Email: <strong>{user.emailId}</strong>
        </p>
        <p className="read-only-text">
          Gender: <strong>{user.gender}</strong>
        </p>
        <p className="read-only-text">
          Account Status: <strong style={{ color: user.status === 'APPROVED' ? 'var(--success)' : user.status === 'REJECTED' ? 'var(--error)' : 'inherit' }}>{user.status || 'PENDING'}</strong>
        </p>

        <div className="form-divider" style={{ margin: '24px 0' }} />
        
        <h3 className="section-title">Custom Qualifications</h3>
        
        {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          
          <div className="form-group full-width">
            <label className="form-label">
              Select Qualifications (Multi-select)
            </label>
            <div className="pill-group">
              {QUALIFICATION_OPTIONS.map((opt) => {
                const isSelected = form.qualifications.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    className={`pill-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleQualification(opt.value)}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label" htmlFor="hours">
              Hours Per Week Available
            </label>
            <input
              id="hours"
              type="number"
              min="0"
              max="168"
              className="form-input"
              value={form.hoursPerWeek}
              onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder="e.g. 10"
              style={{ maxWidth: '180px' }}
            />
          </div>

          <div className="form-row" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="availableFrom">
                Available From
              </label>
              <input
                id="availableFrom"
                type="date"
                min={todayISO}
                className="form-input"
                value={form.availableFrom}
                onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="availableTo">
                Available To
              </label>
              <input
                id="availableTo"
                type="date"
                min={form.availableFrom || todayISO}
                className="form-input"
                value={form.availableTo}
                onChange={(e) => setForm({ ...form, availableTo: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.willingToVolunteer}
                onChange={(e) => setForm({ ...form, willingToVolunteer: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              Are you willing to participate in a volunteer field? (Checking this sets account to PENDING)
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '24px', maxWidth: '240px' }}>
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
