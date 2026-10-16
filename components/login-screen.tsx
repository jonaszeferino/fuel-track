"use client"

import { useState } from "react"
import { Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginScreenProps {
  onSubmit: (email: string, password: string) => Promise<void>
}

export function LoginScreen({ onSubmit }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#0f3d34] via-[#165a4a] to-[#1f7a5c] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#165a4a] text-white">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#165a4a]">FuelTrack</p>
            <h1 className="text-xl font-bold leading-tight text-slate-900">Entrar na sua conta</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button type="submit" disabled={submitting} className="min-h-11 w-full bg-[#165a4a] hover:bg-[#12362e]">
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Use a mesma conta do app FuelTrack. O acesso pelo navegador é exclusivo para assinantes Premium.
        </p>
      </div>
    </div>
  )
}
