import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const verifyOTP = useStore((state) => state.verifyOTP);
  const { otpVerificationPending, pendingUserLogin } = useStore();

  // If no OTP pending, redirect to login
  if (!otpVerificationPending && !pendingUserLogin) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel text-center">
          <h2>Session Expired</h2>
          <p className="mb-4">Please log in to continue.</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = verifyOTP(otp);
    if (res.success) {
      if (pendingUserLogin?.role === 'Admin') navigate('/admin');
      else if (pendingUserLogin?.role === 'Supervisor') navigate('/supervisor');
      else navigate('/worker');
    } else {
      setError(res.error);
    }
  };

  const handleResend = () => {
    setError('');
    setSuccessMsg('A new verification code has been sent.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="flex justify-center mb-3">
            <div className="btn-icon" style={{ backgroundColor: 'var(--primary-color)', color: 'white', width: '60px', height: '60px', borderRadius: '15px' }}>
              <KeyRound size={32} />
            </div>
          </div>
          <h1>Verify Identity</h1>
          <p>
            A verification code has been sent to your registered email address. 
            Please enter the code below to verify your account.
          </p>
          <p className="text-small text-muted mt-2">Hint: use 123456</p>
        </div>

        {error && <div className="toast error mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{error}</div>}
        {successMsg && <div className="toast success mb-3" style={{ position: 'relative', bottom: 'auto', right: 'auto', minWidth: 'auto', animation: 'none' }}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>
            Verify & Continue
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center mt-4 text-small">
          Didn't receive the code? <button onClick={handleResend} className="btn-outline" style={{ border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>Resend OTP</button>
        </div>
      </div>
    </div>
  );
}
