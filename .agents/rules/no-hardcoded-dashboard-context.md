# Name
no-hardcoded-dashboard-context

# Scope
- frontend/src/App.tsx
- frontend/src/components/dashboard/**/*.tsx
- frontend/src/lib/**/*.ts

# Rationale
Valores visuales de contexto (periodo, filtros por defecto, mensajes) hardcodeados dificultan evolucion, pruebas y reutilizacion.

# Guidelines
## Do
- Derivar el periodo mostrado desde datos reales o configuracion central.
- Definir textos de UI en modulo de constantes/i18n.
- Exponer defaults mediante configuracion tipada.

## Do Not
- No hardcodear periodos de negocio en componentes raiz (ejemplo: 2024 - Full Year).
- No dispersar literales de mensaje en multiples componentes.

## Validation Checklist
- DashboardHeader recibe period derivado de estado o config.
- Los mensajes de error viven en un catalogo central.
- No hay literales de contexto repetidos en la UI.
