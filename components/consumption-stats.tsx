import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Fuel, DollarSign, BarChart3, Droplet } from "lucide-react"

interface ConsumptionStatsProps {
  fuelRecords: any[]
  vehicles: any[]
}

export function ConsumptionStats({ fuelRecords, vehicles }: ConsumptionStatsProps) {
  const calculateConsumption = (vehicleId: number) => {
    const vehicleRecords = fuelRecords
      .filter((record) => record.vehicle_id === vehicleId && record.full_tank)
      .sort((a, b) => a.odometer - b.odometer)

    if (vehicleRecords.length < 2) return null

    const consumptions = []
    for (let i = 1; i < vehicleRecords.length; i++) {
      const current = vehicleRecords[i]
      const previous = vehicleRecords[i - 1]
      const distance = current.odometer - previous.odometer
      const consumption = (current.fuel_amount / distance) * 100
      consumptions.push({
        consumption,
        distance,
        fuelAmount: current.fuel_amount,
        cost: current.total_cost,
        date: current.created_at,
      })
    }

    return consumptions
  }

  const getVehicleStats = (vehicleId: number) => {
    const consumptions = calculateConsumption(vehicleId)
    if (!consumptions || consumptions.length === 0) return null

    const avgConsumption = consumptions.reduce((sum, c) => sum + c.consumption, 0) / consumptions.length
    const totalDistance = consumptions.reduce((sum, c) => sum + c.distance, 0)
    const totalFuel = consumptions.reduce((sum, c) => sum + c.fuelAmount, 0)
    const totalCost = consumptions.reduce((sum, c) => sum + c.cost, 0)

    return {
      avgConsumption: avgConsumption.toFixed(1),
      totalDistance,
      totalFuel: totalFuel.toFixed(1),
      totalCost: totalCost.toFixed(2),
      costPerKm: (totalCost / totalDistance).toFixed(3),
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
      const totalCost = monthRecords.reduce((sum, record) => sum + record.total_cost, 0)
      const totalLiters = monthRecords.reduce((sum, record) => sum + record.fuel_amount, 0)
      const avgPricePerLiter = totalCost / totalLiters

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
    const totalCost = records.reduce((sum, record) => sum + record.total_cost, 0)
    const totalLiters = records.reduce((sum, record) => sum + record.fuel_amount, 0)
    const avgPricePerLiter = totalCost / totalLiters

    return {
      totalCost,
      totalLiters,
      avgPricePerLiter
    }
  }

  const monthlyStats = calculateMonthlyStats(fuelRecords)
  const totals = calculateTotals(fuelRecords)

  // Função para formatar mês
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  }

  if (fuelRecords.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Sem dados suficientes para estatísticas</p>
          <p className="text-sm text-gray-400">
            Registre pelo menos 2 abastecimentos com tanque cheio para ver as estatísticas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totals.totalCost.toFixed(2)}</div>
            <p className="text-xs text-gray-500">
              Média de R$ {totals.avgPricePerLiter.toFixed(2)}/L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Litros</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalLiters.toFixed(1)}L</div>
            <p className="text-xs text-gray-500">
              {fuelRecords.length} abastecimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totals.totalCost / monthlyStats.length).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              {monthlyStats.length} meses registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStats.map((stat) => (
              <div key={stat.month} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{formatMonth(stat.month)}</h3>
                  <span className="text-sm text-gray-500">
                    {stat.records.length} abastecimentos
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">R$ {stat.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Média: R$ {stat.avgPricePerLiter.toFixed(2)}/L
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplet className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{stat.totalLiters.toFixed(1)}L</p>
                      <p className="text-xs text-gray-500">
                        {stat.records.length} registros
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {vehicles.map((vehicle) => {
        const stats = getVehicleStats(vehicle.id)

        if (!stats) {
          return (
            <Card key={vehicle.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{vehicle.name}</span>
                  <Badge variant="secondary">{vehicle.year}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-4">
                  Dados insuficientes. Registre pelo menos 2 abastecimentos com tanque cheio.
                </p>
              </CardContent>
            </Card>
          )
        }

        const lastConsumption = stats.consumptions[stats.consumptions.length - 1]
        const previousConsumption = stats.consumptions[stats.consumptions.length - 2]
        const trend =
          lastConsumption && previousConsumption ? lastConsumption.consumption - previousConsumption.consumption : 0

        return (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>{vehicle.name}</span>
                  <Badge variant="secondary">{vehicle.year}</Badge>
                </div>
                {trend !== 0 && (
                  <div className={`flex items-center space-x-1 ${trend > 0 ? "text-red-500" : "text-green-500"}`}>
                    {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm">{Math.abs(trend).toFixed(1)} L/100km</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Fuel className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Consumo Médio</p>
                  <p className="text-xl font-bold text-blue-600">{stats.avgConsumption}</p>
                  <p className="text-xs text-gray-500">L/100km</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Distância Total</p>
                  <p className="text-xl font-bold text-green-600">{stats.totalDistance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">km</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Fuel className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Combustível Total</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.totalFuel}</p>
                  <p className="text-xs text-gray-500">litros</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Custo Total</p>
                  <p className="text-xl font-bold text-red-600">R$ {stats.totalCost}</p>
                  <p className="text-xs text-gray-500">R$ {stats.costPerKm}/km</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Histórico de Consumo</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stats.consumptions
                    .slice(-5)
                    .reverse()
                    .map((consumption, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{new Date(consumption.date).toLocaleDateString("pt-BR")}</span>
                        <span className="font-semibold">{consumption.consumption.toFixed(1)} L/100km</span>
                        <span className="text-sm text-gray-600">{consumption.distance} km</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
