"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { Plus, Car, Fuel, TrendingUp, AlertCircle, Gauge, LogOut, Lock } from "lucide-react"
import { LoginScreen } from "@/components/login-screen"
import { VehicleForm } from "@/components/vehicle-form"
import { FuelRecordForm } from "@/components/fuel-record-form"
import { VehicleList } from "@/components/vehicle-list"
import { FuelRecordsList } from "@/components/fuel-records-list"
import { ConsumptionStats } from "@/components/consumption-stats"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const tabs = [
  { id: "vehicles", label: "Veículos", shortLabel: "Garagem", icon: Car },
  { id: "fuel", label: "Abastecimentos", shortLabel: "Tanque", icon: Fuel },
  { id: "stats", label: "Estatísticas", shortLabel: "Consumo", icon: TrendingUp },
] as const

type TabId = (typeof tabs)[number]["id"]

const toVehicle = (row: any) => ({
  ...row,
  tank_capacity: Number(row.tank_capacity),
  year: Number(row.year),
})

const toFuelRecord = (row: any) => ({
  ...row,
  odometer: Number(row.odometer),
  fuel_amount: Number(row.fuel_amount),
  fuel_price_per_unit: Number(row.fuel_price_per_unit),
  total_cost: Number(row.total_cost),
})

export default function HomePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabId>("fuel")
  const [vehicles, setVehicles] = useState<any[]>([])
  const [fuelRecords, setFuelRecords] = useState<any[]>([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((current) => {
        const next = session?.user ?? null
        return current?.id === next?.id ? current : next
      })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setVehicles([])
      setFuelRecords([])
      setIsPremium(null)
      return
    }

    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const premium = await checkPremium(user)
        setIsPremium(premium)
        if (!premium) return

        await fetchVehicles()
        await fetchFuelRecords()
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error)
        setHasError(true)
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao banco de dados. Verifique as configurações.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [user?.id])

  const checkPremium = async (currentUser: User) => {
    const { data, error } = await supabase
      .from('premium_users')
      .select('is_premium, expires_at')
      .eq('email', (currentUser.email ?? '').toLowerCase())
      .maybeSingle()

    if (error) throw error
    if (!data?.is_premium) return false
    return !data.expires_at || new Date(data.expires_at).getTime() > Date.now()
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return
    if (/invalid login credentials/i.test(error.message)) throw new Error("E-mail ou senha incorretos")
    if (/email not confirmed/i.test(error.message)) throw new Error("E-mail ainda não confirmado")
    throw new Error("Não foi possível entrar. Tente novamente.")
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('ft_vehicles')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error

    setVehicles((data ?? []).map(toVehicle))
  }

  const fetchFuelRecords = async () => {
    const { data, error } = await supabase
      .from('ft_fuel_records')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error

    setFuelRecords((data ?? []).map(toFuelRecord))
  }

  const addVehicle = async (vehicle) => {
    const { data, error } = await supabase
      .from('ft_vehicles')
      .insert([
        {
          id: crypto.randomUUID(),
          name: vehicle.name,
          tank_capacity: vehicle.tank_capacity,
          year: vehicle.year,
          subtitle: vehicle.subtitle ?? '',
          is_deleted: false
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao adicionar veículo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o veículo",
        variant: "destructive"
      })
      return
    }

    setVehicles([toVehicle(data[0]), ...vehicles])
    setShowVehicleForm(false)
    toast({
      title: "Sucesso",
      description: "Veículo cadastrado com sucesso"
    })
  }

  const deleteVehicle = async (vehicleId) => {
    const [records, expenses, vehicle] = await Promise.all([
      supabase.from('ft_fuel_records').update({ is_deleted: true }).eq('vehicle_id', vehicleId),
      supabase.from('ft_expenses').update({ is_deleted: true }).eq('vehicle_id', vehicleId),
      supabase.from('ft_vehicles').update({ is_deleted: true }).eq('id', vehicleId),
    ])
    const error = records.error || expenses.error || vehicle.error

    if (error) {
      console.error('Erro ao deletar veículo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o veículo",
        variant: "destructive"
      })
      return
    }

    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId))
    setFuelRecords(fuelRecords.filter(record => record.vehicle_id !== vehicleId))
    toast({
      title: "Sucesso",
      description: "Veículo excluído com sucesso"
    })
  }

  const deleteFuelRecord = async (recordId) => {
    try {
      const { error } = await supabase
        .from('ft_fuel_records')
        .update({ is_deleted: true })
        .eq('id', recordId)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o registro",
          variant: "destructive"
        })
        return
      }

      setFuelRecords(fuelRecords.filter(record => record.id !== recordId))
      
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso"
      })
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro",
        variant: "destructive"
      })
    }
  }

  const addFuelRecord = async (record) => {
    try {
      const { data, error } = await supabase
        .from('ft_fuel_records')
        .insert([{
          ...record,
          id: crypto.randomUUID(),
          is_deleted: false
        }])
        .select()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível registrar o abastecimento",
          variant: "destructive"
        })
        return
      }

      if (data && data.length > 0) {
        setFuelRecords(
          [toFuelRecord(data[0]), ...fuelRecords].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
        setShowFuelForm(false)
        toast({
          title: "Sucesso",
          description: "Abastecimento registrado com sucesso!"
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar registro de combustível:', error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar o abastecimento",
        variant: "destructive"
      })
    }
  }

  const openPrimaryAction = () => {
    if (activeTab === "vehicles" || vehicles.length === 0) {
      setShowVehicleForm(true)
      return
    }
    setShowFuelForm(true)
  }

  const lastRecord = fuelRecords[0]
  const monthSpend = fuelRecords.reduce((sum, record) => {
    const date = new Date(record.created_at)
    const now = new Date()
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return sum + (record.total_cost || 0)
    }
    return sum
  }, 0)

  const sheetClassName =
    "flex max-h-[92dvh] flex-col overflow-y-auto rounded-t-[28px] border-0 bg-[#f7faf8] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[90vh] md:w-full md:max-w-xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:border md:pb-6"

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#eef4f1] px-4">
        <div className="max-w-sm rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-bold">Erro de Conexão</h3>
          <p className="text-sm text-slate-500">
            Não foi possível conectar ao banco de dados. Verifique se as variáveis de ambiente estão configuradas corretamente.
          </p>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#eef4f1]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-[#165a4a]"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSubmit={signIn} />
  }

  if (isPremium === false) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#0f3d34] via-[#165a4a] to-[#1f7a5c] px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
          <Lock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h3 className="mb-2 text-lg font-bold text-slate-900">Acesso exclusivo Premium</h3>
          <p className="mb-5 text-sm text-slate-500">
            A conta {user.email} não tem o plano Premium ativo. Assine pelo app FuelTrack para acessar seus dados pelo navegador.
          </p>
          <Button onClick={signOut} variant="outline" className="w-full">
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#eef4f1]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f3d34] via-[#165a4a] to-[#1f7a5c] pb-16 pt-5 text-white md:pb-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">FuelTrack</p>
                <h1 className="text-xl font-bold leading-tight md:text-3xl">Controle de combustível</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openPrimaryAction}
                className="hidden bg-amber-400 text-[#1a2e24] hover:bg-amber-300 md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                {vehicles.length === 0 || activeTab === "vehicles" ? "Novo veículo" : "Abastecer"}
              </Button>
              <button
                onClick={signOut}
                title={`Sair (${user.email})`}
                aria-label="Sair da conta"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 hover:bg-white/25"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-[11px] text-emerald-100/80">Veículos</p>
              <p className="text-xl font-bold sm:text-2xl">{vehicles.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-[11px] text-emerald-100/80">Este mês</p>
              <p className="text-lg font-bold leading-tight sm:text-2xl">R$ {monthSpend.toFixed(0)}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-sm">
              <p className="text-[11px] text-emerald-100/80">Último</p>
              <p className="truncate text-lg font-bold sm:text-2xl">
                {lastRecord ? `${lastRecord.fuel_amount}L` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <div className="mb-4 hidden rounded-2xl bg-white p-1.5 shadow-sm md:flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#165a4a] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-[#165a4a]"></div>
            <p className="font-medium text-slate-500">Carregando sua garagem...</p>
          </div>
        )}

        {hasError && (
          <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-bold">Erro de Conexão</h3>
            <p className="mb-5 text-sm text-slate-500">
              Não foi possível conectar ao banco de dados. Verifique se as variáveis de ambiente estão configuradas corretamente.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        )}

        {!isLoading && !hasError && (
          <>
            {activeTab === "vehicles" && (
              <VehicleList
                vehicles={vehicles}
                onDelete={deleteVehicle}
                onAdd={() => setShowVehicleForm(true)}
              />
            )}

            {activeTab === "fuel" && (
              <FuelRecordsList
                fuelRecords={fuelRecords}
                vehicles={vehicles}
                onDelete={deleteFuelRecord}
                onAdd={() => setShowFuelForm(true)}
                onGoToVehicles={() => setActiveTab("vehicles")}
              />
            )}

            {activeTab === "stats" && (
              <ConsumptionStats fuelRecords={fuelRecords} vehicles={vehicles} />
            )}
          </>
        )}
      </div>

      {!isLoading && !hasError && (
        <>
          <button
            onClick={openPrimaryAction}
            className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-[#16352c] shadow-[0_12px_30px_rgba(245,158,11,0.45)] md:hidden"
            aria-label="Ação principal"
          >
            <Plus className="h-8 w-8" />
          </button>

          <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
            <div className="mx-auto grid max-w-md grid-cols-3 rounded-[28px] bg-[#12362e] p-1.5 text-white shadow-2xl">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] text-[11px] font-semibold ${
                      isActive ? "bg-white text-[#12362e]" : "text-emerald-100/70"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.shortLabel}
                  </button>
                )
              })}
            </div>
          </nav>
        </>
      )}

      <Sheet open={showVehicleForm} onOpenChange={setShowVehicleForm}>
        <SheetContent side="bottom" className={sheetClassName}>
          <SheetHeader className="mb-4 pr-10 text-left">
            <SheetTitle className="text-xl">Cadastrar veículo</SheetTitle>
          </SheetHeader>
          <VehicleForm onSubmit={addVehicle} onCancel={() => setShowVehicleForm(false)} hideChrome />
        </SheetContent>
      </Sheet>

      <Sheet open={showFuelForm} onOpenChange={setShowFuelForm}>
        <SheetContent side="bottom" className={sheetClassName}>
          <SheetHeader className="mb-4 pr-10 text-left">
            <SheetTitle className="text-xl">Registrar abastecimento</SheetTitle>
          </SheetHeader>
          <FuelRecordForm
            vehicles={vehicles}
            onSubmit={addFuelRecord}
            onCancel={() => setShowFuelForm(false)}
            hideChrome
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
