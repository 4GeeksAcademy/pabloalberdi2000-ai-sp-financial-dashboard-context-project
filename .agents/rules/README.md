# Reglas de Gobernanza de Código

Este directorio define reglas operativas para agentes de IA y desarrolladores.
El objetivo es convertir hallazgos técnicos en criterios verificables de cumplimiento.

## 1. Orden de Prioridad (cuando hay conflicto)

1. `cors-and-environment-security.md`
2. `backend-layering-and-data-source.md`
3. `domain-contract-sync-openapi-types.md`
4. `testing-ui-async-and-api-edge-cases.md`
5. `frontend-api-client-and-error-policy.md`
6. `no-hardcoded-dashboard-context.md`
7. `naming-and-language-consistency.md`
8. `document-business-logic-decisions.md`

## 2. Mapa de Reglas por Dominio

### Backend
- `backend-layering-and-data-source.md`
- `cors-and-environment-security.md`
- `domain-contract-sync-openapi-types.md`
- `testing-ui-async-and-api-edge-cases.md`
- `document-business-logic-decisions.md`

### Frontend
- `frontend-api-client-and-error-policy.md`
- `no-hardcoded-dashboard-context.md`
- `naming-and-language-consistency.md`
- `domain-contract-sync-openapi-types.md`
- `testing-ui-async-and-api-edge-cases.md`
- `document-business-logic-decisions.md`

### Cross-cutting (aplican en ambos)
- `domain-contract-sync-openapi-types.md`
- `testing-ui-async-and-api-edge-cases.md`
- `naming-and-language-consistency.md`
- `document-business-logic-decisions.md`

## 3. Protocolo de Uso para Agentes y Reviewers

1. Identificar los archivos modificados en el PR.
2. Seleccionar reglas por scope afectado (backend, frontend o ambos).
3. Validar cada `Validation Checklist` de las reglas aplicables.
4. Registrar incumplimientos con referencia a archivo y corrección esperada.
5. Bloquear merge si hay incumplimientos en reglas de prioridad 1 a 4.

## 4. Checklist de PR (Go/No-Go)

Marcar cada punto con SI o NO.

### Seguridad y arquitectura
- [ ] La configuración CORS no usa wildcard en producción.
- [ ] Los endpoints no contienen lógica de acceso/generación de datos en línea.
- [ ] El contrato API cambiado fue sincronizado con tipos frontend.

### Frontend y DX
- [ ] No hay `fetch` directo en componentes fuera del cliente API central.
- [ ] No hay contexto de negocio hardcodeado en pantallas principales.
- [ ] La vista no mezcla idiomas en el mismo flujo.

### Testing
- [ ] Cada endpoint nuevo o modificado tiene test de comportamiento principal.
- [ ] Hay cobertura de casos borde para inputs/fechas cuando aplica.
- [ ] Los flujos async visibles en UI (loading/success/error) tienen tests.

### Documentación
- [ ] Las funciones de cálculo no triviales explican intención y supuestos.

## 5. Criterio de Bloqueo

El PR se considera bloqueado si se cumple al menos una condición:

1. Incumplimiento en reglas de prioridad 1 a 4.
2. Cambio de contrato backend sin actualización de tipos frontend.
3. Endpoint nuevo sin test asociado.
4. Introducción de hardcodes de contexto de negocio en la UI principal.

## 6. Mantenimiento de Reglas

- Revisar y actualizar estas reglas cuando cambie la arquitectura o el modelo de datos.
- Cualquier nueva regla debe incluir obligatoriamente: Name, Scope, Rationale y Guidelines con checklist verificable.
- No se aceptan reglas genéricas sin criterio de validación objetivo.
