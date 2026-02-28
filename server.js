const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// INDICADORES
// ========================================

// EMA
function calcularEMA(periodo, precos) {
  const k = 2 / (periodo + 1);
  let ema = precos[0];

  for (let i = 1; i < precos.length; i++) {
    ema = precos[i] * k + ema * (1 - k);
  }

  return ema;
}

// RSI
function calcularRSI(periodo, precos) {
  let ganhos = 0;
  let perdas = 0;

  for (let i = precos.length - periodo; i < precos.length - 1; i++) {
    const diferenca = precos[i + 1] - precos[i];

    if (diferenca >= 0) ganhos += diferenca;
    else perdas += Math.abs(diferenca);
  }

  if (perdas === 0) return 100;

  const rs = ganhos / perdas;

  return 100 - 100 / (1 + rs);
}

// Momentum
function calcularMomentum(precos) {
  const recente = precos[precos.length - 1];
  const antigo = precos[precos.length - 5];

  return recente - antigo;
}

// ========================================
// TESTE
// ========================================

app.get("/", (req, res) => {
  res.send("IA Trader Institucional ativa");
});

// ========================================
// ANALISE PROFISSIONAL
// ========================================

app.post("/analisar", async (req, res) => {
  try {
    const symbol = req.body.ativo || "BTCUSDT";
    const timeframe = req.body.timeframe || "4h";

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=150`,
    );

    const candles = await response.json();

    const precos = candles.map((c) => parseFloat(c[4]));

    const precoAtual = precos[precos.length - 1];

    const ema9 = calcularEMA(9, precos);
    const ema21 = calcularEMA(21, precos);

    const rsi = calcularRSI(14, precos);

    const momentum = calcularMomentum(precos);

    // ========================================
    // SISTEMA INSTITUCIONAL DE SCORE
    // ========================================

    let score = 0;
    let motivos = [];

    // ========================================
    // TENDENCIA PRINCIPAL
    // ========================================

    if (ema9 > ema21) {
      score += 35;
      motivos.push("Tendência principal de alta (EMA9 > EMA21)");
    } else {
      score -= 35;
      motivos.push("Tendência principal de baixa (EMA9 < EMA21)");
    }

    // ========================================
    // CONFIRMAÇÃO RSI
    // ========================================

    if (rsi > 55 && rsi < 70) {
      score += 20;
      motivos.push("RSI confirma força compradora");
    } else if (rsi < 45 && rsi > 30) {
      score -= 20;
      motivos.push("RSI confirma força vendedora");
    } else if (rsi >= 70) {
      score -= 25;
      motivos.push("Zona de sobrecompra (risco de reversão)");
    } else if (rsi <= 30) {
      score += 25;
      motivos.push("Zona de sobrevenda (possível reversão)");
    } else {
      motivos.push("RSI neutro");
    }

    // ========================================
    // MOMENTUM
    // ========================================

    if (momentum > 0) {
      score += 20;
      motivos.push("Momentum positivo");
    } else {
      score -= 20;
      motivos.push("Momentum negativo");
    }

    // ========================================
    // PREÇO VS EMA
    // ========================================

    if (precoAtual > ema9) {
      score += 15;
      motivos.push("Preço acima da EMA9");
    } else {
      score -= 15;
      motivos.push("Preço abaixo da EMA9");
    }

    // ========================================
    // ZONA PERIGOSA (mercado indeciso)
    // ========================================

    const diferencaEMAs = Math.abs(ema9 - ema21) / precoAtual;

    if (diferencaEMAs < 0.001) {
      score = score * 0.5;
      motivos.push("Mercado lateral / indeciso");
    }

    // ========================================
    // DECISAO FINAL
    // ========================================

    let decisao;
    let probabilidade;
    let recomendacao;

    if (score >= 50) {
      decisao = "LONG";

      probabilidade = Math.min(95, 60 + score);

      recomendacao =
        "Alta probabilidade de continuação de alta. Entrada LONG favorável.";
    } else if (score <= -50) {
      decisao = "SHORT";

      probabilidade = Math.min(95, 60 + Math.abs(score));

      recomendacao =
        "Alta probabilidade de continuação de baixa. Entrada SHORT favorável.";
    } else {
      decisao = "ABSTER";

      probabilidade = 50;

      recomendacao = "Mercado indefinido. Aguardar confirmação.";
    }

    // ========================================
    // RESPOSTA FINAL
    // ========================================

    res.json({
      ativo: symbol,

      decisao: decisao,

      probabilidade: probabilidade,

      preco: precoAtual.toFixed(4),

      indicadores: {
        rsi: rsi.toFixed(2),

        ema9: ema9.toFixed(4),

        ema21: ema21.toFixed(4),

        momentum: momentum.toFixed(4),
      },

      timeframe: timeframe,

      score: Math.round(score),

      motivos: motivos,

      recomendacao: recomendacao,
    });
  } catch (error) {
    console.log(error);

    res.json({
      decisao: "ERRO",
      probabilidade: 0,
    });
  }
});

// ========================================
// START
// ========================================

app.listen(3000, () => {
  console.log("IA Trader Institucional rodando em http://localhost:3000");
});
