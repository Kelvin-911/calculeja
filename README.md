# CalculeJá — calculadoras financeiras e trabalhistas

## Status atual

- **Código no GitHub:** https://github.com/Kelvin-911/calculeja
- **Site no ar (Vercel):** https://calculeja.vercel.app (domínio fixo do projeto)
- Todo push na branch `main` gera um novo deploy automático na Vercel.
- **Google Search Console:** site verificado, sitemap enviado (4 páginas descobertas).
- **Google AdSense:** conta criada, código de anúncios (`ca-pub-5938250398235100`) e `ads.txt` publicados, **revisão do site solicitada** em 05/11/2026 — aguardando aprovação do Google (pode levar de dias a semanas).
- **Falta:** completar os dados de pagamento no painel do AdSense (Pagamentos → dados bancários) — não bloqueia a revisão, mas é necessário pra receber quando aprovar.
- Página de `privacidade.html` publicada (exigida pelo AdSense, linkada no rodapé de todas as páginas).
- Site agora com 6 calculadoras (salário líquido, rescisão, férias, 13º, horas extras, juros compostos).

**Nota de troubleshooting:** em 05/11/2026 o pipeline de deploy automático GitHub→Vercel travou (pushes não geravam deploy, mesmo com Deploy Hook manual). Resolvido desconectando e reconectando o repositório em Project Settings → Git. Se os deploys pararem de refletir no site, esse é o primeiro passo a tentar.

Site estático, 100% gratuito pra hospedar, com calculadoras que resolvem dúvidas reais de quem é CLT no Brasil. Objetivo: gerar renda via **AdSense** (anúncios) e **afiliados** (cursos de finanças/carreira) conforme o tráfego crescer. Sem investimento inicial — só tempo.

## Por que esse nicho

- "calculadora salário líquido", "calculadora rescisão" e "calculadora juros compostos" têm busca mensal altíssima no Google Brasil e intenção clara (quem busca quer usar a ferramenta na hora).
- Ferramenta útil → menos dependente de produção constante de conteúdo (diferente de blog puro).
- Combina com seu perfil técnico: é código, dá pra evoluir com mais calculadoras, PWA, API, etc.

## O que já está pronto

- `index.html` — página inicial com os cards das calculadoras.
- `calculadoras/salario-liquido.html` — salário líquido CLT com tabelas de INSS e IRRF **2026** (incluindo a redução da Lei 15.270/2025). Lógica testada e validada contra exemplo oficial da fonte.
- `calculadoras/rescisao-trabalhista.html` — saldo de salário, aviso prévio, 13º e férias proporcionais, multa de 40% do FGTS.
- `calculadoras/ferias.html` — férias CLT com 1/3 constitucional e abono pecuniário.
- `calculadoras/decimo-terceiro.html` — 13º salário (1ª e 2ª parcela).
- `calculadoras/horas-extras.html` — horas extras 50%/100% e adicional noturno.
- `calculadoras/juros-compostos.html` — simulação de investimento com aportes mensais.
- `privacidade.html` — política de privacidade (exigida pelo AdSense).
- `css/styles.css` — visual único, responsivo, com modo escuro automático.
- `robots.txt` e `sitemap.xml` — base de SEO técnico.
- `js/tabelas-fiscais-2026.js` — módulo único com as tabelas de INSS/IRRF/Lei 15.270, reaproveitado pelas calculadoras de salário, férias e 13º (evita duplicação e inconsistência entre elas).

Tudo em HTML/CSS/JS puro (sem build, sem framework) — qualquer hospedagem estática gratuita funciona.

## Como testar localmente

Abra `index.html` direto no navegador, ou rode um servidor simples (os módulos JS precisam de `http://`, não funcionam com `file://` em alguns navegadores):

```powershell
# na pasta do projeto
python -m http.server 8080
# depois abra http://localhost:8080
```

## Deploy gratuito (escolha um)

- **Vercel** (recomendado, mais simples): crie conta grátis em vercel.com, conecte um repositório GitHub com esses arquivos, deploy automático a cada push.
- **Netlify**: mesma lógica, netlify.com, ou arraste a pasta direto no painel ("drag and drop deploy").
- **GitHub Pages**: crie repositório no GitHub, suba os arquivos, ative Pages nas configurações do repositório.

Nenhuma dessas opções exige cartão de crédito no plano gratuito.

## O que já foi feito vs. o que falta

**Feito (eu + você):**
1. ✅ Site construído, testado e no ar (GitHub + Vercel).
2. ✅ Google Search Console configurado e sitemap enviado.
3. ✅ Conta AdSense criada, site conectado e revisão solicitada.
4. ✅ Página de Política de Privacidade.

**Falta (só você, dados pessoais/bancários):**
1. **Pagamentos no AdSense** — painel AdSense → Pagamentos → inserir dados bancários (nome, endereço, conta) pra poder receber quando aprovado.
2. **Conta de afiliado na Hotmart** (ou similar) — opcional, pra ter links de produtos de finanças/carreira pra recomendar nas páginas das calculadoras mais pra frente.

**Falta (eu posso fazer, é só avisar):**
1. Mais calculadoras de nicho parecido (ex: férias, 13º isolado, horas extras, FGTS, aposentadoria) — cada uma é uma porta de entrada de busca nova e reforça o perfil do site pra revisão do AdSense.
2. Conteúdo de apoio (artigos curtos) em cada página explicando o cálculo.
3. Divulgação inicial: sugestões de posts em comunidades de RH/finanças pessoais, roteiro de vídeo curto mostrando a calculadora.

## Esperando (fora do nosso controle)

- **Revisão do AdSense**: Google analisa o site contra as políticas do programa. Pode levar de poucos dias a algumas semanas. Enquanto isso, os anúncios não aparecem — é normal.
- **Indexação no Google**: mesmo com o sitemap enviado, o Google leva um tempo (dias) pra rastrear e começar a mostrar as páginas nos resultados de busca.

## Avisos importantes

- As tabelas de INSS/IRRF 2026 usadas aqui vieram de fontes secundárias (contabilidade/blogs especializados) por não haver acesso direto à Receita Federal neste ambiente. Antes de divulgar amplamente, vale uma conferência rápida nos sites oficiais (gov.br/inss e gov.br/receitafederal) ou com um contador.
- A calculadora de rescisão é uma estimativa simplificada (não inclui projeção do aviso prévio nem casos especiais). Isso está avisado na própria página, mas é bom lembrar ao divulgar.
