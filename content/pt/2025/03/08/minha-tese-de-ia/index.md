---
title: "Minha Aventura com IA: Como Cocô de Pássaro e Painéis Solares Me Levaram ao Colapso Acadêmico"
date: 2025-03-08T00:00:00+00:00
draft: false
type: posts
tags: ["IA", "Tese", "Energia Solar", "Detecção de Anomalias", "USP"]
---

# Minha Aventura com IA: Como Cocô de Pássaro e Painéis Solares Me Levaram ao Colapso Acadêmico

*Para os impacientes, minha tese está abaixo. Mas eu escrevi isso com carinho para que você possa entender o que passava pela minha cabeça enquanto escrevia esta tese toda. De nada. Ps.: Ela está em português brasileiro, aproveitem!*

[BDTA USP - Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas](https://bdta.abcd.usp.br/item/003227173)

## Alerta de Spoiler: O Que Diabos Eu Estava Pensando?

Como adiantei no meu [post anterior](https://theobredemann.com/pt/minha-jornada-no-mba/), meu projeto final era sobre detecção de anomalias em dados de séries temporais coletados de inversores de usinas solares. Escolhi este tema porque tinha acesso a um "bom" banco de dados na empresa onde trabalhava (teoricamente, mas todos nós sabemos como isso geralmente termina), além de colegas que supostamente eram especialistas no assunto, e um caso de uso interessante que com certeza não me levaria à beira da insanidade.

Falando em casos de uso, a manutenção sempre foi o calcanhar de Aquiles para empresas neste setor, especialmente para usinas de Geração Distribuída com contratos de geração relativamente rígidos e penalidades. A equipe de Operações e Manutenção tem um trabalho enorme para manter o desempenho de uma usina ótimo. Agora imagine fazer isso em mais de 50 usinas - é complexo a ponto de doer a mente. Porque aparentemente, uma usina não era suficiente para torturar essas pobres almas.

Se de alguma forma eu pudesse detectar degradação contínua de desempenho, poderia alertar alguém antes que um especialista pudesse identificá-la entre os 10.000 gráficos que eles olham diariamente. Sim, eu estava tentando salvar as pessoas da emocionante carreira de olhar para gráficos até os olhos sangrarem.

## "Mas Theo, os Inversores Não São Inteligentes?"

"Mas Theo," você pode dizer, "os inversores já são inteligentes e te avisam sobre curtos-circuitos, derating e outros problemas." (Se você não entendeu nenhum desses termos, leia minha tese. Ou não. A ignorância é uma benção.)

Sim, os inversores têm alguma detecção embutida, mas eles são limitados a problemas elétricos. Eles não conseguem detectar quando cocô de pássaro está bloqueando seus painéis solares, ou quando um galho de árvore está fazendo sombra, ou quando seus painéis estão apenas tendo um dia ruim. É aí que entra meu algoritmo.

## O Algoritmo: Teste Page-Hinkley

Implementei o teste Page-Hinkley, um método de gráfico de controle de soma cumulativa para detectar mudanças em dados de séries temporais. Ele é particularmente bom em detectar pequenas mudanças sustentadas que podem indicar degradação de desempenho em vez de falhas súbitas.

A ideia básica:
1. Definir um limite para desempenho aceitável
2. Acompanhar desvios cumulativos desse limite
3. Quando o desvio cumulativo exceder um certo limite, marcar como anomalia

Simples, né? Errado. O diabo está nos detalhes.

## Desafios Enfrentados

### 1. Problemas de Qualidade de Dados
- Pontos de dados ausentes (inversores offline, erros de comunicação)
- Taxas de amostragem inconsistentes
- Outliers que não faziam sentido (geração de energia negativa, alguém?)

### 2. Ajuste do Algoritmo
- Escolher o limite certo
- Definir a sensibilidade apropriada
- Lidar com variações sazonais

### 3. Validação
- Encontrar especialistas dispostos a validar minha abordagem
- Obter acesso a dados do mundo real para teste
- Provar que o algoritmo realmente funcionava

## O Problema dos Especialistas

Não vou me aprofundar muito nesta parte, mas tive experiências terríveis com "especialistas" que pareciam mais interessados em criticar do que ajudar. Essas pessoas aparentemente tiraram seus doutorados em "Fazer os Outros se Sentirem Inadequados".

Uma experiência particularmente memorável envolveu um especialista que:
1. Concordou em ajudar a validar minha abordagem
2. Passou 30 minutos me dizendo tudo o que eu estava fazendo errado
3. Não ofereceu nenhum feedback construtivo
4. Me deixou questionando toda a minha existência

Obrigado, doutor. Muito útil.

## Resultados

Apesar dos desafios, consegui:
- Implementar um sistema de detecção de anomalias funcional
- Testá-lo em dados reais de usinas solares
- Detectar problemas de desempenho que métodos tradicionais perderam
- Escrever uma tese que pode ser útil para alguém

## Lições Aprendidas

1. **Os dados nunca são tão bons quanto você acha que serão** - Sempre planeje para dados ausentes, inconsistentes ou simplesmente errados.

2. **Especialistas nem sempre são úteis** - Às vezes as pessoas que mais sabem são as menos dispostas a compartilhar.

3. **Algoritmos simples podem ser poderosos** - Você não precisa sempre da solução mais complexa para resolver um problema.

4. **A persistência compensa** - Mesmo quando você quer desistir, continue. A virada pode estar logo ali.

5. **Cocô de pássaro é um problema real para painéis solares** - Quem diria?

## A Tese em Si

Se você está realmente interessado em ler minha obra-prima (ou apenas quer ver o que 8 meses da minha vida produziram), você pode encontrá-la aqui:

[BDTA USP - Identificação de anomalias ofensoras à geração de usinas solares fotovoltaicas](https://bdta.abcd.usp.br/item/003227173)

Ela está em português, mas o Google Tradutor é seu amigo. O resumo básico: eu desenvolvi um algoritmo para detectar quando painéis solares não estão performando tão bem quanto deveriam, o que pode ajudar as equipes de manutenção a identificar e corrigir problemas mais rápido.

## Considerações Finais

