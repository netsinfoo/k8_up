# Estágio 1: Build
FROM golang:1.11-alpine AS build

# Instala o node e npm
RUN apk update && apk upgrade && apk add --no-cache git nodejs bash npm

# Pega as dependencias do go parte da compilação
RUN go get  -u github.com/jteeuwen/go-bindata/...
RUN go get github.com/tools/godep

#Especifica local de execução
WORKDIR /go/src/github.com/kubernetes-up-and-running/kuard

# Adicionado para corrigir o problema do build.sh
RUN git clone https://github.com/kubernetes-up-and-running/kuard .

#Copia todas as fontes 
COPY . .

#Estes são os conjuntos de variaveis que os scrits de build espera
ENV VERBOSE=0
ENV PKG=github.com/kubernetes-up-and-running/kuard
ENV ARCH=amd64
ENV VERSION=test

# Para a construção do binario 
RUN build/build.sh

# Estagio 2
FROM alpine

USER nobody:nobody

COPY  --from=build /go/bin/kuard /kuard

CMD [ "/kuard" ]
