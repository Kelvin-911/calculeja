import { formatBRL, parseBRLInput } from "./main.js";
import {
  calcularINSS,
  calcularIRRFSobreBase,
  calcularReducaoLei15270,
  DEDUCAO_POR_DEPENDENTE,
} from "./tabelas-fiscais-2026.js";

export function calcularDecimoTerceiro({ salarioBruto, mesesTrabalhados, dependentes }) {
  const meses = Math.min(12, Math.max(0, mesesTrabalhados));
  const decimoBruto = (salarioBruto / 12) * meses;

  const primeiraParcela = decimoBruto / 2;
  const segundaParcelaBruta = decimoBruto / 2;

  const { desconto: inss, detalhes: detalhesInss } = calcularINSS(decimoBruto);
  const baseIrrf = Math.max(0, decimoBruto - inss - dependentes * DEDUCAO_POR_DEPENDENTE);
  const impostoCalculado = calcularIRRFSobreBase(baseIrrf);
  const reducao = calcularReducaoLei15270(decimoBruto, impostoCalculado);
  const irrf = Math.max(0, impostoCalculado - reducao);

  const segundaParcelaLiquida = Math.max(0, segundaParcelaBruta - inss - irrf);
  const totalLiquido = primeiraParcela + segundaParcelaLiquida;

  return {
    meses,
    decimoBruto,
    primeiraParcela,
    segundaParcelaBruta,
    inss,
    detalhesInss,
    irrf,
    reducaoLei15270: reducao,
    segundaParcelaLiquida,
    totalLiquido,
  };
}

function renderResultado(container, r) {
  container.innerHTML = `
    <div class="result-total">
      <div class="label">Total líquido estimado do 13º</div>
      <div class="value">${formatBRL(r.totalLiquido)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Item</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>13º bruto (${r.meses}/12 avos)</td><td>${formatBRL(r.decimoBruto)}</td></tr>
        <tr><td>1ª parcela (sem desconto, até 30/11)</td><td>${formatBRL(r.primeiraParcela)}</td></tr>
        <tr><td>2ª parcela bruta</td><td>${formatBRL(r.segundaParcelaBruta)}</td></tr>
        <tr><td>INSS sobre o 13º (descontado na 2ª parcela)</td><td>${formatBRL(r.inss)}</td></tr>
        <tr><td>IRRF sobre o 13º (descontado na 2ª parcela)</td><td>${formatBRL(r.irrf)}</td></tr>
        <tr><td>Redução Lei 15.270/2025</td><td>${formatBRL(r.reducaoLei15270)}</td></tr>
        <tr><td>2ª parcela líquida</td><td>${formatBRL(r.segundaParcelaLiquida)}</td></tr>
      </tbody>
      <tfoot>
        <tr><td>Total líquido (1ª + 2ª parcela)</td><td>${formatBRL(r.totalLiquido)}</td></tr>
      </tfoot>
    </table>
  `;
}

export function initDecimoTerceiroForm() {
  const form = document.getElementById("form-decimo-terceiro");
  if (!form) return;
  const result = document.getElementById("resultado-decimo-terceiro");
  const errorEl = document.getElementById("erro-decimo-terceiro");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const salarioBruto = parseBRLInput(document.getElementById("salario-bruto-13").value);
    const mesesTrabalhados = Number(document.getElementById("meses-trabalhados").value);
    const dependentes = Number(document.getElementById("dependentes-13").value) || 0;

    if (!salarioBruto || salarioBruto <= 0) {
      errorEl.textContent = "Informe um salário bruto maior que zero.";
      return;
    }
    if (!mesesTrabalhados || mesesTrabalhados <= 0 || mesesTrabalhados > 12) {
      errorEl.textContent = "Informe um número de meses entre 1 e 12.";
      return;
    }

    const resultado = calcularDecimoTerceiro({ salarioBruto, mesesTrabalhados, dependentes });
    renderResultado(result, resultado);
  });
}
