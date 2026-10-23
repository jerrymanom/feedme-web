# FeedMe Web

App web (pensada para celular) de **FeedMe**: la despensa compartida de tu casa. Muestra qué puedes cocinar con lo que hay, lleva el inventario, lee los tickets del súper con IA y suma el gasto del mes. Consume la API GraphQL de [`feedme`](https://github.com/jerrymanom/feedme).

## Qué hace

| Pantalla | Para qué sirve |
|----------|----------------|
| **Hoy** | Recetas que puedes cocinar ahora según la hora (desayuno, comida o cena) y las que casi alcanzas, con lo que falta. "Cocinar" descuenta los ingredientes de la despensa. Desde aquí se crean recetas. |
| **Despensa** | Inventario por categoría con controles − / + (con respuesta optimista), alta de productos nuevos y edición: tocar un producto permite cambiarle nombre o categoría, o quitarlo. |
| **Tickets** | Gasto del mes, escaneo de tickets y revisión línea por línea antes de sumar a la despensa; una línea puede crear un producto nuevo. |
| **Hogar** | Crear cuenta o iniciar sesión, código para invitar a quien vive contigo y miembros del hogar. |

Sin sesión, la app muestra la **cocina de ejemplo** de la API en modo solo lectura, así cualquiera puede probarla sin registrarse.

## Stack

- React 19 + Vite
- Apollo Client 4 (token de sesión en `Authorization: Bearer`)
- CSS propio con tokens de color (modo claro y oscuro)
- Sin dependencias extra: enrutamiento por hash de ~20 líneas y pruebas con `node:test`

## Decisiones de diseño

- **Mobile first:** barra de pestañas inferior, botones de al menos 44 px y foco visible con teclado.
- **El ticket se ve como ticket:** la revisión imita el papel térmico, con bordes rasgados, para que sea obvio qué leyó la IA.
- **Fotos más ligeras:** la imagen se reduce a 1600 px en el teléfono antes de subirla; el envío es más rápido y cada escaneo cuesta menos.
- **Dinero en centavos** de punta a punta; solo se formatea al mostrarlo.

## Configuración

Crea `.env` en la raíz:

```
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas unitarias (node:test)
npm run lint
npm run build
```

CI (GitHub Actions) corre lint, pruebas y build en cada PR.

## Estructura

```
src/
├── main.jsx                 # Apollo + sesión + avisos
├── App.jsx                  # Layout y rutas (#/, #/recetas, #/despensa, #/tickets, #/hogar)
├── apollo/client.js         # Cliente con encabezado Authorization
├── auth/                    # Sesión: usuario, hogar, iniciar y cerrar sesión
├── components/              # Barra de pestañas, aviso de demo, stepper, avisos
├── screens/                 # Una pantalla por pestaña + revisión de ticket
├── graphql/                 # Queries y mutations
└── lib/                     # Dinero, fechas, imagen, recetas, router (+ pruebas)
```
