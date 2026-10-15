import React, { useState } from 'react'
import type { BudgetAlert } from '@/services/notifications'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/services/notifications'
import { AlertTriangle, AlertOctagon, X, Bell } from 'lucide-react'

interface Props {
  alerts: BudgetAlert[]
  onDismiss: (id: string) => void
}

export const BudgetAlertBanner: React.FC<Props> = ({ alerts, onDismiss }) => {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  )
  const [requesting, setRequesting] = useState(false)

  if (alerts.length === 0) return null

  const showEnablePush = isNotificationSupported() && permission === 'default'

  async function handleEnablePush() {
    setRequesting(true)
    const newPerm = await requestNotificationPermission()
    setPermission(newPerm)
    setRequesting(false)
  }

  return (
    <div className="space-y-3" role="region" aria-label="Alertas de Presupuesto">
      {/* Botón para solicitar permisos push si no están activados */}
      {showEnablePush && (
        <div className="flex items-center justify-between bg-bg-surface border border-accent-green/30 rounded-radius-md px-3.5 py-2.5 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-accent-green shrink-0 animate-pulse" />
            <span>¿Deseas recibir avisos directos cuando tu presupuesto esté por agotarse?</span>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={requesting}
            className="px-3 py-1 bg-accent-green hover:bg-accent-success text-bg-base font-semibold rounded-radius-sm transition-colors shrink-0 ml-2 disabled:opacity-50"
          >
            {requesting ? 'Activando...' : 'Activar avisos'}
          </button>
        </div>
      )}

      {/* Lista de alertas activas */}
      {alerts.map((alert) => {
        const isDanger = alert.level === 'danger'

        return (
          <div
            key={alert.id}
            data-testid={`budget-alert-${alert.id}`}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-radius-md border ${
              isDanger
                ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
                : 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber'
            }`}
          >
            <div className="flex items-start gap-2.5 flex-1">
              <span className="mt-0.5 shrink-0">
                {isDanger ? <AlertOctagon size={18} /> : <AlertTriangle size={18} />}
              </span>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-semibold">{alert.title}</h4>
                <p className="text-xs text-text-primary/90 leading-relaxed">{alert.message}</p>
                <div className="w-full bg-bg-base/60 rounded-full h-1.5 overflow-hidden mt-1 max-w-xs">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDanger ? 'bg-accent-red' : 'bg-accent-amber'
                    }`}
                    style={{ width: `${Math.min(100, alert.percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(alert.id)}
              className="text-text-muted hover:text-text-primary p-1 rounded-radius-sm transition-colors shrink-0"
              aria-label={`Descartar alerta ${alert.title}`}
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

