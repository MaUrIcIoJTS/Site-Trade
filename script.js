let respostas = []; //Armazena os calculos do input Verificar
let ganhos = []; //Armazena a quantidade de trades finalizado com ganhos
let perdas = []; //Armazena a quantidade de trades finalizado com perdas
let historico = []; //Armazena os valores de ganho e perda em cada trade
let inRespostas = null; //Responsavel por armazenar o conteudo da function verificar.
let res = document.getElementById("outRes"); //Variavel externa para poder ser utilizada em outras function
let usarCotacao = false; //Valor booleano para ativar a function
let timeframe = document.getElementById("timeframe").value; //Valor do time frame selecionado no HTML

//Atualiza o valor do time frame quando o usuário seleciona uma nova opção
document.getElementById("timeframe").addEventListener("change", function () {
  timeframe = this.value;
});

//Vinculando as funções aos botões.
const button = document.getElementById("btCalcular");
button.addEventListener("click", verificar);

const buttonSalvar = document.getElementById("btOperacao");
buttonSalvar.addEventListener("click", salvar);

const preCheck = document.getElementById("preMercado");
preCheck.addEventListener("change", function () {
  usarCotacao = this.checked;
  console.log("campo marcado:", usarCotacao);
});

//Função para carregar o conteudo salvo no cache na página.
window.addEventListener("load", function () {
  let armazenadas = this.localStorage.getItem("respostas"); //recebe os dados brutos salvos em "respostas"
  if (armazenadas) {
    respostas = JSON.parse(armazenadas); //transforma de volta em array
    mostrarRespostas(); //informa o nome da function
  }
  let ganhosArmazenado = this.localStorage.getItem("ganhos");
  if (ganhosArmazenado) {
    ganhos = JSON.parse(ganhosArmazenado);
    estatisticas();
  }

  let perdasArmazenada = this.localStorage.getItem("perdas");
  if (perdasArmazenada) {
    perdas = JSON.parse(perdasArmazenada);
    estatisticas();
  }
  let mediaArmazenada = this.localStorage.getItem("historico");
  if (mediaArmazenada) {
    historico = JSON.parse(mediaArmazenada);
    estatisticas();
  }
});

//Solicitar a cotação do token informado em ativo da API HTML da Binance
async function cotacao(ativo) {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${ativo}`; //busca pelo ativo informado no campo
  try {
    const res = await fetch(url); //Faz a requisição HTTP na url informada e espera a resposta
    const data = await res.json(); //Faz a conversão da resposta para um arquivo .json
    if (!data.price) return "Token inválido"; //Se a data.price for null ele retorna "Token inválido"

    return Number(data.price).toFixed(2); //Converte o retorno da data.price em Number e arredonda o valor em duas casas decimais.
  } catch {
    return "Erro ao buscar";
  }
}

//Função para verificar os valores iniciais do trade.
async function verificar() {
  let outAtivo = document.getElementById("outAtivo");
  let ativo = outAtivo.value.toUpperCase() + "USDT";
  let inOperacao = document.getElementById("inOperacao");
  let operacao = Number(inOperacao.value);
  let inEntrada = document.getElementById("inEntrada");
  let entrada = Number(inEntrada.value);
  let inAlavancagem = document.getElementById("inAlavancagem");
  let alavancagem = Number(inAlavancagem.value);
  let inGain = document.getElementById("inGain");
  let gain = Number(inGain.value) / 100;
  let inLoss = document.getElementById("inLoss");
  let loss = Number(inLoss.value) / 100;

  //Busca a cotação
  const cot = await cotacao(ativo);

  if (usarCotacao && !isNaN(Number(cot))) {
    entrada = cot;
    document.getElementById("inEntrada").value = entrada; //Informa a cotação atual no input
  }
  console.log("campo marcado:", entrada);
  //Calculo entradas trade
  let outGain = entrada * (1 + gain);
  let outLoss = entrada * (1 - loss);
  let lucro = operacao * gain * alavancagem;
  let perda = operacao * loss * alavancagem;

  if (operacao == 0 || isNaN(operacao) || entrada == 0 || isNaN(entrada)) {
    alert("Favor inserir ao menos o valor da 'operação' e da 'entrada'..");
    return;
  } else {
    //Variavel para converter a data para string.
    res.textContent = "";
    let agora = new Date();
    let horarioFormatado = agora.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    //Array onde fica todos os dados manipulados separados.
    let resposta = {
      ativo: ativo,
      cotacao: cot,
      texto:
        "Ativo:" +
        ativo +
        "\n" +
        "Cotação atual: $" +
        cot +
        "\n" +
        "Entrada: $" +
        entrada +
        "\n" +
        "StopGain: $" +
        outGain.toFixed(2) +
        "\n" +
        "StopLoss: $" +
        outLoss.toFixed(2) +
        "\n" +
        "Lucro: $" +
        lucro.toFixed(2) +
        "\n" +
        "Perda: $" +
        perda.toFixed(2) +
        "\n",
      lucro: lucro,
      perda: perda,
      status: null,
      data: horarioFormatado,
    };
    inRespostas = resposta;
    res.textContent = inRespostas.texto;
  }
}

//Salva o conteudo da variavel verificar no localStorage (respostas)
function salvar() {
  res.textContent = ""; //Limpa o campo onde a verificação foi informada.
  respostas.push(inRespostas); //Integra as informações da var resposta para a var respostas.
  localStorage.setItem("respostas", JSON.stringify(respostas));
  //mostra as respostas na tela por meio da função criada no começo
  mostrarRespostas();
}

//Função onde pega as informações do cache (respostas) e retorna em uma div formatada.
function mostrarRespostas() {
  let tradeAtivo = document.getElementById("tradeAtivos");
  tradeAtivo.textContent = "";
  respostas.forEach((resp, index) => {
    let div = document.createElement("div");
    div.innerHTML = `
          <pre>${resp.texto}</pre>
          <small>${resp.ativo} - ${resp.data}</small><br>
          <button onclick="finalizarTrade(${index}, true)">Ganho</button> 
          <button onclick="finalizarTrade(${index}, false)">Perca</button> 
          <hr>
        `;
    tradeAtivo.appendChild(div);
  });
}

//Função para finalizar o trade da box2 e retirar do cache inicial
//Armazenar info especificas como lucro, perda e historico em outros caches.
function finalizarTrade(index, ganhou) {
  let trade = respostas[index];

  if (ganhou) {
    ganhos.push(trade.lucro);
    historico.push(trade.lucro.toFixed(2));
    localStorage.setItem("ganhos", JSON.stringify(ganhos));
  } else {
    perdas.push(trade.perda);
    historico.push(trade.perda.toFixed(2));
    localStorage.setItem("perdas", JSON.stringify(perdas));
  }

  localStorage.setItem("historico", JSON.stringify(historico));

  //Responsável por retirar o conteudo do cache inicial ao apertar um dos botões criados na DIV
  respostas.splice(index, 1);
  localStorage.setItem("respostas", JSON.stringify(respostas));

  mostrarRespostas();
  estatisticas();
}

//Função da area de estatisticas box3.
function estatisticas() {
  let totalGanhos = document.getElementById("totalGanhos");
  let media = document.getElementById("media");
  let totalPerdas = document.getElementById("totalPerda");
  let somaGanhos = ganhos.reduce((a, b) => a + b, 0);
  let somaPerdas = perdas.reduce((a, b) => a + b, 0);
  totalGanhos.textContent = ganhos.length;
  totalPerdas.textContent = perdas.length;
  let valorTotal = somaGanhos - somaPerdas;
  media.textContent = `$${valorTotal.toFixed(2)}`;
}
//_________________________________________________________________________________
//Gerado com IA

async function analisarIA() {
  const timeframe = document.getElementById("timeframe").value; //Valor do time frame selecionado no HTML
  const campo = document.getElementById("outAtivo");

  if (!campo) {
    alert("Campo outAtivo não encontrado");
    return;
  }

  let ativo = campo.value.trim().toUpperCase();

  if (!ativo) {
    alert("Digite um ativo. Exemplo: BTC");
    return;
  }

  // adiciona USDT automaticamente ao final do ativo, caso o usuário não tenha digitado
  if (!ativo.endsWith("USDT")) {
    ativo += "USDT";
  }

  try {
    const response = await fetch("http://localhost:3000/analisar", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ativo: ativo,
        timeframe: timeframe,
      }),
    });

    const data = await response.json();

    let mensagem = `
ATIVO: ${data.ativo}

DECISÃO: ${data.decisao}
PROBABILIDADE: ${data.probabilidade}%

PREÇO: ${data.preco}

RSI: ${data.indicadores.rsi}
EMA9: ${data.indicadores.ema9}
EMA21: ${data.indicadores.ema21}

TIMEFRAME: ${data.timeframe}
SCORE: ${data.score}

MOTIVOS:
- ${data.motivos.join("\n- ")}

RECOMENDAÇÃO:
${data.recomendacao}
`;

    alert(mensagem);
  } catch (erro) {
    console.log(erro);
    alert("Erro ao conectar com IA");
  }
}
