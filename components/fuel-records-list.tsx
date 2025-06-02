import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, Calendar, DollarSign, Gauge } from "lucide-react"

interface FuelRecordsListProps {
  fuelRecords: any[]
  vehicles: any[]
}

export function FuelRecordsList({ fuelRecords, vehicles }: FuelRecordsListProps) {
  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? vehicle.name : "Veículo não encontrado"
  }

  if (fuelRecords.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum abastecimento registrado</p>
          <p className="text-sm text-gray-400">Registre seu primeiro abastecimento para começar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {fuelRecords.map((record) => (
        <Card key={record.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{getVehicleName(record.vehicle_id)}</CardTitle>
              <Badge variant={record.full_tank ? "default" : "secondary"}>
                {record.full_tank ? "Tanque Cheio" : "Parcial"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Quilometragem</p>
                  <p className="font-semibold">{record.odometer.toLocaleString()} km</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Litros</p>
                  <p className="font-semibold">{record.fuel_amount}L</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Preço/L</p>
                  <p className="font-semibold">R$ {record.fuel_price_per_unit.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">R$ {record.total_cost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{record.fuel_type}</Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(record.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>

            {record.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{record.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
