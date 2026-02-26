import { useState } from 'react';
import { AuthService } from '../../services/auth-service';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import './auth.css';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                if (!username.trim()) throw new Error('Username is required');

                const result = await AuthService.signUp(email, password, username);
                if (!result.success) throw new Error(result.error);
                alert('¡Revisa tu correo para el enlace de confirmación!');
            } else {
                const result = await AuthService.signIn(email, password);
                if (!result.success) throw new Error(result.error);
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
                    <div className="logo-icon">
                        <Sparkles size={32} color="#8b5cf6" />
                    </div>
                    <h1>{isSignUp ? 'Crear una Cuenta' : 'Bienvenido'}</h1>
                    <p>{isSignUp ? 'Únete a la comunidad y empieza a jugar' : 'Inicia sesión para acceder a tu panel'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleAuth}>
                    {isSignUp && (
                        <div className="form-group slide-in">
                            <label htmlFor="username">Nombre de Usuario</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Ingresa tu nombre de usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={isSignUp}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                id="email"
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
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
                            <Loader2 className="spinner" size={20} />
                        ) : (
                            <>
                                {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isSignUp ? '¿Ya tienes una cuenta?' : "¿No tienes una cuenta?"}{' '}
                        <button
                            className="auth-toggle"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setEmail('');
                                setPassword('');
                                setUsername('');
                                setError(null);
                            }}
                        >
                            {isSignUp ? 'Iniciar Sesión' : 'Registrarse'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
