"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Vehicle {
  id: number
  name: string
  year: string
}

interface FuelRecord {
  vehicle_id: number
  odometer: number
  fuel_amount: number
  fuel_price_per_unit: number
  total_cost: number
  fuel_type: string
  full_tank: boolean
  notes: string | null
  created_at: string
}

const toDateTimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface FuelRecordFormProps {
  vehicles: Vehicle[]
  onSubmit: (record: FuelRecord) => void
  onCancel: () => void
  hideChrome?: boolean
}

export function FuelRecordForm({ vehicles, onSubmit, onCancel, hideChrome = false }: FuelRecordFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    vehicle_id: vehicles.length === 1 ? vehicles[0].id.toString() : "",
    odometer: "",
    fuel_amount: "",
    fuel_price_per_unit: "",
    fuel_type: "",
    full_tank: false,
    notes: "",
    refueled_at: toDateTimeLocal(new Date()),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.vehicle_id || !formData.odometer || !formData.fuel_amount || 
        !formData.fuel_price_per_unit || !formData.fuel_type || !formData.refueled_at) {
      toast({
        title: "Atenção",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive"
      })
      return
    }
    
    const fuelAmount = parseFloat(formData.fuel_amount)
    const pricePerUnit = parseFloat(formData.fuel_price_per_unit)
    const odometer = parseInt(formData.odometer)
    const vehicleId = parseInt(formData.vehicle_id)

    if (isNaN(fuelAmount) || isNaN(pricePerUnit) || isNaN(odometer) || isNaN(vehicleId)) {
      toast({
        title: "Atenção",
        description: "Valores numéricos inválidos",
        variant: "destructive"
      })
      return
    }

    if (fuelAmount <= 0 || pricePerUnit <= 0 || odometer < 0) {
      toast({
        title: "Atenção",
        description: "Valores devem ser positivos",
        variant: "destructive"
      })
      return
    }

    const refueledAt = new Date(formData.refueled_at)
    if (isNaN(refueledAt.getTime())) {
      toast({
        title: "Atenção",
        description: "Data do abastecimento inválida",
        variant: "destructive"
      })
      return
    }

    const recordData: FuelRecord = {
      vehicle_id: vehicleId,
      odometer: odometer,
      fuel_amount: fuelAmount,
      fuel_price_per_unit: pricePerUnit,
      total_cost: parseFloat((fuelAmount * pricePerUnit).toFixed(2)),
      fuel_type: formData.fuel_type,
      full_tank: formData.full_tank,
      notes: formData.notes || null,
      created_at: refueledAt.toISOString()
    }

    onSubmit(recordData)
  }

  const fuelTypes = ["Gasolina", "Etanol", "Diesel", "GNV"]
  const total =
    formData.fuel_amount && formData.fuel_price_per_unit
      ? (parseFloat(formData.fuel_amount) * parseFloat(formData.fuel_price_per_unit)).toFixed(2)
      : "0.00"

  const form = (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vehicle">Veículo *</Label>
              <Select 
                value={formData.vehicle_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.name} - {vehicle.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="refueled_at">Data e hora *</Label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#165a4a] underline-offset-2 hover:underline"
                  onClick={() => setFormData({ ...formData, refueled_at: toDateTimeLocal(new Date()) })}
                >
                  Agora
                </button>
              </div>
              <Input
                id="refueled_at"
                type="datetime-local"
                value={formData.refueled_at}
                onChange={(e) => setFormData({ ...formData, refueled_at: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometer">Quilometragem *</Label>
              <Input
                id="odometer"
                type="number"
                inputMode="numeric"
                placeholder="Ex: 15000"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type">Tipo de Combustível *</Label>
              <Select 
                value={formData.fuel_type || undefined}
                onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_amount">Litros Abastecidos *</Label>
              <Input
                id="fuel_amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="Ex: 45.5"
                value={formData.fuel_amount}
                onChange={(e) => setFormData({ ...formData, fuel_amount: e.target.value })}
                required
                min="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_price">Preço por Litro (R$) *</Label>
              <Input
                id="fuel_price"
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="Ex: 5.50"
                value={formData.fuel_price_per_unit}
                onChange={(e) => setFormData({ ...formData, fuel_price_per_unit: e.target.value })}
                required
                min="0.01"
              />
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Total do abastecimento</p>
            <p className="text-3xl font-extrabold text-[#165a4a]">R$ {total}</p>
          </div>

          <label
            htmlFor="full_tank"
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <Checkbox
              id="full_tank"
              className="h-5 w-5"
              checked={formData.full_tank}
              onCheckedChange={(checked) => setFormData({ ...formData, full_tank: checked as boolean })}
            />
            <div>
              <span className="font-medium text-slate-900">Tanque cheio</span>
              <p className="text-xs text-slate-500">Necessário para calcular o consumo em km/l</p>
            </div>
          </label>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o abastecimento..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onCancel} className="min-h-11 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="min-h-11 w-full sm:w-auto">
              Registrar Abastecimento
            </Button>
          </div>
        </form>
  )

  if (hideChrome) {
    return form
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Abastecimento</CardTitle>
      </CardHeader>
      <CardContent>
        {form}
      </CardContent>
    </Card>
  )
}
