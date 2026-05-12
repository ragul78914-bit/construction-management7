'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '@/store/useStore';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();
  const verifyOTP = useStore((state) => state.verifyOTP);
  const { otpVerificationPending, pendingUserLogin } = useStore();

  if (!otpVerificationPending && !pendingUserLogin) {
    return (
      <div className="login-page">
        <div className="login-bg-orb" /><div className="login-bg-orb" /><div className="login-bg-orb" />
        <div className="login-grid-bg" />
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff' }}>Session Expired</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Please log in to continue.</p>
          <Link href="/login" className="login-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = verifyOTP(otp);
    if (res.success) {
      if (pendingUserLogin?.role === 'Admin') router.push('/admin');
      else if (pendingUserLogin?.role === 'Supervisor') router.push('/supervisor');
      else router.push('/worker');
    } else setError(res.error);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb" /><div className="login-bg-orb" /><div className="login-bg-orb" />
      <div className="login-grid-bg" />
      <div className="login-particles">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="login-particle" />)}</div>
      <div className="login-card">
        <div className="login-logo"><KeyRound size={36} /></div>
        <h1>Verify Identity</h1>
        <p className="login-subtitle">Enter the 6-digit code sent to your email. Hint: 123456</p>
        {error && <div className="login-error">{error}</div>}
        {successMsg && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.25rem' }}>{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" className="login-input" style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', padding: '1rem', marginBottom: '1.25rem' }}
            placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit" className="login-btn">Verify & Continue <ArrowRight size={18} /></button>
        </form>
        <div className="login-footer">
          Didn&apos;t receive the code?{' '}
          <button onClick={() => { setSuccessMsg('A new code has been sent.'); setTimeout(() => setSuccessMsg(''), 3000); }}
            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
