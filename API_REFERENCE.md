# FeedMe — API Reference

Documento de contexto para el proyecto frontend (React). Describe el propósito de la API, el modelo de datos, todos los queries GraphQL disponibles y ejemplos listos para usar.

---

## ¿Qué es FeedMe?

API GraphQL para gestionar el inventario de cocina y refrigerador. Permite:

- Consultar los **alimentos** disponibles y en qué cantidad.
- Organizar alimentos por **categorías** (Frutas, Lácteos, Cereales, etc.).
- Ver **recetas** y saber cuáles pueden prepararse según el stock actual.
- Filtrar recetas por **tiempo de comida**: desayuno, comida o cena.

---

## Conexión

| Entorno | URL |
|---------|-----|
| Desarrollo local | `http://localhost:3000/graphql` |
| GraphiQL (playground) | `http://localhost:3000/graphiql` |

Todas las peticiones son `POST /graphql` con `Content-Type: application/json`.

CORS está habilitado para cualquier origen en desarrollo. Configurable con la variable de entorno `CORS_ORIGINS` en producción.

### Ejemplo de petición con fetch

```js
const GRAPHQL_URL = 'http://localhost:3000/graphql'

async function query(gql, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: gql, variables }),
  })
  return res.json()
}
```

---

## Modelo de datos

```
Category ──< Product >──< RecipeProduct >──< Recipe
```

- **Category** agrupa productos (ej. Frutas, Lácteos).
- **Product** es un alimento con cantidad en stock.
- **Recipe** requiere uno o más productos para prepararse.
- **RecipeProduct** es la tabla intermedia (join).

### Regla de disponibilidad

`Recipe.available` **no se guarda en base de datos** — se calcula en tiempo real:

> Una receta está disponible (`available: true`) cuando:
> 1. La receta tiene `enabled: true`
> 2. **Todos** sus productos tienen `enabled: true` Y `amount > 0`

### mealtime

Los tiempos de comida se almacenan como **array de strings**. Valores válidos:

| Valor | Significado |
|-------|------------|
| `"desayuno"` | Desayuno |
| `"comida"` | Comida / Almuerzo |
| `"cena"` | Cena |

Una receta puede pertenecer a más de uno: `["desayuno", "cena"]`.

---

## Tipos GraphQL

### Category

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `ID` | Identificador único |
| `name` | `String` | Nombre de la categoría |
| `enabled` | `Boolean` | Si la categoría está activa |
| `products` | `[Product]` | Productos de esta categoría |
| `productsCount` | `Int` | Total de productos |
| `createdAt` | `ISO8601DateTime` | Fecha de creación |
| `updatedAt` | `ISO8601DateTime` | Última actualización |

### Product

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `ID` | Identificador único |
| `name` | `String` | Nombre del producto |
| `amount` | `Int` | Cantidad en stock |
| `enabled` | `Boolean` | Si el producto está activo |
| `category` | `Category` | Categoría a la que pertenece |
| `recipes` | `[Recipe]` | Recetas que lo requieren |
| `createdAt` | `ISO8601DateTime` | Fecha de creación |
| `updatedAt` | `ISO8601DateTime` | Última actualización |

### Recipe

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `ID` | Identificador único |
| `name` | `String` | Nombre de la receta |
| `mealtime` | `[String]` | Tiempos de comida válidos |
| `available` | `Boolean` | ¿Se puede preparar ahora? (calculado) |
| `enabled` | `Boolean` | Si la receta está activa |
| `products` | `[Product]` | Ingredientes requeridos |
| `createdAt` | `ISO8601DateTime` | Fecha de creación |
| `updatedAt` | `ISO8601DateTime` | Última actualización |

---

## Queries disponibles

### `categories` — Lista todas las categorías

```graphql
query {
  categories {
    id
    name
    enabled
    productsCount
    products {
      id
      name
      amount
      enabled
    }
  }
}
```

---

### `category(name)` — Una categoría por nombre

```graphql
query {
  category(name: "Lácteos") {
    id
    name
    enabled
    productsCount
    products {
      id
      name
      amount
    }
  }
}
```

---

### `products` — Lista productos con filtros opcionales

| Argumento | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `categoryId` | `ID` | — | Filtra por categoría |
| `enabledOnly` | `Boolean` | `false` | Solo productos activos |

```graphql
# Todos los productos
query {
  products {
    id
    name
    amount
    enabled
    category { name }
  }
}

# Solo productos habilitados
query {
  products(enabledOnly: true) {
    id
    name
    amount
    category { name }
  }
}

# Productos de una categoría específica
query {
  products(categoryId: "3") {
    id
    name
    amount
    enabled
  }
}

# Combinado: productos habilitados de una categoría
query {
  products(categoryId: "3", enabledOnly: true) {
    id
    name
    amount
  }
}
```

---

### `product(name)` — Un producto por nombre

```graphql
query {
  product(name: "Huevo") {
    id
    name
    amount
    enabled
    category { name }
    recipes { name mealtime }
  }
}
```

---

### `recipes` — Lista recetas con filtros opcionales

| Argumento | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `mealtime` | `String` | — | `"desayuno"`, `"comida"` o `"cena"` |
| `availableOnly` | `Boolean` | `false` | Solo recetas con stock completo |

> Solo retorna recetas con `enabled: true`.

```graphql
# Todas las recetas habilitadas
query {
  recipes {
    id
    name
    mealtime
    available
    enabled
    products { name amount }
  }
}

# Recetas de desayuno
query {
  recipes(mealtime: "desayuno") {
    id
    name
    mealtime
    available
    products { name amount }
  }
}

# Recetas disponibles ahora
query {
  recipes(availableOnly: true) {
    id
    name
    mealtime
    products { name amount }
  }
}

# ¿Qué puedo cenar hoy?
query {
  recipes(mealtime: "cena", availableOnly: true) {
    id
    name
    mealtime
    available
    products { name amount }
  }
}
```

---

### `recipe(name)` — Una receta por nombre

```graphql
query {
  recipe(name: "Quesadilla de queso") {
    id
    name
    mealtime
    available
    enabled
    products {
      id
      name
      amount
      enabled
      category { name }
    }
  }
}
```

---

### `unavailableRecipes` — Recetas que no pueden prepararse

Retorna recetas habilitadas donde al menos un ingrediente tiene `amount: 0` o `enabled: false`.

```graphql
query {
  unavailableRecipes {
    id
    name
    mealtime
    available
    products {
      name
      amount
      enabled
    }
  }
}
```

---

## Casos de uso para el frontend

### Pantalla principal: ¿qué puedo comer hoy?

```graphql
query RecipesAvailable {
  desayuno: recipes(mealtime: "desayuno", availableOnly: true) {
    id
    name
    mealtime
  }
  comida: recipes(mealtime: "comida", availableOnly: true) {
    id
    name
    mealtime
  }
  cena: recipes(mealtime: "cena", availableOnly: true) {
    id
    name
    mealtime
  }
}
```

### Inventario completo con categorías

```graphql
query Inventory {
  categories {
    id
    name
    productsCount
    products {
      id
      name
      amount
      enabled
    }
  }
}
```

### Detalle de receta con ingredientes

```graphql
query RecipeDetail($name: String!) {
  recipe(name: $name) {
    id
    name
    mealtime
    available
    products {
      id
      name
      amount
      enabled
      category { name }
    }
  }
}
```

Variables:
```json
{ "name": "Huevo estrellado" }
```

### Qué falta en mi cocina

```graphql
query MissingIngredients {
  unavailableRecipes {
    name
    mealtime
    products {
      name
      amount
      enabled
    }
  }
}
```

---

## Levantar la API localmente

### Con Docker (recomendado)

```bash
# Clonar y levantar
git clone <repo>
cd feedme
docker-compose up

# Seed de datos de prueba (primera vez)
docker-compose run api rails db:seed
```

### Sin Docker

```bash
bundle install
rails db:create db:migrate db:seed
rails server
```

---

## Notas de implementación para React

- **Cliente GraphQL sugerido**: [Apollo Client](https://www.apollographql.com/docs/react/) o [URQL](https://formidable.com/open-source/urql/).
- Los campos de fecha (`createdAt`, `updatedAt`) vienen en formato **ISO 8601**.
- Los IDs son **strings** en GraphQL aunque sean enteros en la BD.
- El campo `mealtime` es un **array de strings** — útil para chips/badges en la UI.
- `available` es calculado en el servidor — siempre refleja el stock real al momento de la query. No cachear indefinidamente.
- Las queries que retornan listas nunca retornan `null` (son `[Type]!`), siempre array (puede estar vacío).
