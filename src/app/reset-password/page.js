'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useStore from '@/store/useStore';
import { Lock, KeyRound, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const resetPassword = useStore(state => state.resetPassword);

  if (!email) {
    return (
      <div className="login-page">
        <div className="login-bg-orb" /><div className="login-bg-orb" /><div className="login-bg-orb" />
        <div className="login-grid-bg" />
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff' }}>Invalid Link</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>This reset link is invalid or expired.</p>
          <button className="login-btn" onClick={() => router.push('/forgot-password')}>Go to Forgot Password</button>
        </div>
      </div>
    );
  }

  const handleVerifyOtp = (e) => { e.preventDefault(); setError(''); if (otp === '123456') setStep(2); else setError('Invalid code.'); };
  const handleReset = (e) => {
    e.preventDefault(); setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 8) return setError('Min 8 characters');
    resetPassword(email, newPassword);
    setStep(3);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb" /><div className="login-bg-orb" /><div className="login-bg-orb" />
      <div className="login-grid-bg" />
      <div className="login-particles">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="login-particle" />)}</div>
      <div className="login-card">
        {step === 1 && (<>
          <div className="login-logo"><KeyRound size={36} /></div>
          <h1>Reset Verification</h1>
          <p className="login-subtitle">Enter the OTP sent to your email. Hint: 123456</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleVerifyOtp}>
            <input type="text" className="login-input" style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', padding: '1rem', marginBottom: '1.25rem' }}
              placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <button type="submit" className="login-btn">Verify OTP</button>
          </form>
        </>)}
        {step === 2 && (<>
          <div className="login-logo" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Lock size={36} /></div>
          <h1>Set New Password</h1>
          <p className="login-subtitle">Enter your new password below</p>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleReset}>
            <label className="login-label">New Password</label>
            <div className="login-input-wrapper">
              <input type="password" className="login-input" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <Lock size={18} className="login-input-icon" />
            </div>
            <label className="login-label">Confirm Password</label>
            <div className="login-input-wrapper">
              <input type="password" className="login-input" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Lock size={18} className="login-input-icon" />
            </div>
            <button type="submit" className="login-btn">Reset Password</button>
          </form>
        </>)}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#22c55e', margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#fff' }}>Password Updated!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Please log in with your new password.</p>
            <button className="login-btn" onClick={() => router.push('/login')}>Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="login-page"><div style={{color:'#fff'}}>Loading...</div></div>}><ResetPasswordContent /></Suspense>;
}
