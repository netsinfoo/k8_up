# HTTP Load balancing com ingress

A parte  critica de qualquer aplicação é entregar trafego de rede de e a partirde uma aplicação. Para muitos usuarios e para casos simples as capacidades vistas anteriomente são suficientes.

Mas o objeto serviço do k8s opera em camanda 4. Isso significa que ele apenas encaminha as conexões tcp e udp e não olha para dentro das conexões. O porque disto, hopedar muitas aplicações em um cluster usa muitas exposições de serviços.
no caso onde estes serviços são do tipo: NodePort, teremos clientes conectados a uma unica porta por serviço. No caso onde os serviços são : LoadBalancer, iremos alocar recursos da nuvem para cada serviço. Mas para a camada 7 pode-se fazer melhor.
