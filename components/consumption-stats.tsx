import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Fuel, DollarSign, BarChart3, Droplet } from "lucide-react"

interface ConsumptionStatsProps {
  fuelRecords: any[]
  vehicles: any[]
}

export function ConsumptionStats({ fuelRecords, vehicles }: ConsumptionStatsProps) {
  // Filtrar registros deletados para garantir que não sejam considerados
  const activeFuelRecords = fuelRecords.filter((record) => !record.is_deleted)
  
  const calculateConsumption = (vehicleId: number) => {
    const vehicleRecords = activeFuelRecords
      .filter((record) => record.vehicle_id === vehicleId)
      .sort((a, b) => a.odometer - b.odometer)

    if (vehicleRecords.length < 2) return null

    const consumptions = []
    
    // Encontrar todos os registros com tanque cheio
    const fullTankRecords = vehicleRecords.filter(record => record.full_tank)
    
    if (fullTankRecords.length < 2) return null
    
    // Pegar apenas os dois últimos tanques cheios
    const lastTwoFullTanks = fullTankRecords.slice(-2)
    if (lastTwoFullTanks.length < 2) return null
    
    const previousFullTank = lastTwoFullTanks[0]  // Primeiro tanque cheio (apenas referência)
    const currentFullTank = lastTwoFullTanks[1]   // Segundo tanque cheio (consumo real)
    
    // Encontrar todos os registros ENTRE os dois tanques cheios (excluindo o primeiro)
    const recordsBetween = vehicleRecords.filter(record => 
      record.odometer > previousFullTank.odometer && 
      record.odometer <= currentFullTank.odometer
    )
    
    // Calcular distância total percorrida
    const distance = currentFullTank.odometer - previousFullTank.odometer
    
    // Calcular total de combustível consumido (EXCLUINDO o primeiro tanque cheio)
    const totalFuelConsumed = recordsBetween.reduce((sum, record) => sum + record.fuel_amount, 0)
    
    // Calcular consumo em L/100km
    const consumption = (totalFuelConsumed / distance) * 100
    
    // Calcular km/l
    const kmPerLiter = distance / totalFuelConsumed
    
    // Calcular custo total (EXCLUINDO o primeiro tanque cheio)
    const totalCost = recordsBetween.reduce((sum, record) => sum + record.total_cost, 0)
    
    consumptions.push({
      consumption,
      kmPerLiter,
      distance,
      fuelAmount: totalFuelConsumed,
      cost: totalCost,
      date: currentFullTank.created_at,
      recordsCount: recordsBetween.length,
      startOdometer: previousFullTank.odometer,
      endOdometer: currentFullTank.odometer,
      referenceOdometer: previousFullTank.odometer  // Apenas referência
    })

    return consumptions
  }

  const getVehicleStats = (vehicleId: number) => {
    const consumptions = calculateConsumption(vehicleId)
    if (!consumptions || consumptions.length === 0) return null

    // Buscar todos os registros do veículo para calcular totais (apenas não deletados)
    const allVehicleRecords = activeFuelRecords.filter((record) => record.vehicle_id === vehicleId)
    
    // Usar o único resultado de consumo calculado (dos dois últimos tanques cheios)
    const consumption = consumptions[0]
    const totalDistance = consumption.distance
    
    // Calcular totais usando todos os registros do veículo
    const totalFuel = allVehicleRecords.reduce((sum, record) => sum + record.fuel_amount, 0)
    const totalCost = allVehicleRecords.reduce((sum, record) => sum + record.total_cost, 0)
    
    // Calcular km/l usando os dados dos dois últimos tanques cheios
    const avgKmPerLiter = consumption.kmPerLiter

    return {
      avgKmPerLiter: avgKmPerLiter.toFixed(1),
      totalDistance,
      totalFuel: totalFuel.toFixed(1),
      totalCost: totalCost.toFixed(2),
      costPerKm: totalDistance > 0 ? (totalCost / totalDistance).toFixed(3) : "0.000",
      consumptions,
    }
  }

  // Função para agrupar registros por mês
  const groupByMonth = (records: any[]) => {
    const months: { [key: string]: any[] } = {}
    
    records.forEach(record => {
      const date = new Date(record.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!months[monthKey]) {
        months[monthKey] = []
      }
      months[monthKey].push(record)
    })
    
    return months
  }

  // Função para calcular estatísticas por mês
  const calculateMonthlyStats = (records: any[]) => {
    const months = groupByMonth(records)
    const stats = []

    for (const [month, monthRecords] of Object.entries(months)) {
      const totalCost = monthRecords.reduce((sum, record) => sum + (record.total_cost || 0), 0)
      const totalLiters = monthRecords.reduce((sum, record) => sum + (record.fuel_amount || 0), 0)
      const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

      stats.push({
        month,
        totalCost,
        totalLiters,
        avgPricePerLiter,
        records: monthRecords
      })
    }

    return stats.sort((a, b) => b.month.localeCompare(a.month))
  }

  // Função para calcular totais gerais
  const calculateTotals = (records: any[]) => {
    const totalCost = records.reduce((sum, record) => sum + (record.total_cost || 0), 0)
    const totalLiters = records.reduce((sum, record) => sum + (record.fuel_amount || 0), 0)
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0

    return {
      totalCost,
      totalLiters,
      avgPricePerLiter
    }
  }

  // Função para calcular a última média de km/l
  const calculateLastAverageKmPerLiter = () => {
    let lastKmPerLiter = 0
    let lastDate = new Date(0)
    
    vehicles.forEach(vehicle => {
      const consumptions = calculateConsumption(vehicle.id)
      if (consumptions && consumptions.length > 0) {
        // Pegar o último registro de cada veículo (que já considera todos os abastecimentos intermediários)
        const lastConsumption = consumptions[consumptions.length - 1]
        const consumptionDate = new Date(lastConsumption.date)
        
        // Manter o registro mais recente
        if (consumptionDate > lastDate) {
          lastDate = consumptionDate
          lastKmPerLiter = lastConsumption.kmPerLiter
        }
      }
    })
    
    return lastKmPerLiter
  }

  // Função para calcular eficiência entre os dois últimos abastecimentos do veículo mais recente
  const calculateLastTwoKmPerLiter = () => {
    let lastVehicleId = null
    let lastDate = new Date(0)
    // Encontrar o veículo do último abastecimento (apenas não deletados)
    activeFuelRecords.forEach(record => {
      const date = new Date(record.created_at)
      if (date > lastDate) {
        lastDate = date
        lastVehicleId = record.vehicle_id
      }
    })
    if (!lastVehicleId) return 0
    
    const consumptions = calculateConsumption(lastVehicleId)
    if (!consumptions || consumptions.length === 0) return 0
    
    // Pega o último cálculo de km/l desse veículo (que já considera todos os abastecimentos intermediários)
    return consumptions[consumptions.length - 1].kmPerLiter
  }

  const lastTwoKmPerLiter = calculateLastTwoKmPerLiter()

  const monthlyStats = calculateMonthlyStats(activeFuelRecords)
  const totals = calculateTotals(activeFuelRecords)
  const lastAverageKmPerLiter = calculateLastAverageKmPerLiter()

  // Função para formatar mês
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  }

  if (activeFuelRecords.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
        <p className="text-lg font-bold">Sem estatísticas ainda</p>
        <p className="mt-1 px-2 text-sm text-slate-500">
          Registre pelo menos 2 abastecimentos com tanque cheio para ver o consumo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Consumo</h2>
        <p className="text-sm text-slate-500">Totais, meses e eficiência por veículo</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl bg-[#165a4a] p-4 text-white shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">Gasto total</p>
            <DollarSign className="h-4 w-4 text-amber-300" />
          </div>
          <p className="text-2xl font-extrabold">R$ {totals.totalCost.toFixed(2)}</p>
          <p className="mt-1 text-xs text-emerald-100">Média R$ {totals.avgPricePerLiter.toFixed(2)}/L</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Litros</p>
            <Droplet className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{totals.totalLiters.toFixed(1)}L</p>
          <p className="mt-1 text-xs text-slate-500">{activeFuelRecords.length} abastecimentos</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">2 últimos</p>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{lastTwoKmPerLiter.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-500">km/l do veículo mais recente</p>
        </div>

        <div className="rounded-3xl bg-amber-400 p-4 text-[#1a2e24] shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide">Último km/l</p>
            <Fuel className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold">{lastAverageKmPerLiter.toFixed(1)}</p>
          <p className="mt-1 text-xs opacity-80">último registro calculado</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5 sm:p-5">
        <h3 className="mb-3 text-base font-bold sm:text-lg">Estatísticas mensais</h3>
        <div className="space-y-3">
          {monthlyStats.map((stat) => (
            <div key={stat.month} className="rounded-2xl bg-[#f3f8f5] p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold capitalize text-slate-900 sm:text-base">{formatMonth(stat.month)}</h4>
                <span className="shrink-0 text-xs font-medium text-slate-500">
                  {stat.records.length} abastecimentos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-bold text-[#165a4a]">R$ {stat.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">Média R$ {stat.avgPricePerLiter.toFixed(2)}/L</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{stat.totalLiters.toFixed(1)}L</p>
                  <p className="text-xs text-slate-500">{stat.records.length} registros</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {vehicles.map((vehicle) => {
        const stats = getVehicleStats(vehicle.id)

        if (!stats) {
          return (
            <div key={vehicle.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">{vehicle.name}</h3>
                <Badge variant="secondary">{vehicle.year}</Badge>
              </div>
              <p className="py-3 text-sm text-slate-500">
                Dados insuficientes. Registre pelo menos 2 abastecimentos com tanque cheio.
              </p>
            </div>
          )
        }

        const lastConsumption = stats.consumptions[stats.consumptions.length - 1]
        const previousConsumption = stats.consumptions[stats.consumptions.length - 2]
        const trend =
          lastConsumption && previousConsumption ? lastConsumption.consumption - previousConsumption.consumption : 0

        let lastTwoKmPerLiter = null
        if (stats.consumptions.length >= 1) {
          lastTwoKmPerLiter = stats.consumptions[stats.consumptions.length - 1].kmPerLiter
        }

        return (
          <div key={vehicle.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold">{vehicle.name}</h3>
                <Badge variant="secondary">{vehicle.year}</Badge>
              </div>
              {trend !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? "text-red-500" : "text-emerald-600"}`}>
                  {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(trend).toFixed(1)} L/100km</span>
                </div>
              )}
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <p className="text-xs text-slate-600">Eficiência média</p>
                <p className="text-xl font-extrabold text-[#165a4a]">{lastTwoKmPerLiter !== null ? lastTwoKmPerLiter.toFixed(1) : '-'}</p>
                <p className="text-xs text-slate-500">km/l (2 últimos tanques cheios)</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3 text-center">
                <p className="text-xs text-slate-600">Distância total</p>
                <p className="text-xl font-extrabold text-sky-700">{stats.totalDistance.toLocaleString()}</p>
                <p className="text-xs text-slate-500">km</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <p className="text-xs text-slate-600">Combustível total</p>
                <p className="text-xl font-extrabold text-amber-700">{stats.totalFuel}</p>
                <p className="text-xs text-slate-500">litros</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3 text-center">
                <p className="text-xs text-slate-600">Custo total</p>
                <p className="text-xl font-extrabold text-rose-700">R$ {stats.totalCost}</p>
                <p className="text-xs text-slate-500">R$ {stats.costPerKm}/km</p>
              </div>
            </div>

            <h4 className="mb-2 text-sm font-bold text-slate-800">Eficiência dos dois últimos tanques cheios</h4>
            <div className="space-y-2">
              {stats.consumptions.map((consumption, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-2xl bg-[#f3f8f5] p-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-bold">{new Date(consumption.date).toLocaleDateString("pt-BR")}</span>
                    <span className="text-sm text-slate-600">{consumption.distance} km percorridos</span>
                    <span className="text-xs text-[#165a4a]">
                      Referência: {consumption.startOdometer.toLocaleString()} km → Final: {consumption.endOdometer.toLocaleString()} km
                    </span>
                    <span className="text-xs text-violet-700">{consumption.recordsCount} abastecimentos considerados</span>
                    <span className="text-xs text-slate-500">(Primeiro tanque cheio é apenas referência de odômetro)</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                    <div className="sm:text-right">
                      <span className="text-lg font-extrabold text-[#165a4a]">{consumption.kmPerLiter.toFixed(1)} km/l</span>
                      <span className="block text-sm text-slate-500">{consumption.consumption.toFixed(1)} L/100km</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{consumption.fuelAmount}L</span>
                      <span className="block text-xs text-slate-500">R$ {consumption.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
