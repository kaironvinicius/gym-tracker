# Gym Tracker

App web progresiva (PWA) para registrar y seguir el progreso de tus entrenamientos en el gimnasio. Funciona directamente desde el navegador, sin necesidad de cuenta ni servidor.

## Funcionalidades

- Organiza tus ejercicios por **categorías** (pecho, espalda, piernas, etc.)
- Registra cada serie con **peso, fecha y comentarios**
- Consulta el **historial** de cada ejercicio
- Visualiza tu progreso en **gráficas**
- Los datos se guardan localmente en tu dispositivo (sin conexión a internet)
- Instalable como app en móvil o escritorio (PWA)

## Tecnologías

- [Next.js 15](https://nextjs.org/) — framework de React
- [TypeScript](https://www.typescriptlang.org/) — tipado estático
- [Tailwind CSS](https://tailwindcss.com/) — estilos
- [Dexie.js](https://dexie.org/) — base de datos local (IndexedDB)
- [Recharts](https://recharts.org/) — gráficas

## Arrancar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del proyecto

```
src/
├── app/              # Páginas (Next.js App Router)
│   ├── category/     # Crear y editar categorías
│   └── exercise/     # Ejercicios, registros, historial y gráficas
├── components/       # Componentes reutilizables
├── hooks/            # Hooks personalizados
└── lib/
    ├── db.ts         # Base de datos local (IndexedDB)
    └── utils.ts      # Utilidades
```

## Datos

Todos los datos se almacenan en el navegador mediante **IndexedDB**. No se envía nada a ningún servidor. Si borras los datos del navegador, se pierden los registros.
