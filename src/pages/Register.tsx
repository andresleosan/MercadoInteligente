import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail, loginWithGoogle } from '@/services/auth'
import { isConfigValid } from '@/config/firebase'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!isConfigValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
        <div className="max-w-md w-full">
          <DarkCard className="p-6">
            <h2 className="text-lg font-semibold text-accent-red mb-2">
              Error de configuración
            </h2>
            <p className="text-sm text-text-secondary">
              Las variables de entorno de Firebase no están configuradas.
            </p>
          </DarkCard>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await registerWithEmail(email, password)
      navigate('/')
    } catch {
      setError('Error al crear la cuenta. Verificá el email.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/')
    } catch {
      setError('Error al registrarse con Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-radius-md bg-accent-green/10 mb-4">
            <ShoppingCart className="text-accent-green" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Crear cuenta</h1>
          <p className="text-sm text-text-secondary mt-1">Empezá a controlar tu presupuesto</p>
        </div>

        <DarkCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-radius-sm px-3 py-2">
                <p className="text-sm text-accent-red">{error}</p>
              </div>
            )}

            <DarkInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full"
              required
            />

            <DarkInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña (mín. 6 caracteres)"
              className="w-full"
              required
              minLength={6}
            />

            <DarkInput
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              className="w-full"
              required
            />

            <DarkButton
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </DarkButton>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface text-text-muted">O registrate con</span>
            </div>
          </div>

          <DarkButton
            variant="secondary"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </DarkButton>
        </DarkCard>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-accent-green font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
