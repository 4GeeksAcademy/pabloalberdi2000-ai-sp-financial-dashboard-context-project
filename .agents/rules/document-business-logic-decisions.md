# Name
document-business-logic-decisions

# Scope
- backend/app/routes.py
- frontend/src/lib/financial-utils.ts
- Cualquier archivo con calculos de negocio

# Rationale
La logica de resumen, alertas y comparacion tiene supuestos implicitos (baseline, threshold, porcentaje). Si no se documentan, aumentan errores de interpretacion.

# Guidelines
## Do
- Agregar docstring o comentario corto antes de funciones de negocio no triviales.
- Explicar en una linea: objetivo, formula y supuesto principal.
- Mantener comentarios de alto valor, no comentarios obvios.

## Do Not
- No dejar funciones de calculo complejas sin contexto de negocio.
- No duplicar formulas en varios lugares sin referencia central.

## Validation Checklist
- summarize_movements, detect_outcome_alerts y calculate_net_value tienen descripcion de intencion.
- computeKPIs y computeMonthlyData documentan su formula principal.
- No hay comentarios redundantes de bajo valor.
