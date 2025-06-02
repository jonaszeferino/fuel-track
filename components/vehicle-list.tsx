import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Calendar, Fuel, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VehicleListProps {
  vehicles: any[]
  onDelete: (id: number) => void
}

export function VehicleList({ vehicles, onDelete }: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum veículo cadastrado</p>
          <p className="text-sm text-gray-400">Clique em "Adicionar Veículo" para começar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => (
        <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{vehicle.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-500" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(vehicle.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {vehicle.subtitle && (
              <Badge variant="secondary" className="w-fit">
                {vehicle.subtitle}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Ano: {vehicle.year}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Fuel className="w-4 h-4 mr-2" />
              <span>Tanque: {vehicle.tank_capacity}L</span>
            </div>
            <div className="text-xs text-gray-400">
              Cadastrado em: {new Date(vehicle.created_at).toLocaleDateString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
