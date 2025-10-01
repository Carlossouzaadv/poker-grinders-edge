# Base da Marca: Poker Grinders Edge

Este documento detalha todos os elementos necessários para a construção da identidade visual e comunicação do nosso SaaS.

---

## Identidade da Marca

### Nome
**Poker Grinders Edge**

### Slogan
> "A vantagem que os outros não veem."

### Missão
Fornecer ferramentas e recursos avançados para jogadores de poker que buscam aprimorar suas habilidades, analisar suas jogadas e alcançar consistentemente resultados superiores através de dados e tecnologia.

### Visão
Ser a plataforma líder e indispensável em análise e estudo de poker, reconhecida pela inovação, precisão e por ser a arma secreta dos jogadores mais dedicados.

### Valores Fundamentais

- **Precisão Analítica**: Compromisso com dados corretos e insights acionáveis.
- **Inovação Contínua**: Busca incessante por novas tecnologias para criar vantagem competitiva.
- **Foco no Desempenho**: Tudo o que fazemos é para melhorar os resultados do jogador.
- **Design Excepcional**: Acreditamos que uma ferramenta poderosa deve ser sofisticada e intuitiva.

---

## Público-Alvo

### Primário
Jogadores de poker semi-profissionais e profissionais que já entendem a importância do estudo e buscam ferramentas para otimizar seu processo.

### Secundário
Jogadores regulares e entusiastas ambiciosos que desejam dar o próximo passo e profissionalizar seu jogo.

### Personas

#### Pedro "ProGrinder" Costa
- **Idade**: 28 anos
- **Perfil**: Jogador profissional de Cash Game NL500
- **Dor**: Precisa identificar leaks no seu jogo para subir de stake
- **Objetivo**: Aumentar ROI e passar para high stakes
- **Uso**: Análise diária de sessões, estudo GTO, tracking de performance

#### Maria Santos
- **Idade**: 35 anos
- **Perfil**: Coach profissional e especialista em MTT
- **Dor**: Precisa de ferramentas para analisar múltiplos alunos simultaneamente
- **Objetivo**: Oferecer insights mais profundos e rápidos para seus alunos
- **Uso**: Dashboard agregado, análise comparativa, relatórios automatizados

#### João Silva
- **Idade**: 24 anos
- **Perfil**: Estudante de poker, joga microstakes
- **Dor**: Quer evoluir mas não sabe por onde começar
- **Objetivo**: Profissionalizar o jogo nos próximos 2 anos
- **Uso**: Ferramentas educacionais, análise de mãos, comunidade

---

## Sistema Visual

### Estética Geral
Moderna, sofisticada, tecnológica e escura. A sensação deve ser a de estar operando um software de ponta, uma ferramenta de análise "militar" para o poker.

**Inspiração**: Terminais de análise financeira, dashboards de trading, interfaces de IA futurísticas.

### Paleta de Cores

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Fundo Base** | `#121212` | `18, 18, 18` | Background principal, fundo de seções |
| **Fundo Secundário** | `#1a1a1a` | `26, 26, 26` | Cards, containers, elementos elevados |
| **Primária (Ação)** | `#00FF8C` | `0, 255, 140` | Botões CTA, links, destaques importantes |
| **Secundária (Sutil)** | `#4C5FD5` | `76, 95, 213` | Bordas, ícones secundários, hover states |
| **Texto Principal** | `#FFFFFF` | `255, 255, 255` | Títulos, texto de destaque |
| **Texto Secundário** | `#E0E0E0` | `224, 224, 224` | Corpo de texto, descrições |
| **Texto Muted** | `#9E9E9E` | `158, 158, 158` | Legendas, metadados, placeholders |

#### Variações e Gradientes

**Gradiente Hero:**
```css
background: linear-gradient(to bottom, #121212 0%, #0a0a0a 100%);
```

**Gradiente Cards:**
```css
background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
```

**Glow Effect (Hover):**
```css
box-shadow: 0 0 20px rgba(0, 255, 140, 0.3);
```

### Tipografia

#### Fontes

**Títulos (Headings):**
- Família: **Montserrat**
- Pesos: 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
- Uso: H1, H2, H3, elementos de navegação, CTAs
- Import:
```html
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&display=swap');
```

**Corpo de Texto (Body):**
- Família: **Open Sans**
- Pesos: 300 (Light), 400 (Regular), 600 (Semi-Bold)
- Uso: Parágrafos, descrições, listas, formulários
- Import:
```html
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap');
```

#### Hierarquia Tipográfica

| Elemento | Fonte | Tamanho (Desktop) | Tamanho (Mobile) | Weight | Line Height |
|----------|-------|-------------------|------------------|---------|-------------|
| H1 | Montserrat | 56-72px | 36-48px | 700 | 1.2 |
| H2 | Montserrat | 40-48px | 32-36px | 700 | 1.3 |
| H3 | Montserrat | 28-32px | 24-28px | 600 | 1.4 |
| H4 | Montserrat | 20-24px | 18-20px | 600 | 1.4 |
| Body Large | Open Sans | 18-20px | 16-18px | 400 | 1.6 |
| Body | Open Sans | 16px | 14-16px | 400 | 1.6 |
| Body Small | Open Sans | 14px | 12-14px | 400 | 1.5 |
| Caption | Open Sans | 12px | 11px | 300 | 1.4 |

### Iconografia

#### Estilo
Minimalista, em estilo **Glassmorphism 3D**. Ícones com aparência de vidro fosco, bordas brilhantes nas cores primária e secundária, flutuando sobre o fundo escuro.

#### Características
- Aparência translúcida (opacidade 60-80%)
- Bordas iluminadas com glow sutil
- Sombra profunda para criar profundidade
- Efeito de reflexo/refração de luz
- Cores: Verde Esmeralda (#00FF8C) e Azul Elétrico (#4C5FD5)

#### Biblioteca de Ícones
- **Primária**: Ícones custom em estilo glassmorphism (disponíveis em `/assets/images/nova id visual/`)
- **Secundária**: Heroicons ou Lucide Icons para ícones de interface

### Imagens e Gráficos

#### Estilo Visual
- Visualizações abstratas de dados
- Redes neurais e elementos holográficos
- Padrões geométricos minimalistas
- Efeitos de luz e partículas
- Cores predominantes: Verde esmeralda, azul elétrico, tons escuros

#### Tratamento de Imagens
- **Opacidade**: 40-60% quando usada como background
- **Overlay**: Gradiente escuro sobre imagens de fundo
- **Blur**: Sutil desfoque em backgrounds para foco no conteúdo
- **Saturação**: Levemente reduzida para manter coesão com paleta

#### Banco de Imagens
Localização: `/web/public/assets/images/nova id visual/`

Arquivos disponíveis:
- `Hero.jpg` - Background principal hero section
- `stats.jpg` - Ícone análise profunda
- `GTO.jpg` - Ícone estratégia otimizada
- `leaks.jpg` - Ícone detecção de leaks
- `mindset.jpg` - Ícone mindset de elite
- `background1.jpg` - Pattern abstrato para seções
- `background2.jpg` - Pattern alternativo

---

## Componentes de UI

### Botões

#### Botão Primário (CTA)
```css
background: #00FF8C;
color: #121212;
padding: 16px 40px;
border-radius: 8px;
font-family: 'Open Sans', sans-serif;
font-weight: 600;
font-size: 18px;
transition: all 0.3s ease;

/* Hover */
background: #00DD7A;
box-shadow: 0 8px 24px rgba(0, 255, 140, 0.4);
transform: scale(1.05);
```

#### Botão Secundário
```css
background: transparent;
color: #00FF8C;
border: 2px solid #00FF8C;
padding: 14px 38px;
border-radius: 8px;

/* Hover */
background: rgba(0, 255, 140, 0.1);
```

### Cards

#### Feature Card
```css
background: linear-gradient(135deg, #1a1a1a 0%, #121212 100%);
border: 1px solid rgba(76, 95, 213, 0.2);
border-radius: 16px;
padding: 32px;
transition: all 0.5s ease;

/* Hover */
border-color: rgba(0, 255, 140, 0.5);
transform: scale(1.05);
box-shadow: 0 16px 48px rgba(0, 255, 140, 0.2);
```

### Inputs

#### Text Input
```css
background: #1a1a1a;
border: 1px solid rgba(76, 95, 213, 0.3);
color: #FFFFFF;
padding: 12px 16px;
border-radius: 8px;

/* Focus */
border-color: #00FF8C;
outline: none;
box-shadow: 0 0 0 3px rgba(0, 255, 140, 0.1);
```

---

## Tom de Voz

### Características
- **Confiante**: Sabemos do que estamos falando
- **Direto**: Sem rodeios, foco em resultados
- **Técnico mas acessível**: Profundo sem ser intimidador
- **Inspirador**: Motiva o jogador a melhorar
- **Honesto**: Transparente sobre benefícios e limitações

### Exemplos

❌ **Evitar:**
"Talvez você consiga melhorar um pouco..."
"Tente usar nossa ferramenta..."
"Somos mais uma opção no mercado..."

✅ **Preferir:**
"Encontre seus leaks com precisão cirúrgica."
"Domine o jogo com dados que importam."
"A vantagem que os profissionais usam."

### Palavras-Chave
- Precisão
- Vantagem
- Elite
- Dominar
- Otimizar
- Estratégia
- Performance
- Insights
- Maestria
- Inexplorável

---

## Estrutura da Landing Page

### Seções Obrigatórias

1. **Hero**
   - Título impactante com slogan
   - Subtítulo explicando proposta de valor
   - CTA primário
   - Background visual impressionante

2. **Features** (4 principais)
   - Análise Profunda
   - Estratégia Otimizada (GTO)
   - Detecção de Leaks
   - Mindset de Elite

3. **Social Proof**
   - Depoimentos de jogadores profissionais
   - Estatísticas de uso
   - Logos de parceiros (se aplicável)

4. **CTA Final**
   - Reforço da proposta de valor
   - Botão de ação destacado
   - Sense of urgency sutil

5. **Footer**
   - Links institucionais
   - Newsletter signup
   - Redes sociais
   - Copyright

### Seções Opcionais (Futuro)

- Pricing tiers
- Demo interativo
- Comparação com concorrentes
- Blog/Conteúdo educacional
- FAQ

---

## Diretrizes de Implementação

### Performance
- Lazy loading para imagens abaixo da dobra
- Otimização de imagens (WebP quando possível)
- Critical CSS inline
- Fontes com `font-display: swap`

### Responsividade
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px, 1536px
- Touch-friendly (botões min 44x44px)
- Teste em: iPhone SE, iPhone 12, iPad, Desktop 1920px

### Acessibilidade
- Contraste mínimo WCAG AA (4.5:1 para texto)
- Alt text descritivo em todas as imagens
- Navegação por teclado funcional
- ARIA labels quando necessário
- Foco visível em elementos interativos

### SEO
- Títulos H1-H6 hierárquicos
- Meta description otimizada
- Schema.org markup (SoftwareApplication)
- Open Graph tags
- Sitemap XML

---

## Checklist de Qualidade

### Visual
- [ ] Todas as cores da paleta estão sendo usadas consistentemente
- [ ] Tipografia segue a hierarquia definida
- [ ] Espaçamento consistente (múltiplos de 8px)
- [ ] Hover states definidos para elementos interativos
- [ ] Animações suaves (max 300ms)

### Conteúdo
- [ ] Tom de voz consistente em todos os textos
- [ ] CTAs claros e orientados a ação
- [ ] Sem erros de português
- [ ] Proposta de valor clara na primeira dobra

### Técnico
- [ ] Performance: PageSpeed > 90
- [ ] Sem erros de console
- [ ] Imagens otimizadas
- [ ] Responsivo em todos os breakpoints
- [ ] Testado em Chrome, Firefox, Safari, Edge

### Conversão
- [ ] CTA primário visível sem scroll
- [ ] Formulário simples (máx 3 campos)
- [ ] Loading states em ações assíncronas
- [ ] Mensagens de erro claras
- [ ] Confirmação de sucesso visível

---

## Recursos e Assets

### Localização de Arquivos
```
poker-grinders-edge/
├── web/
│   ├── public/
│   │   └── assets/
│   │       └── images/
│   │           └── nova id visual/
│   │               ├── Hero.jpg
│   │               ├── stats.jpg
│   │               ├── GTO.jpg
│   │               ├── leaks.jpg
│   │               ├── mindset.jpg
│   │               ├── background1.jpg
│   │               └── background2.jpg
│   └── src/
│       ├── app/
│       │   ├── page.tsx (Landing Page)
│       │   └── globals.css (Estilos globais)
│       └── components/
└── BRAND_IDENTITY.md (este arquivo)
```

### Links Úteis
- [Google Fonts - Montserrat](https://fonts.google.com/specimen/Montserrat)
- [Google Fonts - Open Sans](https://fonts.google.com/specimen/Open+Sans)
- [Heroicons](https://heroicons.com/)
- [Lucide Icons](https://lucide.dev/)

---

## Histórico de Versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2025-09-30 | Claude Code | Criação inicial do documento |

---

## Contato e Suporte

Para dúvidas sobre a implementação desta identidade visual, entre em contato com a equipe de desenvolvimento.

**Mantido por**: Poker Grinders Edge Team
**Última atualização**: 2025-09-30
