    async function loadData() {
      if (!user) return
      setLoading(true)
      setError('')

      try {
        const [budgetData, spent] = await Promise.all([
          getBudget(user.uid, selectedMonth),
          getTotalSpent(user.uid, selectedMonth),
        ])

        if (!isMounted) return

        setBudget(budgetData ? budgetData.amount : null)
        setTotalSpent(spent)
      } catch (err) {
        console.error('Error cargando datos:', err)
        if (isMounted) {
          setError('Error al cargar los datos. RecargÃ¡ la pÃ¡gina.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, selectedMonth])

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesiÃ³n:', err)
      setError('Error al cerrar sesiÃ³n. IntentÃ¡ de nuevo.')
    }
  }

  const remaining = budget !== null ? budget - totalSpent : 0
  const isOverBudget = budget !== null && totalSpent > budget
  const percentage = budget !== null && budget > 0 ? (totalSpent / budget) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mercado Inteligente</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            {isInstallable ? (
              <button
                onClick={() => void promptInstall()}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Instalar app
              </button>
            ) : null}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cerrar sesiÃ³n
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <MonthNavigator month={selectedMonth} onChange={setSelectedMonth} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : showBudgetForm ? (
          <BudgetPage
            month={selectedMonth}
            onSaved={() => {
              setShowBudgetForm(false)
            }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del mes</h2>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Gastado</p>
                  <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
                </div>
                {budget !== null ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Presupuesto</p>
                      <p className="text-2xl font-bold text-gray-900">${budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{isOverBudget ? 'Pasado' : 'Restante'}</p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Presupuesto</p>
                    <p className="text-lg font-medium text-gray-500 mb-2">Sin presupuesto</p>
                    <button
                      onClick={() => setShowBudgetForm(true)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Definir presupuesto
                    </button>
                  </div>
                )}
              </div>

              {budget !== null && budget > 0 && (
                <>
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
              <BudgetPage month={selectedMonth} />
              <AddPurchase />
            </div>

            <PurchaseHistory month={selectedMonth} />
          </>
        )}
      </main>
    </div>
  )
}
```

Cambios clave:
- Import `MonthNavigator` y `getCurrentMonth` helper.
- Estado `selectedMonth` (default: `getCurrentMonth()`), `budget` (ahora `number | null`), `showBudgetForm`.
- `useEffect` con `isMounted` flag y dep `[user, selectedMonth]` â€” recarga al cambiar mes, cancela queries pendientes.
- `getBudget` y `getTotalSpent` llamados con `selectedMonth`.
- Resumen 3 estados: normal (restante verde), pasado (rojo), sin presupuesto (botÃ³n definir).
- `showBudgetForm` renderiza `<BudgetPage month={selectedMonth} onSaved={...} />` en lugar del Dashboard.
- `<BudgetPage month={selectedMonth} />` en la grid (no solo mes actual).
- `<PurchaseHistory month={selectedMonth} />` (no solo mes actual).
- Eliminado el `{user?.uid}` del header (era info de debug innecesaria).

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**