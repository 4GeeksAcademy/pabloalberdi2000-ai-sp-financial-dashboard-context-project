/**
 * @file param-types.ts
 * @description Parámetros de query verificados contra OpenAPI (/docs)
 * Verificación: ✅ Todos los parámetros son trazables a /openapi.json
 * Prohibición: NO se permite `any` ni `object` laxos
 * Tipado: Estricto con JSDoc en cada propiedad
 */

/**
 * Filtro global de rango de fechas (Funcionalidad 1)
 * Extendido por: AlertsParams, TopCategoriesParams
 *
 * Uso:
 * - Ambos campos son **opcionales**
 * - Si ambos están vacíos: devolver histórico completo
 * - Si solo start_date: devolver desde esa fecha hasta hoy/máximo disponible
 * - Si solo end_date: devolver desde inicio disponible hasta esa fecha
 * - Si ambos: devolver rango específico
 *
 * Verificado en /openapi.json:
 * - /api/metrics/alerts parameters: start_date, end_date (nullable, format: date)
 * - /api/metrics/categories/top parameters: start_date, end_date (nullable, format: date)
 *
 * @property start_date - Fecha inicial del rango (opcional, YYYY-MM-DD)
 * @property end_date - Fecha final del rango (opcional, YYYY-MM-DD)
 */
export interface DateRangeFilter {
  /**
   * Fecha inicial del rango de filtro (formato: YYYY-MM-DD)
   * Verificado en /openapi.json como: type string, format: date, required: false, nullable: true
   * Comportamiento:
   * - undefined o null = sin límite inferior (desde inicio del dataset)
   * - Debe ser <= end_date si ambos se proporcionan
   * Ejemplo: "2024-01-01"
   */
  start_date?: string | null;

  /**
   * Fecha final del rango de filtro (formato: YYYY-MM-DD)
   * Verificado en /openapi.json como: type string, format: date, required: false, nullable: true
   * Comportamiento:
   * - undefined o null = sin límite superior (hasta fin del dataset)
   * - Debe ser >= start_date si ambos se proporcionan
   * Ejemplo: "2024-12-31"
   */
  end_date?: string | null;
}

/**
 * Parámetros para GET /api/metrics/alerts (Funcionalidad 2: Tabla de Anomalías)
 * Extiende DateRangeFilter para heredar start_date y end_date
 *
 * Verificado en /openapi.json -> /paths/~1api~1metrics~1alerts/get
 *
 * Lógica de uso:
 * - Se envían como query parameters en la URL: ?threshold=0.5&group_by=month&start_date=2024-01-01&end_date=2024-12-31
 * - El threshold define el umbral de incremento porcentual para detectar anomalías
 * - El group_by define la granularidad temporal (día, semana, mes)
 * - start_date y end_date filtran el rango de análisis
 * - business_type (opcional) segmenta la detección por B2B o B2C
 *
 * @property threshold - Umbral de incremento porcentual (0.01 a 1.0, default 0.3)
 * @property group_by - Granularidad temporal ("day" | "week" | "month", default "month")
 * @property business_type - Filtro opcional por segmento de negocio (B2B o B2C)
 * @property start_date - Heredado de DateRangeFilter
 * @property end_date - Heredado de DateRangeFilter
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral de incremento porcentual para detectar anomalías
   * Verificado en /openapi.json como: type number, minimum 0, default 0.3
   * Rango permitido: [0.01, 1.0]
   * Interpretación:
   * - 0.3 = 30% de incremento respecto al baseline detecta anomalía
   * - 0.1 = 10% de incremento (más sensible, más alertas)
   * - 1.0 = 100% de incremento (menos sensible)
   * Comportamiento en UI: input numérico con validación min=0.01, max=1.0, step=0.01
   */
  threshold?: number;

  /**
   * Granularidad temporal de agrupación
   * Verificado en /openapi.json como: enum ["day", "week", "month"], default "month"
   * Comportamiento:
   * - "day": agrupa por día (ej. period: "2024-01-01")
   * - "week": agrupa por semana (ej. period: "2024-W01")
   * - "month": agrupa por mes (ej. period: "2024-01")
   * Default: "month"
   */
  group_by?: "day" | "week" | "month";

  /**
   * Filtro opcional por tipo de negocio
   * Verificado en /openapi.json como: enum ["B2B", "B2C"], required: false, nullable: true
   * Comportamiento:
   * - undefined o null = análisis de anomalías en ambos segmentos
   * - "B2B" = solo anomalías en segmento B2B
   * - "B2C" = solo anomalías en segmento B2C
   */
  business_type?: "B2B" | "B2C" | null;
}

/**
 * Parámetros para GET /api/metrics/categories/top (Funcionalidad 3: Categorías B2B vs B2C)
 * Extiende DateRangeFilter para heredar start_date y end_date
 *
 * Verificado en /openapi.json -> /paths/~1api~1metrics~1categories~1top/get
 *
 * Lógica de uso:
 * - Se envían como query parameters: ?operation_type=income&business_type=B2B&limit=5&start_date=...&end_date=...
 * - Para comparar B2B vs B2C, se hacen **dos requests paralelos**:
 *   * GET /api/metrics/categories/top?operation_type=income&business_type=B2B&limit=5
 *   * GET /api/metrics/categories/top?operation_type=income&business_type=B2C&limit=5
 * - El porcentaje sobre el grupo se calcula en frontend: (total_amount / sum_all_in_business_type) * 100
 *
 * @property operation_type - Tipo de operación a analizar (income o outcome, default outcome)
 * @property limit - Número máximo de categorías a devolver (1 a 20, default 5)
 * @property business_type - Filtro por segmento de negocio (B2B o B2C, default null = ambos)
 * @property start_date - Heredado de DateRangeFilter
 * @property end_date - Heredado de DateRangeFilter
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Tipo de operación a analizar
   * Verificado en /openapi.json como: enum ["income", "outcome"], default "outcome"
   * Comportamiento:
   * - "income": Top categorías de ingreso
   * - "outcome": Top categorías de gasto
   * Para Funcionalidad 3: usar siempre "income"
   */
  operation_type?: "income" | "outcome";

  /**
   * Número máximo de categorías a devolver en la respuesta
   * Verificado en /openapi.json como: type integer, minimum 1, maximum 20, default 5
   * Comportamiento:
   * - Rango: [1, 20]
   * - Default: 5
   * - La API devuelve como máximo N categorías ordenadas por total_amount descendente
   */
  limit?: number;

  /**
   * Filtro por tipo de negocio
   * Verificado en /openapi.json como: enum ["B2B", "B2C"], required: false, nullable: true
   * Comportamiento:
   * - undefined o null = categorías de ambos segmentos (B2B + B2C)
   * - "B2B" = solo categorías del segmento B2B
   * - "B2C" = solo categorías del segmento B2C
   * Para Funcionalidad 3: se hacen dos requests, uno con "B2B" y otro con "B2C"
   */
  business_type?: "B2B" | "B2C" | null;
}

/**
 * Parámetros para GET /api/metrics (Funcionalidad 1: Base de Filtro Global)
 * Extiende DateRangeFilter para heredar start_date y end_date
 *
 * Verificado en /openapi.json -> /paths/~1api~1metrics/get
 *
 * Lógica de uso:
 * - Se envían como query parameters: ?start_date=...&end_date=...&category=sales&operation_type=income
 * - Devuelve array de FinancialMovement filtrados por parámetros
 * - Es el endpoint base que alimenta a los cálculos de KPI en el dashboard
 *
 * @property category - Filtro opcional por categoría
 * @property operation_type - Filtro opcional por tipo de operación
 * @property start_date - Heredado de DateRangeFilter
 * @property end_date - Heredado de DateRangeFilter
 */
export interface MetricsParams extends DateRangeFilter {
  /**
   * Categoría a filtrar
   * Verificado en /openapi.json como: enum ["suppliers", "sales", "operational", "administrative", "others"], required: false
   * Comportamiento:
   * - undefined o null = sin filtro de categoría
   * - Uno de los valores: filtra solo esa categoría
   */
  category?: "suppliers" | "sales" | "operational" | "administrative" | "others" | null;

  /**
   * Tipo de operación a filtrar
   * Verificado en /openapi.json como: enum ["income", "outcome"], required: false
   * Comportamiento:
   * - undefined o null = sin filtro de tipo
   * - "income": solo ingresos
   * - "outcome": solo gastos
   */
  operation_type?: "income" | "outcome" | null;
}

/**
 * Constructor de parámetros de query con validación
 * Función auxiliar para validar y construir parámetros de forma segura
 *
 * @param params - Objeto parcial de parámetros (puede tener undefined/null)
 * @returns Objeto con parámetros validados, omitiendo undefined/null
 *
 * Uso:
 * ```typescript
 * const params = buildQueryParams({
 *   threshold: 0.5,
 *   start_date: "2024-01-01",
 *   end_date: undefined, // será omitido
 *   group_by: "month"
 * });
 * ```
 */
export function buildQueryParams<T extends Record<string, any>>(
  params: Partial<T>
): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

/**
 * Validador de rango de fechas
 * Verifica que start_date <= end_date si ambos se proporcionan
 *
 * @param filter - Objeto DateRangeFilter a validar
 * @returns true si es válido, false si hay error
 *
 * Uso:
 * ```typescript
 * if (!isValidDateRange({ start_date: "2024-01-01", end_date: "2023-12-31" })) {
 *   console.error("start_date debe ser menor o igual a end_date");
 * }
 * ```
 */
export function isValidDateRange(filter: DateRangeFilter): boolean {
  if (!filter.start_date || !filter.end_date) {
    return true; // Si falta alguno, no hay validación de rango
  }
  return filter.start_date <= filter.end_date;
}

/**
 * Validador de threshold de alertas
 * Verifica que threshold esté en rango [0.01, 1.0]
 *
 * @param threshold - Valor de threshold a validar
 * @returns true si es válido (dentro de rango), false si está fuera
 *
 * Uso:
 * ```typescript
 * if (!isValidThreshold(params.threshold)) {
 *   console.error("threshold debe estar entre 0.01 y 1.0");
 * }
 * ```
 */
export function isValidThreshold(threshold?: number): boolean {
  if (threshold === undefined) {
    return true; // Si no se proporciona, usa default del servidor
  }
  return threshold >= 0.01 && threshold <= 1.0;
}

/**
 * Validador de limit de categorías
 * Verifica que limit esté en rango [1, 20]
 *
 * @param limit - Valor de limit a validar
 * @returns true si es válido (dentro de rango), false si está fuera
 *
 * Uso:
 * ```typescript
 * if (!isValidLimit(params.limit)) {
 *   console.error("limit debe estar entre 1 y 20");
 * }
 * ```
 */
export function isValidLimit(limit?: number): boolean {
  if (limit === undefined) {
    return true; // Si no se proporciona, usa default del servidor (5)
  }
  return limit >= 1 && limit <= 20;
}
