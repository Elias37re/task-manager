# TaskSpace - Gerenciador de Tarefas Full-Stack Premium

Uma aplicação web completa e responsiva do tipo "Task Manager" (Gerenciador de Tarefas) desenvolvida com uma arquitetura Full-Stack moderna.

---

## 🚀 Arquitetura e Tecnologias

- **Front-end:**
  - **React (Vite):** Estrutura de componentes dinâmica e rápida.
  - **CSS3 Personalizado (Vanilla CSS):** Estilo premium utilizando Glassmorphism, temas escuros (Dark Mode), micro-animações nas interações e design totalmente responsivo.
  - **Lucide React:** Coleção de ícones vetoriais modernos.

- **Back-end:**
  - **Node.js + Express:** API RESTful modularizada com rotas protegidas e tratamento de erros.
  - **JWT (JSON Web Token):** Autenticação segura por sessão.
  - **Bcryptjs:** Criptografia e hashing de senhas.
  - **Morgan & Cors:** Middleware de registro de requisições e políticas de compartilhamento de recursos.

- **Banco de Dados:**
  - **PostgreSQL:** Banco de dados relacional que gerencia usuários e tarefas com restrições de chaves estrangeiras, deleção em cascata e índices de consulta otimizados.

---

## 🛠️ Instalação e Execução

### 1. Inicializar o Banco de Dados (PostgreSQL)

Se você não tiver o PostgreSQL instalado localmente ou não possuir direitos de administrador, o projeto conta com um script automatizado que baixa, instala e executa uma versão portátil do PostgreSQL diretamente no espaço de usuário.

No Windows, abra o PowerShell e execute:
```powershell
# Executa o script de configuração local do banco
powershell -ExecutionPolicy Bypass -File scripts/start-db.ps1
```

Este script irá:
1. Baixar o PostgreSQL portátil 15.3 (caso não esteja presente).
2. Inicializar o cluster do banco em `db/data` (sem senha, com autenticação local confiável).
3. Iniciar o servidor de banco de dados na porta padrão `5432`.
4. Criar a base de dados `taskmanager` e aplicar o esquema do banco.

---

### 2. Iniciar o Back-end (API)

Acesse o diretório do backend, instale as dependências (caso não tenham sido instaladas) e inicie o servidor:
```bash
cd backend
npm install
npm run dev
```
O servidor Express estará rodando em `http://localhost:5000`.

---

### 3. Iniciar o Front-end

Acesse o diretório do frontend, instale as dependências e inicie o servidor de desenvolvimento do Vite:
```bash
cd ../frontend
npm install
npm run dev
```
Abra o navegador e acesse: `http://localhost:5173/`.

---

## 📋 Funcionalidades Principais

1. **Autenticação Segura:** Cadastro de novos usuários e login utilizando senhas criptografadas e JWT.
2. **Dashboard de Métricas:** Estatísticas em tempo real com barra de progresso do total de tarefas concluídas, pendentes e em andamento.
3. **CRUD Completo de Tarefas:** Criação, edição, listagem e remoção de tarefas.
4. **Ciclo de Status Dinâmico:** Altere o status de uma tarefa rapidamente clicando no marcador (Pendente ➔ Em Andamento ➔ Concluída).
5. **Filtros e Busca Avançada:** Pesquisa textual em tempo real no título/descrição, e filtros rápidos por status e prioridades.
6. **Ordenação Inteligente:** Ordene suas tarefas por Data de Criação, Título, Data de Vencimento e Prioridade (com suporte para ordem crescente ou decrescente).
7. **Responsividade:** Interface otimizada tanto para telas de desktop quanto para dispositivos móveis.
