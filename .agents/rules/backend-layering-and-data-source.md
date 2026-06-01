# Name
backend-layering-and-data-source

# Scope
- backend/app/main.py
- backend/app/routes.py
- Cualquier archivo nuevo en backend/app/**/*.py

# Rationale
La API actual mezcla capa HTTP con generación de datos mock en handlers. Esto aumenta el acoplamiento, dificulta cambiar a base de datos real y complica pruebas por capas.

# Guidelines
## Do
- Crear una capa de servicio en backend/app/services/ para lógica de negocio y acceso a datos.
- Mantener los handlers FastAPI como orquestadores: validar input, llamar servicio, retornar respuesta.
- Inyectar dependencias de datos por función o constructor (repositorio/adapter).

## Do Not
- No llamar generate_mock_movements ni queries directas desde funciones decoradas con @router.get/@router.post.
- No duplicar la misma obtención de datos en múltiples endpoints.

## Validation Checklist
- Cada endpoint en routes.py contiene como maximo: parseo Query + llamada a servicio + return.
- La logica de agregacion, filtros y comparaciones vive fuera de routes.py.
- No existe random/data generation en handlers HTTP.
