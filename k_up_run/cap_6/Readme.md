# LABELS E ANOTAÇÕES.
Os rótulos são pares de chave/valor que podem ser anexados a objetos do Kubernetes, como Pods e ReplicaSets. Eles podem ser arbitrários e são úteis para anexar informações de identificação a objetos do Kubernetes. Os rótulos fornecem a base para agrupar objetos.

As anotações, por outro lado, fornecem um mecanismo de armazenamento que se assemelha a rótulos: as anotações são pares de chave/valor projetados para conter informações não identificadoras que podem ser aproveitadas por ferramentas e bibliotecas.

# Labels (rotulos)

Os rótulos fornecem metadados de identificação para objetos. Essas são qualidades fundamentais do objeto que serão usadas para agrupamento, visualização e operação.

As chaves de rotulos podem ser divididas em duas partes: um prefixo opcional ee um nome, separados por uma barra. O prefixo, se especificado, deve ser um subdomínio DNS com um limite de 253 caracteres. O nome da chave é obrigatório e deve ter menos de 63 caracteres. Os nomes também devem começar e terminar com um caractere alfanumérico e permitir o uso de traços ( - ), sublinhados ( _ ) e pontos ( . ) entre os caracteres.

Para ver os labels contidos nos objetos.

	$ kubectl get deployments --show-labels

Os rotulos podem ser modificados conforme a necessidade de uso.

	$ kubectl label deployments alpaca-test "canary=true"

Fazer consulta a um label especifico.

	$ kubectl get deployments -L canary

Remover uma label.

	$ kubectl label deployments alpaca-test "canary-"

Usar um seletor de labels

	$ kubectl get pods --selector="ver=2"

Podendo fazer combinações de labels.

	$ kubectl get pods --selector="app=bandicoot,ver=2"

ou usando um conjunto de valores(array)

	$ kubectl get pods --selector="app in (alpaca,bandicoot)"

Table  Selector operators

	Operator 			Description
	key=value 			key is set to value
	key!=value 			key is not set to value
	key in (value1, value2) 	key is one of value1 or value2
	key notin (value1, value2) 	key is not one of value1 or value2
	key 				key is set
	!key 				key is not set

## Anotações

As anotações fornecem um local para armazenar metadados adicionais para objetos do Kubernetes com o único propósito de auxiliar ferramentas e bibliotecas. Eles são uma maneira de outros programas que conduzem o Kubernetes por meio de uma API para armazenar alguns dados opacos com um objeto. As anotações podem ser usadas para a própria ferramenta ou para passar informações de configuração entre sistemas externos.

Enquanto os rótulos são usados para identificar e agrupar objetos, as anotações são usadas para fornecer informações extras sobre a origem de um objeto, como usá-lo ou a política em torno desse objeto.

As anotações são usadas para:

• Acompanhar um “motivo” para a atualização mais recente de um objeto.

• Comunicar uma política de agendamento especializada para um agendador especializado.

• Estender dados sobre a última ferramenta para atualizar o recurso e como ele foi atualizado (usado para detectar alterações por outras ferramentas e fazer uma mesclagem inteligente).

• Anexar informações de versão, versão ou imagem que não sejam apropriadas para rótulos (pode incluir um hash Git, carimbo de data/hora, número PR etc.).

• Habilitar o objeto Deployment para acompanhar os ReplicaSets que ele está gerenciando para distribuições.

• Forneçer dados extras para aprimorar a qualidade visual ou usabilidade de uma interface do usuário. Por exemplo, os objetos podem incluir um link para um ícone (ou uma versão codificada em base64 de um ícone).

• Protótipo da funcionalidade alfa no Kubernetes (em vez de criar um campo de API de primeira classe, os parâmetros para essa funcionalidade são codificados em uma anotação).

## Definindo anotações

Anotações são definidas em uma seção comun do metadado em cada objeto do kubernetes.

...
	metadata:
	  annotations:
	    example.com/icon-url: "https://example.com/icon.png"
...


As anotações são muito convenientes e fornecem um acoplamento flexível poderoso. No entanto, eles devem ser usados criteriosamente para evitar uma confusão de dados não digitados.

## Limpando.

	$ kubectl delete deployments --all

Pode-se fazer o uso da flag "--selector" para apagar apenas os pods com labels definidas.




