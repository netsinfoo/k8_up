# Namespace
- é utilizado para organizar objetos em um cluster kubernetes.Por padrão o kbctl
interage com o namespace default. Caso queira interagir com outo namespace deve 
fazer uso da flag --namespace. Para interagir com todos os namespace em seu clus-
ter deve-se utilizar a flag --all-namespace.

# Context
- Usado para modificar o namespace de forma permanente, pode-se usar o context.
Sendo gravado no arquivo de configuração do kubectl.
- Para criar um contexto usamos o comando.
$ kubectl config set-context my-context --namespace=mystuff

Isso cria um novo contexto, mas para começar a usa-lo deve-se rodar. 
$ kubectl config use-context my-context 


# Como visualizar objetos na API do kubernetes.

- O comando mais basico para visualização de objetos no kubernetes é o "get".
Se rodarmos kubectl get [nome do recurso] teremos uma lista completa com as in-
formações contidas no recurso. Se quiser buscar por recursos mais especificos 
pode-se usar o get [nome do recurso] [nome do objeto]

Para conseguir uma quantidade maior de informações, usamos as flags -o json|yaml
$ kubectl get pods my-pod -o json|yaml

Para criar uma tabela sem cabeçalho, usamos.
$ kubectl get pods --no-headers

Para buscar uma informação especifica usamos o --template.
$ kubectl get pods my-pod -o jsonpath --template={.status.podIP}

Se o interesse for bucar uma informação mais detalhada de um objeto em particu-
lar usamos o comando "describe"
$ kubectl describe <resource-name> <obj-name>

# Criando, atualizando e destruindo objetos Kubernetes.
- Para criar o objeto basta aplicar.
$ kubectl apply -f obj.yaml

- Para fazer mudanças no objeto, pode-se aplicar.
$ kubectl apply -f obj.yaml

- Pode-se ainda editar interativamente.
$ kubectl edit <resource-name> <obj-name>

- Para usar o comando "apply" sem realizar mudanças deve-se usar a flag "--dry-run"
$ kubectl apply -f obj.yaml --dry-run

- O comando "apply" tambem grava um historico das configurações previas em uma 
anotação dentro do objeto. Podes-se manipular esses comandos com:
- edit-last-applied , set-last-applied , and view-last-applied
por exemplo um comando para mostrar o ultimo esteado aplicado seria:
$ kubectl apply -f myobj.yaml view-last-applied

- Para deletar o objeto, simplesmente rodo.
$ kubectl delete -f obj.yaml


# Rotulando e anotando objetos.
- Serve para rotular e fazer anotações sobre os objetos. Ex:
$ kubectl label pods bar color=red

# Comandos de depuração
- O k8s tem um grande número de comando para depurar os containers.
$ kubectl logs <pod-name>

No caso de multiplos containers em um pod, pode-se escolher o container a ser
visualizado, utilizando a flag -c, para ficar observando sem sair dos logs usa
se a flag -f

- Pode-se usar o comando "exec" para rodar algo em um container em execução.
$ kubectl exec -it <pod-name> -- bash

Este comando proverá um bash interativo em seu container em execução.

- Se não tiver um bash ou um terminal em seu container disponivel em seu contai-
ner, pode-se sempre anexar (attach)

- Para copiar arquivos de e para um contêiner usando o comando cp:
$ kubectl cp <pod-name>:</path/to/remote/file> </path/to/local/file>

- Para acessar diretamente o pod via network, pode-se utilizar o comando "port-
forward" para encaminhar o trafego de uma maquina local para um pod. Isso permi-
te encapsular com segurança o tráfego de rede para contêineres que podem não es-
tar expostos em nenhum lugar da rede pública.
$ kubectl port-forward <pod-name> 8080:80

Abre uma conexao que encaminha o trafigo de uma maquina local na porta 8080 para
um container remoto na porta 80

- Caso esteja interessado em como o cluester esta usando os recursos, podemos 
usar o comando top para ver a lista de recursos usandos em outros nos e pods.
$ kubectl top nodes
	ou
$ kubectl top pods

# Comando de autocompletar
- O kubectl suporta integração com o shell para habilitar o tab completions.
deve-se instalar o modulo "bash-completion".
$ sudo apt-get install bash-completion

Para tornar permanente. 
$ echo "source <(kubectl completion bash)" >> ${HOME}/.bashrc

# Sumario.
- Kubectl tem uma grande quantidade de ajuda interna disponível. Você pode começar a visualizar esta ajuda com:
$ kubectl help
	ou 
$ kubectl help <command-name>




























