# Script para resetar PostgreSQL e Redis
Write-Host "Resetando bancos de dados..." -ForegroundColor Cyan

# Navegar para a pasta server
cd server

# Parar os containers
Write-Host "`nParando containers..." -ForegroundColor Yellow
docker compose down

# Remover volumes de dados
Write-Host "`nRemovendo volumes de dados (PostgreSQL e Redis)..." -ForegroundColor Yellow
docker volume rm server_postgres_data server_redis_data 2>$null

Write-Host "Volumes removidos" -ForegroundColor Green

# Reiniciar os containers
Write-Host "`nIniciando containers com volumes limpos..." -ForegroundColor Yellow
docker compose up -d

# Aguardar os containers ficarem prontos
Write-Host "`nAguardando containers ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Executar push do Prisma para sincronizar schema
Write-Host "`nSincronizando schema do Prisma..." -ForegroundColor Yellow
docker compose exec -T app npm run db:push

Write-Host "`nBancos de dados resetados com sucesso!" -ForegroundColor Green
