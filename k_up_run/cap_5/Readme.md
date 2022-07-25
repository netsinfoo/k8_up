#Pods


## Pods do k8s
Pods representam uma coleção de containers de aplicação e volumes rodando no mesmo ambiente. Pods, não containers, são a menor artefato implantavel no cluster k8s. Um container dentro de um pod é executado em seu próprio cgroup, mas compartilha varios namespaces do linux.


## Pensando com pods.

A pergunta mais comum que ocorre com a adoção do k8s é *O que devo colocar em um pod?*
- Em geral, a pergunta certa a se fazer ao projetar pods é: “Esses contêineres funcionarão corretamente se instaciarem em máquinas diferentes?” Se a resposta for “não”, um Pod é o agrupamento correto para os contêineres. Se a resposta for “sim”, vários Pods provavelmente são a solução  correta.

Caso a interação entre os contairners ocorrer de forma natural via uma conexão rede, eles pode ficar em pods diferente, pois caso eles sejam instanciados em maquinas diferentes eles poderão funcionar normalmente. No caso de serviços que estejam compartilhando o mesmo volume e não haja conexão de rede entre eles, estes devem ficar no mesmo pod. Como no exemplo citado no livro do server html e o um servidor com o git.

## o manifesto do pod

Pods são descritos em um manifesto. Este manifesto é apenas uma representação em arquivo de texto do objeto da api do k8s.

Ver a diferença entre configuração declarativa e imperativa.

## Criando um pod

A forma simples de criar um pod é via rodando o comando imperativo kubectl.

$ kubectl run kuard --generator=run-pod/v1 --image=gcr.io/kuar-demo/kuard-amd64:blue

Pode-se ver o status do pod rodando;

$ kubectl get pods

Para deletar o pod.

$ kubectl delete pods/kuard

## Criando um manifesto de um pod.

Manifestos podem ser escritos usando yaml ou json, mas yaml é normalmente preferido para essa função porque é um pouco mais editavel e aceita comentarios.

Os manifestos incluem alguns campos e atributos-chave, ou seja, uma seção de metadados para descrever o pod e seus rotulos, uma seção de especificações para descrever volumes e uma lista de containers que serão executados no pod.

apiVersion: v1
kind: Pod
metadata:
  name: kuard
spec:
  containers:
    - image: gcr.io/kuar-demo/kuard-amd64:blue
      name: kuard
      ports:
        - containerPort: 8080
          name: http
          protocol: TCP


## Rodando pods

Usando o comando kubectl apply para lançar uma versão simples do kuard.

$ kubectl apply -f kuard-pod.yaml

O pod manifest foi submetido para servidor de API do k8s. O k8s system agendará para que um pode seja executado em um no saudavel do cluster, onde será monitorado pelo processo deamon kubelet.


## Ouvindo pods.

Agora que temos um pod em execução, vamos descobrir um pouco mais sobre ele.

$ kubectl get pods

Podendo usar a flag -o wide para menos informação ou -o json | yaml para informações completa


## Detalhes do Pod.

Para pegar mais detalhes do pod usamos o comando "describe"

$ kubectl describe pods kuard

O inicio traz informações sobre o no, depois sobre o container, e por fim sobre os eventos ocorridos.

## Deletando um pod.

Podemos deletar o pode pelo nome, ou usando o arquivo do qual ele foi criado.

$ kubectl delete pods/kuard
	
	ou
 
$ kubectl delete -f kuard-pod.yaml

## Acessando seu pod

Agora que seu pod está rodando, podemos querer acessa-lo por uma grande quantidade de motivos.Podemos querer carregar um serviço web que esta rodando no pod. Podemos querer ver os logs para debugar um problema, ou executar outros comandos no contexto do pod para ajudar a debugar.

### Usando o port forwarding 

Para alcança-lo, podemos usar o port-forwarding integrado a api do k8s e às linhas de comando.

	$ kubectl port-forward kuard 8080:8080

Executando esse comando é criado um túnel da maquina local atráves do k8s master, para a instancia do pod rodando em um dos nos worker.

### Pegando mais informações de logs.

Qundo precisamos debugar nossa aplicação, é util ir mais fundo do que descrever para enteder o que o aplicativo esta fazendo. o k8s fornece dois comando para depurar containers em execução. O comando kubectl logs baixa os logs atuais das instancias em execução.

	$ kubectl logs kuard

Adicionando a flag -f ira causar com fluxo continuo de logs. "--previous pegará os logs previos da instância do container.


### Rodando comandos em se container com exec

Ás vezes os logs não são suficientes para determinr o que está acontecendo, e é necessário utilizar comando de contexto do próprio container.

	$ kubectl exec kuard date

Para usar uma sessão interativa pode-se utilizar a flag "-it"

	$ kubectl exec -it kuard ash  

### Copiando arquivos de e para um container.

Ás vezes é necessário copiar arquivos para dentro de um container ou dele.

	$ kubectl cp <pod-name>:/captures/capture3.txt ./capture3.txt

	$ kubectl cp $HOME/config.txt <pod-name>:/config.txt

## Verificação de integridade

Quando executamos nossa aplicação como um container k8s, ele automaticamente é mantida ativa usando um processo de checagem de integridade. Essa checagem garante que o principal processo de sua aplicação está sempre em execução. Do contrário o k8s reiniciará.

Contudo na maioria dos casos um simples processo não é o suficente. Por exemplo se seu processo tem um deadlock e esta inapto a servir requisições, um processo de checagem ira acreditar que sua aplicação está integra e que o processo continua sendo executado. 

### Liveness probe

As sondagens de atividade são definidas por contêiner, o que significa que cada contêiner dentro de um pod é verificado separadamente. Tomando por exemplo o codigo escrito em kuard-pod-health.yaml. O inicio  verificação da verificação tem um delay de 5 segundos, o teste deve respçonder dentro do tempo limite de um segundo e o codigo HTTP deve ser igual ou maior que 200 e menor igual a 400 para que o teste seja considerado bem sucedido. O k8s chamará o teste a cada 10 segundos. Se mais de tres testes consecutivos falharem o container falhará e sera reiniciado.

### Sondagem de prontidão

O k8s faz uma diferenciação entre liveness e readiness. Liveness determina se a aplicação estãfuncionando corretamente, containers que falharem nessa checagem serão reiniciados. Readiness descrevem quando o container está pronto para servir requisições de usuarios. Containers que falharem na verificação de readiness são removidos do serviço de load balancer. Combinando os dois temos a garantia de que pelo menos um container sádio está rodando dentro do cluster.


### Tipos de checagem de saude.

Adicionalmente, o k8s tambem suporta uma checagem de saude do soquete TCP, que abre uma conexão TCP, caso a conexão tenha sucesso, o teste foi bem sucedido. Este tipo de teste é util em aplicações que não são HTTP.

Por fim, o k8s permite testes exec. Estes executam um scritp ou programa no contexto do container. Seguindo as convenções tipicas, se o script retornar zero como codigo de saída, o teste é bem sucedido, senão ele falha. 

## Gerenciamento de recursos.

Muitas pessoas migra para containers e orquestração como k8s por causa da melhoria radical no empacotamento de imagens e na implatação confiavel que eles fornecem. Além de aumentarem a utilização geral dos nos do cluster. Garantindo que essas maquinas estejam ativas ao maximo aumenta a eficiencia de cada centavo investido na infraestrutura.

O k8s permite o usuário especificar dois tipos de metricas de diferentes de recursos. Solicitação de recursos minimos, que são os recursos minimos para o funcionamento da aplicação, e recursos de limite, que especificam o maximo de recursos que a aplicação deve consumir.

### Solicitações de recursos: recursos mínimos necessários.

Podemos definir a quantidade de recursos minimos os containers serem executados.O k8s garantirá que estes recursos estarão disponíveis para o pod. Os recursos mais comuns são CPU e memoria, mas o k8s tem suporte para outros tipos de recursos, como GPU e outros.

#### Detalhes do limite da solicitação.

As requisições são usadas quando pods são agendados para nos. O agendador do k8s ira garantir que a some de resiquições de recursos de todos os pods não exeda a capacidade do nó. É importante ressaltar que a solicitação especifica um mínimo. Ele não especifica um maximo para os recursos que um pod pode usar. 

O consumo de cpu é feita pelo container para o uso de todos os cores de cpu, quando agendamos um pod ele ira consumir o que estiver disponivel, quando acresentamos o segundo ele ira dividir o total de cpu ficando com a metade para cada um, um terceiro adicionando aumentaria o rateio para um terço para cada um, um quarto pode mudaria a cota para 1/4 para cada. um quinto pod não seria locado nesse nó porque ele o no tinha alcançado sua capacidade maxima. Levando em coanta que foi garantido 0.5 core para cada pod no nó.

O consumo de memoria é feito de forma semelhante, contudo com uma diferença, Se um contêiner estiver acima de sua solicitação de memória, o SO não pode simplesmente remover a memória do processo, porque ela foi alocada. Consequentemente, quando o sistema fica sem memória, o kubelet encerra os contêineres cujo uso de memória é maior que a memória solicitada. Esses contêineres são reiniciados automaticamente, mas com menos memória disponível na máquina para o contêiner consumir.

### Limitando o uso de recursos com limites.

Adicionalmente podemos configurar um consumo maximo de recursos do pod via "resource limits"

## Dados persistentes com volumes

### Usando volume com Pods

Para adicionar um volume a um manifesto de pod, há duas novas estrofes para adicionar à nossa configuração. A primeira é uma nova seção spec.volumes. Essa matriz define todos os volumes que podem ser acessados por contêineres no manifesto do pod. É importante observar que nem todos os contêineres precisam montar todos os volumes definidos no Pod. A segunda adição é a matriz volumeMounts na definição do contêiner. Essa matriz define os volumes que são montados em um contêiner específico e o caminho em que cada volume deve ser montado. Observe que dois contêineres diferentes em um pod podem montar o mesmo volume em caminhos de montagem diferentes.


## Diferentes formas de usar volumes em pods

Existe uma grande variedade de formas que pode-se usar dados em sua aplicação. A seguir temos algmas

### Comunicação e sincronização

Como no exemplo do sidecar do git com o nginx. O pod usa um volume chamado "emptyDir". Esse volume tem como escopo a vida útil do Pod, mas pode ser compartilhado entre dois contêineres, formando a base para a comunicação entre nossa sincronização do Git e contêineres de serviço da Web.

### Cache

Uma aplicação pode usar um volume valioso para desempenho, mas não necessaria para a correta oeração do aplicativo. Por exemplo, talvez a aplicação mantenha miniaturas pré-renderizada de imagens maiores. Claro, eles podem ser reconstruidos a partir das originais, mais eles fazem o serviço de miniaturas mais custoso. Pode-se desejar que esse cache sobreviva a uma reinicialização do container devido a uma falha de verificação de integridade e, portanto esse volume tambem funciona bem para  o caso de uso de cache.

### Dados persistentes.

As vezes usaremos volumes para dados realmente persistentes - dados que são independentes da vida útil de um pod em particular, e devemos mover entre nos no cluster, se um node falhar ou mover um pod para uma maquina diferente por alguma razão. Para alcançar isso, k8s suportas uma grande variedade de volume de armazenamento de redes remotas, incluindo suporte a uma grande variedade de protocolos como NFS  e  iSCSI, bem como redes de provedores de armazenamento em nuvem como amazon, azure e google.

### Sistema de arquivos montado do host.

Outras aplicações não necessitam de um volume persistente, mas eles preciam de um acesso aos sistemas de arquivos do host subjacente. Por exemplo, eles podem precisar acessar o arquivo de sistema /dev para executar o acesso a raw block-level para uma disposito no sistema. Para estecaso , o k8s oferece suporte ao volume  hostpath, que pode montar locais arbitrarios no no do worker do container. O exemplo anterior usa um tipo de hostPath. O volume é criado em /var/lib/kuard no host.

### Dados persistentes usando discos remotos.

Muitas vezes, queremos que um dado que o pod esteja utilizando pemaneça em um pod mesmo se ele for resetado em uma maquina host diferente.

Para conseguir isso, podemos montar um volume de armazenamento de rede remota em seu pod. Quando usamos um armazenamento baseado em redes, o k8s automaticamente mounta e desmonta um armazemando de rede apropriado sempre que um pod que usa esse volume é agendado em uma maquina especifica. 

Existem vários métodos para montar volumes pela rede. O k8s inclue suporte para protocolos padrão como NFS e iSCSI, bem como APIs de armazenamento baseadas em provedor de nuvem para os principais provedores de nuvem publica e privada. Em muitos casos, os provedores de nuvem tambem criarão o disco para voce, caso ele ainda não exista.

Volumes persistentes são um assunto profundo que tem muitos detalhes diferentes: em particular, a maneira como os volumes persistentes, as declarações de volumes persistentes e o provisionamento de volumes dinamicos funcionam juntos. cap-15.

## Colocando tudo junto.

Muitos aplicativos são stateful e, como tal, devemos preservar todos os dados e garantir o acesso ao volume de armazenamento subjacente, independentemente da máquina em que o aplicativo é executado. Como vimos anteriormente, isso pode ser feito usando um volume persistente apoiado por armazenamento conectado à rede. Também queremos garantir que uma instância íntegra do aplicativo esteja em execução o tempo todo, o que significa que queremos garantir que o contêiner executando o kuard esteja pronto antes de expô-lo aos clientes.
Por meio de uma combinação de volumes persistentes, testes de prontidão e atividade e restrições de recursos, o Kubernetes fornece tudo o que é necessário para executar aplicativos com estado de maneira confiável.




