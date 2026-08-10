# 📌 Task Manager - Aplicação Web Full-Stack

Uma aplicação web desenvolvida para auxiliar estudantes e profissionais no gerenciamento eficiente de rotinas, prazos e tarefas diárias. O projeto resolve a falta de organização centralizada por meio de uma interface conectada a um servidor robusto.  

---

## 🎯 Objetivos do Projeto

- **Organização Eficiente:** Permitir o cadastro, listagem, edição e exclusão de tarefas em tempo real (CRUD completo).
- **Persistência de Dados:** Garantir que todas as informações fiquem salvas com segurança em um banco de dados relacional.
- **Experiência do Usuário:** Oferecer uma interface responsiva, ágil e de fácil navegação para dispositivos móveis e desktop.
- **Arquitetura Escalável:** Aplicar o padrão RESTful na comunicação entre a interface (Front-end) e o servidor (Back-end).

---

## 🛠️ Tecnologias Utilizadas (Tech Stack)

### **Front-end**
- **React.js:** Construção de componentes dinâmicos e reativos. 
- **HTML5 & CSS3:** Estruturação semântica e estilização moderna com layout responsivo.
- **JavaScript (ES6+):** Lógica da aplicação, manipulação de estado e consumo de API.

### **Back-end**
- **Node.js e Express.js:** Criação do servidor e rotas da API RESTful.
- **SQL (PostgreSQL / MySQL):** Modelagem e estruturação do banco de dados relacional.

### **Ferramentas e Versionamento**
- **Git e GitHub:** Versionamento de código, controle de *branches* e documentação do repositório. 

---

## 📋 Funcionalidades Principais

1. **Autenticação Segura:** Cadastro de novos usuários e login utilizando senhas criptografadas e JWT.
2. **Dashboard de Métricas:** Estatísticas em tempo real com barra de progresso do total de tarefas concluídas, pendentes e em andamento.
3. **CRUD Completo de Tarefas:** Criação, edição, listagem e remoção de tarefas.
4. **Ciclo de Status Dinâmico:** Altere o status de uma tarefa rapidamente clicando no marcador (Pendente ➔ Em Andamento ➔ Concluída).
5. **Filtros e Busca Avançada:** Pesquisa textual em tempo real no título/descrição, e filtros rápidos por status e prioridades.
6. **Ordenação Inteligente:** Ordene suas tarefas por Data de Criação, Título, Data de Vencimento e Prioridade (com suporte para ordem crescente ou decrescente).
7. **Responsividade:** Interface otimizada tanto para telas de desktop quanto para dispositivos móveis.

---

## 🚀 Instalação e Execução

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

### 🔑 Usuário de Teste (Credenciais Padrão)

Caso queira testar a aplicação sem criar uma nova conta, utilize as seguintes credenciais pré-cadastradas:
- **E-mail:** `testuser@gmail.com`
- **Senha:** `password123`

---

## 💡 Aprendizados e Impactos 

Durante a execução deste projeto acadêmico, foi possível consolidar diversos conhecimentos práticos essenciais de Engenharia de Software:

1. **Integração Cliente-Servidor:** Compreensão do ciclo de requisição e resposta HTTP utilizando métodos REST (GET, POST, PUT, DELETE).
2. **Modelagem de Dados:** Aplicação de conceitos relacionais em SQL para estruturação e consulta eficiente das informações.
3. **Gerenciamento de Estado no Front-end:** Uso de *hooks* do React para controle de dados em tempo real e atualização de interfaces. 
4. **Boas Práticas de Código:** Organização modular de pastas, separação de responsabilidades no código e versionamento consistente com Git.
