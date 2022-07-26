# Descoberta de serviços

A maioria das infraestrutura de redes tradicionais não foram construidas pra o nível de dinamismo que k8s apresenta.

## O que é a descoberta de seviços

O nome geral para essa classe de descobertas e soluções é descoberta de serviços. Um bom sistema de descoberta de serviços permitirá que usuarios resolvam essa informação rapida e confiavel. Um bom sistema de descobeta de serviços pode armazenar definições mais ricas do que esse serviço é.


## O objeto de serviço.

Um seviço de descoberta real no kubernetes começa com um objeto de serviço. Um objeto de serviço é uma forma de criar um seletor de label nomeado. Assim como o kubectl run é uma forma fácil de criar um deployment o kubectl expose cria um serviço.



liberando o acesso do service.


	$ ALPACA_POD=$(kubectl get pods -l app=alpaca \
	-o jsonpath='{.items[0].metadata.name}')

	$ kubectl port-forward $ALPACA_POD 48858:8080

## Serviço de DNS

O k8s prove um serviço de DNS interno para que container tenha um registro do tipo A . Dentro de um namespace, basta usar o nome do serviço para se conectar a um dos pods identificados por um serviço.

## Readiness check

Muitas vezes, quando uma aplicação é inicicializada ela não está pronta para lidar com solicitações. Geralmente, uma certa quantidade de inicialização pode levar de menos de um segundo a varios minutos. Uma coisa bacana que o service faz é rastrear quais dos pods estão prontos por meio de um readiness check. Vamos mudar o manifesto de deployment para adicionar o readiness check.


	$ kubectl edit deployment/alpaca-prod

## Olhando além do cluster.

Até agora, tudo o que abordamos neste capítulo foi sobre a exposição de serviços dentro de um cluster. Muitas vezes, os IPs dos pods só podem ser acessados de dentro do cluster. Em algum momento, teremos que permitir a entrada de novo tráfego!

A maneira mais portátil de fazer isso é usar um recurso chamado NodePorts, que aprimora ainda mais um serviço. Além de um IP de cluster, o sistema escolhe uma porta (ou o usuário pode especificar uma) e cada nó no cluster encaminha o tráfego pra essa porta para o serviço

Com esse recurso, se você puder acessar qualquer nó do cluster, poderá entrar em contato com um serviço. Você usa o NodePort sem saber onde qualquer um dos pods desse serviço está sendo executado. Isso pode ser integrado a balanceadores de carga de hardware ou software para expor ainda mais o serviço.


