import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Worker');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginWithCredentials = useStore((state) => state.loginWithCredentials);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = loginWithCredentials(identifier, password, role);
    if (res.success) {
      if (role === 'Admin') navigate('/admin');
      else if (role === 'Supervisor') navigate('/supervisor');
      else navigate('/worker');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="flex justify-center mb-3">
            <div className="btn-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px' }}>
              <Shield size={32} />
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </div>

        {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Worker">Worker</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email or Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 text-small">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <LogIn size={18} />
            Login
          </button>
        </form>

        <div className="text-center mt-4 text-small">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
