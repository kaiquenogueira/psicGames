# Use uma imagem base com Node.js e Python
FROM node:18-bullseye

# Instalar Python e pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY requirements.txt ./

# Instalar dependências Node.js (incluindo devDependencies para o build)
RUN npm ci

# Criar ambiente virtual Python e instalar dependências
RUN python3 -m venv .venv
RUN .venv/bin/pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Expor porta
EXPOSE 5050

# Definir variáveis de ambiente
ENV PORT=5050
ENV PYTHONPATH=/app

# Comando para iniciar a aplicação
CMD [".venv/bin/python", "main.py"]