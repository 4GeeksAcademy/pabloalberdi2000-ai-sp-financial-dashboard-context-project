# Name
frontend-api-client-and-error-policy

# Scope
- frontend/src/App.tsx
- frontend/src/lib/**/*.ts
- frontend/src/components/**/*.tsx

# Rationale
El fetch directo en App dificulta reutilizacion, retries, observabilidad y manejo uniforme de errores. Centralizar cliente API mejora mantenibilidad y DX.

# Guidelines
## Do
- Crear frontend/src/lib/api-client.ts como unico punto para requests HTTP.
- Estandarizar errores en un tipo unico (ApiError con status, message, endpoint).
- Usar AbortController en llamadas async de componentes con useEffect.

## Do Not
- No usar fetch directo dentro de componentes de pagina o widgets de dashboard.
- No ignorar errores con catch vacio.

## Validation Checklist
- No hay llamadas fetch/axios en componentes fuera de api-client.
- Errores de red y errores HTTP se diferencian en UI.
- Las llamadas async en componentes cancelan request en unmount.
