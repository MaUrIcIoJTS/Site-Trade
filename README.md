# Área Trade + IA Trader

Sistema web para planejamento e registro de operações de trade com integração a um motor de análise técnica baseado em indicadores (EMA, RSI e Momentum), utilizando dados da API da Binance.

O projeto é dividido em duas partes:

- **Front-end:** HTML + CSS + JavaScript
- **Back-end:** Node.js + Express (motor de análise técnica)

---

# Funcionalidades

## Área Trade (Front-end)

- Cálculo automático de:
  - Stop Gain
  - Stop Loss
  - Lucro potencial
  - Perda potencial
- Consulta de cotação em tempo real via API da Binance
- Registro de operações abertas
- Finalização manual de trades (Ganho ou Perda)
- Estatísticas locais:
  - Total de ganhos
  - Total de perdas
  - Resultado acumulado
- Persistência de dados via `localStorage`

---

##  IA Trader (Back-end)

Sistema de análise técnica baseado em:

- EMA 9
- EMA 21
- RSI (14 períodos)
- Momentum

O motor calcula um **score institucional** baseado em:

- Tendência principal
- Confirmação via RSI
- Força do Momentum
- Relação preço x EMA
- Detecção de mercado lateral

Retorna:

- Decisão: `LONG`, `SHORT` ou `ABSTER`
- Probabilidade estimada
- Score final
- Indicadores técnicos
- Justificativa detalhada

---

# Estrutura do Projeto
/projeto
│
├── index.html
├── estilo.css
├── script.js
│
├── server.js
├── package.json

---

# Como executar o projeto

## Front-end

Basta abrir o arquivo:

index.html


No navegador.

---

## Back-end (IA Trader)

### Pré-requisitos

- Node.js instalado (versão 18+ recomendada)

### Instalação

No diretório do servidor:

npm install express cors node-fetch


### Executar servidor

node server.js


Saída esperada:

IA Trader Institucional rodando em http://localhost:3000

# Tecnologias Utilizadas

## Front-end

- HTML5
- JavaScript
- LocalStorage
- Fetch API

## Back-end

- Node.js
- Express
- node-fetch
- API pública da Binance

# ⚠️ Observações Importantes

- Parte da analise foi criada com a ajuda de IA, está demarcado nó código o início do uso.
- O sistema não executa ordens reais.
- A IA não garante resultados futuros.
- O cálculo de probabilidade é baseado em heurística.
- Dados vêm diretamente da API pública da Binance.
- O projeto é educacional.

# 📜 Licença

- Uso educacional.
