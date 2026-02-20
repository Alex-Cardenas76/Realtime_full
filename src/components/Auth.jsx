import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import './Auth.css';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.description || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{isSignUp ? 'Join SyncRoom' : 'Welcome Back'}</h1>
                    <p>{isSignUp ? 'Create your account to start matching' : 'Sign in to access your dashboard'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleAuth}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button className="auth-button" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="spinner"></span>
                        ) : (
                            <>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            className="auth-toggle"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
