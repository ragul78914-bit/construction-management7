'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '@/store/useStore';
import { LogIn, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Worker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const loginWithCredentials = useStore((state) => state.loginWithCredentials);
  const initializeData = useStore((state) => state.initializeData);

  useEffect(() => {
    setMounted(true);
    initializeData();
  }, [initializeData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = loginWithCredentials(identifier, password, role);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (role === 'Admin') router.push('/admin');
          else if (role === 'Supervisor') router.push('/supervisor');
          else router.push('/worker');
        }, 1200);
      } else {
        setError(res.error);
        setLoading(false);
      }
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="login-page">
      {/* Framer Motion Background Orbs */}
      <motion.div
        className="login-bg-orb"
        animate={{ x: [0, 50, -30, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ width: 450, height: 450, background: 'radial-gradient(circle, rgba(99,102,241,0.5), rgba(139,92,246,0.3))', top: '-10%', left: '-10%', position: 'absolute', filter: 'blur(80px)', borderRadius: '50%' }}
      />
      <motion.div
        className="login-bg-orb"
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ width: 350, height: 350, background: 'radial-gradient(circle, rgba(236,72,153,0.4), rgba(244,63,94,0.2))', bottom: '-10%', right: '-10%', position: 'absolute', filter: 'blur(80px)', borderRadius: '50%' }}
      />
      <motion.div
        className="login-bg-orb"
        animate={{ x: [0, 40, -50, 0], y: [0, -40, 50, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(6,182,212,0.4), rgba(59,130,246,0.2))', top: '40%', left: '50%', position: 'absolute', filter: 'blur(80px)', borderRadius: '50%' }}
      />
      
      <div className="login-grid-bg" />
      
      {/* Framer Motion Floating Particles */}
      <div className="login-particles" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="login-particle"
            initial={{ y: '100vh', opacity: 0, x: Math.random() * 100 - 50 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.8, 0],
              x: Math.random() * 200 - 100
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear" 
            }}
            style={{
              position: 'absolute',
              background: 'rgba(255,255,255,0.4)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              width: Math.random() * 5 + 2,
              height: Math.random() * 5 + 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {success ? (
          <motion.div 
            className="login-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="login-success-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <CheckCircle size={40} />
            </motion.div>
            <motion.div 
              className="login-success-text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome back!
            </motion.div>
            <motion.div 
              className="login-success-sub"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting to your dashboard...
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="login-card"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
          >
            <motion.div 
              className="login-logo"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={36} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="login-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your Monex account
            </motion.p>

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="login-error"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <motion.div 
                className="role-pills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {['Admin', 'Supervisor', 'Worker'].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`role-pill ${role === r ? 'active' : ''}`}
                    onClick={() => setRole(r)}
                  >
                    {r}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="login-label">Email or Phone</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    className="login-input"
                    placeholder="Enter email or phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                  <Mail size={18} className="login-input-icon" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <input
                    type="password"
                    className="login-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="login-input-icon" />
                </div>
              </motion.div>

              <motion.div 
                style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="/forgot-password" style={{ color: '#a78bfa', fontSize: '0.85rem', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </motion.div>

              <motion.button 
                type="submit" 
                className={`login-btn ${loading ? 'loading' : ''}`} 
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} 
                    />
                    Signing in...
                  </span>
                ) : (
                  <><LogIn size={18} /> Sign In</>
                )}
              </motion.button>
            </form>

            <motion.div 
              className="login-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Don&apos;t have an account?{' '}
              <Link href="/signup">Sign Up</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
