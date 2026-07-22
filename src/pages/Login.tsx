import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '@/services/auth'
import { isConfigValid } from '@/config/firebase'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { DarkCard } from '@/components/ui/DarkCard'
import { DarkInput } from '@/components/ui/DarkInput'
import { DarkButton } from '@/components/ui/DarkButton'
import { GoogleAuthButton } from '@/components/ui/GoogleAuthButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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
              Agregá las variables VITE_FIREBASE_* en Cloudflare Pages → Settings → Environment variables.
            </p>
          </DarkCard>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch {
      setError('Error al iniciar sesión con Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-radius-md bg-accent-green/10 mb-4">
            <ShoppingCart className="text-accent-green" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Mercado Inteligente</h1>
          <p className="text-sm text-text-secondary mt-1">Iniciá sesión para continuar</p>
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
              placeholder="Contraseña"
              className="w-full"
              required
            />

            <DarkButton
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </DarkButton>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-base px-3 py-1 text-text-muted shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green/80" />
                O continuá con
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <GoogleAuthButton
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={loading}
            />
            <p className="text-center text-[11px] leading-4 text-text-muted">
              Ingresá con tu cuenta Google para acceder más rápido y conservar tus datos.
            </p>
          </div>
        </DarkCard>

        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-accent-green font-medium hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
