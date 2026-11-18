# Fase 3: Especificación de Componentes

**Documento de Arquitectura Visual y Funcional**  
**Fecha:** 2026-11-18  
**Estado:** ✅ Especificación de Componentes Completa  
**Tipos TypeScript:** Referenciados desde `api-types.ts` y `param-types.ts`

---

## Visión General

Este documento especifica la arquitectura de tres nuevas funcionalidades del dashboard financiero, detallando componentes, props, lógica de renderizado condicional y resolución de ambigüedades dejadas por el Product Manager.

---

## Funcionalidad 1: Filtro Global de Rango de Fechas (Dashboard Principal)

### Componente: `DateRangeFilterPanel`

**Ubicación:** `frontend/src/components/dashboard/date-range-filter-panel.tsx`

**Propósito:** Proporcionar dos inputs opcionales de fecha que filtren globalmente todos los datos del dashboard (KPIs, gráficos, tabla de alertas, comparativa B2B/B2C).

**Props (Interfaz TypeScript):**

```typescript
interface DateRangeFilterPanelProps {
  /**
   * Rango de fechas seleccionado actualmente
   * Tipo: DateRangeFilter (de param-types.ts)
   * - start_date?: string | null (formato YYYY-MM-DD)
   * - end_date?: string | null (formato YYYY-MM-DD)
   */
  dateRange: DateRangeFilter;

  /**
   * Callback ejecutado cuando el usuario cambia el filtro
   * Parámetro: nuevo objeto DateRangeFilter
   * Responsabilidad del padre: propagar cambio a toda la aplicación
   */
  onDateRangeChange: (newRange: DateRangeFilter) => void;

  /**
   * Rango válido disponible en el dataset (de /api/metrics/facets)
   * Tipo: MetricsFacets
   * Uso: validar entrada del usuario y mostrar rango mínimo/máximo en UI
   */
  facets: MetricsFacets;

  /**
   * Estado de carga (ej. mientras se obtienen facets)
   * Tipo: boolean
   * Cuando true: mostrar skeleton o disable inputs
   */
  isLoading?: boolean;
}
```

**Comportamiento y Renderizado:**

#### Estados Base

- **Inicial:** Ambos inputs vacíos (sin restricción de rango)
- **Solo Inicio:** `start_date` relleno, `end_date` vacío → filtro desde esa fecha hasta el máximo del dataset
- **Solo Fin:** `start_date` vacío, `end_date` relleno → filtro desde el mínimo del dataset hasta esa fecha
- **Ambos Rellenos:** Rango específico → filtro exacto
- **Rango Invertido:** `start_date` > `end_date` → mostrar error visual (borde rojo) con mensaje: "Start date must be before end date"

#### Especificación Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Date Range Filter                                           │
│ ┌──────────────────────┐  ┌──────────────────────┐         │
│ │ Start: [YYYY-MM-DD]  │  │ End:   [YYYY-MM-DD]  │  [Clear]│
│ │ (optional)           │  │ (optional)           │         │
│ │ Min: 2024-01-01      │  │ Max: 2024-12-31      │         │
│ └──────────────────────┘  └──────────────────────┘         │
│ Valid range: 2024-01-01 to 2024-12-31                      │
└─────────────────────────────────────────────────────────────┘
```

#### Validaciones Implementar

1. **Formato:** Validar que entrada sea `YYYY-MM-DD` (antes de enviar al API)
2. **Rango:** `start_date` debe ser ≤ `end_date` (mostrar error si no)
3. **Límites:** Ambas fechas deben estar dentro de `facets.min_date` y `facets.max_date`
4. **Debounce:** Esperar 300ms después del último cambio antes de llamar `onDateRangeChange` (para no saturar estado)

#### Caso Límite 1: Usuario borra start_date pero keep end_date

**Entrada:** `{ start_date: "2024-06-15", end_date: "2024-12-31" }` → usuario elimina start_date

**Comportamiento Esperado:**
- Mostrar `{ start_date: undefined, end_date: "2024-12-31" }`
- Tableros se actualizan: datos desde inicio del dataset (2024-01-01) hasta 2024-12-31
- Sin error visual

#### Caso Límite 2: Ambos inputs están vacíos

**Entrada:** `{ start_date: undefined, end_date: undefined }`

**Comportamiento Esperado:**
- Mostrar histórico completo (sin filtro)
- UI muestra: "Showing all available data (2024-01-01 to 2024-12-31)"
- Sin error visual

---

## Funcionalidad 2: Tabla de Alertas de Anomalías de Gasto (Dashboard Principal)

### Componente: `AnomaliesAlertTable`

**Ubicación:** `frontend/src/components/dashboard/anomalies-alert-table.tsx`

**Propósito:** Mostrar una tabla de anomalías detectadas en gasto con 4 columnas clave, permitir ajuste de threshold en tiempo real y respetar activamente el filtro de rango de fechas de Funcionalidad 1.

**Props (Interfaz TypeScript):**

```typescript
interface AnomaliesAlertTableProps {
  /**
   * Array de alertas detectadas
   * Tipo: AlertsResponse (alias de MetricsAlert[])
   * Comportamiento:
   * - Array vacío: mostrar empty state
   * - Array con elementos: mostrar tabla
   */
  alerts: AlertsResponse;

  /**
   * Parámetros actuales de filtro de alertas
   * Tipo: AlertsParams (de param-types.ts)
   * Incluye: threshold, group_by, start_date, end_date, business_type
   */
  params: AlertsParams;

  /**
   * Callback ejecutado cuando el usuario cambia parámetros
   * Parámetro: nuevo objeto AlertsParams
   * Responsabilidad del padre: hacer fetch de nuevas alertas
   */
  onParamsChange: (newParams: AlertsParams) => void;

  /**
   * Estado de carga (ej. mientras se obtienen alertas)
   * Tipo: boolean
   * Cuando true: mostrar skeleton de tabla
   */
  isLoading?: boolean;

  /**
   * Estado de error (ej. fallo en fetch)
   * Tipo: string | null
   * Cuando no null: mostrar mensaje de error en lugar de tabla
   * Ejemplo: "Failed to load alerts. Please try again."
   */
  error?: string | null;
}
```

**Esquema de Columnas:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| **Period** | string | Período agrupado (ej. "2024-01" para meses, "2024-01-01" para días) |
| **Outcome Total** | number | Gasto total registrado en ese período (formato moneda) |
| **Baseline Avg** | number | Media móvil de los 3 períodos anteriores (formato moneda) |
| **Increase %** | number | Incremento porcentual: (outcome_total - baseline_avg) / baseline_avg (formato %: "45.2%") |

**Comportamiento y Renderizado:**

#### Estados Base

- **Cargando:** Mostrar skeleton de tabla (5 filas simuladas)
- **Error:** Mostrar mensaje de error rojo con opción de retry
- **Sin Anomalías:** Mostrar tabla vacía con mensaje: "No anomalies detected for the selected range and threshold"
- **Con Anomalías:** Mostrar tabla con filas ordenadas por `increase_ratio` descendente

#### Especificación Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Anomalies Detection                                                     │
│                                                                         │
│ Threshold (Sensitivity):  [0.3 ▼] (adjust: 0.01 - 1.0)                │
│ Group By:                 [Month ▼]                                   │
│                                                                         │
│ ┌──────────┬──────────────┬──────────────┬──────────────┐              │
│ │ Period   │ Outcome $    │ Baseline $   │ Increase %   │              │
│ ├──────────┼──────────────┼──────────────┼──────────────┤              │
│ │ 2024-02  │ $125,500     │ $100,000     │ +25.5%       │              │
│ │ 2024-03  │ $98,000      │ $110,000     │ -10.9%       │              │
│ │ 2024-04  │ $155,000     │ $107,750     │ +43.8%       │              │
│ └──────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                         │
│ Note: Only anomalies with increase % > threshold are shown            │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Configuración de Threshold (Input Numérico)

```typescript
<input
  type="number"
  min={0.01}
  max={1.0}
  step={0.01}
  value={params.threshold ?? 0.3}
  onChange={(e) => onParamsChange({ ...params, threshold: parseFloat(e.target.value) })}
/>
```

**Validación:**
- Si usuario ingresa fuera de rango, mostrar error y revertir a valor anterior
- Validador: `isValidThreshold(params.threshold)` (de param-types.ts)

#### Validaciones Implementar

1. **Threshold:** Debe estar entre 0.01 y 1.0
2. **Formato Moneda:** `formatCurrency(amount)` (de financial-utils.ts)
3. **Formato Porcentaje:** `formatPercent(increase_ratio * 100)` (de financial-utils.ts)
4. **Debounce:** Esperar 500ms después de cambiar threshold antes de hacer fetch

#### Caso Límite 1: Array de alertas está vacío

**Entrada:** `alerts: []`

**Comportamiento Esperado:**
- **Tabla permanece visible** (nunca ocultarla)
- Mostrar fila única con mensaje: "No anomalies detected for the selected range and threshold"
- Sin skeleton ni spinner
- Usuario puede ajustar threshold sin ocultar la tabla

#### Caso Límite 2: Threshold cambia pero rango de fechas se mantiene igual

**Entrada:** Usuario cambia threshold de 0.3 a 0.5

**Comportamiento Esperado:**
- Enviar al padre: `onParamsChange({ ...params, threshold: 0.5 })`
- El padre debe hacer fetch de nuevas alertas con nuevos parámetros
- Mostrar skeleton mientras se cargan nuevas alertas
- Tabla se actualiza automáticamente cuando respuesta llega

---

## Funcionalidad 3: Vista Comparativa B2B vs B2C (Nueva Página)

### Página: `ComparisonPage`

**Ubicación:** `frontend/src/pages/comparison.tsx`

**Propósito:** Proporcionar vista paralela de top 5 categorías de ingreso entre B2B y B2C, con tabla e indicadores, y gráfico comparativo de ingresos totales.

**Props (si es componente) o State (si es página):**

```typescript
interface ComparisonPageState {
  /**
   * Parámetros de filtro actuales
   * Tipo: TopCategoriesParams (de param-types.ts)
   * Incluye: operation_type (siempre "income"), limit, start_date, end_date
   */
  params: TopCategoriesParams;

  /**
   * Top 5 categorías de ingreso B2B
   * Tipo: TopCategoriesResponse (alias de TopCategoryItem[])
   */
  b2bCategories: TopCategoriesResponse;

  /**
   * Top 5 categorías de ingreso B2C
   * Tipo: TopCategoriesResponse (alias de TopCategoryItem[])
   */
  b2cCategories: TopCategoriesResponse;

  /**
   * Rango de fechas válido (de /api/metrics/facets)
   * Tipo: MetricsFacets
   */
  facets: MetricsFacets;

  /**
   * Estados de carga separados por segmento
   * Tipo: { b2b: boolean, b2c: boolean }
   */
  isLoading: { b2b: boolean; b2c: boolean };

  /**
   * Estados de error separados por segmento
   * Tipo: { b2b: string | null, b2c: string | null }
   */
  error: { b2b: string | null; b2c: string | null };
}
```

**Especificación de Componentes Internos:**

### Sub-componente: `CategoryTablePanel`

**Propósito:** Mostrar tabla de top N categorías de ingreso para un segmento (B2B o B2C).

```typescript
interface CategoryTablePanelProps {
  /**
   * Título del panel (ej. "B2B Top Income Categories")
   * Tipo: string
   */
  title: string;

  /**
   * Tipo de negocio (B2B o B2C) - usado para CSS classes/styling
   * Tipo: "B2B" | "B2C"
   */
  businessType: "B2B" | "B2C";

  /**
   * Array de categorías (top N)
   * Tipo: TopCategoriesResponse
   */
  categories: TopCategoriesResponse;

  /**
   * Total agregado de todas las categorías en este segmento
   * Tipo: number
   * Uso: para calcular porcentaje individual
   */
  segmentTotal: number;

  /**
   * Estado de carga
   * Tipo: boolean
   */
  isLoading?: boolean;

  /**
   * Mensaje de error
   * Tipo: string | null
   */
  error?: string | null;
}
```

**Esquema de Columnas (Tabla):**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| **Rank** | number | 1-5 (posición en top) |
| **Category** | string | Nombre de categoría (suppliers, sales, operational, administrative, others) |
| **Total Amount** | number | Suma en la categoría (formato moneda) |
| **% of Group** | number | Porcentaje sobre el total del segmento B2B/B2C |

**Comportamiento y Renderizado:**

#### Estados Base

- **Cargando:** Mostrar skeleton de tabla (5 filas)
- **Error:** Mostrar mensaje de error rojo
- **Sin Registros:** Mostrar "No income data for this period" (tabla vacía pero visible)
- **Con Registros:** Mostrar tabla ordenada descendentemente por total_amount

#### Especificación Visual (Lado a Lado)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐ │
│  │ B2B Top Income Categories           │  │ B2C Top Income Categories│ │
│  ├────┬────────────┬──────────┬────────┤  ├────┬────────────┬────────┤ │
│  │ #  │ Category   │ Amount $ │ % Group│  │ #  │ Category   │ % Group│ │
│  ├────┼────────────┼──────────┼────────┤  ├────┼────────────┼────────┤ │
│  │ 1  │ Sales      │ $450K    │ 42.3% │  │ 1  │ Sales      │ 55.8% │ │
│  │ 2  │ Suppliers  │ $380K    │ 35.7% │  │ 2  │ Operational│ 28.4% │ │
│  │ 3  │ Operational│ $190K    │ 17.8% │  │ 3  │ Suppliers  │ 10.2% │ │
│  │ 4  │ Admin      │ $45K     │ 4.2%  │  │ 4  │ Others     │ 5.6%  │ │
│  │ 5  │ Others     │ $5K      │ 0.5%  │  │ 5  │ Admin      │ 0.0%  │ │
│  └────┴────────────┴──────────┴────────┘  └────┴────────────┴────────┘ │
│                                                                         │
│  Total B2B Income: $1,070,000  │  Total B2C Income: $850,000           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sub-componente: `IncomeComparisonChart`

**Propósito:** Gráfico comparativo de ingresos totales B2B vs B2C (ej. gráfico de barras).

```typescript
interface IncomeComparisonChartProps {
  /**
   * Ingreso total B2B agregado
   * Tipo: number
   */
  b2bTotal: number;

  /**
   * Ingreso total B2C agregado
   * Tipo: number
   */
  b2cTotal: number;

  /**
   * Parámetros de rango de fechas (para mostrar en etiqueta)
   * Tipo: DateRangeFilter
   */
  dateRange: DateRangeFilter;

  /**
   * Estado de carga
   * Tipo: boolean
   */
  isLoading?: boolean;
}
```

**Comportamiento Visual:**

```
┌──────────────────────────────────────────────────────────┐
│ Income Comparison (Jan 1 - Dec 31, 2024)               │
│                                                          │
│  B2B  ████████████████████ $1,070,000  (55.7%)         │
│  B2C  ██████████████       $850,000    (44.3%)         │
│                                                          │
│  Total Income: $1,920,000                               │
└──────────────────────────────────────────────────────────┘
```

**Especificación de Validaciones:**

1. **Cálculo de Porcentaje:** `(amount / (b2bTotal + b2cTotal)) * 100`
2. **Formato Moneda:** `formatCurrency(amount)`
3. **Formato Porcentaje:** `formatPercent(percentage)`

#### Caso Límite 1: B2B no tiene datos, pero B2C sí

**Entrada:** 
```
b2bCategories: []
b2cCategories: [{ category: "sales", operation_type: "income", total_amount: 500000 }]
```

**Comportamiento Esperado:**
- **Panel B2B:** Mostrar "No income data for this period"
- **Panel B2C:** Mostrar tabla con 1 fila
- **Gráfico:** Mostrar solo barra B2C ($500,000, 100%)
- Sin errores visuales

#### Caso Límite 2: Ambos segmentos vacíos en rango de fechas seleccionado

**Entrada:**
```
b2bCategories: []
b2cCategories: []
start_date: "2024-01-01"
end_date: "2024-01-05"
```

**Comportamiento Esperado:**
- Ambos paneles muestran "No income data for this period"
- Gráfico muestra: "No data available for the selected date range"
- Mensaje de información (amarillo/gris): "Try expanding the date range"
- Sin errores visuales

#### Caso Límite 3: Filtro de fechas se actualiza pero uno de los segmentos sigue cargando

**Entrada:** Usuario cambia rango de fechas, B2B está en fetch, B2C ya cargó

**Comportamiento Esperado:**
- Panel B2B: mostrar skeleton
- Panel B2C: mostrar tabla con datos anteriores (hasta que se actualice)
- Gráfico: esperando datos de B2B (mostrar skeleton o estado neutral)
- Cuando B2B cargue: actualizar gráfico automáticamente

---

## Resumen de Componentes Especificados

| Funcionalidad | Componente | Archivo | Props | Casos Límite |
|---------------|-----------|---------|----|------------|
| 1. Filtro de Fechas | `DateRangeFilterPanel` | `date-range-filter-panel.tsx` | `dateRange`, `onDateRangeChange`, `facets`, `isLoading` | 2 |
| 2. Tabla Alertas | `AnomaliesAlertTable` | `anomalies-alert-table.tsx` | `alerts`, `params`, `onParamsChange`, `isLoading`, `error` | 2 |
| 3. Comparativa B2B/B2C | `ComparisonPage` | `comparison.tsx` | State (page) | 3 |
| 3. Sub-panel Categorías | `CategoryTablePanel` | `category-table-panel.tsx` | `title`, `businessType`, `categories`, `segmentTotal`, `isLoading`, `error` | Heredados de página |
| 3. Gráfico Comparativo | `IncomeComparisonChart` | `income-comparison-chart.tsx` | `b2bTotal`, `b2cTotal`, `dateRange`, `isLoading` | Heredados de página |

---

## Decisiones Arquitectónicas Registradas

| Decisión | Justificación |
|----------|---------------|
| **Tabla de Alertas Nunca Oculta** | El PM no especificó qué hacer cuando no hay anomalías. Decisión: mostrar mensaje "No anomalies detected" en lugar de ocultar tabla. Mejora UX y evita confusión. |
| **Dos Requests Paralelos para B2B vs B2C** | El endpoint `/api/metrics/categories/top` acepta un único `business_type`. Para comparar, se hacen dos llamadas paralelas en frontend. |
| **Cálculo de Porcentajes en Frontend** | El endpoint devuelve `total_amount` sin porcentaje. Frontend calcula: `(total_amount / sum_all_in_group) * 100`. |
| **Debounce en Filtros** | Cambios rápidos de threshold/fecha no gatillan fetch inmediatamente; esperar 300-500ms evita múltiples requests. |
| **Estados de Carga Separados por Segmento** | En Comparativa B2B/B2C, B2B y B2C se cargan en paralelo. Permitir que uno muestre datos mientras el otro carga mejora percepción de velocidad. |

---

## Próximo Paso

→ **Fase 4:** Redactar `frontend/specs/README.md` con documentación completa del contrato de datos, endpoints exactos, restricciones y casos límite verificables.
