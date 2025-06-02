"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VehicleFormProps {
  onSubmit: (vehicle: any) => void
  onCancel: () => void
}

export function VehicleForm({ onSubmit, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    tank_capacity: "",
    year: "",
    subtitle: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      tank_capacity: Number.parseFloat(formData.tank_capacity),
      year: Number.parseInt(formData.year),
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Veículo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Veículo</Label>
              <Input
                id="name"
                placeholder="Ex: Honda Civic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Tipo/Modelo</Label>
              <Input
                id="subtitle"
                placeholder="Ex: Sedan, Hatch, SUV"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tank_capacity">Capacidade do Tanque (L)</Label>
              <Input
                id="tank_capacity"
                type="number"
                step="0.1"
                placeholder="Ex: 50"
                value={formData.tank_capacity}
                onChange={(e) => setFormData({ ...formData, tank_capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit">Cadastrar Veículo</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
