# Fase 1: Verificación de API contra `/docs`

**Fecha:** 2026-11-18  
**Estado:** ✅ Completado  
**OpenAPI Endpoint:** `http://localhost:8000/openapi.json`

---

## 1. Exploración de Endpoints Disponibles

### Endpoints Relevantes para las 3 Funcionalidades

```
✅ GET /api/metrics/facets
✅ GET /api/metrics/alerts
✅ GET /api/metrics/categories/top
✅ GET /api/metrics (soporte de date range)
✅ GET /health (health check)
```

---

## 2. Funcionalidad 1: Filtro Global de Rango de Fechas

### Endpoint Base: `GET /api/metrics`

**Verificación de Parámetros:**
```
✅ start_date: query param, type: string (format: date), optional, nullable
✅ end_date: query param, type: string (format: date), optional, nullable
✅ category: query param, enum: [suppliers, sales, operational, administrative, others], optional
✅ operation_type: query param, enum: [income, outcome], optional
```

**Respuesta:**
```
✅ Array de FinancialMovement objects
   - create_date: string (ISO date format)
   - amount: number
   - operation_type: "income" | "outcome"
   - category: "suppliers" | "sales" | "operational" | "administrative" | "others"
   - business_type: "B2B" | "B2C"
```

**Rango de Fechas Válido:**
Obtenido desde `/api/metrics/facets`:
```
✅ min_date: 2024-01-01 (string, format: date)
✅ max_date: 2024-12-31 (string, format: date)
```

---

## 3. Funcionalidad 2: Tabla de Alertas de Anomalías de Gasto

### Endpoint: `GET /api/metrics/alerts`

**Parámetros de Query Verificados:**
```
✅ threshold: number, minimum: 0, default: 0.3 (rango permitido: 0.01 - 1.0)
✅ group_by: enum: [day, week, month], default: "month"
✅ start_date: query param, string (format: date), optional, nullable
✅ end_date: query param, string (format: date), optional, nullable
✅ business_type: enum: [B2B, B2C], optional, nullable
```

**Respuesta:**
```
✅ Array de MetricsAlert objects
   - period: string (período agrupado según group_by)
   - outcome_total: number (total de gasto para el período)
   - baseline_average: number (promedio móvil de 3 períodos anteriores)
   - increase_ratio: number (incremento porcentual: (outcome_total - baseline_average) / baseline_average)
```

**Interpretación del Contrato:**
- El `period` corresponde al grupo temporal (ej: "2024-01" para meses, "2024-01-01" para días)
- `increase_ratio` es **la métrica de anomalía**: si > threshold, es una anomalía detectada
- El array está vacío si no hay anomalías

**Desajuste Resuelto:**
El PM indicó "tabla de anomalías" sin especificar cuándo renderizar. 
**Decisión de arquitectura:** 
- Nunca ocultar la tabla; siempre renderizar
- Mostrar mensaje "No anomalies detected" cuando array esté vacío
- Permitir que el usuario ajuste `threshold` para explorar sensibilidades

---

## 4. Funcionalidad 3: Vista Comparativa B2B vs B2C (Categorías de Ingreso)

### Endpoint: `GET /api/metrics/categories/top`

**Parámetros de Query Verificados:**
```
✅ operation_type: enum: [income, outcome], default: "outcome" 
   → Para Funcionalidad 3, usar: "income"
✅ limit: integer, minimum: 1, maximum: 20, default: 5
✅ start_date: query param, string (format: date), optional, nullable
✅ end_date: query param, string (format: date), optional, nullable
✅ business_type: enum: [B2B, B2C], optional, nullable
```

**Respuesta:**
```
✅ Array de TopCategoryItem objects (limitado a N items)
   - category: enum: [suppliers, sales, operational, administrative, others]
   - operation_type: "income" | "outcome"
   - total_amount: number (suma agregada para esa categoría)
```

**Interpretación del Contrato:**
- Cada fila representa el total agregado de una categoría para el business_type especificado
- Para obtener top 5 de **ingreso B2B**, llamar:
  ```
  GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5
  ```
- Para **ingreso B2C**, llamar:
  ```
  GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5
  ```
- Necesario hacer **dos requests paralelos** para comparar B2B vs B2C
- Calcular **porcentaje sobre el grupo**: `(total_amount / sum_all_in_business_type) * 100`

---

## 5. Endpoint: `GET /api/metrics/facets`

**Propósito:** Proporcionar opciones válidas para filtros globales

**Respuesta Verificada:**
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["suppliers", "sales", "operational", "administrative", "others"],
  "min_date": "2024-01-01",
  "max_date": "2024-12-31"
}
```

**Uso en Frontend:**
- Mostrar rangos min/max de fechas en el filtro global
- Validar entrada de usuario contra facetas disponibles
- Alimentar dropdowns/selects de categorías

---

## 6. Patrones Frontend Existentes (Confirmados)

### Tipos Base Existentes (`financial-types.ts`)
```typescript
✅ export type OperationType = 'income' | 'outcome'
✅ export type Category = '...'
✅ export type BusinessType = 'B2B' | 'B2C'
✅ export interface FinancialMovement { ... }
✅ export interface KPIMetrics { ... }
✅ export interface MonthlyDataPoint { ... }
```

### Patrón de Utilidades (`financial-utils.ts`)
```typescript
✅ Funciones puras: computeKPIs(), computeMonthlyData()
✅ Formatters: formatCurrency(), formatPercent()
✅ Helpers de fecha: toYearMonthKey(), formatMonthYearLabel()
```

### Reglas de Tipado Estricto
```typescript
✅ No `any` ni `object` permitidos
✅ JSDoc requerido en cada interfaz/función
✅ Validación: npx tsc --noEmit debe pasar sin errores
```

---

## 7. Discrepancias y Resoluciones

| Aspecto | Brief del PM | Verificación `/docs` | Decisión Arquitectónica |
|---------|--------------|---------------------|------------------------|
| **Rango de fechas** | "filtro global por rango" | ✅ Parámetros opcionales `start_date` / `end_date` en `/api/metrics` | Implementar como dos inputs opcionales (vacíos = datos históricos completos) |
| **Alertas anomalías** | "tabla de anomalías" | ✅ Endpoint `/api/metrics/alerts` devuelve array vacío si sin anomalías | Nunca ocultar tabla; mostrar "No anomalies detected" |
| **Threshold** | No especificado | ✅ Parámetro `threshold` (0.01-1.0, default 0.3) | Input numérico configurable en UI |
| **B2B vs B2C** | "vista comparativa" | ✅ Parámetro `business_type` en endpoints de categorías | Dos requests paralelos + cálculo manual de porcentajes |
| **Período de alertas** | No especificado | ✅ Parámetro `group_by` (day/week/month, default: month) | Usar default "month"; permitir usuario cambiar si es necesario |

---

## 8. Resumen de Verificación

| Funcionalidad | Endpoint(s) | Parámetros | Esquema Respuesta | Estado |
|---------------|-------------|-----------|-------------------|--------|
| Filtro de fechas global | `/api/metrics` | `start_date`, `end_date` | `FinancialMovement[]` | ✅ Verificado |
| Tabla alertas anomalías | `/api/metrics/alerts` | `threshold`, `start_date`, `end_date`, `business_type`, `group_by` | `MetricsAlert[]` | ✅ Verificado |
| Vista comparativa B2B/B2C | `/api/metrics/categories/top` | `operation_type=income`, `business_type`, `limit`, `start_date`, `end_date` | `TopCategoryItem[]` | ✅ Verificado |
| Facetas (rango válido) | `/api/metrics/facets` | (ninguno) | `MetricsFacets` | ✅ Verificado |

---

## 9. Siguiente Paso

→ **Fase 2:** Redactar tipos TypeScript estrictos en:
- `frontend/src/specs/api-types.ts` (respuestas de API)
- `frontend/src/specs/param-types.ts` (parámetros de query)
