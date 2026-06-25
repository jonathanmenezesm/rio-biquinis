# Usar uma imagem leve do Node.js
FROM node:18-alpine

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos de dependências para o contêiner
COPY package.json package-lock.json ./

# Instalar as dependências
RUN npm install

# Copiar todos os arquivos do projeto para o contêiner
COPY . .

# Construir a versão otimizada da aplicação
RUN npm run build

# Expor a porta 3000 para o servidor
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]