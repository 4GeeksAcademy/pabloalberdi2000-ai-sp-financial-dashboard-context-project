# Name
domain-contract-sync-openapi-types

# Scope
- backend/app/routes.py
- frontend/src/lib/financial-types.ts
- Cualquier cambio de schema de API

# Rationale
Cuando backend y frontend evolucionan por separado, el contrato puede divergir. Sin sincronizacion, aparecen errores de runtime y deuda de integracion.

# Guidelines
## Do
- Tratar modelos Pydantic como fuente de verdad del contrato.
- Sincronizar tipos frontend ante cualquier cambio en response_model o campos de API.
- Verificar en PR que los campos create_date, amount, operation_type, category, business_type mantienen consistencia.

## Do Not
- No mergear cambios de schema backend sin actualizar tipos frontend y tests relacionados.
- No introducir campos opcionales en frontend sin reflejo en backend o adaptador.

## Validation Checklist
- Todo cambio en response_model tiene cambio correlativo en financial-types.ts o adaptador.
- Tests de frontend/backend contemplan el nuevo contrato.
- No hay mapeos ad-hoc silenciosos en componentes.
