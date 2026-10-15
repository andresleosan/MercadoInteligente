import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  getUserFamily,
  createFamily,
  joinFamilyByCode,
  leaveFamily,
} from '@/services/families'
import type { Family } from '@/types'
import {
  Users,
  UserPlus,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  Shield,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

export default function FamilyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Formularios
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [newFamilyName, setNewFamilyName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFamilyData() {
      if (!user) return
      setLoading(true)
      setError('')

      try {
        const userFam = await getUserFamily(user.uid)
        if (isMounted) {
          setFamily(userFam)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos familiares')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFamilyData()
    return () => { isMounted = false }
  }, [user])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccessMsg('')
    setActionLoading(true)

    try {
      const created = await createFamily(
        user.uid,
        user.email || '',
        newFamilyName,
        user.displayName
      )
      setFamily(created)
      setSuccessMsg('¡Grupo familiar creado exitosamente!')
      setNewFamilyName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la familia')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccessMsg('')
    setActionLoading(true)

    try {
      const joined = await joinFamilyByCode(
        user.uid,
        user.email || '',
        joinCode,
        user.displayName
      )
      setFamily(joined)
      setSuccessMsg('¡Te has unido al grupo familiar!')
      setJoinCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al unirse al grupo familiar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLeave() {
    if (!user || !family) return
    const isOwner = family.ownerId === user.uid
    const confirmMessage = isOwner && family.members.length === 1
      ? '¿Estás seguro de que deseas salir? Como eres el único miembro, la familia será eliminada.'
      : '¿Estás seguro de que deseas abandonar este grupo familiar?'

    if (!window.confirm(confirmMessage)) return

    setError('')
    setSuccessMsg('')
    setActionLoading(true)

    try {
      await leaveFamily(user.uid, family.id)
      setFamily(null)
      setSuccessMsg('Has abandonado el grupo familiar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al salir de la familia')
    } finally {
      setActionLoading(false)
    }
  }

  function handleCopyCode() {
    if (!family?.code) return
    navigator.clipboard.writeText(family.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // fallback
    })
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Header */}
      <header className="bg-bg-header border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 -ml-1.5 text-text-muted hover:text-text-primary transition-colors rounded-radius-sm"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Users className="text-accent-green" size={20} />
              <h1 className="text-sm font-semibold">Presupuesto Familiar</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[640px] mx-auto px-4 py-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-accent-red/10 border border-accent-red/30 rounded-radius-md px-4 py-3">
            <AlertCircle size={16} className="text-accent-red shrink-0" />
            <p className="text-xs text-accent-red">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-radius-md px-4 py-3">
            <Check size={16} className="text-accent-green shrink-0" />
            <p className="text-xs text-accent-green">{successMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent-green" size={28} />
          </div>
        ) : family ? (
          /* Vista: Usuario con grupo familiar */
          <div className="space-y-4">
            {/* Tarjeta resumen de la familia */}
            <div className="bg-bg-surface border border-border-subtle rounded-radius-lg p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full">
                    Familia Activa
                  </span>
                  <h2 className="text-lg font-bold text-text-primary mt-1.5">{family.name}</h2>
                  <p className="text-xs text-text-muted">
                    {family.members.length} {family.members.length === 1 ? 'miembro' : 'miembros'} compartiendo gastos
                  </p>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 text-xs text-accent-red hover:bg-accent-red/10 border border-accent-red/30 rounded-radius-sm px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  <LogOut size={13} />
                  <span>Salir</span>
                </button>
              </div>

              {/* Código de invitación */}
              <div className="bg-bg-base border border-border-subtle rounded-radius-md p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block font-medium">
                    Código de Invitación
                  </span>
                  <span className="text-base font-mono font-bold tracking-wider text-accent-green">
                    {family.code}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs font-medium bg-bg-surface hover:bg-bg-elevated border border-border-subtle px-3 py-1.5 rounded-radius-sm transition-colors text-text-primary"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-accent-green" />
                      <span className="text-accent-green">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-text-muted">
                Comparte este código con tu pareja o familiares para que puedan unirse y sincronizar sus gastos y presupuesto.
              </p>
            </div>

            {/* Lista de Miembros */}
            <div className="bg-bg-surface border border-border-subtle rounded-radius-lg p-5">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users size={14} className="text-accent-green" />
                <span>Miembros del grupo</span>
              </h3>
              <div className="divide-y divide-border-subtle">
                {family.members.map((member) => {
                  const isOwner = member.role === 'owner'
                  const isCurrentUser = member.uid === user?.uid

                  return (
                    <div key={member.uid} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted">
                          {isOwner ? <Shield size={14} className="text-accent-amber" /> : <User size={14} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {member.displayName || member.email}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] bg-bg-elevated text-text-secondary px-1.5 py-0.2 rounded font-medium">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-muted block">
                            {member.email}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isOwner
                            ? 'text-accent-amber bg-accent-amber/10 border-accent-amber/30'
                            : 'text-text-muted bg-bg-elevated border-border-subtle'
                        }`}
                      >
                        {isOwner ? 'Propietario' : 'Miembro'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Beneficios sincronizados */}
            <div className="bg-accent-green/5 border border-accent-green/20 rounded-radius-lg p-4 flex items-start gap-3">
              <Sparkles className="text-accent-green shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary">Sincronización familiar activa</p>
                <p>
                  Tanto el presupuesto diario como las compras registradas por cualquier miembro se reflejan automáticamente para todos los integrantes.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Vista: Usuario sin grupo familiar (Crear o Unirse) */
          <div className="space-y-4">
            {/* Selector de modo */}
            <div className="grid grid-cols-2 p-1 bg-bg-surface border border-border-subtle rounded-radius-md gap-1">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`py-2 text-xs font-semibold rounded-radius-sm transition-colors ${
                  mode === 'create'
                    ? 'bg-accent-green text-bg-base shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Crear Grupo
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`py-2 text-xs font-semibold rounded-radius-sm transition-colors ${
                  mode === 'join'
                    ? 'bg-accent-green text-bg-base shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Unirme con Código
              </button>
            </div>

            {mode === 'create' ? (
              <form
                onSubmit={handleCreate}
                className="bg-bg-surface border border-border-subtle rounded-radius-lg p-5 space-y-4"
              >
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Crear nuevo grupo familiar</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Crea un grupo para compartir presupuestos y compras con tu familia.
                  </p>
                </div>

                <div>
                  <label htmlFor="familyName" className="block text-xs font-medium text-text-secondary mb-1.5">
                    Nombre del grupo
                  </label>
                  <input
                    id="familyName"
                    type="text"
                    required
                    placeholder="Ej: Familia Pérez"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    className="w-full bg-bg-base border border-border-subtle rounded-radius-md px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !newFamilyName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-accent-green hover:opacity-90 text-bg-base font-semibold py-2.5 px-4 rounded-radius-md text-xs transition-opacity disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <>
                      <Users size={15} />
                      <span>Crear Grupo Familiar</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleJoin}
                className="bg-bg-surface border border-border-subtle rounded-radius-lg p-5 space-y-4"
              >
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Unirse a un grupo existente</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Ingresa el código que te compartió el administrador de la familia.
                  </p>
                </div>

                <div>
                  <label htmlFor="joinCode" className="block text-xs font-medium text-text-secondary mb-1.5">
                    Código de invitación
                  </label>
                  <input
                    id="joinCode"
                    type="text"
                    required
                    placeholder="Ej: FAM-9X2Y"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full font-mono uppercase bg-bg-base border border-border-subtle rounded-radius-md px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-green"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !joinCode.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-accent-green hover:opacity-90 text-bg-base font-semibold py-2.5 px-4 rounded-radius-md text-xs transition-opacity disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Unirme al Grupo</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
