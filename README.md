# PsicGames 🧠🎮

Uma plataforma de jogos cognitivos desenvolvida para treinamento e avaliação de habilidades mentais como atenção, memória, foco e tempo de reação.

## 🎯 Funcionalidades

- **Jogos Cognitivos**: Diversos jogos para treinar diferentes habilidades mentais
- **Modo Multiplayer**: Jogue com amigos em tempo real
- **Interface Moderna**: Design responsivo e intuitivo
- **Tempo Real**: Comunicação via WebSocket para experiência fluida

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.13+**
- **Flask** - Framework web
- **Flask-SocketIO** - Comunicação em tempo real
- **Flask-CORS** - Suporte a CORS
- **Eventlet** - Servidor assíncrono

### Frontend
- **React 18** - Interface do usuário
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Socket.IO Client** - Comunicação em tempo real
- **Lucide React** - Ícones

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.13 ou superior
- Node.js 18 ou superior
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/kaiquenogueira/psicGames.git
cd psicGames
```

### 2. Configuração do Backend (Python)

#### Criar ambiente virtual
```bash
python3 -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
```

#### Instalar dependências Python
```bash
pip install -r requirements.txt
```

### 3. Configuração do Frontend (Node.js)

#### Instalar dependências Node.js
```bash
npm install
```

### 4. Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SOCKET_URL=http://localhost:5050
```

### 5. Executar a Aplicação

#### Terminal 1 - Backend (Flask)
```bash
source .venv/bin/activate
python main.py
```
O servidor Flask estará rodando em `http://localhost:5050`

#### Terminal 2 - Frontend (React)
```bash
npm run dev
```
O frontend estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
psicGames/
├── .venv/                  # Ambiente virtual Python
├── components/             # Componentes UI reutilizáveis
│   └── ui/
├── src/                    # Código fonte React
├── main.py                 # Servidor Flask principal
├── multiplayer.py          # Lógica multiplayer e WebSocket
├── package.json            # Dependências Node.js
├── requirements.txt        # Dependências Python
├── vite.config.js         # Configuração Vite
├── tailwind.config.js     # Configuração Tailwind
└── *.jsx                  # Componentes dos jogos
```

## 🎮 Jogos Disponíveis

- **Attention Game** - Teste de atenção seletiva
- **Memory Game** - Jogo da memória clássico
- **Focus Training** - Treinamento de foco e concentração
- **Reaction Time** - Teste de tempo de reação
- **Sequence Game** - Memorização de sequências
- **Organization Game** - Organização e categorização
- **Spot Difference** - Encontre as diferenças
- **Sustained Attention** - Atenção sustentada

## 🌐 Deploy para Produção

### Usando Docker (Recomendado)

1. **Build da aplicação React**:
```bash
npm run build
```

2. **Configurar variáveis de ambiente para produção**:
```env
VITE_SOCKET_URL=https://seu-dominio.com
PORT=5050
```

3. **Executar em produção**:
```bash
source .venv/bin/activate
python main.py
```

### Deploy em Serviços Cloud

#### Heroku
1. Instale o Heroku CLI
2. Crie um `Procfile`:
```
web: python main.py
```
3. Configure as variáveis de ambiente no Heroku
4. Deploy:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Railway/Render
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. O deploy será automático

## 🔧 Configuração para Servidor

### Nginx (Opcional)
Para servir arquivos estáticos e fazer proxy reverso:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Kaique Nogueira**
- GitHub: [@kaiquenogueira](https://github.com/kaiquenogueira)

## 🐛 Reportar Bugs

Se você encontrar algum bug, por favor abra uma [issue](https://github.com/kaiquenogueira/psicGames/issues) descrevendo o problema.

## ⭐ Suporte

Se este projeto te ajudou, considere dar uma estrela no GitHub!