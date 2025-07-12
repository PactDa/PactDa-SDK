# PactDa Server (NestJS + Docker + PostgreSQL)

## Overview
This project is a backend server built with [NestJS](https://nestjs.com/) using TypeORM, PostgreSQL, and Docker Compose. It also includes PgAdmin for database management.

---

## Features
- NestJS modular architecture
- TypeORM with PostgreSQL
- Docker Compose for easy setup
- PgAdmin for DB management
- Environment variable support via `.env`

---

## Getting Started (English)

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed
- [pnpm](https://pnpm.io/) (for local development)

### 2. Setup
1. Clone this repository
2. Go to the `server/` directory
3. Create a `.env` file (see example below)

#### Example `.env`
```
POSTGRES_USER=admin
POSTGRES_PASSWORD=11223344
POSTGRES_DB=Pactda_DB
PGADMIN_DEFAULT_EMAIL=admin@pactda.com
PGADMIN_DEFAULT_PASSWORD=11223344
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=11223344
DB_DATABASE=Pactda_DB
```

### 3. Start All Services
```bash
cd server
# Build and start all containers
docker-compose up -d --build
```

### 4. Access
- **API**: [http://localhost:3000](http://localhost:3000)
- **PgAdmin**: [http://localhost:8080](http://localhost:8080)
  - Login: use `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`

### 5. Stopping Services
```bash
docker-compose down
```

---

## การใช้งาน (ภาษาไทย)

### 1. เตรียมเครื่องมือ
- ติดตั้ง Docker Desktop
- ติดตั้ง pnpm (ถ้าจะรัน local)

### 2. สร้างไฟล์ `.env` ในโฟลเดอร์ server (ตัวอย่างด้านบน)

### 3. สั่งรัน
```bash
cd server
docker-compose up -d --build
```

### 4. เปิดใช้งาน
- API: [http://localhost:3000](http://localhost:3000)
- PgAdmin: [http://localhost:8080](http://localhost:8080)

### 5. หยุดบริการ
```bash
docker-compose down
```

---

## Troubleshooting
- ถ้า API 404 หรือเชื่อมต่อ DB ไม่ได้ ให้เช็คว่า `.env` ถูก mount เข้า container หรือยัง
- ถ้าแก้ไขโค้ดหรือ .env ต้อง `docker-compose down` แล้ว `docker-compose up -d --build` ใหม่
- ดู log ด้วยคำสั่ง:
  ```bash
  docker-compose logs nestjs
  ```
- ตรวจสอบสถานะ container:
  ```bash
  docker-compose ps
  ```

---

## Useful Commands
- ดู log ทั้งหมด: `docker-compose logs`
- ดู log เฉพาะ NestJS: `docker-compose logs nestjs`
- เข้า shell ใน container: `docker-compose exec nestjs sh`
- เข้า psql: `docker-compose exec postgres psql -U admin -d Pactda_DB`

---

## Project Structure
```
server/
  ├── src/
  │   ├── user/
  │   ├── credit/
  │   ├── payment/
  │   ├── apikey/
  │   ├── api/
  │   └── permission/
  ├── docker-compose.yml
  ├── Dockerfile
  ├── .env
  └── README.md
```

---

