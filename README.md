# CalculeJá — calculadoras financeiras e trabalhistas

Site estático, 100% gratuito pra hospedar, com calculadoras que resolvem dúvidas reais de quem é CLT no Brasil. Objetivo: gerar renda via **AdSense** (anúncios) e **afiliados** (cursos de finanças/carreira) conforme o tráfego crescer. Sem investimento inicial — só tempo.

## Por que esse nicho

- "calculadora salário líquido", "calculadora rescisão" e "calculadora juros compostos" têm busca mensal altíssima no Google Brasil e intenção clara (quem busca quer usar a ferramenta na hora).
- Ferramenta útil → menos dependente de produção constante de conteúdo (diferente de blog puro).
- Combina com seu perfil técnico: é código, dá pra evoluir com mais calculadoras, PWA, API, etc.

## O que já está pronto

- `index.html` — página inicial com os cards das calculadoras.
- `calculadoras/salario-liquido.html` — salário líquido CLT com tabelas de INSS e IRRF **2026** (incluindo a redução da Lei 15.270/2025). Lógica testada e validada contra exemplo oficial da fonte.
- `calculadoras/rescisao-trabalhista.html` — saldo de salário, aviso prévio, 13º e férias proporcionais, multa de 40% do FGTS.
- `calculadoras/juros-compostos.html` — simulação de investimento com aportes mensais.
- `css/styles.css` — visual único, responsivo, com modo escuro automático.
- `robots.txt` e `sitemap.xml` — base de SEO técnico.

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

## O que eu preciso que você faça (contas que exigem seus dados/CPF)

Eu não consigo criar essas contas por você — elas pedem verificação humana/identidade:

1. **Conta no GitHub** (grátis) — pra guardar o código e conectar no deploy.
2. **Conta na Vercel ou Netlify** (grátis) — pra publicar o site.
3. **Google Search Console** — pra indexar o site no Google e acompanhar buscas.
4. **Google AdSense** — só vale a pena pedir depois que o site tiver algum tráfego orgânico (geralmente exigem conteúdo publicado há um tempo e algumas visitas).
5. **Conta de afiliado na Hotmart** (ou similar) — pra conseguir links de produtos de finanças/carreira pra recomendar nas páginas das calculadoras.

Quando estiver com essas contas, me avisa e eu continuo (conectar domínio, configurar analytics, escrever o conteúdo de SEO, adicionar os anúncios/links no lugar certo).

## Roteiro de crescimento (próximos passos)

1. Deploy do site (gratuito) e submissão no Google Search Console.
2. Mais 4–6 calculadoras de nicho parecido (ex: calculadora de férias, 13º isolado, horas extras, FGTS, aposentadoria) — cada uma é uma porta de entrada de busca nova.
3. Conteúdo de apoio (artigos curtos) em cada página explicando o cálculo — já tem a base, só expandir.
4. Depois de tráfego: Google AdSense + links de afiliados relevantes (cursos de finanças pessoais, contabilidade, concursos).
5. Divulgação inicial: posts em comunidades de RH/finanças pessoais, TikTok/Reels curtos mostrando a calculadora resolvendo uma dúvida comum.

## Avisos importantes

- As tabelas de INSS/IRRF 2026 usadas aqui vieram de fontes secundárias (contabilidade/blogs especializados) por não haver acesso direto à Receita Federal neste ambiente. Antes de divulgar amplamente, vale uma conferência rápida nos sites oficiais (gov.br/inss e gov.br/receitafederal) ou com um contador.
- A calculadora de rescisão é uma estimativa simplificada (não inclui projeção do aviso prévio nem casos especiais). Isso está avisado na própria página, mas é bom lembrar ao divulgar.
