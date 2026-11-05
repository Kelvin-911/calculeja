// Marca o link de navegação da página atual para leitores de tela e destaque visual.
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach((link) => {
      const href = link.getAttribute("href").split("/").pop();
      if (href === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  });
}

export function formatBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseBRLInput(raw) {
  if (raw === null || raw === undefined || raw === "") return NaN;
  const normalized = String(raw).replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}
