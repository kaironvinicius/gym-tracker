# Apps

Monorepo con varias mini-apps web personales. Cada app es un proyecto Next.js independiente con su propio `package.json`, sus propias dependencias, su propia base IndexedDB y su propio deploy.

## Apps

| App | Carpeta | Descripción |
| :-- | :------ | :---------- |
| **Gym Bro** | [`apps/gymtracker`](./apps/gymtracker) | Seguimiento de entrenamientos de gimnasio (categorías, ejercicios, registros, gráficas, backup). |
| **Gastos** | [`apps/expenses`](./apps/expenses) | Gestión de gastos e ingresos personales (transacciones, categorías, resumen mensual con gráfico). |

## Desarrollo

Cada app se levanta de forma independiente:

```bash
cd apps/gymtracker   # o apps/expenses
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

Cada app es un proyecto Vercel independiente. Al configurar el proyecto:

- **Root Directory**: `apps/gymtracker` o `apps/expenses` según el caso.
- Cada uno tendrá su propia URL pública.

## Stack común

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Dexie (IndexedDB) — datos locales en el navegador
- Recharts — gráficas

No hay paquetes compartidos: si dos apps necesitan el mismo componente, vive en cada una con su copia. Decisión deliberada para mantener las apps totalmente desacopladas.
