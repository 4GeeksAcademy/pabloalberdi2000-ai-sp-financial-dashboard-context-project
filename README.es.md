# Panel de Métricas Financieras

_Esta documentación también está disponible en inglés en [README.md](README.md)._

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Inicio técnico rápido

### Prerrequisitos

- Docker y Docker Compose

### Ejecución local

```bash
docker compose up --build
```

Servicios:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Detener servicios

```bash
docker compose down
```

## Estructura del proyecto

```text
backend/
   app/
   tests/
frontend/
   src/
   public/
.agents/rules/
memory-bank/
docker-compose.yml
```

## Flujo de trabajo

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Valida el comportamiento de backend y frontend en local.
4. Aplica las reglas de gobernanza en `.agents/rules/` para cualquier cambio.
5. Actualiza el contenido de `memory-bank/` cuando cambie arquitectura o comportamiento.

## Reglas del agente y memoria técnica

- Índice de reglas: [.agents/rules/README.md](.agents/rules/README.md)
- Contexto de producto: [memory-bank/productContext.md](memory-bank/productContext.md)
- Contexto tecnológico: [memory-bank/techContext.md](memory-bank/techContext.md)
- Estado del sistema: [memory-bank/systemStatus.md](memory-bank/systemStatus.md)

## Estructura esperada del directorio para agentes

```text
./.agents
└─ /rules
   └─ <nombre-regla>.md
└─ /skills
   └─ /<nombre-skill>
      └─ /SKILL.md
```

El frontend usa por defecto el proxy de Vite para `/api`, así que no necesitas variables de entorno extra ni en desarrollo local ni en Codespaces.
Si necesitas apuntar a otro backend, copia `frontend/.env.example` como `.env` y define `VITE_API_BASE_URL`.

---

Los créditos del proyecto y la lista de contribuidores están disponibles en el historial y en los insights del repositorio.
