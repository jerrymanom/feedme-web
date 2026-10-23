# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev        # Servidor de desarrollo → http://localhost:5173
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # ESLint
npm test           # node:test sobre src/**/*.test.js
```

Pruebas: funciones puras en `src/lib/` con `node:test` (sin dependencias). Si agregas lógica, extráela a `src/lib/` y pruébala ahí.

## Arquitectura

**FeedMe Web** es la app (mobile first) de la despensa compartida. Consume la API GraphQL de Rails.

```
main.jsx → ApolloProvider → SessionProvider → ToastProvider → App (useRoute) → screens/*
```

- **Rutas por hash** (`src/lib/router.js`, `useSyncExternalStore`): `#/`, `#/recetas`, `#/despensa`, `#/tickets`, `#/tickets/:id`, `#/hogar`. No agregar un router sin necesidad.
- **Sesión** (`src/auth/`): el token vive en `localStorage` (`src/lib/session.js`) y `apollo/client.js` lo envía como `Authorization: Bearer`. `signIn`/`signOut` llaman `client.resetStore()`. `useSession()` da `me`, `household`, `signIn`, `signOut`.
- **Sin sesión** la API responde con el hogar demo (solo lectura): las mutations de escritura devuelven error. La UI deshabilita esas acciones y muestra `DemoBanner`.
- **Mutations** devuelven errores de negocio como datos (`errors: [String]`); mostrarlos con `useToast()`. Errores de red van al `catch`.
- **Refetch** por nombre de operación: `MealRecipes`, `Recipes`, `Pantry`, `Purchases`, `Categories`, `Session`.
- **Formularios:** la lógica que arma inputs de mutations (`confirmItems`, `recipeIngredients`) vive en `src/lib/forms.js` con pruebas.
- **Límite de complejidad de la API: 30.** Mantén cada query pequeña.
- **Dinero** siempre en centavos (`formatCents`). Fechas de calendario (`AAAA-MM-DD`) con `formatIsoDate`, nunca `new Date(iso)`.
- **Estilos:** tokens en `src/index.css` (nopal, jamaica, maíz; modo oscuro), componentes en `src/App.css`. El ticket (`.receipt`) es el único elemento decorativo; el resto se mantiene sobrio.

### Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_GRAPHQL_URL` | URL del endpoint GraphQL | `http://localhost:3000/graphql` |

## Referencia de la API

`API_REFERENCE.md` contiene el schema GraphQL completo, todos los queries disponibles con ejemplos, el modelo de datos detallado y cómo levantar el backend (Docker o local).
