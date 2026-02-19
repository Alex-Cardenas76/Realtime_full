import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Auth.css'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [view, setView] = useState('login') // 'login' | 'signup'
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta (si aplica) o inicia sesión.")
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{view === 'login' ? 'Bienvenido' : 'Crear Cuenta'}</h1>
          <p className="auth-description">
            {view === 'login' 
              ? 'Inicia sesión para acceder a tu dashboard' 
              : 'Regístrate para comenzar tu viaje'}
          </p>
        </div>
        
        {error && (
          <div className="message-box error">
            <span>⚠️</span> {error}
          </div>
        )}
        {message && (
          <div className="message-box success">
            <span>✅</span> {message}
          </div>
        )}

        <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="auth-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="input-label">Contraseña</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {view === 'signup' && (
            <div className="input-group">
              <label htmlFor="confirmPassword" className="input-label">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                required={true}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button className="auth-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : <span>{view === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</span>}
          </button>
        </form>
        
        <div className="auth-footer">
          {view === 'login' ? (
            <p>
              ¿No tienes cuenta? <button className="link-button" onClick={() => setView('signup')}>Regístrate</button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta? <button className="link-button" onClick={() => setView('login')}>Inicia Sesión</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
