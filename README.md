# Fuel Track - Controle de Combustível

Aplicação para controle e monitoramento de consumo de combustível de veículos.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
```

### 2. Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá para Settings > API
4. Copie a URL e a anon key
5. Cole no arquivo `.env.local`

### 3. Estrutura do Banco

O projeto espera as seguintes tabelas no Supabase:

#### Tabela `vehicles`
- `id` (int, primary key)
- `name` (text)
- `tank_capacity` (numeric)
- `year` (int)
- `subtitle` (text)
- `is_deleted` (boolean, default: false)
- `created_at` (timestamp, default: now())

#### Tabela `fuel_records`
- `id` (int, primary key)
- `vehicle_id` (int, foreign key to vehicles.id)
- `fuel_amount` (numeric)
- `total_cost` (numeric)
- `odometer` (numeric)
- `full_tank` (boolean)
- `is_deleted` (boolean, default: false)
- `created_at` (timestamp, default: now())

## Instalação

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

## Execução

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Funcionalidades

- ✅ Cadastro de veículos
- ✅ Registro de abastecimentos
- ✅ Cálculo de consumo (L/100km)
- ✅ Cálculo de eficiência (km/l)
- ✅ Estatísticas mensais
- ✅ Histórico de consumo
- ✅ Interface responsiva 