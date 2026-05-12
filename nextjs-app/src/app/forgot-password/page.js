'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '@/store/useStore';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const checkEmailExists = useStore(state => state.checkEmailExists);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (checkEmailExists(email)) {
      setSuccess('A password reset link has been sent to your email address.');
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 3000);
    } else {
      setError('No account found with this email address');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb" /><div className="login-bg-orb" /><div className="login-bg-orb" />
      <div className="login-grid-bg" />
      <div className="login-particles">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="login-particle" />)}</div>
      <div className="login-card">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
        <div className="login-logo"><Mail size={36} /></div>
        <h1>Forgot Password?</h1>
        <p className="login-subtitle">Enter your email to receive reset instructions</p>
        {error && <div className="login-error">{error}</div>}
        {success && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.85rem', marginBottom: '1.25rem' }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <label className="login-label">Email Address</label>
          <div className="login-input-wrapper">
            <input type="email" className="login-input" placeholder="Enter email" value={email}
              onChange={(e) => setEmail(e.target.value)} required disabled={!!success} />
            <Mail size={18} className="login-input-icon" />
          </div>
          <button type="submit" className="login-btn" disabled={!!success}><Send size={18} /> Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
