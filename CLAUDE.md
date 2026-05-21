# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev        # Servidor de desarrollo → http://localhost:5173
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # ESLint
```

No hay tests configurados.

## Arquitectura

**FeedMe Web** es un frontend React que consume una API GraphQL (Rails) para mostrar qué recetas se pueden preparar con el inventario de cocina actual.

### Flujo de datos

```
main.jsx → ApolloProvider(client) → App.jsx → useQuery(RECIPES_AVAILABLE) → GraphQL API
```

- `src/apollo/client.js` — configura `ApolloClient` con `HttpLink` apuntando a `VITE_GRAPHQL_URL` (default: `http://localhost:3000/graphql`)
- `src/graphql/queries.js` — todas las queries GraphQL como constantes `gql`
- `src/App.jsx` — único componente; hace `useQuery` y renderiza listas por tiempo de comida

### Query principal

`RECIPES_AVAILABLE` usa tres aliases GraphQL (`desayuno`, `comida`, `cena`) en una sola petición para traer las recetas disponibles por tiempo de comida.

### Modelo de datos (servidor)

```
Category ──< Product >──< RecipeProduct >──< Recipe
```

`Recipe.available` es **calculado en tiempo real** por el servidor — no se persiste. Una receta está disponible cuando está habilitada y todos sus productos tienen `enabled: true` y `amount > 0`. No cachear indefinidamente.

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_GRAPHQL_URL` | URL del endpoint GraphQL | `http://localhost:3000/graphql` |

Las variables de Vite se exponen vía `import.meta.env.*`.

## Referencia de la API

`API_REFERENCE.md` contiene el schema GraphQL completo, todos los queries disponibles con ejemplos, el modelo de datos detallado y cómo levantar el backend (Docker o local).
