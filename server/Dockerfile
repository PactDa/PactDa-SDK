# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy แค่ไฟล์ที่ใช้ติดตั้ง dependency
COPY package.json pnpm-lock.yaml ./

# ติดตั้ง pnpm (ถ้ายังไม่มี)
RUN npm install -g pnpm

# ติดตั้ง dependencies
RUN pnpm install --frozen-lockfile

# Copy source code ที่เหลือ (ยกเว้น node_modules เพราะเรามี .dockerignore)
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
