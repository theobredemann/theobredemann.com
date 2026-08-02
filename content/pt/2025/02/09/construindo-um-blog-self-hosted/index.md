---
title: "Construindo um Blog Self-Hosted: Uma Jornada de Paciência, Docker e Café"
date: 2025-02-09T00:00:00+00:00
draft: false
type: posts
tags: ["Self-Hosted", "Docker", "Blog", "Ghost", "Raspberry Pi"]
---

# Construindo um Blog Self-Hosted: Uma Jornada de Paciência, Docker e Café

## O Porquê

Recentemente, senti a necessidade de compartilhar meu conhecimento com os outros, mas não tinha certeza de como fazer. Sendo alguém que evita redes sociais como a peste e tem uma aversão natural a câmeras (sério, quem gosta de se ver em vídeo?), optei pelo formato escrito.

## O Que

Uma vez decidido pelo texto, mergulhei em pesquisas. Nossa, haviam muitas opções! Meu primeiro filtro foi simples: tinha que ser gratuito porque isso é um hobby, não um esquema para ganhar dinheiro (e sejamos honestos, salários portugueses não estão exatamente batendo recordes).

Quando cheguei a Portugal, passando três meses sem minha esposa, precisei de algo para manter minha mente ocupada. Descobri o maravilhoso mundo das soluções self-hosted - uma forma de ter controle total sobre a tecnologia, executá-la em hardware barato e melhorar minhas habilidades em rede, programação e, mais importante, paciência.

## A Decisão

Com os filtros definidos para base de texto, open-source e self-hosted, as opções se estreitaram significativamente. Após incontáveis vídeos no YouTube (meu histórico de navegador era uma bagunça), tudo se resumiu a WordPress vs. Ghost. Ambos poderiam rodar em um Raspberry Pi 5, mas sendo um completo iniciante em sites, escolhi a opção mais simples: Ghost.

Para os curiosos, Ghost é um projeto open-source semelhante ao WordPress, oferecendo opções de monetização e configurações fáceis (perfeito para alguém com desafios em frontend como eu, que considera UI uma arte obscura). Dê uma olhada no [site do Ghost](https://ghost.org/) se quiser se aprofundar.

## Os Requisitos

Antes de mergulharmos no inferno que nos aguarda (envolvendo Docker, certificados, rede, nginx e horas aquecendo a cadeira), aqui está o que você vai precisar:

1. Um Raspberry Pi (optei pelo 5 com 8GB de RAM, porque por que não?)
2. Um domínio (a menos que queira manter seus pensamentos brilhantes só para você)
3. Ubuntu Server 24 LTS rodando no Pi (sim, sou fã do Ubuntu)
4. Conexão com a internet (óbvio)
5. A paciência de um santo

Olha, eu era daquele tipo de pessoa que sempre instalava tudo diretamente no computador, mesmo com o Docker me olhando de lado. Então, com zero conhecimento sobre sites ou Docker, fui no YOLO total e decidi construir um site usando Docker E Ghost. Porque por que não tornar as coisas mais emocionantes?

Antes de mergulharmos, você vai precisar de um Raspberry Pi rodando Ubuntu Server 24.04. Você também precisa fazer SSH nele (e não, não vou te ensinar isso - o Google existe por um motivo). Ah, e se você ainda está usando login por senha em vez de chaves SSH... não tenho nada a dizer para você.

Claro, você poderia passar o próximo século lendo a documentação interminável do Docker no [Docker Hub do Ghost](https://hub.docker.com/_/ghost/). Mas sejamos realistas - você está aqui porque quer a versão TL;DR, e eu te ajudo nisso.

## A Aventura Começa

Primeiro, sejamos inteligentes com a configuração da rede. Defina um IP fixo para seu dispositivo (neste caso, o Raspberry Pi) na sua rede local. Confie em mim, você não quer brincar de "onde está meu Pi" toda vez que precisar acessar seus apps. Com isso resolvido, vamos para a parte divertida.

### Configuração de Domínio e DNS

Escolhi a Cloudflare para meu domínio porque segurança digital estava na minha lista de estudos (tentando ser um adulto responsável aqui). Após algumas pesquisas e sendo super cuidadoso com os preços porque, sejamos honestos, gastar dinheiro é ruim, consegui o theobredemann.com por apenas 10 dólares por ano. Isso é menos de 1 dólar por mês - até meu eu econômico poderia viver com isso!

A coisa legal da Cloudflare? Eles são enormes. Estamos falando de lidar com 80,9% de todos os sites (de acordo com o Google). Então, se alguém hackear eles, meu pequeno blog será o menor dos problemas. Além disso, eles oferecem várias características de segurança e têm tanta documentação e tutoriais que você pode encontrar ajuda para literalmente qualquer coisa. Sério, o que você precisar, está lá.

Para a configuração de DNS, adicionei dois registros:

1. Um registro A para theobredemann.com apontando para meu IP doméstico (encontre o seu em [checkip.amazonaws.com](https://checkip.amazonaws.com))
2. Um registro CNAME para www apontando para theobredemann.com

Ambos com a opção Proxied habilitada porque segurança é legal.

Fácil, né? Bem... talvez não. O que acontece quando seu IP muda porque seu roteador decidiu tirar uma folga, ou porque seu provedor de internet adora mexer com você? Não se preocupe - podemos lidar com isso usando as APIs da Cloudflare, e é claro que vou te ajudar porque sou uma pessoa tão legal.

### Atualizações Automáticas de IP

Como os provedores adoram mudar nossos IPs nos piores momentos, precisamos de uma solução de atualização automática. Aqui está como:

1. Crie um token de API da Cloudflare (Perfil -> API Tokens -> Criar Token -> Edit zone DNS) com permissões de leitura e escrita
2. Obtenha seu Zone_ID do painel do domínio
3. Pegue cada ID de registro DNS usando:

```bash
curl https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_API_KEY"
```

Crie um script de atualização - Agradeça em seus pensamentos, eu sofri muito para fazer funcionar:

```bash
sudo nano /usr/local/bin/update_cloudflare_dns.sh

#!/bin/bash

# Configuração da API Cloudflare
AUTH_TOKEN="seu_token"
ZONE_ID="sua_zone_id"

# Registros DNS para atualizar - adicione seus registros aqui
declare -A DNS_RECORDS=(
    ["seu-dominio.com"]="id_do_registro"
)

# Obter IP público atual
CURRENT_IP=$(curl -s -X GET https://checkip.amazonaws.com)

# Atualizar cada registro DNS
for DOMAIN in "${!DNS_RECORDS[@]}"; do
    RECORD_ID="${DNS_RECORDS[$DOMAIN]}"

    curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
         -H "Authorization: Bearer $AUTH_TOKEN" \
         -H "Content-Type: application/json" \
         -d "{
              \"type\":\"A\",
              \"name\":\"$DOMAIN\",
              \"content\":\"$CURRENT_IP\",
              \"ttl\":1,
              \"proxied\":true
            }"

    echo "$(date): Atualizado $DOMAIN para $CURRENT_IP" >> /var/log/cloudflare_update.log
done

sudo chmod +x /usr/local/bin/update_cloudflare_dns.sh
```

Adicione ao crontab para nunca mais tocar nisso:

```bash
sudo crontab -e
*/5 * * * * /usr/local/bin/update_cloudflare_dns.sh
```

## Configuração do Docker

### Estrutura de Diretórios

Primeiro, vamos criar nosso espaço de trabalho (escolhi /srv porque por que não):

```bash
sudo mkdir -p /srv/containers/{ghost,nginx}
sudo mkdir -p /srv/containers/ghost/{data,settings}
sudo chown $USER:$USER -R containers
```

### Segurança de Rede

Para tornar a vida dos hackers um pouco mais difícil (porque somos legais assim), criei redes frontend e backend separadas. O backend hospeda Ghost e NGINX, enquanto o frontend tem apenas NGINX para configuração local. Ter NGINX e Ghost na mesma rede também facilita minha vida na configuração.

### Docker Compose

Para o Ghost, é bem simples sem configurações complicadas para atrapalhar.

