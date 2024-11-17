## Visão Geral

Este é um aplicativo móvel desenvolvido em React Native como parte de um desafio técnico para a posição de Desenvolvedor Mobile na Interset Tecnologia. O aplicativo permite que os usuários façam login, visualizem e filtrem listas de clientes e vistorias, adicionem novos clientes e vistorias vejam detalhes de uma vistoria específica e editem essa vistoria..

## Funcionalidades Implementadas

### 1. Consumo da API

- Clientes: Os dados dos clientes são obtidos da API e exibidos em uma lista, com recursos de busca e filtragem.
- Vistoria: Os dados das vistorias são obtidos da API e exibidos em uma lista, permitindo a busca e edição.

### 2. CRUD de Vistoria

- Criação: O aplicativo permite a criação de novas vistorias.
- Leitura: Uma lista de todas as vistorias realizadas é exibida.
- Atualização: É possível atualizar e editar uma vistoria existente.

### 3. Interface do Usuário

- Design: A interface do usuário foi desenvolvida de forma intuitiva e agradável, utilizando componentes nativos do React Native.
- Experiência do Usuário: A experiência do usuário foi priorizada, com transições suaves entre telas e feedback visual.

### 4. Considerações Adicionais

- Gerenciamento de Estado: O Redux foi utilizado para gerenciar o estado da aplicação de forma eficiente.
- Navegação: A navegação entre as telas foi implementada utilizando a biblioteca React Navigation.
- Testes: Foram escritos testes unitários para garantir a qualidade do código e o funcionamento correto das principais funcionalidades.
- Integração com API: Uma funcionalidade de envio dos dados para a API foi implementada para manter a sincronização entre o aplicativo e o servidor.

## Estrutura do Projeto

O projeto segue uma estrutura de diretórios típica de um aplicativo React Native, com os seguintes diretórios e arquivos principais:

- `src/`: Contém o código-fonte do aplicativo.
  - `screens/`: Contém os componentes de tela do aplicativo.
    - `LoginScreen.tsx`: Tela de login.
    - `SharedListScreen.tsx`: Tela com as listas de clientes e vistorias.
    - `NewClientScreen.tsx`: Tela para adicionar um novo cliente.
    - `NewInspectionScreen.tsx`: Tela para adicionar uma nova vistoria.
    - `ScreenInspectionDetails.tsx`: Tela com detalhes de uma vistoria específica.
  - `store/`: Contém a configuração do Redux e os slices.
    - `index.ts`: Configuração da store do Redux.
    - `slice/`: Contém os slices do Redux.
      - `authSlice.ts`: Slice para o estado de autenticação.
      - `clientsSlice.ts`: Slice para o estado dos clientes.
      - `inspectionSlice.ts`: Slice para o estado das vistorias.
  - `hooks/`: Contém hooks personalizados.
    - `useAppDispatch.ts`: Hook para acessar a função `dispatch` do Redux.
    - `useAppSelector.ts`: Hook para acessar o estado do Redux.
  - `navigation/`: Contém a configuração de navegação do aplicativo.
    - `AppNavigator.tsx`: Configuração do navegador principal do aplicativo.
  - `types/`: Contém definições de tipos.
    - `api.ts`: Definições de tipos para as respostas da API.
- `__tests__/`: Contém os testes do aplicativo.
- `__mocks__/`: Contém mocks usados nos testes.
- `App.tsx`: Componente raiz do aplicativo.

## Fluxo do Aplicativo

### Autenticação

O fluxo de autenticação do aplicativo é gerenciado pelo slice `authSlice` do Redux. Quando o usuário entra na tela de login (`LoginScreen`) e submete suas credenciais, a ação `loginStart` é despachada. Se as credenciais estiverem corretas, a ação `loginSuccess` é despachada e o usuário é redirecionado para a tela `SharedListScreen`. Se as credenciais estiverem incorretas ou ocorrer um erro, a ação `loginFailure` é despachada e uma mensagem de erro é exibida.

{ "email": "admin@admin.com", "senha": "123456" }

### Lista Compartilhada

A tela `SharedListScreen` exibe duas listas: uma de clientes e outra de vistorias. Os dados para essas listas são buscados da API quando a tela é carregada e armazenados nos slices `clientsSlice` e `inspectionSlice` do Redux, respectivamente.

A tela permite alternar entre as duas listas usando botões de aba e oferece a funcionalidade de pesquisa para filtrar os itens da lista atual. Tocar em um item de vistoria na lista navega para a tela `ScreenInspectionDetails` com os detalhes daquela vistoria.

Um botão de ação flutuante (FAB) na tela permite ao usuário adicionar um novo cliente ou uma nova vistoria, dependendo da lista atual.

### Adição de Cliente

Na tela `NewClientScreen`, o usuário pode adicionar um novo cliente preenchendo um formulário com nome, e-mail e telefone do cliente. A validação do formulário é feita ao enviar e, se todos os campos estiverem corretos, uma requisição POST é enviada à API para criar o novo cliente. Em caso de sucesso, o usuário é redirecionado de volta à tela `SharedListScreen`.

### Adição de Vistoria

A tela `NewInspectionScreen` permite ao usuário adicionar uma nova vistoria. O usuário preenche um formulário com o tipo, categoria, se a vistoria contém anomalia, a anomalia (se aplicável), uma observação e fotos.

A lista de anomalias disponíveis é buscada da API quando a tela é carregada. A validação do formulário acontece ao enviar e, se não houver erros, uma requisição POST é enviada à API para criar a nova vistoria e fazer o upload das fotos. Se bem-sucedido, o usuário é redirecionado de volta para a tela `SharedListScreen`.

### Detalhes da Vistoria

A tela `ScreenInspectionDetails` exibe detalhes de uma vistoria específica. A ID da vistoria é passada para a tela via parâmetros de navegação. Os detalhes da vistoria são buscados da API usando a ID quando a tela é carregada.

A tela permite ao usuário editar certos campos da vistoria, como tipo, categoria e observação. Ao salvar, uma requisição PUT é enviada à API para atualizar a vistoria. A tela também exibe quaisquer fotos associadas à vistoria.

## Gerenciamento de Estado

O aplicativo usa o Redux para gerenciamento de estado. Existem três slices principais:

- `authSlice`: Gerencia o estado de autenticação do usuário.
- `clientsSlice`: Gerencia o estado dos clientes.
- `inspectionSlice`: Gerencia o estado das vistorias.

Os componentes acessam o estado e despacham ações usando os hooks `useAppSelector` e `useAppDispatch`, respectivamente.

## Testes

O aplicativo tem uma ampla cobertura de testes, com testes para os componentes de tela, redutores Redux e operações assíncronas. Os testes usam as bibliotecas Jest e Testing Library.

Os testes dos componentes de tela (`LoginScreen.test.tsx`, `NewClientScreen.test.tsx`, `ScreenInspectionDetails.test.tsx`, `SharedListScreen.test.tsx`) verificam a renderização correta dos componentes, alterações de estado baseadas na interação do usuário e chamadas corretas à API.

Os testes dos redutores Redux (`authSlice.test.ts`, `clientsSlice.test.ts`, `inspectionSlice.test.ts`) verificam se os redutores atualizam o estado corretamente em resposta às ações despachadas.

## Comunicação com API

O aplicativo se comunica com uma API backend para operações CRUD em clientes e vistorias e para autenticação de usuário. A biblioteca Axios é usada para fazer requisições HTTP.

A URL base da API é `https://suporte.zapto.org:3001`. Os endpoints usados são:

- `/cliente/all`: Busca todos os clientes (GET).
- `/cliente`: Cria um novo cliente (POST).
- `/vistoria/all`: Busca todas as vistorias (GET).
- `/vistoria`: Cria uma nova vistoria (POST).
- `/vistoria/:id`: Atualiza uma vistoria (PUT).
- `/vistoria/upload`: Faz upload de fotos para uma vistoria (POST).
- `/anomalia/all`: Busca todas as anomalias (GET).
