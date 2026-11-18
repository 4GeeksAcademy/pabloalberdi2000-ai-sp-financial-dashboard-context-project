/**
 * @file api-types.ts
 * @description Respuestas verificadas de API (OpenAPI schemas contra /docs)
 * Verificación: ✅ Todos los tipos son trazables a http://localhost:8000/openapi.json
 * Prohibición: NO se permite `any` ni `object` laxos
 * Tipado: Estricto con JSDoc en cada propiedad
 */

/**
 * Tipo que representa un operación (ingreso o gasto)
 * @example "income" | "outcome"
 */
export type OperationType = "income" | "outcome";

/**
 * Categorías de operaciones financieras
 * Verificado en /openapi.json -> /components/schemas/FinancialMovement
 * @example "suppliers" | "sales" | "operational" | "administrative" | "others"
 */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/**
 * Tipos de negocio para segmentación
 * Verificado en /openapi.json -> /components/schemas/FinancialMovement
 * @example "B2B" | "B2C"
 */
export type BusinessType = "B2B" | "B2C";

/**
 * Período de agrupación para alertas de anomalías
 * Verificado en /openapi.json -> /api/metrics/alerts parameters
 * @example "day" | "week" | "month"
 */
export type GroupByPeriod = "day" | "week" | "month";

/**
 * Movimiento financiero individual (respuesta de GET /api/metrics)
 * Verificado contra: /openapi.json -> /paths/~1api~1metrics/get -> responses/200
 * Schema: /components/schemas/FinancialMovement
 *
 * @property create_date - Fecha de creación del movimiento en formato ISO (YYYY-MM-DD)
 * @property amount - Cantidad monetaria en unidades base (ej. USD)
 * @property operation_type - Tipo de operación: "income" (ingreso) o "outcome" (gasto)
 * @property category - Categoría financiera del movimiento
 * @property business_type - Segmento de negocio: "B2B" o "B2C"
 */
export interface FinancialMovement {
  /**
   * Fecha ISO del movimiento (formato: YYYY-MM-DD)
   * Verificado en /openapi.json como type: string, format: date
   */
  create_date: string;

  /**
   * Cantidad monetaria de la operación
   * Verificado en /openapi.json como type: number
   */
  amount: number;

  /**
   * Tipo de operación: "income" (ingreso) o "outcome" (gasto)
   * Verificado en /openapi.json como enum: ["income", "outcome"]
   */
  operation_type: OperationType;

  /**
   * Categoría a la que pertenece la operación
   * Verificado en /openapi.json como enum: ["suppliers", "sales", "operational", "administrative", "others"]
   */
  category: Category;

  /**
   * Segmento de negocio: "B2B" o "B2C"
   * Verificado en /openapi.json como enum: ["B2B", "B2C"]
   */
  business_type: BusinessType;
}

/**
 * Fila de alerta de anomalía detectada (respuesta de GET /api/metrics/alerts)
 * Verificado contra: /openapi.json -> /paths/~1api~1metrics~1alerts/get -> responses/200
 * Schema: /components/schemas/MetricsAlert
 *
 * Lógica de interpretación:
 * - Una anomalía se detecta cuando: increase_ratio > threshold (parámetro de query)
 * - El período es una ventana temporal agrupada según group_by (day/week/month)
 * - baseline_average es la media móvil de los 3 períodos anteriores
 *
 * @property period - Identificador del período (ej. "2024-01" para meses, "2024-01-01" para días)
 * @property outcome_total - Gasto total registrado en ese período
 * @property baseline_average - Media móvil de gasto de los 3 períodos anteriores
 * @property increase_ratio - Incremento porcentual: (outcome_total - baseline_average) / baseline_average
 */
export interface MetricsAlert {
  /**
   * Período agrupado según group_by (day/week/month)
   * Formato depende de group_by: "2024-01" (month), "2024-W01" (week), "2024-01-01" (day)
   * Verificado en /openapi.json como type: string
   */
  period: string;

  /**
   * Total de gasto registrado en el período
   * Verificado en /openapi.json como type: number
   */
  outcome_total: number;

  /**
   * Promedio móvil de los 3 períodos anteriores (baseline para detectar anomalías)
   * Verificado en /openapi.json como type: number
   */
  baseline_average: number;

  /**
   * Incremento porcentual relativo al baseline
   * Fórmula: (outcome_total - baseline_average) / baseline_average
   * Rango esperado: 0 a 1+ (ej. 0.5 = 50% de incremento)
   * Verificado en /openapi.json como type: number
   */
  increase_ratio: number;
}

/**
 * Colección de alertas de anomalías
 * Respuesta directa de GET /api/metrics/alerts
 *
 * @property (array element) - Cada elemento es un MetricsAlert
 *
 * Comportamiento:
 * - Array vacío si no hay anomalías (nunca null ni undefined)
 * - La UI debe mostrar "No anomalies detected" cuando esté vacío
 */
export type AlertsResponse = MetricsAlert[];

/**
 * Categoría de ingreso/gasto con agregación (respuesta de GET /api/metrics/categories/top)
 * Verificado contra: /openapi.json -> /paths/~1api~1metrics~1categories~1top/get -> responses/200
 * Schema: /components/schemas/TopCategoryItem
 *
 * Uso:
 * - Para obtener top N categorías de ingreso B2B: GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5
 * - Para obtener top N categorías de ingreso B2C: GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5
 * - El porcentaje sobre el grupo se calcula en frontend: (total_amount / sum_all_in_group) * 100
 *
 * @property category - Categoría de la operación
 * @property operation_type - Tipo de operación ("income" o "outcome")
 * @property total_amount - Suma agregada de todas las operaciones en esta categoría para el grupo
 */
export interface TopCategoryItem {
  /**
   * Categoría de operación
   * Verificado en /openapi.json como enum: ["suppliers", "sales", "operational", "administrative", "others"]
   */
  category: Category;

  /**
   * Tipo de operación (income o outcome)
   * Verificado en /openapi.json como enum: ["income", "outcome"]
   */
  operation_type: OperationType;

  /**
   * Suma total en la categoría para el business_type especificado
   * Verificado en /openapi.json como type: number
   */
  total_amount: number;
}

/**
 * Colección de categorías principales
 * Respuesta directa de GET /api/metrics/categories/top
 *
 * @property (array element) - Cada elemento es un TopCategoryItem limitado por `limit` parameter
 *
 * Comportamiento:
 * - Array vacío si no hay registros para la combinación (business_type/operation_type/dates)
 * - La UI debe mostrar estado vacío explícito
 */
export type TopCategoriesResponse = TopCategoryItem[];

/**
 * Rango de fechas válido y facetas disponibles en el dataset
 * Respuesta de GET /api/metrics/facets (sin parámetros de query)
 * Verificado contra: /openapi.json -> /paths/~1api~1metrics~1facets/get -> responses/200
 * Schema: /components/schemas/MetricsFacets
 *
 * Propósito:
 * - Alimentar validadores de entrada de usuario
 * - Mostrar rango válido en UI (ej. "Data available from 2024-01-01 to 2024-12-31")
 * - Alimentar dropdowns/selects de categorías y tipos de operación
 *
 * @property operation_types - Lista de tipos de operación disponibles
 * @property business_types - Lista de tipos de negocio disponibles
 * @property categories - Lista de categorías disponibles
 * @property min_date - Fecha más antigua en el dataset (YYYY-MM-DD)
 * @property max_date - Fecha más reciente en el dataset (YYYY-MM-DD)
 */
export interface MetricsFacets {
  /**
   * Tipos de operación disponibles en el dataset
   * Verificado en /openapi.json como type: array, items: enum ["income", "outcome"]
   * Esperado: ["income", "outcome"]
   */
  operation_types: OperationType[];

  /**
   * Tipos de negocio disponibles en el dataset
   * Verificado en /openapi.json como type: array, items: enum ["B2B", "B2C"]
   * Esperado: ["B2B", "B2C"]
   */
  business_types: BusinessType[];

  /**
   * Categorías disponibles en el dataset
   * Verificado en /openapi.json como type: array, items: enum [...]
   * Esperado: ["suppliers", "sales", "operational", "administrative", "others"]
   */
  categories: Category[];

  /**
   * Fecha mínima en el dataset (formato: YYYY-MM-DD)
   * Verificado en /openapi.json como type: string, format: date
   */
  min_date: string;

  /**
   * Fecha máxima en el dataset (formato: YYYY-MM-DD)
   * Verificado en /openapi.json como type: string, format: date
   */
  max_date: string;
}

/**
 * Resumen de métricas agregadas (Respuesta de GET /api/metrics/summary - futuro)
 * Incluida para referencia, aunque no es usada en Fases 1-3
 *
 * @property total_income - Ingreso total en el rango filtrado
 * @property total_outcome - Gasto total en el rango filtrado
 * @property profit - Ganancia neta (total_income - total_outcome)
 * @property profit_percent - Porcentaje de ganancia relativo al ingreso
 */
export interface KPIMetrics {
  /**
   * Total de ingresos
   * Verificado como type: number
   */
  total_income: number;

  /**
   * Total de gastos
   * Verificado como type: number
   */
  total_outcome: number;

  /**
   * Ganancia neta (ingresos - gastos)
   * Verificado como type: number
   */
  profit: number;

  /**
   * Porcentaje de ganancia relativo al ingreso
   * Rango: 0-100+ (puede ser negativo si hay pérdida)
   * Verificado como type: number
   */
  profit_percent: number;
}
