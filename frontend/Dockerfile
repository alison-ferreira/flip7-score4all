FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# O script 'dev' já está configurado no package.json com a flag --host
CMD ["npm", "run", "dev"]
