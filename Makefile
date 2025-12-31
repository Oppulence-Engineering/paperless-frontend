.PHONY: help
help: ## Display this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

##@ Setup

.PHONY: setup
setup: ## Setup local environment (copy .env.example files)
	@echo "Setting up environment files..."
	@if [ ! -f .env ]; then \
		echo "Creating root .env file..."; \
		touch .env; \
	fi
	@if [ ! -f apps/sim/.env ]; then \
		echo "Copying apps/sim/.env.example to apps/sim/.env"; \
		cp apps/sim/.env.example apps/sim/.env; \
		echo "⚠️  Please update apps/sim/.env with your values"; \
	fi
	@if [ ! -f packages/db/.env ]; then \
		echo "Copying packages/db/.env.example to packages/db/.env"; \
		cp packages/db/.env.example packages/db/.env; \
		echo "⚠️  Please update packages/db/.env with your values"; \
	fi
	@echo "✓ Setup complete"

.PHONY: generate-secrets
generate-secrets: ## Generate secure secrets for environment variables
	@echo "Generating secure secrets..."
	@echo ""
	@echo "BETTER_AUTH_SECRET=$$(openssl rand -hex 32)"
	@echo "ENCRYPTION_KEY=$$(openssl rand -hex 32)"
	@echo "INTERNAL_API_SECRET=$$(openssl rand -hex 32)"
	@echo "API_ENCRYPTION_KEY=$$(openssl rand -hex 32)"
	@echo ""
	@echo "Copy these values to your .env files"

.PHONY: install
install: ## Install dependencies using bun
	bun install

##@ Docker Compose - Local Development

.PHONY: up
up: ## Start all services in background
	docker compose -f docker-compose.local.yml up -d

.PHONY: start
start: up ## Alias for 'up'

.PHONY: down
down: ## Stop and remove all containers
	docker compose -f docker-compose.local.yml down

.PHONY: stop
stop: down ## Alias for 'down'

.PHONY: restart
restart: ## Restart all services
	docker compose -f docker-compose.local.yml restart

.PHONY: logs
logs: ## Follow logs from all services
	docker compose -f docker-compose.local.yml logs -f

.PHONY: logs-app
logs-app: ## Follow logs from simstudio app only
	docker compose -f docker-compose.local.yml logs -f simstudio

.PHONY: logs-realtime
logs-realtime: ## Follow logs from realtime service only
	docker compose -f docker-compose.local.yml logs -f realtime

.PHONY: logs-db
logs-db: ## Follow logs from database only
	docker compose -f docker-compose.local.yml logs -f db

.PHONY: ps
ps: ## Show status of all services
	docker compose -f docker-compose.local.yml ps

##@ Database

.PHONY: db-shell
db-shell: ## Connect to PostgreSQL database shell
	docker compose -f docker-compose.local.yml exec db psql -U postgres -d simstudio

.PHONY: db-migrate
db-migrate: ## Run database migrations
	docker compose -f docker-compose.local.yml up migrations

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  WARNING: This will destroy all database data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f docker-compose.local.yml down -v; \
		docker compose -f docker-compose.local.yml up -d db; \
		sleep 5; \
		docker compose -f docker-compose.local.yml up migrations; \
		docker compose -f docker-compose.local.yml up -d; \
	fi

##@ Build & Development

.PHONY: build
build: ## Build all services
	docker compose -f docker-compose.local.yml build

.PHONY: build-nocache
build-nocache: ## Build all services without cache
	docker compose -f docker-compose.local.yml build --no-cache

.PHONY: dev
dev: ## Run development server locally (not in Docker)
	bun run dev

.PHONY: dev-full
dev-full: ## Run full development stack locally (with sockets)
	bun run dev:full

##@ Clean

.PHONY: clean
clean: down ## Stop containers and remove volumes
	docker compose -f docker-compose.local.yml down -v

.PHONY: clean-all
clean-all: clean ## Remove all containers, volumes, and images
	docker compose -f docker-compose.local.yml down -v --rmi all

.PHONY: prune
prune: ## Remove unused Docker resources (system-wide)
	docker system prune -f

##@ Lint & Format

.PHONY: lint
lint: ## Run linter
	bunx biome check --write --unsafe .

.PHONY: lint-check
lint-check: ## Check linting without fixing
	bunx biome check --unsafe .

.PHONY: format
format: ## Format code
	bunx biome format --write .

.PHONY: format-check
format-check: ## Check code formatting
	bunx biome format .

.PHONY: type-check
type-check: ## Run TypeScript type checking
	bun run type-check

##@ Testing

.PHONY: test
test: ## Run tests
	bun run test

##@ Utility

.PHONY: shell-app
shell-app: ## Open shell in simstudio container
	docker compose -f docker-compose.local.yml exec simstudio sh

.PHONY: shell-realtime
shell-realtime: ## Open shell in realtime container
	docker compose -f docker-compose.local.yml exec realtime sh

.PHONY: rebuild-app
rebuild-app: ## Rebuild and restart simstudio app only
	docker compose -f docker-compose.local.yml up -d --build simstudio

.PHONY: rebuild-realtime
rebuild-realtime: ## Rebuild and restart realtime service only
	docker compose -f docker-compose.local.yml up -d --build realtime

##@ Ollama (Optional)

.PHONY: ollama-up
ollama-up: ## Start Ollama service
	docker compose -f docker-compose.ollama.yml up -d

.PHONY: ollama-down
ollama-down: ## Stop Ollama service
	docker compose -f docker-compose.ollama.yml down

.PHONY: ollama-logs
ollama-logs: ## Follow Ollama logs
	docker compose -f docker-compose.ollama.yml logs -f
