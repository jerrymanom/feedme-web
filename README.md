# FeedMe Web

Frontend React para la API GraphQL de FeedMe — gestiona el inventario de cocina y muestra qué recetas se pueden preparar con el stock actual.

## Stack

- **React 19** + **Vite 8**
- **Apollo Client 4** para GraphQL
- JavaScript (JSX)

## Requisitos

- Node.js 18+
- Backend FeedMe corriendo en `http://localhost:3000` (ver `API_REFERENCE.md`)

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

Si no se define, toma `http://localhost:3000/graphql` como default.

## Comandos

```bash
npm install        # Instalar dependencias
npm run dev        # Servidor de desarrollo → http://localhost:5173
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Lint con ESLint
```

## Estructura

```
src/
├── main.jsx              # Entry point — ApolloProvider + ReactDOM
├── App.jsx               # Componente principal, query de recetas disponibles
├── apollo/
│   └── client.js         # Configuración de Apollo Client
└── graphql/
    └── queries.js        # Definiciones de queries GraphQL
```

## Funcionamiento

La pantalla principal consulta `RecipesAvailable` — una sola query que usa aliases GraphQL para traer recetas disponibles de los tres tiempos de comida (desayuno, comida, cena) en paralelo.

Una receta aparece disponible solo cuando todos sus ingredientes tienen stock (`amount > 0` y `enabled: true`). Este cálculo lo hace el servidor en tiempo real.

## API

Ver `API_REFERENCE.md` para el schema GraphQL completo, todos los queries disponibles y cómo levantar el backend localmente.
