"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Car, Fuel, TrendingUp } from "lucide-react"
import { VehicleForm } from "@/components/vehicle-form"
import { FuelRecordForm } from "@/components/fuel-record-form"
import { VehicleList } from "@/components/vehicle-list"
import { FuelRecordsList } from "@/components/fuel-records-list"
import { ConsumptionStats } from "@/components/consumption-stats"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("vehicles")
  const [vehicles, setVehicles] = useState([])
  const [fuelRecords, setFuelRecords] = useState([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)

  // Simular dados iniciais
  //testando 2
  useEffect(() => {
    const mockVehicles = [
      {
        id: 1,
        name: "Honda Civic",
        tank_capacity: 50,
        year: 2020,
        subtitle: "Sedan",
        created_at: new Date().toISOString(),
        is_deleted: false,
      },
    ]

    const mockFuelRecords = [
      {
        id: 1,
        vehicle_id: 1,
        odometer: 15000,
        fuel_amount: 45,
        fuel_price_per_unit: 5.5,
        total_cost: 247.5,
        fuel_type: "Gasolina",
        full_tank: true,
        notes: "Primeiro abastecimento",
        created_at: new Date().toISOString(),
      },
    ]

    setVehicles(mockVehicles)
    setFuelRecords(mockFuelRecords)
  }, [])

  const addVehicle = (vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: Date.now(),
      created_at: new Date().toISOString(),
      is_deleted: false,
    }
    setVehicles([...vehicles, newVehicle])
    setShowVehicleForm(false)
  }

  const addFuelRecord = (record) => {
    const newRecord = {
      ...record,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }
    setFuelRecords([...fuelRecords, newRecord])
    setShowFuelForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Combustível</h1>
          <p className="text-gray-600">Gerencie seus veículos e monitore o consumo de combustível</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("vehicles")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "vehicles" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Veículos</span>
          </button>
          <button
            onClick={() => setActiveTab("fuel")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "fuel" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Abastecimentos</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "stats" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Estatísticas</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === "vehicles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Meus Veículos</h2>
              <Button onClick={() => setShowVehicleForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Veículo
              </Button>
            </div>

            {showVehicleForm && <VehicleForm onSubmit={addVehicle} onCancel={() => setShowVehicleForm(false)} />}

            <VehicleList vehicles={vehicles} />
          </div>
        )}

        {activeTab === "fuel" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Registros de Abastecimento</h2>
              <Button onClick={() => setShowFuelForm(true)} disabled={vehicles.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Abastecimento
              </Button>
            </div>

            {vehicles.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Cadastre um veículo primeiro para registrar abastecimentos</p>
                </CardContent>
              </Card>
            )}

            {showFuelForm && (
              <FuelRecordForm vehicles={vehicles} onSubmit={addFuelRecord} onCancel={() => setShowFuelForm(false)} />
            )}

            <FuelRecordsList fuelRecords={fuelRecords} vehicles={vehicles} />
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Estatísticas de Consumo</h2>
            <ConsumptionStats fuelRecords={fuelRecords} vehicles={vehicles} />
          </div>
        )}
      </div>
    </div>
  )
}
