'use client';

import React, { useState, useTransition } from 'react';
import { Hexagon, Lock, User, ArrowRight, AlertCircle, ShieldCheck, KeyRound, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { loginAction, verifyMfaAction } from '../actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Multi-step MFA states
  const [step, setStep] = useState<'credentials' | 'mfa_setup' | 'mfa_challenge'>('credentials');
  const [mfaData, setMfaData] = useState<{ userid: string; secret: string | null } | null>(null);
  const [otpCode, setOtpCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(formData);
      
      if (result.success) {
        if (result.requiresMfa) {
          setMfaData({ userid: result.userid || '', secret: result.secret || null });
          setStep(result.isConfigured ? 'mfa_challenge' : 'mfa_setup');
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Failed to login');
      }
    });
  };

  const handleMfaSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!mfaData) return;

    startTransition(async () => {
      const isEnrolling = step === 'mfa_setup';
      const result = await verifyMfaAction(mfaData.userid, otpCode, isEnrolling);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Verification failed');
      }
    });
  };

  const copySecret = () => {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-body text-slate-800 flex items-center justify-center relative overflow-hidden selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {step === 'credentials' && (
          <motion.div 
            key="credentials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel w-full max-w-[420px] p-8 rounded-3xl relative z-10 shadow-[0_8px_32px_rgb(0,0,0,0.05)] border-white/80"
          >
            <div className="flex items-center gap-3 mb-8 justify-center">
              <Hexagon className="w-8 h-8 text-zinc-900 fill-zinc-900" />
              <span className="font-heading font-semibold text-2xl tracking-tight text-zinc-900">SUVI AI</span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-xl font-heading font-medium text-slate-800 mb-2">Welcome Back</h1>
              <p className="text-sm text-slate-500">Sign in to your clinical workspace</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider pl-1 font-medium">User ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="userid"
                    required
                    className="glass-panel w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-700 outline-none focus:shadow-[0_4px_20px_rgb(79,70,229,0.15)] focus:border-indigo-300/60 transition-all text-sm placeholder:text-slate-400/70"
                    placeholder="Enter User ID (e.g. doctor)"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider pl-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    name="password"
                    required
                    className="glass-panel w-full pl-11 pr-4 py-3.5 rounded-2xl text-slate-700 outline-none focus:shadow-[0_4px_20px_rgb(79,70,229,0.15)] focus:border-indigo-300/60 transition-all text-sm placeholder:text-slate-400/70"
                    placeholder="Enter Password"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full black-button rounded-2xl py-3.5 mt-2 flex items-center justify-center gap-2 font-medium text-sm group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Authenticating...' : 'Continue to Workspace'}
                {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center bg-white/40 p-3 rounded-xl border border-white/60">
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wide mb-1 opacity-70">Demo Credentials</p>
              <p className="text-xs text-slate-600 font-medium">
                superadmin | doctor | nurse | admin <br/> 
                <span className="opacity-60 font-normal">Password: password</span>
              </p>
              <p className="text-[10px] text-indigo-500 font-medium mt-1">
                * Select &quot;doctor&quot; to demo first-time MFA setup
              </p>
            </div>
          </motion.div>
        )}

        {step === 'mfa_setup' && (
          <motion.div 
            key="mfa_setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel w-full max-w-[440px] p-8 rounded-3xl relative z-10 shadow-[0_8px_32px_rgb(0,0,0,0.05)] border-white/80"
          >
            <div className="flex items-center gap-3 mb-6 justify-center">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              <span className="font-heading font-semibold text-xl tracking-tight text-zinc-900">Custom MFA Setup</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-md font-heading font-semibold text-slate-800 mb-1">Pair Secure Key</h2>
              <p className="text-xs text-slate-500 px-4 leading-relaxed">
                Scan the clinical OTP QR code using Google Authenticator, Microsoft Authenticator, or a custom Hospital Auth App.
              </p>
            </div>

            {/* Premium Simulated QR Code Graphic */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-2xl border border-slate-200/50 shadow-inner flex flex-col items-center gap-2 relative group">
                <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer scan border anchors */}
                  <rect x="5" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="9" y="9" width="12" height="12" />
                  <rect x="75" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="79" y="9" width="12" height="12" />
                  <rect x="5" y="75" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="9" y="79" width="12" height="12" />
                  {/* Mock QR details pattern grid */}
                  <rect x="35" y="5" width="8" height="8" />
                  <rect x="47" y="15" width="12" height="8" />
                  <rect x="63" y="9" width="8" height="16" />
                  <rect x="5" y="35" width="16" height="8" />
                  <rect x="25" y="25" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                  <rect x="30" y="30" width="10" height="10" />
                  <rect x="75" y="35" width="12" height="12" />
                  <rect x="55" y="45" width="16" height="16" />
                  <rect x="35" y="65" width="12" height="8" />
                  <rect x="75" y="60" width="8" height="10" />
                  <rect x="79" y="79" width="16" height="16" />
                  <rect x="55" y="75" width="12" height="12" />
                  <rect x="25" y="79" width="8" height="8" />
                </svg>
                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[0.5px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded font-mono">SUVI Clinical Node</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="flex flex-col gap-5">
              {mfaData?.secret && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider text-center">Can&apos;t scan? Use code:</span>
                  <div className="flex items-center justify-between gap-2 bg-slate-100/80 border border-slate-200/50 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-700">
                    <span className="font-semibold">{mfaData.secret}</span>
                    <button 
                      type="button" 
                      onClick={copySecret}
                      className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                      title="Copy Key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600 animate-bounce" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider text-center font-medium">Enter 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  className="glass-panel w-full tracking-[1.5em] text-center font-mono font-bold text-lg py-3.5 rounded-2xl text-slate-800 outline-none focus:border-indigo-300 focus:shadow-[0_4px_20px_rgb(79,70,229,0.1)] transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 text-sm"
                  placeholder="000000"
                />
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full black-button rounded-2xl py-3.5 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Verifying...' : 'Complete Pair & Sign In'}
              </button>
            </form>

            <button 
              onClick={() => setStep('credentials')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium mt-4 transition-colors"
            >
              Back to Credentials
            </button>
          </motion.div>
        )}

        {step === 'mfa_challenge' && (
          <motion.div 
            key="mfa_challenge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel w-full max-w-[420px] p-8 rounded-3xl relative z-10 shadow-[0_8px_32px_rgb(0,0,0,0.05)] border-white/80"
          >
            <div className="flex items-center gap-3 mb-6 justify-center">
              <KeyRound className="w-8 h-8 text-indigo-600" />
              <span className="font-heading font-semibold text-xl tracking-tight text-zinc-900">Security Verification</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-md font-heading font-semibold text-slate-800 mb-1">MFA Challenge</h2>
              <p className="text-xs text-slate-500 px-4 leading-relaxed">
                Please enter the 6-digit verification code generated by your paired security device.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleMfaSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider text-center font-medium">OTP Code</label>
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  className="glass-panel w-full tracking-[1.5em] text-center font-mono font-bold text-lg py-3.5 rounded-2xl text-slate-800 outline-none focus:border-indigo-300 focus:shadow-[0_4px_20px_rgb(79,70,229,0.1)] transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 text-sm"
                  placeholder="000000"
                />
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full black-button rounded-2xl py-3.5 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? 'Verifying...' : 'Verify Secure Token'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
              Enter any 6 digits (e.g. <span className="font-semibold text-slate-600">123456</span>) to verify for preview.
            </div>

            <button 
              onClick={() => setStep('credentials')}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium mt-4 transition-colors"
            >
              Back to Credentials
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
