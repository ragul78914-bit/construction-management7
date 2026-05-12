import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const checkEmailExists = useStore(state => state.checkEmailExists);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (checkEmailExists(email)) {
      setSuccess('A password reset link has been sent to your email address. Please check your inbox and click the link to proceed.');
      // Mocking the scenario of checking inbox and clicking the link:
      // Clicking the link takes exactly to the Reset OTP stage which we can simulate by navigation
      setTimeout(() => {
        // Directing straight to Reset Password for mock simplicity (assuming link + OTP was done)
        // Actually, requirement says: 'Forgot Password OTP Verification Page (enter OTP from email link)'
        // Let's pass the email through state to Reset Password page (which we'll combine the OTP check logically)
        navigate('/reset-password', { state: { email } });
      }, 3000);
    } else {
      setError('No account found with this email address');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="mb-4">
          <Link to="/login" className="flex items-center text-muted" style={{ display: 'inline-flex', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
        
        <div className="auth-header">
          <div className="flex justify-center mb-3">
            <div className="btn-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px' }}>
              <Mail size={32} />
            </div>
          </div>
          <h1>Forgot Password?</h1>
          <p>Enter your registered email address to receive password reset instructions.</p>
        </div>

        {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}
        {success && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!success}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!!success}>
            <Send size={18} />
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
