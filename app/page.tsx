"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Car, Fuel, TrendingUp, AlertCircle } from "lucide-react"
import { VehicleForm } from "@/components/vehicle-form"
import { FuelRecordForm } from "@/components/fuel-record-form"
import { VehicleList } from "@/components/vehicle-list"
import { FuelRecordsList } from "@/components/fuel-records-list"
import { ConsumptionStats } from "@/components/consumption-stats"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function HomePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("vehicles")
  const [vehicles, setVehicles] = useState([])
  const [fuelRecords, setFuelRecords] = useState([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setHasError(false)
        await fetchVehicles()
        await fetchFuelRecords()
      } catch (error) {
        console.error('Erro ao inicializar aplicação:', error)
        setHasError(true)
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao banco de dados. Verifique as configurações.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar veículos:', error)
      return
    }
    
    const uniqueVehicles = data?.reduce((acc, vehicle) => {
      if (!acc.find(v => v.id === vehicle.id)) {
        acc.push(vehicle)
      }
      return acc
    }, []) || []
    
    setVehicles(uniqueVehicles)
  }

  const fetchFuelRecords = async () => {
    const { data, error } = await supabase
      .from('fuel_records')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar registros de combustível:', error)
      return
    }
    
    const uniqueRecords = data?.reduce((acc, record) => {
      if (!acc.find(r => r.id === record.id)) {
        acc.push(record)
      }
      return acc
    }, []) || []
    
    setFuelRecords(uniqueRecords)
  }

  const addVehicle = async (vehicle) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([
        {
          name: vehicle.name,
          tank_capacity: vehicle.tank_capacity,
          year: vehicle.year,
          subtitle: vehicle.subtitle,
          is_deleted: false
        }
      ])
      .select()

    if (error) {
      console.error('Erro ao adicionar veículo:', error)
      return
    }

    setVehicles([...vehicles, data[0]])
    setShowVehicleForm(false)
  }

  const deleteVehicle = async (vehicleId) => {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_deleted: true })
      .eq('id', vehicleId)

    if (error) {
      console.error('Erro ao deletar veículo:', error)
      return
    }

    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId))
  }

  const deleteFuelRecord = async (recordId) => {
    try {
      const { error } = await supabase
        .from('fuel_records')
        .update({ is_deleted: true })
        .eq('id', recordId)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o registro",
          variant: "destructive"
        })
        return
      }

      // Atualiza a lista local removendo o registro deletado
      setFuelRecords(fuelRecords.filter(record => record.id !== recordId))
      
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso"
      })
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro",
        variant: "destructive"
      })
    }
  }

  const addFuelRecord = async (record) => {
    try {
      const { data, error } = await supabase
        .from('fuel_records')
        .insert([{
          ...record,
          is_deleted: false
        }])
        .select()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível registrar o abastecimento",
          variant: "destructive"
        })
        return
      }

      if (data && data.length > 0) {
        setFuelRecords([...fuelRecords, data[0]])
        setShowFuelForm(false)
        toast({
          title: "Sucesso",
          description: "Abastecimento registrado com sucesso!"
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar registro de combustível:', error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar o abastecimento",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Controle de Combustível</h1>
          <p className="text-sm md:text-base text-gray-600">Gerencie seus veículos e monitore o consumo de combustível</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando dados...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {hasError && (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro de Conexão</h3>
              <p className="text-gray-500 mb-4">
                Não foi possível conectar ao banco de dados. Verifique se as variáveis de ambiente estão configuradas corretamente.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show if not loading and no error */}
        {!isLoading && !hasError && (
          <>
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
                  activeTab === "vehicles" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Veículos</span>
              </button>
              <button
                onClick={() => setActiveTab("fuel")}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
                  activeTab === "fuel" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Fuel className="w-4 h-4" />
                <span>Abastecimentos</span>
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm md:text-base ${
                  activeTab === "stats" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Estatísticas</span>
              </button>
            </div>

            {/* Content */}
            {activeTab === "vehicles" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold">Meus Veículos</h2>
                  <Button onClick={() => setShowVehicleForm(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Veículo
                  </Button>
                </div>

                {showVehicleForm && <VehicleForm onSubmit={addVehicle} onCancel={() => setShowVehicleForm(false)} />}

                <VehicleList vehicles={vehicles} onDelete={deleteVehicle} />
              </div>
            )}

            {activeTab === "fuel" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold">Registros de Abastecimento</h2>
                  <Button 
                    onClick={() => setShowFuelForm(true)} 
                    disabled={vehicles.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Abastecimento
                  </Button>
                </div>

                {vehicles.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-6">
                      <p className="text-gray-500">Cadastre um veículo primeiro para registrar abastecimentos</p>
                    </CardContent>
                  </Card>
                )}

                {showFuelForm && (
                  <FuelRecordForm 
                    vehicles={vehicles} 
                    onSubmit={addFuelRecord} 
                    onCancel={() => setShowFuelForm(false)} 
                  />
                )}

                <FuelRecordsList 
                  fuelRecords={fuelRecords} 
                  vehicles={vehicles} 
                  onDelete={deleteFuelRecord}
                />
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Estatísticas de Consumo</h2>
                <ConsumptionStats fuelRecords={fuelRecords} vehicles={vehicles} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
