---
title: "Detecção de Problemas em Usinas Solares: Por Que Um Modelo Só Não Bastou"
date: 2026-09-06T09:00:00Z
type: posts
tags:
  - "pt"
  - "ia"
  - "energia-solar"
  - "machine-learning"
---

Uma usina solar parece simples até o momento em que precisamos decidir se existe de fato algum problema. A geração caiu: foi uma nuvem, temperatura alta do módulo, sujeira, um inversor com dificuldade, um sensor ruim ou uma falha real? Se a resposta for apenas “a potência caiu”, toda tarde nublada vira uma emergência. Ninguém merece esse dashboard.

Foi por isso que voltei a um tema que já tinha me causado uma quantidade respeitável de sofrimento durante a minha tese de IA: detectar perda de desempenho em usinas solares. Desta vez, em vez de tentar fazer um único algoritmo carregar o projeto inteiro nas costas, montei um pequeno fluxo em que cada modelo tem uma função clara.

O projeto completo em notebooks está no [GitHub](https://github.com/theobredemann/solar-plant-problem-detection).

## Começar pelo normal, não pela falha

O primeiro passo foi quase chato — e é justamente por isso que era importante. Antes de prever qualquer coisa, verifiquei se os dados se comportavam como dados solares deveriam. As medições da Planta 1 não têm valores nulos nas colunas carregadas, têm boa completude temporal e mostram um ciclo diário muito claro: quase nada de geração à noite, subida pela manhã, pico ao meio-dia e queda no fim da tarde.

Isso parece óbvio, mas muda todo o problema. Um valor baixo à meia-noite não é uma anomalia. Um valor baixo com irradiação alta pode ser. Ou seja: potência bruta não é o sinal; **potência comparada às condições** é o sinal.

## Uma usina, duas visões úteis

Modelei os dados em dois níveis.

No **nível da planta**, somei a geração dos inversores em cada timestamp. Assim respondo à pergunta maior: *a usina está produzindo o que deveria produzir agora?* É a visão certa para um dashboard de saúde, perda generalizada de desempenho e problemas que afetam o site inteiro.

No **nível do inversor**, cada fonte mantém seu próprio histórico. A pergunta muda para: *qual fonte parecida com um inversor está se comportando de forma diferente?* Uma usina pode parecer razoável no total enquanto um equipamento perde desempenho silenciosamente. Agregar cedo demais esconderia essa pista.

O objetivo não é escolher um nível para sempre. O monitoramento da planta diz que algo merece atenção; o diagnóstico por inversor ajuda a descobrir onde olhar.

## A barra mínima: vencer a resposta óbvia

Comparei todos os modelos com uma baseline ingênua: prever que o próximo valor será igual ao último. Não é glamouroso, mas é honesto. Se um modelo complexo não consegue vencer essa regra, ele não merece o custo de manutenção que traz junto.

A métrica principal é WAPE. Pense nela como a parcela da energia total gerada que o modelo deixou de explicar: **quanto mais perto de zero, melhor**. Um WAPE de `0.038` significa que o erro acumulado de previsão equivale a aproximadamente 3,8% da geração real; `0.192` significa 19,2%. Não é probabilidade nem nota. É uma proporção prática de erro, que continua fazendo sentido quando a geração solar se aproxima de zero à noite.

## LSTM: memória útil, maquinaria mais pesada

Uma LSTM é uma rede neural que lê uma sequência, não uma linha isolada. Aqui ela vê as 96 observações anteriores de quinze em quinze minutos — aproximadamente um dia — e aprende se a geração está subindo, no pico ou caindo.

Para os inversores, a LSTM chegou a WAPE **0.225**, melhor que a baseline em **0.312**. É um ganho útil, especialmente porque o notebook mostra quais inversores e quais horas do dia concentram os maiores erros.

No nível da planta, a LSTM também superou a baseline: **0.274** contra **0.303**. Portanto, memória temporal ajuda. Mas ela é mais pesada para treinar, exige janelas contínuas e escalonamento cuidadoso, e perde para modelos que conseguem enxergar o clima atual diretamente.

Isso não torna a LSTM um fracasso. Mostra onde ela se encaixa: benchmark de sequência e ferramenta de diagnóstico, não o estimador padrão em tempo real.

## Árvores: a vencedora prática para nowcasting

LightGBM e XGBoost funcionam de outra forma. Em vez de guardar uma sequência longa na memória, combinam muitas pequenas decisões: a irradiação está alta? É meio-dia? A produção estava subindo há alguns minutos? A temperatura do módulo está incomum?

Com o clima atual disponível, isso combina muito bem com geração solar. No nível do inversor, o LightGBM chegou a WAPE **0.055** e o XGBoost a **0.062**, contra **0.202** da baseline. No nível da planta, LightGBM chegou a **0.038** e XGBoost a **0.039**, enquanto a baseline ficou em **0.192**.

Os números tornam a decisão razoavelmente clara: para estimar a geração esperada no momento atual, os modelos de árvore são a opção mais forte e simples deste projeto.

Mas há uma ressalva importante. Isto é **nowcasting condicionado ao clima**, não previsão pura do futuro. O modelo usa irradiação e temperatura atuais, o que é perfeito para monitoramento. Para prever horas à frente, seriam necessárias previsões meteorológicas ou apenas variáveis do passado.

## Transformando a diferença em alerta útil

Mesmo um bom modelo de geração esperada não deveria enviar alerta para todo pequeno erro. Nuvens se movem, sensores oscilam e uma usina solar não é uma máquina perfeitamente lisa.

Para essa etapa, usei o Page-Hinkley, um detector leve de mudanças vindo do mundo maravilhosamente pouco fashion das estatísticas antigas. Ele observa um único score de degradação:

```text
degradation_score = max(geração esperada - geração real, 0)
```

Se a planta produz mais do que o esperado, o score é zero. Se produz menos repetidamente, o score sobe. O Page-Hinkley procura essa mudança persistente, em vez de entrar em pânico com cada pico isolado.

No período de teste, ele produziu nove alertas. O maior aconteceu em 14 de junho de 2020 às 13:45, com score de degradação perto de 23.356. Os alertas são salvos com timestamp e severidade, então podem ser investigados em vez de apenas admirados num gráfico e esquecidos.

Ele pode ser usado? Sim — como gatilho de investigação. Ele pode dizer ao operador: “este período está incomum o suficiente para olhar”. Ele não pode provar que um inversor falhou. Os dados não têm eventos de manutenção rotulados, então ainda não existe uma forma honesta de afirmar a taxa de falso positivo ou a acurácia de detecção de falhas. Essa validação precisa de feedback de campo.

## O que eu usaria na prática

Se eu fosse colocar isso em um fluxo real, começaria com LightGBM ou XGBoost no nível da planta para estimar o que o site deveria produzir. Quando o residual ficasse relevante, consultaria os resíduos das árvores no nível do inversor para localizar a provável origem. O Page-Hinkley destacaria diferenças persistentes para que elas não se perdessem em milhares de leituras normais.

As LSTMs continuariam na caixa de ferramentas: úteis para análise de sequência, diagnóstico e para entender o quanto o histórico importa. Apenas não seriam o primeiro componente que eu colocaria em produção para este caso com sensores meteorológicos e clima atual disponível.

A lição não foi que um modelo “venceu”. O resultado útil é a cadeia de raciocínio:

```text
clima atual + geração recente
        -> geração esperada
        -> diferença entre real e esperado
        -> alerta para diferença persistente
        -> contexto da planta + investigação por inversor
```

Isso é muito mais útil do que um modelo sofisticado prevendo o próximo número de uma planilha. Dá a uma pessoa um motivo para olhar no lugar certo.
