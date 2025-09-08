# Servidor de API do Cardápio Digital

API backend para o Sistema de Cardápio Digital construído com Node.js, Express, TypeScript e Firebase.

## Funcionalidades

- 🔥 Integração com Firebase Admin SDK
- 📦 Arquitetura orientada a objetos com repositories
- ✅ Validação de entrada com Zod
- 🖼️ Upload de arquivos com Firebase Storage
- 🔐 Middleware de segurança (Helmet, CORS, etc.)
- 📊 Verificações de saúde e monitoramento
- 🚀 TypeScript com recursos ES modernos
- 📝 Tratamento de erros abrangente

## Stack Tecnológica

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: Firebase Firestore
- **Armazenamento**: Firebase Cloud Storage
- **Validação**: Zod
- **Upload de Arquivos**: Multer

## Estrutura do Projeto

```
server/
├── src/
│   ├── config/          # Arquivos de configuração
│   ├── controllers/     # Controladores de rotas
│   ├── middleware/      # Middleware do Express
│   ├── models/          # Tipos TypeScript e schemas Zod
│   ├── routes/          # Rotas do Express
│   ├── services/        # Lógica de negócio e repositories
│   ├── app.ts           # Configuração da aplicação Express
│   └── server.ts        # Ponto de entrada do servidor
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Pré-requisitos

- Node.js 18.0+
- npm ou yarn
- Projeto Firebase com Firestore e Storage habilitados

## Instalação

1. **Instalar dependências:**
```bash
cd server
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com sua configuração:

```env
# Ambiente
NODE_ENV=development
PORT=3001

# Configuração Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"seu-project-id",...}
FIREBASE_STORAGE_BUCKET=seu-project-id.appspot.com

# Configuração CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

3. **Configuração do Firebase:**

Baixe sua chave de conta de serviço do Firebase:
- Vá para Firebase Console → Configurações do Projeto → Contas de Serviço
- Clique em "Gerar nova chave privada"
- Copie o conteúdo JSON para `FIREBASE_SERVICE_ACCOUNT_KEY` como uma única linha

## Desenvolvimento

### Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

### Construir para produção:
```bash
npm run build
```

### Iniciar servidor de produção:
```bash
npm start
```

### Verificação de tipos:
```bash
npm run type-check
```

## Endpoints da API

### Verificação de Saúde
- `GET /api/v1/health` - Status de saúde da API

### Produtos
- `GET /api/v1/restaurants/:id/products` - Listar produtos
- `POST /api/v1/restaurants/:id/products` - Criar produto
- `GET /api/v1/restaurants/:id/products/:productId` - Obter produto
- `PUT /api/v1/restaurants/:id/products/:productId` - Atualizar produto
- `DELETE /api/v1/restaurants/:id/products/:productId` - Deletar produto
- `GET /api/v1/restaurants/:id/products/categories` - Obter categorias
- `POST /api/v1/restaurants/:id/products/:productId/image` - Upload de imagem

### Pedidos
- `GET /api/v1/restaurants/:id/orders` - Listar pedidos
- `POST /api/v1/restaurants/:id/orders` - Criar pedido
- `PATCH /api/v1/restaurants/:id/orders/:orderId/status` - Atualizar status

### Upload
- `POST /api/v1/restaurants/:id/upload/image` - Upload de imagem

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `NODE_ENV` | Ambiente (development/production) | Sim |
| `PORT` | Porta do servidor | Não (padrão: 3001) |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase | Sim |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON da conta de serviço Firebase | Sim |
| `FIREBASE_STORAGE_BUCKET` | Nome do bucket de armazenamento | Não |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS | Não |
| `MAX_FILE_SIZE_MB` | Tamanho máximo de upload em MB | Não (padrão: 10) |

## Esquema do Banco de Dados

A API usa Firebase Firestore com a seguinte estrutura de coleções:

```
restaurants/{restaurantId}/
├── products/           # Documentos de produtos
├── orders/            # Documentos de pedidos  
├── tables/            # Documentos de mesas
├── coupons/           # Documentos de cupons
└── settings/          # Documentos de configurações
```

## Upload de Arquivos

Arquivos são enviados para o Firebase Cloud Storage com a estrutura:
```
restaurants/{restaurantId}/
├── products/          # Imagens de produtos
├── logos/             # Logos de restaurantes
└── qrcodes/           # Códigos QR
```

## Tratamento de Erros

A API retorna respostas de erro consistentes:

```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "code": "CODIGO_ERRO",
    "details": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Recursos de Segurança

- Helmet.js para cabeçalhos de segurança
- Configuração CORS
- Sanitização de entrada
- Validação de upload de arquivos
- Limites de tamanho de requisição
- Rate limiting (configurável)

## Deploy em Produção

1. **Construir a aplicação:**
```bash
npm run build
```

2. **Definir variáveis de ambiente:**
```bash
export NODE_ENV=production
export FIREBASE_PROJECT_ID=seu-project-id
# ... outras variáveis
```

3. **Iniciar o servidor:**
```bash
npm start
```

## Docker (Opcional)

Crie um `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## Testes

Para testar a API, você pode usar curl ou qualquer cliente HTTP:

```bash
# Verificação de saúde
curl http://localhost:3001/api/v1/health

# Criar um produto
curl -X POST http://localhost:3001/api/v1/restaurants/test-restaurant/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Produto Teste","description":"Teste","category":"Comida","price":1000}'
```

## Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua funcionalidade
3. Faça suas alterações
4. Teste completamente
5. Submeta um pull request

## Licença

Licença MIT - veja o arquivo LICENSE para detalhes
