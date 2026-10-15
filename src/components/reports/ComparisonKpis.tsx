import React from 'react'
import type { MonthlyComparison } from '@/services/reports'
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, Award } from 'lucide-react'

interface Props {
  comparison: MonthlyComparison
}

export const ComparisonKpis: React.FC<Props> = ({ comparison }) => {
  const isIncrease = comparison.percentageChange > 0
  const isDecrease = comparison.percentageChange < 0
  const isBudgetSet = comparison.currentBudget !== null
  const isOverBudget = isBudgetSet && (comparison.savingsOrDeficit ?? 0) < 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Gastado */}
      <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-secondary text-xs font-medium mb-1.5">
          <span>Gasto Total</span>
          <div className="p-1.5 bg-bg-elevated rounded-radius-sm text-accent-green">
            <DollarSign size={16} />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary">
            ${comparison.currentSpent.toLocaleString()}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {isBudgetSet ? (
              <span>
                Presupuesto: ${comparison.currentBudget?.toLocaleString()}{' '}
                <span className={isOverBudget ? 'text-accent-red font-semibold' : 'text-accent-green font-semibold'}>
                  ({isOverBudget ? 'Excedido' : 'Bajo límite'})
                </span>
              </span>
            ) : (
              'Sin presupuesto fijado'
            )}
          </div>
        </div>
      </div>

      {/* 2. Comparativa vs Mes Anterior */}
      <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-secondary text-xs font-medium mb-1.5">
          <span>Vs. Mes Anterior</span>
          <div
            className={`p-1.5 bg-bg-elevated rounded-radius-sm ${
              isDecrease ? 'text-accent-green' : isIncrease ? 'text-accent-red' : 'text-text-muted'
            }`}
          >
            {isDecrease ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold ${
                isDecrease ? 'text-accent-green' : isIncrease ? 'text-accent-red' : 'text-text-primary'
              }`}
            >
              {isIncrease ? `+${comparison.percentageChange}%` : `${comparison.percentageChange}%`}
            </span>
            <span className="text-xs text-text-muted">
              (${Math.abs(comparison.difference).toLocaleString()}{' '}
              {comparison.difference >= 0 ? 'más' : 'menos'})
            </span>
          </div>
          <div className="text-xs text-text-muted mt-1">
            Mes previo: ${comparison.previousSpent.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 3. Ticket Promedio */}
      <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-secondary text-xs font-medium mb-1.5">
          <span>Ticket Promedio</span>
          <div className="p-1.5 bg-bg-elevated rounded-radius-sm text-accent-amber">
            <ShoppingCart size={16} />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary">
            ${comparison.averageTicket.toLocaleString()}
          </div>
          <div className="text-xs text-text-muted mt-1">
            En {comparison.purchaseCount} {comparison.purchaseCount === 1 ? 'compra registrada' : 'compras registradas'}
          </div>
        </div>
      </div>

      {/* 4. Categoría Principal */}
      <div className="bg-bg-surface border border-border-subtle rounded-radius-md p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-text-secondary text-xs font-medium mb-1.5">
          <span>Rubro Principal</span>
          <div className="p-1.5 bg-bg-elevated rounded-radius-sm text-accent-green">
            <Award size={16} />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary truncate">
            {comparison.topCategory ? comparison.topCategory.categoryName : 'Sin compras'}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {comparison.topCategory ? (
              <span>
                ${comparison.topCategory.total.toLocaleString()} ({comparison.topCategory.percentage}%)
              </span>
            ) : (
              'Ningún rubro registrado'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

