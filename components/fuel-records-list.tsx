import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, Calendar, TrendingUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface FuelRecordsListProps {
  fuelRecords: any[]
  vehicles: any[]
  onDelete: (id: number) => void
}

export function FuelRecordsList({ fuelRecords, vehicles, onDelete }: FuelRecordsListProps) {
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)

  if (fuelRecords.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum registro de abastecimento</p>
          <p className="text-sm text-gray-400">Clique em "Novo Abastecimento" para começar</p>
        </CardContent>
      </Card>
    )
  }

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.name} (${vehicle.year})` : 'Veículo não encontrado'
  }

  const handleDeleteClick = (recordId: number) => {
    setRecordToDelete(recordId)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete)
      setRecordToDelete(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fuelRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getVehicleName(record.vehicle_id)}</CardTitle>
                <div className="flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-blue-500" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="w-fit">
                  {record.fuel_type}
                </Badge>
                <Badge variant={record.full_tank ? "default" : "outline"} className="w-fit">
                  {record.full_tank ? "Tanque Cheio" : "Parcial"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Quilometragem: {record.odometer.toLocaleString()} km</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="w-4 h-4 mr-2" />
                <span>
                  {record.fuel_amount}L x R${record.fuel_price_per_unit.toFixed(2)} = R${record.total_cost.toFixed(2)}
                </span>
              </div>
              {record.notes && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Observações:</p>
                  <p>{record.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Registrado em: {new Date(record.created_at).toLocaleDateString("pt-BR")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={recordToDelete !== null} onOpenChange={() => setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
