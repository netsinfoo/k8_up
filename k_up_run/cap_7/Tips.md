# Dicas e conceitos.

Service é um balanceador de carga, que realiza uma requisição para a kube-apiserver , recebendo uma lista de endpoints das aplicações, direcionando o tráfego para os pods. Por padrão o service trabalha com estratégia de balanceamento “round robin”. Existem basicamente três tipos de services “ClusterIP”, “NodePort” e “LoadBalancer”, vamos entender um pouco sobre cada um.

ClusterIP: tipo padrão de service, que possibilita a comunicação apenas através da SDN criada para comunicação dos pods.

NodePort: um service que disponibiliza uma porta em cada nó do cluster que possui um pod em execução da aplicação, sua forma de acesso se dá através do “IP + porta” (xxx.xxx.xxx.xxx:porta), possuindo um range limite padrão de portas que podem ser utilizadas (30000–32767).

LoadBalancer: um tipo de service que realiza balanceamento de carga diretamente para dentro do cluster, porém para utilizar esse recurso você precisar ter realizado a integração com um serviço de “balanceamento de carga”, se você utiliza algum provedor cloud isso pode ser feito de forma simples, basta garantir que seus nodes possuem permissão para executar essa integração, já em ambiente on-premise é necessário ter um appliance que se integre com seu cluster. Um ponto importante sobre esse tipo de service é que é gerado um novo componente do tipo loadbalancer para cada aplicação, ou seja cuidado a utilizá-lo, para não gerar um custo considerável em ambientes cloud.




### FONTES
https://blog.getupcloud.com/kubernetes-ingress-c781dba08068
