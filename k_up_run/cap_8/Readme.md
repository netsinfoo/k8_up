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

	apiVersion: extensions/v1beta1
	kind: Ingress
	metadata:
		name: host-ingress
	spec:
		rules:
			- host: alpaca.example.com
			  http:
				paths:
					- backend:
					  serviceName: alpaca
					  servicePort: 8080



$ kubectl describe ingress host-ingress
Name:
host-ingress
Namespace:
default
Address:
Default backend: default-http-backend:80 (<none>)
Rules:
Host
Path Backends
----
---- --------
alpaca.example.com
/
alpaca:8080 (<none>)
Annotations:
...
Events:
<none>


Há algumas coisas que são um pouco confusas aqui. Primeiro, há uma referência ao default-http-backend . Essa é uma convenção que apenas alguns controladores Ingress usam para lidar com solicitações que não são tratadas de outra maneira. Esses controladores enviam essas solicitações para um serviço chamado default-http-backend no namespace kube-system. Esta convenção é exibida no lado do cliente no kubectl


### Usando paths


Quando há vários caminhos no mesmo host listados no sistema Ingress, o prefixo mais longo corresponde. Assim, neste exemplo, o tráfego que começa com /a/ é encaminhado para o serviço alpaca, enquanto todos os outros tráfegos (começando com / ) são direcionados para o serviço bandicoot. 

À medida que as solicitações são encaminhadas para o serviço upstream, o caminho permanece inalterado. Isso significa que uma solicitação para bandicoot.example.com/a/ aparece no servidor upstream configurado para esse nome de host e caminho de solicitação. O serviço upstream precisa estar pronto para servir o tráfego nesse subcaminho. Nesse caso, o kuard possui um código especial para teste, onde responde no caminho raiz ( / ) junto com um conjunto predefinido de subcaminhos ( / a/ , /b/ e /c/ ).

## Tópicos e truques avançados do Ingress

Existem alguns outros recursos sofisticados que são suportados pelo Ingress. O nível de suporte para esses recursos difere com base na implementação do controlador Ingress, e dois controladores podem implementar um recurso de maneiras ligeiramente diferentes. Muitos dos recursos estendidos são expostos por meio de anotações no objeto Ingress. Tenha cuidado, pois essas anotações podem ser difíceis de validar e são fáceis de errar. Muitas dessas anotações se aplicam a todo o objeto Ingress e, portanto, podem ser mais gerais do que você gostaria. Para reduzir o escopo das anotações, você sempre pode dividir um único objeto Ingress em vários objetos Ingress. O controlador Ingress deve lê-los e mesclá-los.

### Rodando multiplos controladores ingress

Muitas vezes, você pode querer executar vários controladores do ingress em um único cluster. Nesse caso, você especifica qual objeto Ingress destina-se a qual controlador Ingress usando a anotação kubernetes.io/ingress.class. O valor deve ser uma string que especifica qual controlador do Ingress deve examinar este objeto. Os próprios controladores Ingress, então, devem ser configurados com essa mesma string e devem respeitar apenas os objetos Ingress com a anotação correta. 

Se a anotação kubernetes.io/ingress.class estiver ausente, o comportamento será indefinido. É provável que vários controladores lutem para satisfazer o Ingress e gravar o campo de status dos objetos Ingress.

### Multiplos objetos ingress

Se você especificar vários objetos Ingress, os controladores Ingress deverão lê-los todos e tentar mesclá-los em uma configuração coerente. No entanto, se você especificar configurações duplicadas e conflitantes, o comportamento é indefinido. É provável que diferentes controladores Ingress se comportem de forma diferente. Mesmo uma única implementação pode fazer coisas diferentes dependendo de fatores não óbvios.

### Ingress e namespaces

O Ingress interage com namespaces de algumas maneiras não óbvias. 

Primeiro, devido a uma abundância de cuidados de segurança, um objeto Ingress só pode se referir a um serviço upstream no mesmo namespace. Isso significa que você não pode usar um objeto Ingress para apontar um subcaminho para um serviço em outro namespace. 

No entanto, vários objetos Ingress em diferentes namespaces podem especificar subcaminhos para o mesmo host. Esses objetos Ingress são então mesclados para criar a configuração final do controlador Ingress.

Esse comportamento entre namespaces significa que é necessário que o Ingress seja coordenado globalmente no cluster. Se não for coordenado com cuidado, um objeto Ingress em um namespace pode causar problemas (e comportamento indefinido) em outros namespaces. Normalmente, não há restrições embutidas no controlador Ingress sobre quais namespaces têm permissão para especificar quais nomes de host e caminhos. Os usuários avançados podem tentar impor uma política para isso usando um controlador de admissão personalizado.

### Reescrita de caminho

Algumas implementações do controlador Ingress suportam, opcionalmente, a reescrita de caminho. Isso pode ser usado para modificar o caminho na solicitação HTTP à medida que ela é submetida a proxy. Isso geralmente é especificado por uma anotação no objeto Ingress e se aplica a todas as solicitações especificadas por esse objeto. Por exemplo, se estivéssemos usando o controlador NGINX Ingress, poderíamos especificar uma anotação de nginx.ingress.kubernetes.io/rewrite-target: / . Às vezes, isso pode fazer com que os serviços upstream funcionem em um subcaminho, mesmo que não tenham sido criados para isso. 

Existem várias implementações que não apenas implementam a reescrita de caminho, mas também suportam expressões regulares ao especificar o caminho. Por exemplo, o controlador NGINX permite que expressões regulares capturem partes do caminho e usem esse conteúdo capturado ao reescrever. Como isso é feito (e qual variante de expressões regulares é usada) é específica da implementação. A reescrita de caminho não é uma bala de prata, e muitas vezes pode levar a erros. Muitos aplicativos da Web supõem que podem se vincular usando caminhos absolutos. Nesse caso, o aplicativo em questão pode estar hospedado em /subpath, mas as solicitações aparecem em / . Ele pode então enviar um usuário para /app-path . Há então a questão de saber se esse é um link “interno” para o aplicativo (nesse caso, deve ser /subpath/app-path) ou um link para algum outro aplicativo. Por esta razão, provavelmente é melhor evitar subcaminhos se você puder ajudá-lo em aplicações complicadas.

###    Servindo TLS

Ao servir sites, está se tornando cada vez mais necessário fazê-lo com segurança usando TLS e HTTPS. O Ingress suporta isso (assim como a maioria dos controladores Ingress). 

Primeiro, os usuários precisam especificar um secret com seu certificado e chaves TLS . Você também pode criar um secret imperativamente com kubectl create secret tls <secret-name> --cert <certificate-pem-file> -- key <private-key-pem-file>
 
 Depois de fazer upload do certificado, você pode referenciá-lo em um objeto Ingress. Isso especifica uma lista de certificados junto com os nomes de host para os quais esses certificados devem ser usados. Novamente, se vários objetos Ingress especificarem certificados para o mesmo nome de host, o comportamento será indefinido.





 















