import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1 = OTP, 2 = New Password, 3 = Success
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const resetPassword = useStore(state => state.resetPassword);

  if (!email) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel text-center">
          <h2>Invalid Link</h2>
          <p className="mb-4">This reset link is invalid or has expired. Please request a new one.</p>
          <button className="btn btn-primary" onClick={() => navigate('/forgot-password')}>Go to Forgot Password</button>
        </div>
      </div>
    );
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    // Mock OTP logic
    if (otp === '123456') {
      setStep(2);
    } else {
      setError('Invalid or expired verification code. Please try again.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    resetPassword(email, newPassword);
    setStep(3);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        
        {step === 1 && (
          <>
            <div className="auth-header">
              <div className="flex justify-center mb-3">
                <div className="btn-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px' }}>
                  <KeyRound size={32} />
                </div>
              </div>
              <h1>Reset Verification</h1>
              <p>A verification code has been sent to your email address.</p>
              <p className="text-small text-muted mt-2">Hint: 123456</p>
            </div>

            {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}

            <form onSubmit={handleVerifyOtp}>
              <div className="form-group text-center">
                <input
                  type="text"
                  className="form-input text-center"
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5em', padding: '1rem' }}
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>Verify OTP</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <div className="flex justify-center mb-3">
                <div className="btn-icon" style={{ backgroundColor: 'var(--accent-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px' }}>
                  <Lock size={32} />
                </div>
              </div>
              <h1>Set New Password</h1>
              <p>Please enter your new password below.</p>
            </div>

            {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>Reset Password</button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} style={{ color: 'var(--success-color)' }} />
            </div>
            <h2>Password Updated!</h2>
            <p className="mb-4 text-muted">Your password has been reset successfully. Please log in with your new password.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Back to Login</button>
          </div>
        )}

      </div>
    </div>
  );
}
