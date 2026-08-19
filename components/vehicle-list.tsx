"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Car, Fuel, Plus, Trash2 } from "lucide-react"
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

interface VehicleListProps {
  vehicles: any[]
  onDelete: (id: number) => void
  onAdd: () => void
}

export function VehicleList({ vehicles, onDelete, onAdd }: VehicleListProps) {
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null)

  if (vehicles.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#165a4a]">
          <Car className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold text-slate-900">Nenhum veículo ainda</p>
        <p className="mt-1 text-sm text-slate-500">Cadastre o primeiro para começar a registrar abastecimentos.</p>
        <Button onClick={onAdd} className="mt-6 min-h-12 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Adicionar veículo
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Garagem</h2>
          <p className="text-sm text-slate-500">{vehicles.length} veículo{vehicles.length === 1 ? "" : "s"} cadastrado{vehicles.length === 1 ? "" : "s"}</p>
        </div>
        <Button onClick={onAdd} className="hidden md:inline-flex">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-emerald-900/5"
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#1f7a5c]" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#165a4a]">
                  <Car className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-slate-900">{vehicle.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{vehicle.year}</Badge>
                    {vehicle.subtitle && <Badge variant="outline">{vehicle.subtitle}</Badge>}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => setVehicleToDelete(vehicle.id)}
                aria-label="Excluir veículo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 pl-2">
              <div className="rounded-2xl bg-[#f3f8f5] px-3 py-2">
                <p className="text-[11px] font-medium text-slate-500">Tanque</p>
                <p className="flex items-center gap-1 font-bold text-slate-900">
                  <Fuel className="h-3.5 w-3.5 text-[#1f7a5c]" />
                  {vehicle.tank_capacity}L
                </p>
              </div>
              <div className="rounded-2xl bg-[#f3f8f5] px-3 py-2">
                <p className="text-[11px] font-medium text-slate-500">Desde</p>
                <p className="font-bold text-slate-900">
                  {new Date(vehicle.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AlertDialog open={vehicleToDelete !== null} onOpenChange={() => setVehicleToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (vehicleToDelete) {
                  onDelete(vehicleToDelete)
                  setVehicleToDelete(null)
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
