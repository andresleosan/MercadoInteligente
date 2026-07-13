import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/services/auth'
import { getBudget } from '@/services/budget'
import { getTotalSpent } from '@/services/purchases'
import { useNavigate } from 'react-router-dom'
import BudgetPage from '@/pages/Budget'
import AddPurchase from '@/pages/AddPurchase'
import PurchaseHistory from '@/pages/PurchaseHistory'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [budgetAmount, setBudgetAmount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!user) return
      
      try {
        const [budget, spent] = await Promise.all([
          getBudget(user.uid),
          getTotalSpent(user.uid),
        ])
        
        if (budget) {
          setBudgetAmount(budget.amount)
        }
        setTotalSpent(spent)
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('Error al cargar los datos. Recargá la página.')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const remaining = budgetAmount - totalSpent
  const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mercado Inteligente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del mes</h2>
              
              {budgetAmount === 0 ? (
                <p className="text-gray-600 mb-4">
                  Configurá tu presupuesto mensual para empezar a controlar tus gastos.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Presupuesto</p>
                      <p className="text-2xl font-bold text-gray-900">${budgetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gastado</p>
                      <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Restante</p>
                      <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {percentage.toFixed(1)}% del presupuesto utilizado
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetPage />
              <AddPurchase />
            </div>

            <PurchaseHistory />
          </>
        )}
      </main>
    </div>
  )
}
