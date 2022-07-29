# HTTP Load balancing com ingress

A parte  critica de qualquer aplicação é entregar trafego de rede de e a partirde uma aplicação. Para muitos usuarios e para casos simples as capacidades vistas anteriomente são suficientes.

Mas o objeto serviço do k8s opera em camanda 4. Isso significa que ele apenas encaminha as conexões tcp e udp e não olha para dentro das conexões. O porque disto, hopedar muitas aplicações em um cluster usa muitas exposições de serviços. No caso onde estes serviços são do tipo: NodePort, teremos clientes conectados a uma unica porta por serviço. No caso onde os serviços são: LoadBalancer, iremos alocar recursos da nuvem para cada serviço. Mas para a camada 7 pode-se fazer melhor.

Ao resolver um problema similar me situações que não são do k8s, usurarios geralmente recorrem a ideia de virtual hosting. Este é um mecanismo onde muitos hosts virtuais tem o mesmo endereço ip. Tipicamente é utilizado um um balanceador de carga ou um proxy reverso para aceitar conexoes de entrada nas portas HTTP e HTTPS. O programa então analiisa a conexão HTTP e baseado no cabeçalho e no caminho da  URL que é requisitado o proxy encaminha para algum outro programa. É dessa forma que o load-balancer ou reverse proxy funciona como um guarda de transito para decodificar e direcionar conexões de entrada  para o servidor upstream correto.

K8s chama o sistema de balanceador de carga baseado em http de ingress. O Ingress é uma forma de implemtação do padrão de virtual hosting nativo do K8s. Um dos aspetos mais compleso deste padrão é que o usuário tem que gerenciar o arquivo de configurão do balanceador de carga. Em um ambiente dinamico e com um conjunto de hosts virtuais em expanção, isso pode ser bem complexo O sistema do ingress trabalha para simplicar: A padronização  dessa configuração; mover para um objeto padrão do k8s; e mesclar varios objetor ingress em uma configuração única para o balanceador de cargas.

## Ingress Spec versus Ingress controler.

Embora conceitualmente simples, em sua implementação, o igress é muito diferente de praticamente todos os outros objetos regulares do kubernetes. Ele é dividido em uma especificação de recurso comum e uma implemetação de controlador. Não há um controlador ingress padrão integrado ao k8s, portanto, o usuário deve instalar uma das muitas implementações opcionais.

Pode-se criar em modificar objetos ingress como qualquer outro objeto. Mas, por padrão, não há código em execução para realmente agir nesses objetos. Cabe aos usuarios instalar e gerenciar um controlador externo. Desta forma o controlador é conectavel.


Exitem muitas razões para o ingress acabar assim. Em primeiro lugar, não existe um único balanceador de carga http que possa ser universalmente utilizdo. Além dos balanceadores de carga( de software livre t e proprietários), também existem recursos de balanceadores de carga fornecidos por provedores de nuvem e balanceadores de carga baseado em hardware. A segunda razão é que o objeto ingress foi adicionado ao k8s antes de qualquer um dos recursos de extensibilidade comuns serem adicionados. À medida que o ingress progride, é provavel que ele evolua para utilizar esses mecanismos.

## Instalando o Contour

Existem muitos controladores ingress disponives, mas para este estudo usaremos o contour. Este é um controlador criado para configurar o balanceador de carga de código aberto (e projeto CNCF) chamado Envoy. O Envoy foi desenvolvido para ser configurado dinamicamente por meio de uma API. O controlador Contour Ingress se encarrega de traduzir os objetos Ingress em algo que o Envoy possa entender.

Para instalar o envoy, podemos fazer uma simples invocação do endereçço do projeto.


	kubectl apply -f https://j.hept.io/contour-deployment-rbac

Depois da instalação pode-se buscar o endereço do ip externo do contour via: 

	kubectl get -n heptio-contour service contour -o wide

Lembrando que o deployment fica em outro namespace de nome project contour.

### Importante.

Caso esteja utilizando o minikube, é necessário fazer uma configuração para obtenção do IP EXTERNO.

	$ minikube tunnel 

irá ser pedido senha de admim.

O minikube tunnel é executado como um processo, criando uma rota de rede no host para o CIDR de serviço do cluster usando o endereço IP do cluster como gateway. O comando tunnel expõe o IP externo diretamente a qualquer programa em execução no sistema operacional do host.

## Configurando DNS.

Para que o Ingress funcione bem, você precisa configurar as entradas DNS para o endereço externo do seu balanceador de carga. Você pode mapear vários nomes de host para um único ponto de extremidade externo e o controlador do Ingress reproduzirá o policial de tráfego e direcionará as solicitações recebidas para o serviço upstream apropriado com base nesse nome de host.

Supomos que você tenha um domínio chamado example.com . Você precisa configurar duas entradas DNS: alpaca.example.com e bandicoot.example.com . Se você tiver um endereço IP para seu balanceador de carga externo, convém criar registros A. Se você tiver um nome de host, convém configurar os registros CNAME.

Nessa configuração, usando o minikube, devemos registrar os endereços das aplicações no /etc/hosts.


## Usando o INGRESS

Vamos subir nossos deploymentes alpaca, bandicoot e be-default.

### Forma mais simples de ser usada.

obs: é importante lembrar que o v1beta1 não é usado. Dessa forma vamos mudar o arquivo sugerido no livro para:

	apiVersion: networking.k8s.io/v1
	kind: Ingress
	metadata:
  		name: be-default-ingress
	spec:
  		defaultBackend:
    			service:
      				name: be-default-prod
     					port: 
        				number: 8080  # Com essa mudança o atributo port vira um map, sendo descrito assim.


### Usando hostnames.


As coisas começam a ficar interessantes quando começamos a direcionar o tráfego com base nas propriedades da solicitação. O exemplo mais comum disso é fazer com que o sistema Ingress examine o cabeçalho do host HTTP (que é definido para o domínio DNS na URL original) e direcione o tráfego com base nesse cabeçalho.















