"use client"

import { Badge } from "@/components/ui/badge"
import { Fuel, Plus, Trash2 } from "lucide-react"
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
import { useMemo, useState } from "react"

interface FuelRecordsListProps {
  fuelRecords: any[]
  vehicles: any[]
  onDelete: (id: number) => void
  onAdd: () => void
  onGoToVehicles: () => void
}

export function FuelRecordsList({ fuelRecords, vehicles, onDelete, onAdd, onGoToVehicles }: FuelRecordsListProps) {
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
  const [vehicleFilter, setVehicleFilter] = useState<string>("all")

  const filteredRecords = useMemo(() => {
    if (vehicleFilter === "all") return fuelRecords
    return fuelRecords.filter((record) => String(record.vehicle_id) === vehicleFilter)
  }, [fuelRecords, vehicleFilter])

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.name}` : 'Veículo não encontrado'
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Fuel className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold">Cadastre um veículo primeiro</p>
        <p className="mt-1 text-sm text-slate-500">Depois você registra cada abastecimento em segundos.</p>
        <Button className="mt-6 min-h-12 w-full sm:w-auto" onClick={onGoToVehicles}>
          Ir para a garagem
        </Button>
      </div>
    )
  }

  if (fuelRecords.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#165a4a]">
          <Fuel className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold">Nenhum abastecimento</p>
        <p className="mt-1 text-sm text-slate-500">Toque no botão amarelo + para registrar o primeiro.</p>
        <Button onClick={onAdd} className="mt-6 min-h-12 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo abastecimento
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Abastecimentos</h2>
          <p className="text-sm text-slate-500">{filteredRecords.length} registro{filteredRecords.length === 1 ? "" : "s"}</p>
        </div>
        <Button onClick={onAdd} className="hidden md:inline-flex">
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      {vehicles.length > 1 && (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setVehicleFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              vehicleFilter === "all" ? "bg-[#165a4a] text-white" : "bg-white text-slate-600"
            }`}
          >
            Todos
          </button>
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setVehicleFilter(String(vehicle.id))}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                vehicleFilter === String(vehicle.id) ? "bg-[#165a4a] text-white" : "bg-white text-slate-600"
              }`}
            >
              {vehicle.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <article
            key={record.id}
            className="flex gap-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-emerald-900/5"
          >
            <div className={`w-1.5 shrink-0 ${record.full_tank ? "bg-amber-400" : "bg-emerald-400"}`} />
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-bold text-slate-900">{getVehicleName(record.vehicle_id)}</h3>
                  <p className="text-lg font-extrabold text-[#165a4a] sm:hidden">
                    R$ {record.total_cost.toFixed(2)}
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-400">
                  {new Date(record.created_at).toLocaleDateString("pt-BR")} · {record.odometer.toLocaleString()} km
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{record.fuel_type}</Badge>
                  <Badge variant={record.full_tank ? "default" : "outline"}>
                    {record.full_tank ? "Tanque cheio" : "Parcial"}
                  </Badge>
                  <Badge variant="outline">{record.fuel_amount}L</Badge>
                </div>
                {record.notes && (
                  <p className="mt-2 break-words text-sm text-slate-500">{record.notes}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="hidden text-right sm:block">
                  <p className="text-xl font-extrabold text-[#165a4a]">R$ {record.total_cost.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">R$ {record.fuel_price_per_unit.toFixed(2)}/L</p>
                </div>
                <p className="text-xs text-slate-500 sm:hidden">R$ {record.fuel_price_per_unit.toFixed(2)}/L</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setRecordToDelete(record.id)}
                  aria-label="Excluir abastecimento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AlertDialog open={recordToDelete !== null} onOpenChange={() => setRecordToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de abastecimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recordToDelete) {
                  onDelete(recordToDelete)
                  setRecordToDelete(null)
                }
              }}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
