'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useStore from '@/store/useStore';
import { UserPlus, Mail, Lock, Phone, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignUpPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { users, signUp, currentUser, isAuthenticated, isHydrated } = useStore();
  
  // Check if any Admin exists in the store
  const hasAdmin = users.some(u => u.role === 'Admin');
  
  // Default role based on whether an admin already exists
  const [role, setRole] = useState(hasAdmin ? 'Worker' : 'Admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated once store is hydrated
  useEffect(() => {
    if (mounted && isHydrated && isAuthenticated && currentUser) {
      const userRole = currentUser.role;
      if (userRole === 'Admin') router.replace('/admin');
      else if (userRole === 'Supervisor') router.replace('/supervisor');
      else router.replace('/worker');
    }
  }, [mounted, isHydrated, isAuthenticated, currentUser, router]);

  // Determine available roles for the signup page.
  // We only allow one Admin in the system (or initial admin creation).
  const availableRoles = hasAdmin ? ['Supervisor', 'Worker'] : ['Admin', 'Supervisor', 'Worker'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters');
    
    setLoading(true);

    setTimeout(() => {
      const { confirmPassword, ...dataToSubmit } = formData;
      const res = signUp({ ...dataToSubmit, role });
      
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

  if (!mounted || !isHydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c29' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading...</div>
      </div>
    );
  }

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
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(135deg, #0f0c29, #302b63)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
          >
            <motion.div 
              className="login-success-icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 40px rgba(34, 197, 94, 0.4)' }}
            >
              <CheckCircle size={40} />
            </motion.div>
            <motion.div 
              className="login-success-text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600, marginTop: '1.5rem' }}
            >
              Account Created!
            </motion.div>
            <motion.div 
              className="login-success-sub"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}
            >
              Redirecting to your dashboard...
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="login-card"
            style={{ maxWidth: 500 }}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
          >
            <motion.div 
              className="login-logo"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus size={36} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Create Account
            </motion.h1>
            <motion.p 
              className="login-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Join the construction management platform
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
                {availableRoles.map(r => (
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

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <label className="login-label">Full Name</label>
                <div className="login-input-wrapper">
                  <input type="text" className="login-input" placeholder="Enter your full name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <User size={18} className="login-input-icon" />
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <label className="login-label">Email</label>
                  <div className="login-input-wrapper">
                    <input type="email" className="login-input" placeholder="Enter email" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <Mail size={18} className="login-input-icon" />
                  </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                  <label className="login-label">Phone Number</label>
                  <div className="login-input-wrapper">
                    <input type="tel" className="login-input" placeholder="Enter phone" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                    <Phone size={18} className="login-input-icon" />
                  </div>
                </motion.div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <label className="login-label">Password</label>
                  <div className="login-input-wrapper">
                    <input type="password" className="login-input" placeholder="Password" value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    <Lock size={18} className="login-input-icon" />
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                  <label className="login-label">Confirm</label>
                  <div className="login-input-wrapper">
                    <input type="password" className="login-input" placeholder="Confirm" value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                    <Lock size={18} className="login-input-icon" />
                  </div>
                </motion.div>
              </div>

              <motion.button 
                type="submit" 
                className={`login-btn ${loading ? 'loading' : ''}`} 
                disabled={loading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: 8 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} 
                    />
                    Creating Account...
                  </span>
                ) : (
                  <><UserPlus size={18} /> Sign Up as {role}</>
                )}
              </motion.button>
            </form>

            <motion.div 
              className="login-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Already have an account?{' '}
              <Link href="/login">Log In</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
