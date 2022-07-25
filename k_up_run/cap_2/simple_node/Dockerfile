# Inicia apartir de uma imagem Node.js 10 LTS
FROM node:16
#Especifica o diretorio dentro da imagem onde os comando são executados.
WORKDIR /usr/src/app
#Copria os pacotes dos arquivos e instala as dependencias
COPY package*.json ./
RUN npm install
#Copia todos os arquivos o app para a imagem
COPY . .
#Expoe a porta
EXPOSE 3000
#Comando padrão a ser executado ao iniciar o container.
CMD [ "npm", "start"]
