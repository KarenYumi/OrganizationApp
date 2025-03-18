# 🍰 SweetFlow - Sistema de Gestão de Pedidos de Bolos 

Este projeto foi desenvolvido para auxiliar uma confeiteira na organização de seus pedidos de bolos, garantindo mais eficiência e controle no processo de produção. Utilizando um sistema de Kanban, é possível gerenciar cada etapa da preparação — desde a escolha da massa, recheio e cobertura, até o status final do pedido, como pronto, cancelado ou entregue.

Além disso, o sistema registra informações detalhadas sobre cada encomenda, incluindo descrição do bolo, data e local de entrega, e se o cliente irá buscar ou receber em domicílio. Dessa forma, a confeiteira pode acompanhar todos os pedidos de maneira prática, reduzindo erros e otimizando o fluxo de trabalho.


## 🚀 Funcionalidades
  ✅ Kanban para organização dos pedidos. </br>
  ✅ Acompanhamento das etapas: massa, recheio e cobertura. </br>
  ✅ Atualização do status do pedido (A fazer, pendente, pronto, cancelado, entregue). </br>
  ✅ Informações detalhadas do bolo e da entrega. </br>
  ✅ Interface intuitiva para facilitar o uso. </br>


## 🛠 Tecnologias Utilizadas
 - Frontend </br>
    React – Biblioteca para construção da interface. </br>
    Vite – Ferramenta para criação e otimização do projeto. </br>
    React DnD – Implementação de Drag and Drop para o Kanban. </br>
    React Router – Navegação entre páginas. </br>

- Backend </br>
    Node.js – Plataforma para execução do servidor. </br>
    Express.js – Framework para criação da API. </br>
    Body-parser – Middleware para processar requisições JSON. </br>
    fs (File System) – Manipulação de arquivos JSON como banco de dados. </br>


## 📦 Instalação e Execução
1️⃣ Clonar o Repositório </br>
  git clone https://github.com/KarenYumi/OrganizationApp.git </br>
  cd cakeflow </br>

2️⃣ Instalar Dependências </br>
  npm install </br>

3️⃣ Executar o Projeto </br>
  - FrontEnd </br>
    npm run dev </br>

  - Backend </br>
    cd backend </br>
    npm start </br>


## 🛣 Futuras Melhorias
  - Add criação de card no kanban
  - Arrumar a lógica do kanban pra salvar a posição do card
  - Arruamr a criação do pedido adicionando status
  - Arrumar a descrição do pedido para que ele já separe em cards no kanban

💡 Sugestões e melhorias são bem-vindas!