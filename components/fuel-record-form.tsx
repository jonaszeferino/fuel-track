"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface FuelRecordFormProps {
  vehicles: any[]
  onSubmit: (record: any) => void
  onCancel: () => void
}

export function FuelRecordForm({ vehicles, onSubmit, onCancel }: FuelRecordFormProps) {
  const [formData, setFormData] = useState({
    vehicle_id: "",
    odometer: "",
    fuel_amount: "",
    fuel_price_per_unit: "",
    fuel_type: "",
    full_tank: false,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fuelAmount = Number.parseFloat(formData.fuel_amount)
    const pricePerUnit = Number.parseFloat(formData.fuel_price_per_unit)

    onSubmit({
      ...formData,
      vehicle_id: Number.parseInt(formData.vehicle_id),
      odometer: Number.parseInt(formData.odometer),
      fuel_amount: fuelAmount,
      fuel_price_per_unit: pricePerUnit,
      total_cost: fuelAmount * pricePerUnit,
    })
  }

  const fuelTypes = ["Gasolina", "Etanol", "Diesel", "GNV"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Abastecimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Veículo</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}>
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

            <div className="space-y-2">
              <Label htmlFor="odometer">Quilometragem</Label>
              <Input
                id="odometer"
                type="number"
                placeholder="Ex: 15000"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_amount">Litros Abastecidos</Label>
              <Input
                id="fuel_amount"
                type="number"
                step="0.01"
                placeholder="Ex: 45.5"
                value={formData.fuel_amount}
                onChange={(e) => setFormData({ ...formData, fuel_amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_price">Preço por Litro (R$)</Label>
              <Input
                id="fuel_price"
                type="number"
                step="0.01"
                placeholder="Ex: 5.50"
                value={formData.fuel_price_per_unit}
                onChange={(e) => setFormData({ ...formData, fuel_price_per_unit: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_type">Tipo de Combustível</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
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
              <Label>
                Total: R${" "}
                {formData.fuel_amount && formData.fuel_price_per_unit
                  ? (Number.parseFloat(formData.fuel_amount) * Number.parseFloat(formData.fuel_price_per_unit)).toFixed(
                      2,
                    )
                  : "0.00"}
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="full_tank"
              checked={formData.full_tank}
              onCheckedChange={(checked) => setFormData({ ...formData, full_tank: checked as boolean })}
            />
            <Label htmlFor="full_tank">Tanque cheio</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o abastecimento..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit">Registrar Abastecimento</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
