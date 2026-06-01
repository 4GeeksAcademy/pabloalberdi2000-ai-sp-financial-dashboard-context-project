# Name
testing-ui-async-and-api-edge-cases

# Scope
- frontend/src/**/*.test.ts
- frontend/src/**/*.test.tsx
- backend/tests/**/*.py

# Rationale
Existe buena cobertura de backend y utilidades frontend, pero faltan pruebas de flujo async de UI y algunos casos borde API. Esta regla reduce regresiones funcionales.

# Guidelines
## Do
- Frontend: agregar tests para loading, success y error en App/dashboard.
- Backend: cubrir fechas invalidas, rangos invertidos y limites de query params.
- Mantener tests deterministas con seed controlada por test.

## Do Not
- No aprobar PRs que agreguen endpoints sin al menos un test de comportamiento principal.
- No depender de orden aleatorio sin fijar semilla en test.

## Validation Checklist
- Cada nuevo endpoint tiene test de status code y estructura de respuesta.
- App tiene pruebas para estado de carga y mensaje de error.
- Casos borde de fecha en comparison/summary tienen cobertura.
