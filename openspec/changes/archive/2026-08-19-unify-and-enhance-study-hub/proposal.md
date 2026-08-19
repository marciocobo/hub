## Why

Cada página de certificação (`ccaf_2026.html`, `aws_saa_study.html`, `clf_c02_study.html`) reimplementa o mesmo motor de simulado/flashcards/checklist de forma independente e ligeiramente divergente (ex: chaves de `localStorage` inconsistentes — `'ccaf_ck'` vs. `CKKEY`). Isso duplica ~120-160KB de JS/CSS por página, dificulta adicionar qualquer melhoria (precisa ser replicada 3x), e faz com que a maior parte do progresso do usuário (resultado de simulados, avanço em flashcards) se perca a cada reload porque só o checklist é persistido. O hub (`index.html`) também não tem visibilidade nenhuma do progresso real do usuário nas certificações.

## What Changes

- Extrair o motor de estudo (simulado, flashcards, checklist, navegação de dashboard) para arquivos externos compartilhados (`study-engine.js`, `study-engine.css`), consumidos pelas 3 páginas de certificação. **BREAKING** (interno): as páginas passam a depender de arquivos externos ao invés de serem 100% autocontidas.
- Unificar o progresso do usuário em um único schema de `localStorage` namespaced por certificação (substitui as chaves divergentes atuais), cobrindo checklist, última tentativa/histórico de simulado, e estado de flashcards.
- `index.html` passa a ler esse schema e exibir progresso agregado por card (ex: "62% do checklist", "última nota: 780/1000").
- Flashcards ganham marcação known/unknown e agendamento por repetição espaçada (SM-2 simplificado), substituindo a navegação puramente sequencial/aleatória atual.
- Simulados passam a registrar histórico de tentativas (data, score, breakdown por domínio), exibido como lista/gráfico simples na própria página.
- Novo recurso de exportar/importar progresso como arquivo JSON (dado que não há backend, isso é o único jeito de mover progresso entre navegadores/dispositivos ou fazer backup).
- Documentar o padrão resultante de página de estudo em uma skill do Claude Code, para que novas páginas (novas certificações ou referências) nasçam consistentes sem exigir releitura manual do código existente.

## Capabilities

### New Capabilities
- `study-progress-tracking`: schema unificado de progresso (checklist, simulado, flashcards) persistido em `localStorage` e lido tanto pelas páginas de certificação quanto pelo hub (`index.html`) para exibir status agregado.
- `flashcard-spaced-repetition`: marcação known/unknown por flashcard e agendamento de revisão via algoritmo SM-2 simplificado.
- `exam-attempt-history`: registro e exibição do histórico de tentativas de simulado por certificação (score, data, breakdown por domínio).
- `progress-export-import`: exportação e importação do progresso do usuário como arquivo JSON.

### Modified Capabilities
_Nenhuma — não há specs existentes no projeto (primeira leva de capabilities documentadas)._

## Impact

- **Novos arquivos**: `study-engine.js`, `study-engine.css` (raiz do repo, referenciados via `<script src>`/`<link>`).
- **Arquivos modificados**: `ccaf_2026.html`, `aws_saa_study.html`, `clf_c02_study.html` (migram para o motor compartilhado e o schema de progresso unificado), `index.html` (passa a exibir progresso agregado por card).
- **Não afetados**: `ai_concepts.html`, `aws_services.html` (páginas de referência sem simulado/flashcards/checklist — fora de escopo).
- **Sem backend/build step**: tudo continua estático; export/import de progresso é a única forma de portabilidade entre navegadores.
- **Tooling**: nova skill do Claude Code documentando o padrão de página de estudo (não é uma capability de produto, é artefato de processo — capturado em `tasks.md`, não em `specs/`).
