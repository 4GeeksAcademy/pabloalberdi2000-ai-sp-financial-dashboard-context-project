# Informe Técnico Fase 2: Auditoría de Prácticas de Ingeniería

## Alcance revisado
Revisión basada en evidencia de frontend y backend, incluyendo:

- [frontend/src/App.tsx](frontend/src/App.tsx)
- [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts)
- [frontend/src/components/dashboard/kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx)
- [frontend/src/components/ui/skeleton.tsx](frontend/src/components/ui/skeleton.tsx)
- [frontend/eslint.config.js](frontend/eslint.config.js)
- [backend/app/main.py](backend/app/main.py)
- [backend/app/routes.py](backend/app/routes.py)
- [backend/tests/test_routes.py](backend/tests/test_routes.py)

---

## 1) Análisis de Prácticas de Ingeniería

### Buenas prácticas detectadas

1. Arquitectura modular en frontend con componentes de presentación reutilizables y separados por responsabilidad en [frontend/src/components/dashboard/kpi-card.tsx](frontend/src/components/dashboard/kpi-card.tsx) y [frontend/src/components/ui/card.tsx](frontend/src/components/ui/card.tsx).
2. Lógica de negocio desacoplada de la UI en funciones puras (`computeKPIs`, `computeMonthlyData`) en [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
3. Tipado explícito de dominio en backend mediante `Literal` y modelos Pydantic (`FinancialMovement`, `MetricsSummaryItem`, etc.) en [backend/app/routes.py](backend/app/routes.py#L10).
4. Cobertura backend sólida sobre casos funcionales clave (filtros, facets, summary, comparison, alerts, segmentación B2B/B2C) en [backend/tests/test_routes.py](backend/tests/test_routes.py).
5. Pruebas unitarias de utilidades frontend para cálculos y formato en [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts).
6. Base de DX correcta con linting moderno (ESLint + TypeScript + React Hooks) en [frontend/eslint.config.js](frontend/eslint.config.js).
7. Manejo explícito de estado de carga/error en UI y uso de skeletons reutilizables en [frontend/src/App.tsx](frontend/src/App.tsx#L24) y [frontend/src/components/ui/skeleton.tsx](frontend/src/components/ui/skeleton.tsx).

### Malas prácticas, antipatrones o riesgos

1. CORS abierto globalmente (`allow_origins=["*"]`, métodos/headers universales) en [backend/app/main.py](backend/app/main.py#L8), riesgo de exposición innecesaria fuera de entorno local.
2. Acoplamiento de capa HTTP con generación de datos mock dentro de handlers (`generate_mock_movements(seed=42)` repetido en endpoints) en [backend/app/routes.py](backend/app/routes.py#L250).
3. Falta de tests de integración frontend del flujo asíncrono de App (loading/success/error), pese a existir tests de utilidades, en [frontend/src/App.tsx](frontend/src/App.tsx).
4. Falta de documentación de intención (docstrings/comentarios útiles) en funciones de negocio no triviales de [backend/app/routes.py](backend/app/routes.py) y [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts).
5. Hardcode de periodo en cabecera (`"2024 - Full Year"`) en [frontend/src/App.tsx](frontend/src/App.tsx#L48), reduciendo flexibilidad y trazabilidad.
6. Mezcla de idioma en UI (labels en inglés y error en español) en [frontend/src/App.tsx](frontend/src/App.tsx#L35), afectando consistencia del producto.
7. No existe cliente API centralizado para manejo homogéneo de errores/reintentos; fetch directo en App en [frontend/src/App.tsx](frontend/src/App.tsx#L15).

---

## 2) Clasificación y Agrupación por Categorías

### Arquitectura

#### Buenas
1. Separación de responsabilidades en frontend: UI base (`Card`, `Skeleton`) y componentes de dashboard en capas distintas.
2. Backend con utilidades de dominio reutilizables (`filter_movements`, `summarize_movements`, `build_top_categories`) separadas de la definición de rutas.

#### Riesgos
1. CORS demasiado permisivo para entornos no controlados.
2. Dependencia directa de datos mock en cada endpoint (sin servicio/repositorio intermedio).

### Naming (Nomenclatura)

#### Buenas
1. Nombres expresivos y orientados al dominio (`MetricsComparison`, `detect_outcome_alerts`, `computeMonthlyData`).
2. Convenciones consistentes de TypeScript y Python en nombres de funciones y tipos.

#### Riesgos
1. Inconsistencia lingüística en texto de interfaz (ES/EN).
2. Falta de guía explícita sobre convenciones de idioma de producto y API.

### Testing

#### Buenas
1. Buen set de tests backend orientado a comportamiento observable por endpoint.
2. Tests frontend de utilidades que validan cálculos y formatos clave.

#### Riesgos
1. Ausencia de pruebas de integración de componentes para flujos de fetch/error.
2. Cobertura no visible para casos borde de fechas inválidas (p. ej., `start_date > end_date`) en comparación.

### Documentación

#### Buenas
1. Tipado fuerte (Pydantic + TypeScript) ayuda como documentación viva del contrato.
2. FastAPI aporta documentación automática de endpoints y modelos.

#### Riesgos
1. Pocos comentarios explicativos de decisiones de negocio (ej. umbrales, baseline en alertas).
2. Sin documentación breve de supuestos de cálculo en utilidades de frontend.

### DX (Developer Experience)

#### Buenas
1. Configuración de linting clara y moderna.
2. Utilidad `cn` y primitives UI favorecen consistencia visual y mantenibilidad.

#### Riesgos
1. Fetch y manejo de error no centralizados.
2. Valores de UI importantes hardcodeados en componente raíz.

---

## 3) Set de Reglas Propuestas (Guía de Estilo y Mitigación)

1. **Regla de capas backend**: los handlers solo orquestan; acceso/generación de datos debe estar en servicio/repositorio.
2. **Regla de CORS por entorno**: prohibir wildcard en producción; cargar orígenes permitidos desde configuración.
3. **Regla de cliente API frontend**: toda llamada HTTP debe pasar por un módulo de infraestructura con timeout, parsing de errores y tipado.
4. **Regla de i18n/naming de producto**: un único idioma por interfaz; definir glosario financiero para labels y mensajes.
5. **Regla de pruebas de flujo async**: cualquier flujo visible en UI debe cubrir loading/success/error en tests de integración.
6. **Regla de pruebas de borde backend**: cubrir inputs inválidos y límites de query params (fechas invertidas, vacíos, límites máximos).
7. **Regla de documentación mínima**: cada función de negocio no trivial debe tener docstring corta con propósito y supuestos.
8. **Regla de contratos compartidos**: derivar tipos frontend desde OpenAPI o validar esquemas en CI para evitar deriva de contratos.
9. **Regla de configuración de UI**: evitar hardcodes de período/feature flags en componentes raíz; usar estado derivado o configuración.
10. **Regla de determinismo en tests**: evitar mutación global de `random`; preferir inyección de generador pseudoaleatorio por contexto de prueba.

---

## Evidencias (Snippets)

### Seguridad/CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Fuente: [backend/app/main.py](backend/app/main.py#L6)

### Acoplamiento de fetch en App

```tsx
async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}
```

Fuente: [frontend/src/App.tsx](frontend/src/App.tsx#L15)

---

## Resumen Ejecutivo

El proyecto presenta una base sólida para evolución: modularidad razonable, tipado fuerte y una cobertura backend útil. Los principales riesgos técnicos se concentran en seguridad/configuración (CORS), acoplamiento de la API a datos mock y ausencia de pruebas de integración frontend para flujos asíncronos. Aplicando el set de reglas propuesto, la codebase puede avanzar rápidamente hacia un estándar más robusto y escalable de ingeniería.
