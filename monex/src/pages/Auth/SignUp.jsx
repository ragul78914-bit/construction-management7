import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { UserPlus, Mail, Lock, Phone, User } from 'lucide-react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { users, signUp } = useStore();

  const hasAdmin = users.some(u => u.role === 'Admin');
  const [role, setRole] = useState(hasAdmin ? 'Worker' : 'Admin');
  
  const availableRoles = hasAdmin ? ['Supervisor', 'Worker'] : ['Admin', 'Supervisor', 'Worker'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    const { confirmPassword, ...dataToSubmit } = formData;
    const res = signUp({ ...dataToSubmit, role });
    if (res.success) {
      if (role === 'Admin') navigate('/admin');
      else if (role === 'Supervisor') navigate('/supervisor');
      else navigate('/worker');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '2rem 0' }}>
      <div className="auth-card glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="auth-header text-center">
          <div className="flex justify-center mb-3">
            <div className="btn-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px', margin: '0 auto' }}>
              <UserPlus size={32} />
            </div>
          </div>
          <h1>Create Account</h1>
          <p>Join the construction management platform</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            {availableRoles.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: `1px solid ${role === r ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: role === r ? 'var(--primary-light)' : 'transparent',
                  color: role === r ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: role === r ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group mb-0">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Sign Up as {role}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 text-small">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
