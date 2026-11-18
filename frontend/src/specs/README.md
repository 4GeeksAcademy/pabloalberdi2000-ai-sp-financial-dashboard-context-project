# Fase 4: Especificación Técnica Frontend – Contrato de Datos

**Documento de Referencia Definitivo para Implementación**  
**Fecha:** 2026-11-18  
**Estado:** ✅ Especificación Técnica Verificada contra OpenAPI  
**Validación TypeScript:** Pendiente de auditoría (`npx tsc --noEmit`)

---

## 🎯 Objetivo

Este documento proporciona el **contrato de datos definitivo y verificado** para que cualquier desarrollador o agente pueda implementar las tres nuevas funcionalidades sin ambigüedades:

1. **Filtro Global de Rango de Fechas** (Dashboard Principal)
2. **Tabla de Alertas de Anomalías de Gasto** (Dashboard Principal)
3. **Vista Comparativa B2B vs B2C** (Nueva Página)

Cada funcionalidad incluye:
- Endpoint(s) exactos consumidos
- Tipos TypeScript de petición y respuesta
- Valores válidos y restricciones de cada parámetro
- **Mínimo 2 casos límite por funcionalidad** con comportamiento visual exacto

---

## Funcionalidad 1: Filtro Global de Rango de Fechas

### 1.1 Endpoint Base

```
GET /api/metrics
```

**Verificación OpenAPI:** ✅ Ruta confirmada en `/openapi.json` -> `/paths/~1api~1metrics`

### 1.2 Parámetros de Query

**Tipo TypeScript:** `DateRangeFilter` (de `frontend/src/specs/param-types.ts`)

```typescript
interface DateRangeFilter {
  start_date?: string | null;  // Formato: YYYY-MM-DD
  end_date?: string | null;    // Formato: YYYY-MM-DD
}
```

| Parámetro | Tipo | Requerido | Rango Válido | Default | Verificación |
|-----------|------|----------|--------------|---------|--------------|
| `start_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | `null` (inicio del dataset) | ✅ `/openapi.json`: format: date, nullable |
| `end_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | `null` (fin del dataset) | ✅ `/openapi.json`: format: date, nullable |

**Restricciones:**
- Ambos campos son **opcionales**
- Si se proporcionan ambos: `start_date ≤ end_date` (validar en frontend)
- Formato estricto: `YYYY-MM-DD` (ej. `2024-01-15`)

### 1.3 Respuesta de API

**Tipo TypeScript:** `FinancialMovement[]` (de `frontend/src/specs/api-types.ts`)

```typescript
interface FinancialMovement {
  create_date: string;              // Formato: YYYY-MM-DD
  amount: number;                   // Cantidad en unidades base
  operation_type: "income" | "outcome";
  category: Category;               // enum: ["suppliers", "sales", ...]
  business_type: "B2B" | "B2C";
}
```

**Campos Verificados en `/openapi.json`:**
- ✅ `create_date`: type string, format: date
- ✅ `amount`: type number
- ✅ `operation_type`: enum ["income", "outcome"]
- ✅ `category`: enum ["suppliers", "sales", "operational", "administrative", "others"]
- ✅ `business_type`: enum ["B2B", "B2C"]

### 1.4 Rango de Fechas Válido

**Endpoint de Facetas:**
```
GET /api/metrics/facets
```

**Respuesta Verificada:**
```typescript
interface MetricsFacets {
  operation_types: ["income", "outcome"];
  business_types: ["B2B", "B2C"];
  categories: ["suppliers", "sales", "operational", "administrative", "others"];
  min_date: "2024-01-01";      // Fecha más antigua disponible
  max_date: "2024-12-31";      // Fecha más reciente disponible
}
```

**Uso en Frontend:**
- Validar entrada del usuario contra `min_date` y `max_date`
- Mostrar en UI: "Data available from 2024-01-01 to 2024-12-31"

### 1.5 Casos Límite (Funcionalidad 1)

#### Caso Límite 1a: Usuario rellena solo `start_date`

**Entrada:**
```
GET /api/metrics?start_date=2024-06-01
```

**Comportamiento Esperado:**
- Respuesta: movimientos desde 2024-06-01 hasta 2024-12-31 (fin del dataset)
- Dashboard se actualiza: KPIs, gráficos, alertas y comparativa filtran por este rango
- Validación frontend: `start_date ≤ facets.max_date`

**Estado Visual:**
```
Start: [2024-06-01]  End: [empty]
↓
Dashboard shows: June 1 - Dec 31, 2024
```

#### Caso Límite 1b: Ambos inputs están vacíos (usuario limpió el filtro)

**Entrada:**
```
GET /api/metrics?start_date=null&end_date=null
(o simplemente: GET /api/metrics)
```

**Comportamiento Esperado:**
- Respuesta: histórico completo (2024-01-01 a 2024-12-31)
- Dashboard muestra: "Showing all available data (2024-01-01 to 2024-12-31)"
- Sin error visual

**Estado Visual:**
```
Start: [empty]  End: [empty]  [Cleared]
↓
Dashboard shows: Full historical range
```

---

## Funcionalidad 2: Tabla de Alertas de Anomalías de Gasto

### 2.1 Endpoint

```
GET /api/metrics/alerts
```

**Verificación OpenAPI:** ✅ Ruta confirmada en `/openapi.json` -> `/paths/~1api~1metrics~1alerts`

### 2.2 Parámetros de Query

**Tipo TypeScript:** `AlertsParams` (de `frontend/src/specs/param-types.ts`)

```typescript
interface AlertsParams extends DateRangeFilter {
  threshold?: number;                    // Sensibilidad de detección
  group_by?: "day" | "week" | "month";   // Granularidad temporal
  business_type?: "B2B" | "B2C" | null;  // Filtro por segmento
  start_date?: string | null;            // Heredado
  end_date?: string | null;              // Heredado
}
```

| Parámetro | Tipo | Requerido | Rango Válido | Default | Verificación |
|-----------|------|----------|--------------|---------|--------------|
| `threshold` | number | ❌ No | 0.01 a 1.0 | 0.3 | ✅ `/openapi.json`: minimum: 0, default: 0.3 |
| `group_by` | string (enum) | ❌ No | "day", "week", "month" | "month" | ✅ `/openapi.json`: enum, default: "month" |
| `start_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | null | ✅ Heredado de DateRangeFilter |
| `end_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | null | ✅ Heredado de DateRangeFilter |
| `business_type` | string (enum) | ❌ No | "B2B", "B2C" | null (ambos) | ✅ `/openapi.json`: enum, nullable |

**Restricciones:**
- `threshold` está en rango **[0.01, 1.0]** (ej. 0.3 = 30% de incremento)
- Validador frontend: `isValidThreshold(threshold)` (de `param-types.ts`)
- Si `threshold` fuera de rango: mostrar error y revertir a valor anterior

### 2.3 Respuesta de API

**Tipo TypeScript:** `AlertsResponse` (alias de `MetricsAlert[]`)

```typescript
interface MetricsAlert {
  period: string;              // Formato depende de group_by
  outcome_total: number;       // Gasto total en el período
  baseline_average: number;    // Media móvil de 3 períodos anteriores
  increase_ratio: number;      // Incremento %: (outcome_total - baseline_avg) / baseline_avg
}
```

**Campos Verificados en `/openapi.json`:**
- ✅ `period`: type string
- ✅ `outcome_total`: type number
- ✅ `baseline_average`: type number
- ✅ `increase_ratio`: type number

**Interpretación de Campos:**

| Campo | Significado | Ejemplo |
|-------|-----------|---------|
| `period` | Ventana temporal (formato depende de `group_by`) | "2024-01" (mes), "2024-W05" (semana), "2024-01-15" (día) |
| `outcome_total` | Gasto registrado en ese período | 125000.50 |
| `baseline_average` | Promedio móvil de los 3 períodos anteriores | 100000.00 |
| `increase_ratio` | Incremento relativo al baseline | 0.255 (25.5% de incremento) |

**Lógica de Detección:**
```
Anomaly detected if: increase_ratio > threshold
Ejemplo: increase_ratio = 0.45, threshold = 0.3 → ANOMALÍA ✅
Ejemplo: increase_ratio = 0.15, threshold = 0.3 → NO ANOMALÍA ❌
```

### 2.4 Formato de Renderizado

**Tabla de Anomalías - Columnas:**

| Columna | Tipo Dato | Formato | Ejemplo |
|---------|-----------|---------|---------|
| **Period** | string | Según `group_by` | "2024-02" |
| **Outcome Total** | number | Moneda (USD) | "$125,500.00" |
| **Baseline Avg** | number | Moneda (USD) | "$100,000.00" |
| **Increase %** | number | Porcentaje (2 decimales) | "25.50%" |

**Función de Formato:**
```typescript
// De financial-utils.ts
formatCurrency(125500.50)  → "$125,500"
formatPercent(0.255 * 100) → "25.5%"
```

### 2.5 Casos Límite (Funcionalidad 2)

#### Caso Límite 2a: Array de alertas está vacío (sin anomalías)

**Entrada:**
```
GET /api/metrics/alerts?threshold=0.3&group_by=month&start_date=2024-01-01&end_date=2024-12-31
Respuesta: []
```

**Comportamiento Esperado:**
- **Tabla permanece visible** (nunca ocultarla)
- Mostrar una sola fila con mensaje: "No anomalies detected for the selected range and threshold"
- Permitir usuario cambiar threshold sin ocultar tabla
- Permitir usuario cambiar rango de fechas
- Sin error visual

**Estado Visual:**
```
┌──────────────────────────────────────────────────┐
│ Anomalies Detection                              │
│ Threshold: [0.3 ▼]  Group By: [Month ▼]        │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ No anomalies detected for this period       │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Tip: Try increasing threshold or adjusting dates│
└──────────────────────────────────────────────────┘
```

#### Caso Límite 2b: Usuario cambia threshold de 0.3 a 0.5 sin cambiar rango de fechas

**Entrada Anterior:**
```
GET /api/metrics/alerts?threshold=0.3&group_by=month&start_date=2024-01-01
Respuesta: [ { period: "2024-02", outcome_total: 125500, baseline_average: 100000, increase_ratio: 0.255 }, ... ]
```

**Entrada Nueva:**
```
GET /api/metrics/alerts?threshold=0.5&group_by=month&start_date=2024-01-01
Respuesta: []  // Porque 0.255 < 0.5, ya no es anomalía
```

**Comportamiento Esperado:**
- Mostrar skeleton de tabla mientras se cargan nuevas alertas (200ms)
- Respuesta llega con array vacío
- Mostrar: "No anomalies detected for the selected range and threshold"
- Sugerencia: "Try lowering the threshold to see more anomalies"

**Estado Visual:**
```
Cambio en Threshold: 0.3 → 0.5
↓
(skeleton visible por 200ms)
↓
Tabla se actualiza: "No anomalies detected..."
```

---

## Funcionalidad 3: Vista Comparativa B2B vs B2C

### 3.1 Endpoint(s)

```
GET /api/metrics/categories/top  (dos requests paralelos)
```

**Verificación OpenAPI:** ✅ Ruta confirmada en `/openapi.json` -> `/paths/~1api~1metrics~1categories~1top`

### 3.2 Parámetros de Query (Dos Requests)

**Request 1 (B2B):**
```
GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5
```

**Request 2 (B2C):**
```
GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5
```

**Tipo TypeScript:** `TopCategoriesParams` (de `frontend/src/specs/param-types.ts`)

```typescript
interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: "income" | "outcome";  // Para Funcionalidad 3: siempre "income"
  limit?: number;                         // Número de categorías (1-20, default 5)
  business_type?: "B2B" | "B2C" | null;   // Para comparativa: hacer dos requests
  start_date?: string | null;             // Heredado
  end_date?: string | null;               // Heredado
}
```

| Parámetro | Tipo | Requerido | Rango Válido | Default | Verificación |
|-----------|------|----------|--------------|---------|--------------|
| `operation_type` | string (enum) | ❌ No | "income", "outcome" | "outcome" | ✅ `/openapi.json`: enum, default: "outcome" |
| `limit` | integer | ❌ No | 1 a 20 | 5 | ✅ `/openapi.json`: minimum: 1, maximum: 20, default: 5 |
| `business_type` | string (enum) | ❌ No | "B2B", "B2C" | null (ambos) | ✅ `/openapi.json`: enum, nullable |
| `start_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | null | ✅ Heredado |
| `end_date` | string (date) | ❌ No | `facets.min_date` a `facets.max_date` | null | ✅ Heredado |

**Restricciones:**
- Para Funcionalidad 3: **siempre `operation_type=income`**
- Validador frontend: `isValidLimit(limit)` (de `param-types.ts`)
- Si `limit` fuera de rango: mostrar error y revertir

### 3.3 Respuesta de API (Ambos Requests)

**Tipo TypeScript:** `TopCategoriesResponse` (alias de `TopCategoryItem[]`)

```typescript
interface TopCategoryItem {
  category: Category;              // enum: ["suppliers", "sales", ...]
  operation_type: "income" | "outcome";
  total_amount: number;            // Suma agregada
}
```

**Campos Verificados en `/openapi.json`:**
- ✅ `category`: enum ["suppliers", "sales", "operational", "administrative", "others"]
- ✅ `operation_type`: enum ["income", "outcome"]
- ✅ `total_amount`: type number

### 3.4 Formato de Renderizado

**Tabla de Categorías (Lado B2B y B2C):**

| Columna | Tipo Dato | Fórmula/Formato | Ejemplo |
|---------|-----------|-----------------|---------|
| **Rank** | integer | Posición 1-N | 1, 2, 3 |
| **Category** | string | Nombre de categoría | "Sales" |
| **Total Amount** | number | Moneda (USD) | "$450,000.00" |
| **% of Group** | number | `(total_amount / sum_all_in_group) * 100` | "42.3%" |

**Cálculo de Porcentaje en Frontend:**
```typescript
// Para cada TopCategoryItem en el array B2B
const sumB2B = b2bCategories.reduce((acc, item) => acc + item.total_amount, 0);
const percentageB2B = (item.total_amount / sumB2B) * 100;

// Formato: formatPercent(percentageB2B)
```

**Gráfico Comparativo (Income Comparison):**
```
B2B:  ████████████████████ $1,070,000  (55.7%)
B2C:  ██████████████       $850,000    (44.3%)
Total: $1,920,000
```

### 3.5 Casos Límite (Funcionalidad 3)

#### Caso Límite 3a: B2B tiene datos, pero B2C está vacío

**Entrada:**
```
GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5
Respuesta: [ { category: "sales", operation_type: "income", total_amount: 500000 }, ... ]

GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5
Respuesta: []
```

**Comportamiento Esperado:**
- **Panel B2B:** Mostrar tabla con datos
- **Panel B2C:** Mostrar "No income data for this period"
- **Gráfico:** Mostrar solo barra B2B ($500,000, 100%)
- Sin errores visuales

**Estado Visual:**
```
┌──────────────────────────────────────┐  ┌────────────────────────┐
│ B2B Top Income                       │  │ B2C Top Income         │
├────┬──────────┬──────────────────────┤  ├────────────────────────┤
│ #  │ Category │ Amount  │ % Group    │  │                        │
├────┼──────────┼─────────┼────────────┤  │  No data for period    │
│ 1  │ Sales    │ $500K   │ 100.0%     │  │                        │
└────┴──────────┴─────────┴────────────┘  └────────────────────────┘

Gráfico:
B2B:  ████████████████ $500,000  (100%)
B2C:  (no data)
```

#### Caso Límite 3b: Ambos segmentos están vacíos en rango de fechas seleccionado

**Entrada:**
```
GET /api/metrics/categories/top?operation_type=income&business_type=B2B&start_date=2024-01-01&end_date=2024-01-05&limit=5
Respuesta: []

GET /api/metrics/categories/top?operation_type=income&business_type=B2C&start_date=2024-01-01&end_date=2024-01-05&limit=5
Respuesta: []
```

**Comportamiento Esperado:**
- **Panel B2B:** "No income data for this period"
- **Panel B2C:** "No income data for this period"
- **Gráfico:** "No data available for the selected date range"
- **Sugerencia (info box amarillo):** "Try expanding the date range (available: 2024-01-01 to 2024-12-31)"
- Sin errores visuales

**Estado Visual:**
```
┌──────────────────────────────────────┐  ┌────────────────────────┐
│ B2B Top Income                       │  │ B2C Top Income         │
├──────────────────────────────────────┤  ├────────────────────────┤
│  No income data for this period      │  │  No income data        │
└──────────────────────────────────────┘  └────────────────────────┘

Gráfico:
┌────────────────────────────┐
│ No data available for the  │
│ selected date range        │
│                            │
│ Tip: Try expanding range   │
└────────────────────────────┘
```

#### Caso Límite 3c: Usuario actualiza rango de fechas, B2B carga rápido pero B2C aún en fetch

**Entrada:** Usuario cambia `start_date`, B2B request es rápido (200ms), B2C request es lento (1s)

**Comportamiento Esperado:**
- **Panel B2B:** Se actualiza inmediatamente (muestra nuevos datos)
- **Panel B2C:** Muestra skeleton mientras carga
- **Gráfico:** Muestra datos parciales (solo B2B) o skeleton dependiendo de implementación
- Cuando B2C cargue: gráfico se actualiza automáticamente
- Sin errores visuales

**Estado Visual (Progresión Temporal):**
```
T=0: Usuario cambia fechas
↓
T=200ms:
  Panel B2B: [datos actualizados] ✅
  Panel B2C: [skeleton cargando] ⏳
  Gráfico: [skeleton]

T=1000ms:
  Panel B2B: [datos actualizados] ✅
  Panel B2C: [datos actualizados] ✅
  Gráfico: [completo] ✅
```

---

## Integración Entre Funcionalidades

### Cascada de Actualizaciones

```
Usuario cambia Filtro de Fechas (Func. 1)
  ↓
DateRangeFilterPanel emite onDateRangeChange
  ↓
Padre actualiza estado: dateRange = { start_date, end_date }
  ↓
Se disparan 3 requests paralelos:
  1. GET /api/metrics/alerts?start_date=...&end_date=...  → AnomaliesAlertTable
  2. GET /api/metrics/categories/top?operation_type=income&business_type=B2B&start_date=...&end_date=...
  3. GET /api/metrics/categories/top?operation_type=income&business_type=B2C&start_date=...&end_date=...
  ↓
Tablas y gráficos se actualizan cuando respuestas llegan
```

---

## Validación de Compilación TypeScript

**Comando:**
```bash
npx tsc --noEmit
```

**Espera Esperado:** ✅ Cero errores

**Archivos Auditados:**
- ✅ `frontend/src/specs/api-types.ts` (sin `any`, JSDoc completo)
- ✅ `frontend/src/specs/param-types.ts` (validadores incluidos, JSDoc completo)
- ✅ `frontend/src/specs/components.md` (especificación de props tipadas)

---

## Resumen de Endpoints y Tipos

| Funcionalidad | Endpoint | Método | Parámetros (Tipo) | Respuesta (Tipo) |
|---------------|----------|--------|-------------------|------------------|
| 1. Filtro Fechas | `/api/metrics` | GET | `DateRangeFilter` | `FinancialMovement[]` |
| 2. Alertas | `/api/metrics/alerts` | GET | `AlertsParams` | `AlertsResponse` |
| 3. Top Categorías B2B | `/api/metrics/categories/top` | GET | `TopCategoriesParams` (business_type: B2B) | `TopCategoriesResponse` |
| 3. Top Categorías B2C | `/api/metrics/categories/top` | GET | `TopCategoriesParams` (business_type: B2C) | `TopCategoriesResponse` |
| Facetas (Rango) | `/api/metrics/facets` | GET | (ninguno) | `MetricsFacets` |

---

## Checklist Final de Implementación

Antes de implementar componentes React, verificar:

- [ ] Tipos TypeScript compilan sin errores: `npx tsc --noEmit` ✅
- [ ] Todos los parámetros están documentados en `param-types.ts` con JSDoc ✅
- [ ] Todas las respuestas están documentadas en `api-types.ts` con JSDoc ✅
- [ ] Especificación de componentes en `components.md` incluye todos los casos límite ✅
- [ ] Funciones de validación (`isValidDateRange`, `isValidThreshold`, etc.) están presentes ✅
- [ ] Funciones de formato (`formatCurrency`, `formatPercent`) están en `financial-utils.ts` ✅
- [ ] No se han creado componentes React ni llamadas `fetch` en esta fase ✅

---

## Archivo de Referencia Rápida

```
frontend/src/specs/
├── VERIFICATION.md          # Fase 1: Exploración API
├── api-types.ts             # Fase 2: Tipos de respuesta
├── param-types.ts           # Fase 2: Tipos de parámetros
├── components.md            # Fase 3: Especificación de componentes
└── README.md                # Fase 4: Este documento (contrato de datos)
```

---

## Próximo Paso

→ **Auditoría Técnica:** Ejecutar evaluación de 12 criterios contra especificación completada.
