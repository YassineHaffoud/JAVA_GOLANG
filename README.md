# Microservice ToDo

Un micro-service **Node.js/Express** avec :

- Base de données **SQLite** (fichier `data/todo.db`)
- **Redis** pour cache et idempotence
- **Observabilité** via OpenTelemetry & Prometheus/Grafana
- **Rate-limit**, **compression**, **validation JSON** (AJV)
- Tests de performance avec **k6**

---

## Table des matières

1. [Prérequis](#prérequis)  
2. [Installation & usage local](#installation--usage-local)  
3. [Docker Compose (stack complète)](#docker-compose-stack-complète)  
4. [Mode cluster avec PM2](#mode-cluster-avec-pm2)  
5. [Endpoints de l’API](#endpoints-de-lapi)  
6. [Observabilité & métriques](#observabilité--métriques)  
7. [Tests de charge k6](#tests-de-charge-k6)  
8. [Tests d’idempotence](#tests-didempotence)  
9. [Tests unitaires & intégration](#tests-unitaires--intégration)  
10. [Dépannage](#dépannage)  

---

## Prérequis

- **Node.js** v18+
- **npm**
- **Docker** & **docker-compose** (version 3.8+)
- (Optionnel) **Chocolatey** ou autre pour installer k6 en local

---

## Installation & usage local

1. Clonez ce dépôt et placez-vous dans le dossier :

```bash
git clone <url-du-repo>
cd microservice-todo
```

2. Installez les dépendances :

```bash
npm install
```

3. Démarrez en mode développement (avec nodemon) :

```bash
npm run dev
```

4. Vérifiez le health-check :

```bash
# PowerShell
Invoke-RestMethod http://localhost:3000/health

# Bash
curl -i http://localhost:3000/health
```

---

## Docker Compose (stack complète)

Tout en un : Node.js, SQLite, Redis, Prometheus, Grafana

### Construisez et démarrez :

```bash
docker-compose up --build -d
```

### Vérifiez que tous les services sont Up :

```bash
docker-compose ps
```

- redis → port 6379  
- todo-service → port 3000  
- prometheus → port 9090  
- grafana → port 3001  

### Arrêter et nettoyer :

```bash
docker-compose down
```

---

## Mode cluster avec PM2

Pour exploiter tous les cœurs CPU :

1. Installez PM2 globalement (hors conteneur) :

```bash
npm install -g pm2
```

2. Démarrez en cluster :

```bash
pm2 start ecosystem.config.js
pm2 list
```

3. Supervisez et logs :

```bash
pm2 monit       # dashboard CPU / mémoire
pm2 logs        # logs JSON Winston
```

---

## Endpoints de l’API

| Méthode | URL           | Description                        |
|--------|----------------|------------------------------------|
| GET    | /health        | Vérifie que le service est opérationnel |
| GET    | /todos         | Liste toutes les tâches            |
| GET    | /todos/:id     | Récupère une tâche par son ID      |
| POST   | /todos         | Crée une nouvelle tâche            |
| PUT    | /todos/:id     | Met à jour title/completed         |
| DELETE | /todos/:id     | Supprime une tâche                 |

**Validation JSON (AJV)** :

- POST → `title` (string) requis
- PUT → `title` (string) et/ou `completed` (boolean)

---

## Observabilité & métriques

### 1. Metrics prom-client (port 3000)

Exemples :

- `process_cpu_user_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_eventloop_lag_seconds`
- `http_request_duration_seconds_bucket|_sum|_count`

```bash
curl -s http://localhost:3000/metrics | head -n 20
```

### 2. Metrics OpenTelemetry (port 9464)

```bash
curl -s http://localhost:9464/metrics | head -n 10
```

### 3. Prometheus

**Fichier `prometheus.yml`** :

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'todo-otel'
    static_configs:
      - targets: ['todo-service:9464']
  
  - job_name: 'todo-promclient'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['todo-service:3000']
```

Relancez Prometheus :

```bash
docker-compose restart prometheus
```

### 4. Grafana

- URL : http://localhost:3001 (admin/admin)
- Data source : Prometheus → `http://prometheus:9090`
- Dashboard : ToDo Service (latence p50/p95/p99, débit, CPU, mémoire)

---

## Tests de charge k6

### a) Via Docker Compose

Ajoutez dans `docker-compose.yml` :

```yaml
k6:
  image: grafana/k6:latest
  depends_on: [todo-service]
  volumes:
    - ./k6:/scripts:ro
  entrypoint: ["k6", "run", "/scripts/load-test.js"]
```

Puis :

```bash
docker-compose run --rm k6
```

### b) Script k6 exemple (`k6/load-test.js`)

```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  },
};

export default function () {
  let res = http.get('http://todo-service:3000/todos');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

## Tests d’idempotence

Choisissez une clé, ex. `Idempotency-Key: test-12345`

Exécutez deux fois :

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-12345" \
  -d '{"title":"Tâche idem"}'
```

Vérifiez qu’il n’y a qu’un seul enregistrement et le même ID.

---

## Tests unitaires & intégration

Aucun test présent par défaut → à compléter

```bash
npm test
```

---

## Dépannage

- **500 sur /metrics** → vérifiez que votre endpoint expose bien `prom-client.register.metrics()`
- **No data in Grafana** :
  - Data source OK (Save & Test)
  - Explore > `rate(http_request_duration_seconds_count[1m])`
- **Targets DOWN** → contrôlez les noms de service Docker (`todo-service:3000` / `todo-service:9464`)
