import { formatBRL } from "./main.js";

// Tabelas vigentes 2026 (confirmar sempre em gov.br/inss e gov.br/receitafederal).
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

export const DEDUCAO_POR_DEPENDENTE = 189.59;
export const DESCONTO_SIMPLIFICADO = 607.2;

export function calcularINSS(baseContribuicao) {
  const base = Math.min(baseContribuicao, 8475.55);
  let desconto = 0;
  let faixaAnterior = 0;
  const detalhes = [];

  for (const faixa of INSS_FAIXAS) {
    if (base <= faixaAnterior) break;
    const topoFaixa = Math.min(base, faixa.limite);
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

export function calcularIRRFSobreBase(base) {
  if (base <= 0) return 0;
  const faixa = IRRF_FAIXAS.find((f) => base <= f.limite);
  const imposto = base * faixa.aliquota - faixa.deducao;
  return Math.max(0, imposto);
}

export function calcularReducaoLei15270(rendimentoBruto, impostoCalculado) {
  let reducao = 0;
  if (rendimentoBruto <= 5000) {
    reducao = 312.89;
  } else if (rendimentoBruto <= 7350) {
    reducao = Math.max(0, 978.62 - 0.133145 * rendimentoBruto);
  }
  return Math.min(reducao, impostoCalculado);
}
