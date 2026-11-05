import { formatBRL, parseBRLInput } from "./main.js";

// Tabelas vigentes 2026 (confirmar sempre em gov.br/inss e gov.br/receitafederal
// antes de decisões reais — ver fontes no README do projeto).
const INSS_FAIXAS = [
  { limite: 1621.0, aliquota: 0.075 },
  { limite: 2902.84, aliquota: 0.09 },
  { limite: 4354.27, aliquota: 0.12 },
  { limite: 8475.55, aliquota: 0.14 },
];
const INSS_TETO_DESCONTO = 988.09;

const IRRF_FAIXAS = [
  { limite: 2428.8, aliquota: 0, deducao: 0 },
  { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { limite: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { limite: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { limite: Infinity, aliquota: 0.275, deducao: 908.73 },
];

const DEDUCAO_POR_DEPENDENTE = 189.59;
const DESCONTO_SIMPLIFICADO = 607.2;

function calcularINSS(salarioBruto) {
  const baseContribuicao = Math.min(salarioBruto, 8475.55);
  let desconto = 0;
  let faixaAnterior = 0;
  const detalhes = [];

  for (const faixa of INSS_FAIXAS) {
    if (baseContribuicao <= faixaAnterior) break;
    const topoFaixa = Math.min(baseContribuicao, faixa.limite);
    const valorNaFaixa = Math.max(0, topoFaixa - faixaAnterior);
    const valorFaixaDesconto = valorNaFaixa * faixa.aliquota;
    desconto += valorFaixaDesconto;
    detalhes.push({
      faixa: `${formatBRL(faixaAnterior)} – ${formatBRL(faixa.limite)}`,
      aliquota: faixa.aliquota,
      valor: valorFaixaDesconto,
    });
    faixaAnterior = faixa.limite;
  }

  desconto = Math.min(desconto, INSS_TETO_DESCONTO);
  return { desconto, detalhes };
}

function calcularIRRFSobreBase(base) {
  if (base <= 0) return 0;
  const faixa = IRRF_FAIXAS.find((f) => base <= f.limite);
  const imposto = base * faixa.aliquota - faixa.deducao;
  return Math.max(0, imposto);
}

function calcularReducaoLei15270(salarioBruto, impostoCalculado) {
  let reducao = 0;
  if (salarioBruto <= 5000) {
    reducao = 312.89;
  } else if (salarioBruto <= 7350) {
    reducao = Math.max(0, 978.62 - 0.133145 * salarioBruto);
  }
  return Math.min(reducao, impostoCalculado);
}

export function calcularSalarioLiquido({ salarioBruto, dependentes, outrosDescontos }) {
  const { desconto: inss, detalhes: detalhesInss } = calcularINSS(salarioBruto);

  const baseLegal = Math.max(0, salarioBruto - inss - dependentes * DEDUCAO_POR_DEPENDENTE);
  const baseSimplificada = Math.max(0, salarioBruto - DESCONTO_SIMPLIFICADO);

  const impostoLegal = calcularIRRFSobreBase(baseLegal);
  const impostoSimplificado = calcularIRRFSobreBase(baseSimplificada);

  const usaSimplificado = impostoSimplificado < impostoLegal;
  const impostoAntesReducao = usaSimplificado ? impostoSimplificado : impostoLegal;

  const reducao = calcularReducaoLei15270(salarioBruto, impostoAntesReducao);
  const irrfFinal = Math.max(0, impostoAntesReducao - reducao);

  const totalDescontos = inss + irrfFinal + (outrosDescontos || 0);
  const salarioLiquido = Math.max(0, salarioBruto - totalDescontos);

  return {
    salarioBruto,
    inss,
    detalhesInss,
    irrfFinal,
    reducaoLei15270: reducao,
    metodoIrrf: usaSimplificado ? "Desconto simplificado" : "Dependentes + deduções legais",
    outrosDescontos: outrosDescontos || 0,
    totalDescontos,
    salarioLiquido,
  };
}

function renderResultado(container, resultado) {
  const { inss, detalhesInss, irrfFinal, reducaoLei15270, metodoIrrf, outrosDescontos, totalDescontos, salarioLiquido } =
    resultado;

  const linhasInss = detalhesInss
    .filter((d) => d.valor > 0)
    .map(
      (d) =>
        `<tr><td>INSS (${(d.aliquota * 100).toFixed(1)}%) — faixa ${d.faixa}</td><td>${formatBRL(d.valor)}</td></tr>`
    )
    .join("");

  container.innerHTML = `
    <div class="result-total">
      <div class="label">Salário líquido estimado</div>
      <div class="value">${formatBRL(salarioLiquido)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Item</th><th>Valor</th></tr></thead>
      <tbody>
        ${linhasInss}
        <tr><td>INSS total</td><td>${formatBRL(inss)}</td></tr>
        <tr><td>IRRF (método: ${metodoIrrf})</td><td>${formatBRL(irrfFinal)}</td></tr>
        <tr><td>Redução Lei 15.270/2025</td><td>${formatBRL(reducaoLei15270)}</td></tr>
        ${outrosDescontos > 0 ? `<tr><td>Outros descontos informados</td><td>${formatBRL(outrosDescontos)}</td></tr>` : ""}
      </tbody>
      <tfoot>
        <tr><td>Total de descontos</td><td>${formatBRL(totalDescontos)}</td></tr>
      </tfoot>
    </table>
  `;
}

export function initSalarioLiquidoForm() {
  const form = document.getElementById("form-salario");
  if (!form) return;
  const result = document.getElementById("resultado-salario");
  const errorEl = document.getElementById("erro-salario");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const salarioBruto = parseBRLInput(document.getElementById("salario-bruto").value);
    const dependentes = Number(document.getElementById("dependentes").value) || 0;
    const outrosDescontos = parseBRLInput(document.getElementById("outros-descontos").value) || 0;

    if (!salarioBruto || salarioBruto <= 0) {
      errorEl.textContent = "Informe um salário bruto maior que zero.";
      return;
    }
    if (dependentes < 0) {
      errorEl.textContent = "O número de dependentes não pode ser negativo.";
      return;
    }

    const resultado = calcularSalarioLiquido({ salarioBruto, dependentes, outrosDescontos });
    renderResultado(result, resultado);
  });
}
