# Guia de Contribuição — Flip7 Score4All

Agradecemos o seu interesse em contribuir para o **Flip7 Score4All**! Este documento orienta sobre o fluxo de trabalho, os padrões de codificação e os procedimentos para envio de alterações no projeto.

---

## 📐 Padrões de Codificação

### TypeScript e JavaScript
- Utilize `const` por padrão; declare `let` apenas se houver reatribuição necessária.
- Use comparações estritas (`===` e `!==`).
- Tipagem estrita: defina interfaces ou tipos explícitos para parâmetros e retornos de funções.
- Prefira *Arrow Functions* para funções anônimas e callbacks.
- Não deixe código comentado nem variáveis não utilizadas (`noUnusedParameters` e `noUnusedLocals` estão ativados no backend e frontend).

### React 19 (Frontend)
- Componentes funcionais e custom hooks com tipagem TypeScript explícita.
- Garantia de acessibilidade (WCAG): insira `aria-label` em elementos interativos sem texto visível.
- Estilização com Tailwind CSS e Framer Motion para transições de layout.

### Node.js & Express 5 (Backend)
- Arquitetura baseada em serviços para desacoplar a lógica de negócio dos handlers HTTP.
- Manipulação assíncrona com `async/await`.
- Notificação em tempo real via Server-Sent Events (SSE).

---

## 🧪 Regras de Testes e Validação

Todo novo código ou refatoração deve obrigatoriamente incluir ou atualizar testes automatizados:
1. **Princípio FIRST:** Testes rápidos, independentes, repetíveis, auto-validáveis e oportunos.
2. **Cobertura Mínima:** Mantenha a cobertura de declarações acima de 85%.

### Execução de testes antes de abrir uma PR:

```bash
# Backend
cd backend
npm test
npm run typecheck
npm run build

# Frontend
cd frontend
npm run test
npm run lint
npm run typecheck
npm run build
```

---

## 🔀 Fluxo de Trabalho (Git Workflow)

1. Faça um **Fork** ou crie uma nova branch a partir de `main`:
   ```bash
   git checkout -b feature/minha-nova-funcionalidade
   # ou
   git checkout -b fix/descricao-do-bug
   ```
2. Realize suas alterações seguindo os padrões do projeto.
3. Garanta que **todos os testes, linter e verificações de tipo estejam passando**.
4. Crie commits claros e descritivos (ex: `feat(round): add round position variation indicator`).
5. Envie sua branch e abra uma **Pull Request** detalhando:
   - Qual problema a alteração resolve.
   - Como testar a funcionalidade.
   - Capturas de tela ou logs demonstrando o funcionamento.

---

## 💬 Dúvidas ou Sugestões?

Abra uma *Issue* no repositório descrevendo sua ideia ou dúvida. Ficaremos felizes em ajudar!
