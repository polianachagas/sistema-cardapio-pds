# 🍽️ Sistema de Cardápio Digital

Um sistema completo de cardápio digital para restaurantes, construído com React, TypeScript e Firebase, incluindo API backend robusta e interface moderna.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O Sistema de Cardápio Digital é uma solução completa para restaurantes que desejam modernizar a experiência de seus clientes com cardápios digitais interativos, gerenciamento de pedidos em tempo real e administração de produtos.

### 🎨 Frontend (React + TypeScript)
- Interface moderna e responsiva
- Cardápio interativo com categorias
- Carrinho de compras dinâmico
- Geração de QR codes para mesas
- Dashboard administrativo

### 🚀 Backend (Node.js + Express + TypeScript)
- API REST completa
- Integração com Firebase (Firestore + Storage)
- Arquitetura orientada a objetos
- Upload de imagens
- Validação robusta de dados

## ✨ Funcionalidades

### 👥 Para Clientes
- [x] Visualização do cardápio por categorias
- [x] Busca de produtos
- [x] Adicionar itens ao carrinho
- [x] Personalização de produtos com opções
- [x] Finalização de pedidos
- [x] Acesso via QR Code da mesa

### 🏪 Para Restaurantes
- [x] Gerenciamento de produtos
- [x] Controle de categorias
- [x] Upload de imagens dos produtos
- [x] Gestão de pedidos em tempo real
- [x] Controle de mesas
- [x] Dashboard com métricas
- [x] Sistema de cupons de desconto

### 🔧 Técnicas
- [x] API REST completa
- [x] Validação de dados com Zod
- [x] Upload de arquivos
- [x] Tratamento de erros robusto
- [x] Middleware de segurança
- [x] Rate limiting
- [x] Logs estruturados

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca para interfaces
- **TypeScript** - Linguagem com tipagem estática
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI modernos
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **React Query** - Gerenciamento de dados server-state
- **Firebase SDK** - Integração com Firebase

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Linguagem com tipagem estática
- **Firebase Admin SDK** - Backend Firebase
- **Zod** - Validação de esquemas
- **Multer** - Upload de arquivos
- **Helmet** - Middleware de segurança
- **CORS** - Cross-origin resource sharing

### Banco de Dados & Storage
- **Firebase Firestore** - Banco NoSQL em tempo real
- **Firebase Cloud Storage** - Armazenamento de arquivos
- **Firebase Authentication** - Autenticação (opcional)

## 📁 Estrutura do Projeto

```
cardapio-digital/
├── src/                          # Frontend React
│   ├── components/               # Componentes reutilizáveis
│   ├── pages/                    # Páginas da aplicação
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilitários e configurações
│   │   ├── firebase.ts           # Configuração Firebase
│   │   ├── firebase-service.ts   # Serviços Firebase
│   │   ├── types.ts              # Tipos TypeScript
│   │   └── utils.ts              # Funções utilitárias
│   └── assets/                   # Imagens e recursos estáticos
│
├── server/                       # Backend API
│   ├── src/
│   │   ├── config/               # Configurações
│   │   ├── controllers/          # Controladores HTTP
│   │   ├── middleware/           # Middlewares Express
│   │   ├── models/               # Tipos e validações
│   │   ├── routes/               # Definição de rotas
│   │   ├── services/             # Lógica de negócio
│   │   ├── app.ts                # Configuração Express
│   │   └── server.ts             # Entrada do servidor
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── public/                       # Arquivos públicos do frontend
├── package.json                  # Dependências do frontend
├── vite.config.ts               # Configuração Vite
├── tailwind.config.ts           # Configuração Tailwind
└── README.md                    # Este arquivo
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 18.0 ou superior
- npm ou yarn
- Conta Firebase com projeto configurado

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd cardapio-digital
```

### 2. Instalar dependências do Frontend
```bash
npm install
```

### 3. Instalar dependências do Backend
```bash
cd server
npm install
cd ..
```

## ⚙️ Configuração

### 1. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Ative o Storage
4. Ative Authentication (opcional)
5. Obtenha as configurações do projeto

### 2. Configurar Frontend

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Configurar Backend

1. **Baixar chave de serviço do Firebase:**
   - Vá para Firebase Console → Configurações do Projeto → Contas de Serviço
   - Clique em "Gerar nova chave privada"
   - Baixe o arquivo JSON

2. **Criar arquivo .env no diretório server:**
```bash
cd server
cp .env.example .env
```

3. **Configurar variáveis no .env:**
```env
NODE_ENV=development
PORT=3001
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"seu-projeto-id",...}
FIREBASE_STORAGE_BUCKET=seu-projeto-id.appspot.com
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 🏃‍♂️ Execução

### Ambiente de Desenvolvimento

1. **Iniciar o Backend:**
```bash
cd server
npm run dev
```
O servidor estará rodando em `http://localhost:3001`

2. **Iniciar o Frontend (em outro terminal):**
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`

### Construir para Produção

1. **Construir Frontend:**
```bash
npm run build
```

2. **Construir Backend:**
```bash
cd server
npm run build
```

3. **Iniciar em modo produção:**
```bash
# Backend
cd server
npm start

# Frontend (servir arquivos estáticos)
npm run preview
```

## 📡 API Endpoints

### Produtos
- `GET /api/v1/restaurants/:id/products` - Listar produtos
- `POST /api/v1/restaurants/:id/products` - Criar produto
- `GET /api/v1/restaurants/:id/products/:productId` - Obter produto específico
- `PUT /api/v1/restaurants/:id/products/:productId` - Atualizar produto
- `DELETE /api/v1/restaurants/:id/products/:productId` - Deletar produto
- `GET /api/v1/restaurants/:id/products/categories` - Listar categorias
- `POST /api/v1/restaurants/:id/products/:productId/image` - Upload imagem

### Pedidos
- `GET /api/v1/restaurants/:id/orders` - Listar pedidos
- `POST /api/v1/restaurants/:id/orders` - Criar pedido
- `PATCH /api/v1/restaurants/:id/orders/:orderId/status` - Atualizar status

### Upload
- `POST /api/v1/restaurants/:id/upload/image` - Upload genérico

### Verificação
- `GET /api/v1/health` - Status da API

## 🌐 Deploy

### Frontend (Vercel/Netlify)
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Deploy automático

### Backend (Railway/Heroku/Render)
1. Conecte seu repositório
2. Configure as variáveis de ambiente
3. Configure o comando de build: `cd server && npm run build`
4. Configure o comando de start: `cd server && npm start`

### Docker (Opcional)

**Frontend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

**Backend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testes

Para testar a aplicação:

1. **Verificar API:**
```bash
curl http://localhost:3001/api/v1/health
```

2. **Criar produto de teste:**
```bash
curl -X POST http://localhost:3001/api/v1/restaurants/test-restaurant/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hambúrguer Artesanal",
    "description": "Hambúrguer com carne 180g, queijo, alface e tomate",
    "category": "Lanches",
    "price": 2500,
    "available": true
  }'
```

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript em todos os arquivos
- Siga as configurações do ESLint
- Mantenha cobertura de testes
- Documente APIs e componentes complexos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

Feito com ❤️ por Gabriel Nogueira - Sistema de Cardápio Digital
