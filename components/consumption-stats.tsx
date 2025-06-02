import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Fuel, DollarSign, BarChart3 } from "lucide-react"

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
