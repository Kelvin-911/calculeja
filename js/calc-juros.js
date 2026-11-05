import { formatBRL, parseBRLInput } from "./main.js";

export function calcularJurosCompostos({ capitalInicial, aporteMensal, taxaMensal, periodoMeses }) {
  let saldo = capitalInicial;
  const historico = [];
  let totalAportado = capitalInicial;

  for (let mes = 1; mes <= periodoMeses; mes++) {
    saldo += aporteMensal;
    totalAportado += aporteMensal;
    const juros = saldo * taxaMensal;
    saldo += juros;
    historico.push({ mes, saldo, juros });
  }

  const totalJuros = saldo - totalAportado;

  return { saldoFinal: saldo, totalAportado, totalJuros, historico };
}

function renderResultado(container, resultado) {
  const { saldoFinal, totalAportado, totalJuros, historico } = resultado;

  const marcos = historico.filter((h) => h.mes % Math.max(1, Math.round(historico.length / 6)) === 0 || h.mes === historico.length);

  const linhas = marcos
    .map((h) => `<tr><td>Mês ${h.mes}</td><td>${formatBRL(h.saldo)}</td></tr>`)
    .join("");

  container.innerHTML = `
    <div class="result-total">
      <div class="label">Valor final estimado</div>
      <div class="value">${formatBRL(saldoFinal)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Item</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>Total investido (aportes)</td><td>${formatBRL(totalAportado)}</td></tr>
        <tr><td>Total em juros</td><td>${formatBRL(totalJuros)}</td></tr>
      </tbody>
    </table>
    <h3 style="margin-top:1.25rem;font-size:0.95rem;">Evolução do saldo</h3>
    <table class="breakdown">
      <thead><tr><th>Período</th><th>Saldo acumulado</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;
}

export function initJurosCompostosForm() {
  const form = document.getElementById("form-juros");
  if (!form) return;
  const result = document.getElementById("resultado-juros");
  const errorEl = document.getElementById("erro-juros");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const capitalInicial = parseBRLInput(document.getElementById("capital-inicial").value) || 0;
    const aporteMensal = parseBRLInput(document.getElementById("aporte-mensal").value) || 0;
    const taxaValor = Number(document.getElementById("taxa-juros").value);
    const taxaPeriodo = document.getElementById("taxa-periodo").value;
    const periodoValor = Number(document.getElementById("periodo").value);
    const periodoUnidade = document.getElementById("periodo-unidade").value;

    if (capitalInicial < 0 || aporteMensal < 0) {
      errorEl.textContent = "Os valores de capital e aporte não podem ser negativos.";
      return;
    }
    if (!taxaValor || taxaValor <= 0) {
      errorEl.textContent = "Informe uma taxa de juros maior que zero.";
      return;
    }
    if (!periodoValor || periodoValor <= 0) {
      errorEl.textContent = "Informe um período maior que zero.";
      return;
    }

    const taxaMensal = taxaPeriodo === "anual" ? Math.pow(1 + taxaValor / 100, 1 / 12) - 1 : taxaValor / 100;
    const periodoMeses = periodoUnidade === "anos" ? periodoValor * 12 : periodoValor;

    const resultado = calcularJurosCompostos({ capitalInicial, aporteMensal, taxaMensal, periodoMeses });
    renderResultado(result, resultado);
  });
}
