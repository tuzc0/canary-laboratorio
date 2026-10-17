# Laboratorio Canary Release: Nginx + Docker Compose

## Requisitos
- VM Vagrant con Docker Engine y Docker Compose plugin, acceso a Internet para obtener imagenes.
- `curl`, Bash; puerto 8080 disponible en la VM.
- Desde el host Windows usar la IP de la VM o configurar `forwarded_port` en Vagrant.

## Inicio
```bash
cd canary_lab
cp .env.example .env
# Opcional: export HOST_PORT=8080
node --test test/*.test.js  # si Node 22 esta instalado en el host; en GitHub Actions se ejecuta automaticamente

docker compose up -d --build
docker compose ps
curl -s http://localhost:8080/api/info
```

## Etapas de despliegue
```bash
./scripts/promote.sh blue       # 100% v1
./scripts/promote.sh canary10   # aprox. 90% v1, 10% v2
./scripts/sample.sh 100
./scripts/promote.sh canary50   # aprox. 50/50
./scripts/sample.sh 100
./scripts/promote.sh green      # 100% v2
./scripts/promote.sh blue       # rollback
```

## Incidente simulado (la salud sigue OK)
```bash
GREEN_FAIL=true docker compose up -d --force-recreate green
./scripts/promote.sh canary10
./scripts/check-checkout.sh 50
./scripts/promote.sh blue
./scripts/check-checkout.sh 20
```
`/health` seguira respondiendo 200 para v2, pero `/api/checkout` de v2 responde 503. Esta es la razon de monitorear metricas funcionales, no solo health checks.

Para restaurar Green:
```bash
GREEN_FAIL=false docker compose up -d --force-recreate green
```

## Comandos de diagnostico
```bash
docker compose exec -T proxy nginx -t
docker compose exec -T proxy nginx -s reload
docker compose logs --tail=50 proxy
docker compose ps
docker compose down
```

## Nota tecnica
La distribucion 90/10 es aproximada para peticiones HTTP; no segmenta usuarios. La configuracion `Connection: close` y `curl --no-keepalive` hacen mas visible la demostracion. No es un sistema listo para produccion: faltan TLS, monitoreo real, afinidad, limites, manejo de conexiones largas, estrategia de bases de datos y controles de acceso. `nginx/active.conf` es un archivo montado por bind: el script modifica su contenido en el mismo archivo y recarga Nginx; no se sustituye por `mv`.

## GitHub Actions
El workflow `.github/workflows/canary-ci.yml` ejecuta pruebas y el laboratorio en un runner temporal de GitHub. **No despliega automaticamente a la VM Vagrant**: los runners hospedados por GitHub normalmente no tienen conectividad con una VM privada local. Para CD remoto se necesita una ruta segura de red, autenticacion y aprobaciones de ambiente; no se deben abrir puertos SSH indiscriminadamente.
