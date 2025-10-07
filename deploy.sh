#!/bin/bash

# Script de Deploy para PsicGames
echo "🚀 Iniciando deploy do PsicGames..."

# Verificar se estamos na branch main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  Você não está na branch main. Mudando para main..."
    git checkout main
fi

# Atualizar repositório
echo "📥 Atualizando repositório..."
git pull origin main

# Build do frontend
echo "🔨 Fazendo build do frontend..."
npm install
npm run build

# Ativar ambiente virtual Python
echo "🐍 Ativando ambiente virtual Python..."
source .venv/bin/activate

# Instalar dependências Python
echo "📦 Instalando dependências Python..."
pip install -r requirements.txt

# Verificar se o servidor está rodando
echo "🔍 Verificando servidor..."
if pgrep -f "python main.py" > /dev/null; then
    echo "⚠️  Servidor já está rodando. Parando processo anterior..."
    pkill -f "python main.py"
    sleep 2
fi

# Iniciar servidor
echo "🌟 Iniciando servidor..."
nohup python main.py > server.log 2>&1 &

# Aguardar alguns segundos para o servidor inicializar
sleep 5

# Verificar se o servidor está rodando
if pgrep -f "python main.py" > /dev/null; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Servidor rodando em http://localhost:5050"
    echo "📋 Logs disponíveis em server.log"
else
    echo "❌ Erro no deploy. Verifique os logs."
    exit 1
fi