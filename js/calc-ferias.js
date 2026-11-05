import { formatBRL, parseBRLInput } from "./main.js";
import {
  calcularINSS,
  calcularIRRFSobreBase,
  calcularReducaoLei15270,
  DEDUCAO_POR_DEPENDENTE,
} from "./tabelas-fiscais-2026.js";

export function calcularFerias({ salarioBruto, diasGozados, diasVendidos, dependentes }) {
  const valorDia = salarioBruto / 30;

  const feriasGozadasBruto = valorDia * diasGozados;
  const umTercoGozadas = feriasGozadasBruto / 3;
  const baseTributavel = feriasGozadasBruto + umTercoGozadas;

  const { desconto: inss, detalhes: detalhesInss } = calcularINSS(baseTributavel);
  const baseIrrf = Math.max(0, baseTributavel - inss - dependentes * DEDUCAO_POR_DEPENDENTE);
  const impostoCalculado = calcularIRRFSobreBase(baseIrrf);
  const reducao = calcularReducaoLei15270(baseTributavel, impostoCalculado);
  const irrf = Math.max(0, impostoCalculado - reducao);

  const feriasLiquidas = Math.max(0, baseTributavel - inss - irrf);

  const valorAbono = valorDia * diasVendidos;
  const umTercoAbono = valorAbono / 3;
  const totalAbono = valorAbono + umTercoAbono;

  const totalLiquido = feriasLiquidas + totalAbono;

  return {
    diasGozados,
    diasVendidos,
    feriasGozadasBruto,
    umTercoGozadas,
    baseTributavel,
    inss,
    detalhesInss,
    irrf,
    reducaoLei15270: reducao,
    feriasLiquidas,
    valorAbono,
    umTercoAbono,
    totalAbono,
    totalLiquido,
  };
}

function renderResultado(container, r) {
  container.innerHTML = `
    <div class="result-total">
      <div class="label">Total líquido estimado a receber</div>
      <div class="value">${formatBRL(r.totalLiquido)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Item</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>Férias gozadas (${r.diasGozados} dias)</td><td>${formatBRL(r.feriasGozadasBruto)}</td></tr>
        <tr><td>1/3 constitucional sobre férias gozadas</td><td>${formatBRL(r.umTercoGozadas)}</td></tr>
        <tr><td>INSS sobre as férias</td><td>${formatBRL(r.inss)}</td></tr>
        <tr><td>IRRF sobre as férias</td><td>${formatBRL(r.irrf)}</td></tr>
        <tr><td>Redução Lei 15.270/2025</td><td>${formatBRL(r.reducaoLei15270)}</td></tr>
        <tr><td>Líquido das férias gozadas</td><td>${formatBRL(r.feriasLiquidas)}</td></tr>
        ${
          r.diasVendidos > 0
            ? `<tr><td>Abono pecuniário (${r.diasVendidos} dias vendidos, isento)</td><td>${formatBRL(r.valorAbono)}</td></tr>
               <tr><td>1/3 sobre o abono (isento)</td><td>${formatBRL(r.umTercoAbono)}</td></tr>`
            : ""
        }
      </tbody>
      <tfoot>
        <tr><td>Total líquido</td><td>${formatBRL(r.totalLiquido)}</td></tr>
      </tfoot>
    </table>
  `;
}

export function initFeriasForm() {
  const form = document.getElementById("form-ferias");
  if (!form) return;
  const result = document.getElementById("resultado-ferias");
  const errorEl = document.getElementById("erro-ferias");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const salarioBruto = parseBRLInput(document.getElementById("salario-bruto-ferias").value);
    const diasGozados = Number(document.getElementById("dias-gozados").value);
    const diasVendidos = Number(document.getElementById("dias-vendidos").value) || 0;
    const dependentes = Number(document.getElementById("dependentes-ferias").value) || 0;

    if (!salarioBruto || salarioBruto <= 0) {
      errorEl.textContent = "Informe um salário bruto maior que zero.";
      return;
    }
    if (!diasGozados || diasGozados <= 0) {
      errorEl.textContent = "Informe quantos dias de férias serão gozados.";
      return;
    }
    if (diasVendidos > 10) {
      errorEl.textContent = "O máximo de dias que podem ser vendidos (abono) é 10 (1/3 de 30 dias).";
      return;
    }
    if (diasGozados + diasVendidos > 30) {
      errorEl.textContent = "A soma de dias gozados e vendidos não pode passar de 30.";
      return;
    }

    const resultado = calcularFerias({ salarioBruto, diasGozados, diasVendidos, dependentes });
    renderResultado(result, resultado);
  });
}
