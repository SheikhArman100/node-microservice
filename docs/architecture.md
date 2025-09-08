# Microservices Architecture Documentation

## 🏗️ System Architecture

### High-Level Architecture
```
Client Applications (Web, Mobile, API)
            ↓
      API Gateway (Port 3000)
            ↓
┌─────────────────────────────────────────────────────────┐
│                   Microservices                         │
├─────────────┬─────────────┬─────────────────────────────┤
│ User Service│Product      │Order Service                │
│ Port 3001   │Service      │Port 3003                    │
│ gRPC 50053  │Port 3002    │gRPC 50052                   │
│             │gRPC 50051   │                             │
└─────────────┴─────────────┴─────────────────────────────┘
            ↓
    Event Bus (RabbitMQ)
```

### Service Responsibilities

| Service | Primary Function | Database | Key Features |
|---------|------------------|----------|--------------|
| **API Gateway** | Request routing, Authentication, Rate limiting | None | JWT validation, Service orchestration |
| **User Service** | User management, Authentication | MySQL (Prisma) | User CRUD, JWT creation, Address management |
| **Product Service** | Product catalog, Inventory | MongoDB (Mongoose) | Product CRUD, Stock management, Pricing |
| **Order Service** | Order processing, Order management | PostgreSQL (Prisma) | Order creation, Status tracking, Order history |

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with user context
- **Gateway Secret**: Shared secret prevents direct service access
- **Service Trust**: Internal services trust gateway-validated requests

### Security Flow
```
1. Client → Login → User Service → JWT Token
2. Client → Request + JWT → Gateway → Validates JWT
3. Gateway → Add user headers + secret → Service
4. Service → Verify secret → Process request
```

### Security Headers
```javascript
// Gateway to Service Headers
x-gateway-secret: "shared-secret-key"
x-user-id: "user-uuid"
x-user-email: "user@example.com"
x-user-role: "user|admin"
```

## 📡 Communication Patterns

### Synchronous Communication (gRPC)
**Purpose**: Real-time operations requiring immediate response

**Use Cases**:
- Order → User (user validation and details)
- Order → Product (inventory check, reservation)

**Protocol**: gRPC with Protocol Buffers
**Benefits**: Type-safe, Fast, Streaming support

### Asynchronous Communication (RabbitMQ)
**Purpose**: Fire-and-forget operations, Event-driven updates

**Use Cases**:
- Order created → Send confirmation notifications
- User registered → Welcome notifications
- Product low stock → Admin alerts

**Protocol**: AMQP with Topic Exchange
**Benefits**: Reliable delivery, Decoupling, Scalability

### Communication Matrix

| From Service | To Service | Method | Purpose |
|-------------|------------|--------|---------|
| Gateway | User | HTTP/REST | User login, registration |
| Gateway | Product | HTTP/REST | Product catalog browsing |
| Gateway | Order | HTTP/REST | Order creation, status |
| Order | User | gRPC | User validation, addresses |
| Order | Product | gRPC | Inventory check, reservation |
| All Services | Event Bus | RabbitMQ | Event notifications |

## 🛠️ Technology Stack

### Backend Technologies
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 4.18+ | REST API framework |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Sync Communication** | gRPC | @grpc/grpc-js | Service-to-service calls |
| **Async Communication** | RabbitMQ | amqplib | Message queue |
| **Authentication** | JWT | jsonwebtoken | Stateless auth |

### Databases
| Service | Database | ORM/ODM | Purpose |
|---------|----------|---------|---------|
| User | MySQL | Prisma | User data, structured relationships |
| Product | MongoDB | Mongoose | Product catalog, flexible schema |
| Order | PostgreSQL | Prisma | Order records, ACID compliance |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Message Broker** | RabbitMQ 3.11+ | Async communication |
| **Container Runtime** | Docker | Service containerization |
| **Orchestration** | Docker Compose (Dev) → Kubernetes (Prod) | Service orchestration |

## 🗂️ Service Structure

### Repository Structure (Per Service)

#### User Service (TypeScript + MySQL + Prisma)
```
user-service/
├── package.json
├── tsconfig.json
├── .env
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeders/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── client.ts                # Prisma client
│   ├── config/
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   └── validateRequest.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   └── user/
│   │       ├── user.constant.ts
│   │       ├── user.controller.ts
│   │       ├── user.interface.ts
│   │       ├── user.route.ts
│   │       └── user.service.ts
│   ├── grpc/                   # gRPC server
│   │   ├── userServer.ts
│   │   └── handlers/
│   ├── helpers/
│   │   ├── jwtHelpers.ts
│   │   └── paginationHelper.ts
│   ├── shared/
│   │   ├── catchAsync.ts
│   │   └── sendResponse.ts
│   ├── errors/
│   │   └── ApiError.ts
│   └── routes/
│       └── index.ts
└── proto/
    └── user.proto
```

#### Product Service (TypeScript + MongoDB + Mongoose)
```
product-service/
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── index.ts
│   ├── app/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules/
│   │   │   └── product/
│   │   │       ├── product.constant.ts
│   │   │       ├── product.controller.ts
│   │   │       ├── product.interface.ts
│   │   │       ├── product.model.ts
│   │   │       ├── product.route.ts
│   │   │       ├── product.service.ts
│   │   │       └── product.validation.ts
│   │   └── routes/
│   │       └── index.ts
│   ├── grpc/                   # gRPC server
│   │   ├── productServer.ts
│   │   └── handlers/
│   ├── helpers/
│   │   ├── paginationHelper.ts
│   │   └── pick.ts
│   ├── shared/
│   │   ├── catchAsync.ts
│   │   └── sendResponse.ts
│   ├── errors/
│   │   └── ApiError.ts
│   └── constant/
│       └── index.ts
└── proto/
    └── product.proto
```

#### Order Service (TypeScript + PostgreSQL + Prisma)
```
order-service/
├── package.json
├── tsconfig.json
├── .env
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeders/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── client.ts                # Prisma client
│   ├── config/
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   └── validateRequest.ts
│   ├── modules/
│   │   └── order/
│   │       ├── order.controller.ts
│   │       ├── order.interface.ts
│   │       ├── order.route.ts
│   │       ├── order.service.ts
│   │       └── order.validation.ts
│   ├── grpc/                   # gRPC server + clients
│   │   ├── orderServer.ts
│   │   ├── clients/            # gRPC clients to other services
│   │   │   ├── userClient.ts
│   │   │   └── productClient.ts
│   │   └── handlers/
│   ├── helpers/
│   │   ├── paginationHelper.ts
│   │   └── pick.ts
│   ├── shared/
│   │   ├── catchAsync.ts
│   │   └── sendResponse.ts
│   ├── errors/
│   │   └── ApiError.ts
│   └── routes/
│       └── index.ts
└── proto/
    ├── order.proto
    ├── user.proto              # For gRPC client
    └── product.proto            # For gRPC client
```

#### API Gateway (JavaScript/TypeScript)
```
api-gateway/
├── package.json
├── .env
├── src/
│   ├── server.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── services/
│   │   └── serviceProxy.js
│   └── config/
│       └── index.js
└── logs/
```

## 🔌 Port & Network Configuration

### Port Allocation
| Service | REST API | gRPC Server | Database |
|---------|----------|-------------|----------|
| API Gateway | 3000 | - | - |
| User Service | 3001 | 50053 | MySQL:3306 |
| Product Service | 3002 | 50051 | MongoDB:27017 |
| Order Service | 3003 | 50052 | PostgreSQL:5432 |
| RabbitMQ | - | - | 5672 (AMQP), 15672 (UI) |

### Environment Configuration
```bash
# Gateway
GATEWAY_PORT=3000
JWT_SECRET=your-jwt-secret
GATEWAY_SECRET=your-gateway-secret

# Services
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003

# gRPC
PRODUCT_SERVICE_GRPC=localhost:50051
USER_SERVICE_GRPC=localhost:50053
ORDER_SERVICE_GRPC=localhost:50052

# Message Queue
RABBITMQ_URL=amqp://localhost:5672

# Databases
MYSQL_URI=mysql://root:password@localhost:3306/user-service
MONGODB_URI=mongodb://localhost:27017/product-service
POSTGRESQL_URI=postgresql://postgres:password@localhost:5432/order-service
```

## 📊 Data Flow Examples

### User Registration Flow
```
1. Client → Gateway: POST /auth/register
2. Gateway → User Service: POST /register
3. User Service → Database: Create user record
4. User Service → RabbitMQ: Publish 'user.registered' event
5. User Service → Gateway: Success response
6. Gateway → Client: Registration confirmation
```

### Order Creation Flow
```
1. Client → Gateway: POST /orders
2. Gateway → Validates JWT → Extracts user info
3. Gateway → Order Service: POST /orders (with user headers)
4. Order Service → User Service (gRPC): getUserDetails()
5. Order Service → Product Service (gRPC): checkInventory()
6. Order Service → Product Service (gRPC): reserveInventory()
7. Order Service → Internal Payment Processing (Mock)
8. Order Service → Product Service (gRPC): reduceInventory()
9. Order Service → Database: Save order
10. Order Service → RabbitMQ: Publish 'order.created' event
11. Order Service → Gateway: Response with order details
12. Gateway → Client: Order confirmation response
```

## 🚀 Deployment Architecture

### Development Environment
```
Docker Compose:
- All services as containers
- Local databases (MySQL, MongoDB, PostgreSQL)
- Shared network
- Volume mounts for development
```

### Production Environment (Future)
```
Kubernetes Cluster:
- Services as pods
- Managed databases (MySQL, MongoDB, PostgreSQL)
- Service mesh (Istio)
- Load balancers
- Auto-scaling
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services are stateless for easy scaling
- **Database Separation**: Each service owns its data
- **Message Queue**: RabbitMQ handles high throughput async communication
- **Load Balancing**: API Gateway distributes requests

### Performance Optimizations
- **gRPC**: Binary protocol for fast inter-service communication
- **Connection Pooling**: Database connection management for MySQL, MongoDB, PostgreSQL
- **Caching**: Redis for session and frequently accessed data (future)
- **CDN**: Static asset delivery optimization (future)

## 🔍 Monitoring & Observability

### Health Checks
```javascript
// Each service exposes
GET /health
// Response: { status: "healthy", timestamp: "..." }
```

### Logging Strategy
- **Structured Logging**: JSON format for easy parsing
- **Correlation IDs**: Track requests across services
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Centralized Logging**: Future implementation with ELK stack

### Metrics Collection
- **Application Metrics**: Request counts, response times
- **Business Metrics**: Orders created, users registered, products viewed
- **Infrastructure Metrics**: CPU, memory, network usage

## 🎯 Key Design Decisions

### ✅ **Service Independence**
- Separate repositories for each service
- Own databases (no sharing)
- Independent deployment cycles

### ✅ **Multi-Database Strategy**
- **MySQL (User Service)**: Perfect for relational user data, addresses, authentication
- **MongoDB (Product Service)**: Flexible schema for product catalogs, categories, attributes  
- **PostgreSQL (Order Service)**: ACID compliance for order transactions and data integrity

### ✅ **Hybrid Communication**
- gRPC for internal service calls (fast, type-safe)
- REST for external API (familiar, easy to debug)
- RabbitMQ for async events (reliable, scalable)

### ✅ **Security First**
- No direct service access
- Gateway handles authentication
- Services trust gateway completely

### ✅ **TypeScript Throughout**
- Type safety across all services
- Better IDE support and refactoring
- Interface contracts for clear API definitions
- Maintainable and scalable codebase

This architecture provides a solid foundation for building scalable, maintainable microservices with your preferred technology stack and established patterns.