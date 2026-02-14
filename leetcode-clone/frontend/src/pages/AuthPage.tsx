import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { Code2, CheckCircle, Github } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isVerifying) {
                // Handle Verification
                const { error } = await insforge.auth.verifyEmail({
                    otp: token,
                    email // email is needed if verifying by token manually
                });

                if (error) throw error;

                toast.success('Email verified successfully!');
                // Auto-login after verification if possible, or just redirect to login
                setIsVerifying(false);
                setIsLogin(true);
                return;
            }

            // Handle Login/Signup
            const { data, error } = isLogin
                ? await insforge.auth.signInWithPassword({ email, password })
                : await insforge.auth.signUp({ email, password });

            if (error) throw error;

            if (!isLogin && data?.user) {
                // Create profile for new user
                try {
                    const username = email.split('@')[0];
                    console.log('Creating profile for:', username, 'ID:', data.user.id);

                    const { error: profileError } = await insforge.database
                        .from('profiles')
                        .insert([{
                            id: data.user.id,
                            username: username,
                            solved_count: 0,
                            total_submissions: 0
                        }]);

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        toast.error('Account created but profile setup failed. Please contact support.');
                    } else {
                        console.log('Profile created successfully!');
                    }
                } catch (profileErr) {
                    console.error('Profile creation exception:', profileErr);
                }

                toast.success('Account created! Please check your email for the code.');
                setIsVerifying(true);
            } else if (data) {
                toast.success('Welcome back!');
                navigate('/');
            }
        } catch (error: any) {
            console.error('Auth error details:', error);
            const errorMessage = error.message || error.error_description || 'Authentication failed';
            toast.error(errorMessage);
            // If error suggests verification needed, show verification UI
            if (errorMessage.includes('verification') || errorMessage.includes('verify') || errorMessage.includes('confirm')) {
                setIsVerifying(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await insforge.auth.resendVerificationEmail({
                email
            });
            toast.success('Verification code resent! Check your email.');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            const { data, error } = await insforge.auth.signInWithOAuth({
                provider: 'google',
                redirectTo: window.location.origin
            });

            if (error) throw error;

            // If there's a URL, the SDK will handle the redirect automatically
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error('Google OAuth error:', error);
            toast.error(error.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        try {
            setLoading(true);
            const { data, error } = await insforge.auth.signInWithOAuth({
                provider: 'github',
                redirectTo: window.location.origin
            });

            if (error) throw error;

            // If there's a URL, the SDK will handle the redirect automatically
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error('GitHub OAuth error:', error);
            toast.error(error.message || 'Failed to sign in with GitHub');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <Toaster position="top-center" />

            <div className="w-full max-w-md bg-dark-card rounded-2xl p-8 shadow-2xl border border-white/5">
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 bg-brand-yellow rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-yellow/20">
                        {isVerifying ? <CheckCircle size={24} /> : <Code2 size={24} />}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">
                    {isVerifying ? 'Verify Email' : (isLogin ? 'Welcome back' : 'Create an account')}
                </h2>
                <p className="text-dark-sub text-center mb-8">
                    {isVerifying
                        ? 'Enter the code sent to your email'
                        : (isLogin ? 'Enter your details to access your account' : 'Start your coding journey with us')}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isVerifying && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-dark-sub mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-yellow transition-colors"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-sub mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-yellow transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {isVerifying && (
                        <div>
                            <label className="block text-sm font-medium text-dark-sub mb-1">Verification Code</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-yellow transition-colors"
                                placeholder="Enter code"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-yellow hover:bg-brand-darkYellow text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isVerifying ? 'Verify Email' : (isLogin ? 'Sign In' : 'Sign Up'))}
                    </button>

                    {isVerifying && (
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleResend}
                                className="w-full text-sm text-brand-yellow hover:text-brand-darkYellow transition-colors"
                            >
                                Didn't receive a code? Resend
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsVerifying(false)}
                                className="w-full text-sm text-dark-sub hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </form>

                {!isVerifying && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-card text-dark-sub">OR</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-gray-300"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                onClick={handleGitHubSignIn}
                                disabled={loading}
                                className="w-full bg-[#24292e] hover:bg-[#1a1e22] text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Github size={20} />
                                Continue with GitHub
                            </button>
                        </div>
                    </>
                )}

                {!isVerifying && (
                    <div className="mt-6 text-center text-sm text-dark-sub">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-brand-yellow hover:underline font-medium"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </div>
                )}

                {!isVerifying && isLogin && (
                    <div className="mt-2 text-center text-sm">
                        <button
                            onClick={() => setIsVerifying(true)}
                            className="text-dark-sub hover:text-white"
                        >
                            Need to verify code?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
