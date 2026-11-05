import { formatBRL, parseBRLInput } from "./main.js";

const MS_DIA = 24 * 60 * 60 * 1000;

// Meses completos entre duas datas: incrementa mês a mês pelo calendário real e
// soma mais 1 mês se a fração restante tiver 15 dias ou mais (regra da CLT).
function mesesCompletos(inicio, fim) {
  let meses = 0;
  let cursor = new Date(inicio);
  while (true) {
    const proximo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    if (proximo <= fim) {
      meses++;
      cursor = proximo;
    } else {
      break;
    }
  }
  const diasRestantes = Math.round((fim - cursor) / MS_DIA);
  if (diasRestantes >= 15) meses++;
  return meses;
}

function anosCompletos(inicio, fim) {
  let anos = 0;
  let cursor = new Date(inicio);
  while (true) {
    const proximo = new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate());
    if (proximo <= fim) {
      anos++;
      cursor = proximo;
    } else {
      break;
    }
  }
  return anos;
}

export function calcularRescisao({ salarioBruto, admissao, desligamento, tipo, saldoFgts, temFeriasVencidas }) {
  const salarioDiario = salarioBruto / 30;
  const diasNoMesDesligamento = desligamento.getDate();
  const saldoSalario = salarioDiario * diasNoMesDesligamento;

  const anosServico = anosCompletos(admissao, desligamento);

  // 13º proporcional: conta a partir de 1º de janeiro do ano do desligamento
  // (ou da admissão, se for mais recente).
  const inicioAno = new Date(desligamento.getFullYear(), 0, 1);
  const inicioContagem13 = admissao > inicioAno ? admissao : inicioAno;
  const meses13 = Math.min(12, mesesCompletos(inicioContagem13, desligamento));
  const decimoTerceiroProporcional = (salarioBruto / 12) * meses13;

  // Férias proporcionais: conta a partir do último aniversário do período aquisitivo.
  let ultimoAniversario = new Date(admissao.getFullYear() + anosServico, admissao.getMonth(), admissao.getDate());
  if (ultimoAniversario > desligamento) {
    ultimoAniversario = new Date(admissao.getFullYear() + anosServico - 1, admissao.getMonth(), admissao.getDate());
  }
  const mesesFerias = Math.min(12, mesesCompletos(ultimoAniversario, desligamento));
  const feriasProporcionais = (salarioBruto / 12) * mesesFerias;
  const umTercoFeriasProporcionais = feriasProporcionais / 3;

  const feriasVencidas = temFeriasVencidas ? salarioBruto : 0;
  const umTercoFeriasVencidas = feriasVencidas / 3;

  let diasAviso = 0;
  let avisoPrevioIndenizado = 0;
  let multaFgts = 0;
  let decimoTerceiroFinal = decimoTerceiroProporcional;
  let feriasProporcionaisFinal = feriasProporcionais;
  let umTercoFeriasProporcionaisFinal = umTercoFeriasProporcionais;

  if (tipo === "sem-justa-causa") {
    diasAviso = Math.min(90, 30 + anosServico * 3);
    avisoPrevioIndenizado = salarioDiario * diasAviso;
    multaFgts = (saldoFgts || 0) * 0.4;
  } else if (tipo === "pedido-demissao") {
    // Sem aviso indenizado e sem multa de FGTS.
  } else if (tipo === "justa-causa") {
    // Perde 13º e férias proporcionais, aviso prévio e multa de FGTS.
    decimoTerceiroFinal = 0;
    feriasProporcionaisFinal = 0;
    umTercoFeriasProporcionaisFinal = 0;
  }

  const total =
    saldoSalario +
    avisoPrevioIndenizado +
    decimoTerceiroFinal +
    feriasProporcionaisFinal +
    umTercoFeriasProporcionaisFinal +
    feriasVencidas +
    umTercoFeriasVencidas +
    multaFgts;

  return {
    saldoSalario,
    diasNoMesDesligamento,
    anosServico,
    diasAviso,
    avisoPrevioIndenizado,
    decimoTerceiroFinal,
    meses13,
    feriasProporcionaisFinal,
    umTercoFeriasProporcionaisFinal,
    mesesFerias,
    feriasVencidas,
    umTercoFeriasVencidas,
    multaFgts,
    total,
    tipo,
  };
}

function linha(label, valor) {
  if (!valor) return "";
  return `<tr><td>${label}</td><td>${formatBRL(valor)}</td></tr>`;
}

function renderResultado(container, r) {
  container.innerHTML = `
    <div class="result-total">
      <div class="label">Total estimado da rescisão</div>
      <div class="value">${formatBRL(r.total)}</div>
    </div>
    <table class="breakdown">
      <thead><tr><th>Verba</th><th>Valor</th></tr></thead>
      <tbody>
        ${linha(`Saldo de salário (${r.diasNoMesDesligamento} dias)`, r.saldoSalario)}
        ${linha(`Aviso prévio indenizado (${r.diasAviso} dias)`, r.avisoPrevioIndenizado)}
        ${linha(`13º salário proporcional (${r.meses13}/12)`, r.decimoTerceiroFinal)}
        ${linha(`Férias proporcionais (${r.mesesFerias}/12)`, r.feriasProporcionaisFinal)}
        ${linha("1/3 sobre férias proporcionais", r.umTercoFeriasProporcionaisFinal)}
        ${linha("Férias vencidas (não gozadas)", r.feriasVencidas)}
        ${linha("1/3 sobre férias vencidas", r.umTercoFeriasVencidas)}
        ${linha("Multa de 40% do FGTS", r.multaFgts)}
      </tbody>
      <tfoot><tr><td>Total</td><td>${formatBRL(r.total)}</td></tr></tfoot>
    </table>
  `;
}

export function initRescisaoForm() {
  const form = document.getElementById("form-rescisao");
  if (!form) return;
  const result = document.getElementById("resultado-rescisao");
  const errorEl = document.getElementById("erro-rescisao");
  const fgtsField = document.getElementById("campo-fgts");
  const tipoSelect = document.getElementById("tipo-rescisao");

  tipoSelect.addEventListener("change", () => {
    fgtsField.style.display = tipoSelect.value === "sem-justa-causa" ? "block" : "none";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const salarioBruto = parseBRLInput(document.getElementById("salario-bruto-rescisao").value);
    const admissao = new Date(document.getElementById("data-admissao").value);
    const desligamento = new Date(document.getElementById("data-desligamento").value);
    const tipo = tipoSelect.value;
    const saldoFgts = parseBRLInput(document.getElementById("saldo-fgts").value) || 0;
    const temFeriasVencidas = document.getElementById("ferias-vencidas").checked;

    if (!salarioBruto || salarioBruto <= 0) {
      errorEl.textContent = "Informe um salário bruto maior que zero.";
      return;
    }
    if (isNaN(admissao.getTime()) || isNaN(desligamento.getTime())) {
      errorEl.textContent = "Informe as datas de admissão e desligamento.";
      return;
    }
    if (desligamento <= admissao) {
      errorEl.textContent = "A data de desligamento deve ser depois da admissão.";
      return;
    }

    const resultado = calcularRescisao({ salarioBruto, admissao, desligamento, tipo, saldoFgts, temFeriasVencidas });
    renderResultado(result, resultado);
  });
}
