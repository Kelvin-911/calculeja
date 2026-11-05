import { formatBRL, parseBRLInput } from "./main.js";

export function calcularHorasExtras({ salarioBruto, horasMensais, horas50, horas100, horasNoturnas }) {
  const valorHoraNormal = salarioBruto / horasMensais;
  const valorHora50 = valorHoraNormal * 1.5;
  const valorHora100 = valorHoraNormal * 2;

  const totalHoras50 = horas50 * valorHora50;
  const totalHoras100 = horas100 * valorHora100;
  const adicionalNoturno = horasNoturnas * valorHoraNormal * 0.2;

  const totalBruto = totalHoras50 + totalHoras100 + adicionalNoturno;

  return {
    valorHoraNormal,
    valorHora50,
    valorHora100,
    totalHoras50,
    totalHoras100,
    adicionalNoturno,
    horas50,
    horas100,
    horasNoturnas,
    totalBruto,
  };
}

function renderResultado(container, r) {
  container.innerHTML = `
    <div class="result-total">
      <div class="label">Total bruto estimado de horas extras</div>
      <div class="value">${formatBRL(r.totalBruto)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Item</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td>Valor da hora normal</td><td>${formatBRL(r.valorHoraNormal)}</td></tr>
        ${r.horas50 > 0 ? `<tr><td>Horas extras 50% (${r.horas50}h × ${formatBRL(r.valorHora50)})</td><td>${formatBRL(r.totalHoras50)}</td></tr>` : ""}
        ${r.horas100 > 0 ? `<tr><td>Horas extras 100% (${r.horas100}h × ${formatBRL(r.valorHora100)})</td><td>${formatBRL(r.totalHoras100)}</td></tr>` : ""}
        ${r.horasNoturnas > 0 ? `<tr><td>Adicional noturno 20% (${r.horasNoturnas}h)</td><td>${formatBRL(r.adicionalNoturno)}</td></tr>` : ""}
      </tbody>
      <tfoot>
        <tr><td>Total bruto</td><td>${formatBRL(r.totalBruto)}</td></tr>
      </tfoot>
    </table>
  `;
}

export function initHorasExtrasForm() {
  const form = document.getElementById("form-horas-extras");
  if (!form) return;
  const result = document.getElementById("resultado-horas-extras");
  const errorEl = document.getElementById("erro-horas-extras");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const salarioBruto = parseBRLInput(document.getElementById("salario-bruto-he").value);
    const horasMensais = Number(document.getElementById("horas-mensais").value) || 220;
    const horas50 = Number(document.getElementById("horas-50").value) || 0;
    const horas100 = Number(document.getElementById("horas-100").value) || 0;
    const horasNoturnas = Number(document.getElementById("horas-noturnas").value) || 0;

    if (!salarioBruto || salarioBruto <= 0) {
      errorEl.textContent = "Informe um salário bruto maior que zero.";
      return;
    }
    if (!horasMensais || horasMensais <= 0) {
      errorEl.textContent = "Informe uma carga horária mensal válida.";
      return;
    }
    if (horas50 === 0 && horas100 === 0 && horasNoturnas === 0) {
      errorEl.textContent = "Informe ao menos um tipo de hora extra ou adicional noturno.";
      return;
    }

    const resultado = calcularHorasExtras({ salarioBruto, horasMensais, horas50, horas100, horasNoturnas });
    renderResultado(result, resultado);
  });
}
