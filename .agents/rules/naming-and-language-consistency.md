# Name
naming-and-language-consistency

# Scope
- frontend/src/**/*
- backend/app/**/*
- README.md y README.es.md para mensajes de producto

# Rationale
El codigo es legible, pero hay mezcla de idioma en textos de UI. Definir convencion unica evita friccion en UX, QA y mantenimiento.

# Guidelines
## Do
- Mantener nombres tecnicos en ingles para codigo (variables, funciones, tipos).
- Definir idioma objetivo de UI por build: ES o EN, no mixto en una misma pantalla.
- Usar naming semantico de dominio (income, outcome, profit, margin).

## Do Not
- No mezclar labels en ingles con mensajes de error en espanol dentro del mismo flujo de UI.
- No usar abreviaturas ambiguas (tmp, val, data2) en logica de negocio.

## Validation Checklist
- Componentes de una misma vista tienen copy en un solo idioma.
- Nombres de funciones expresan accion + dominio.
- No existen abreviaturas opacas en codigo nuevo.
