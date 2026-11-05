import { formatBRL, parseBRLInput } from "./main.js";
import {
  calcularINSS,
  calcularIRRFSobreBase,
  calcularReducaoLei15270,
  DEDUCAO_POR_DEPENDENTE,
  DESCONTO_SIMPLIFICADO,
} from "./tabelas-fiscais-2026.js";

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
