# Name
cors-and-environment-security

# Scope
- backend/app/main.py
- backend/app/**/*.py relacionado a configuracion
- docker-compose.yml (si define variables de entorno)

# Rationale
CORS en wildcard es util en desarrollo local, pero en produccion expone la API a origenes no autorizados. Se requiere politica por entorno para reducir riesgo.

# Guidelines
## Do
- Definir ALLOWED_ORIGINS por entorno (dev, staging, prod).
- Permitir wildcard solo en desarrollo local explicito.
- Documentar defaults de seguridad en README.

## Do Not
- No usar allow_origins=["*"] en configuraciones de produccion.
- No combinar allow_credentials=True con origen wildcard fuera de local.

## Validation Checklist
- Existe lectura de ALLOWED_ORIGINS desde entorno o config.
- En prod, allow_origins contiene lista explicita de dominios.
- Se documenta comportamiento CORS por entorno.
