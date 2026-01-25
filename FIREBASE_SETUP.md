# Configuração do Firebase

## 1. Criar Projeto Firebase

1. Aceda a [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga os passos para criar o projeto

## 2. Ativar Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar base de dados"
3. Escolha "Iniciar em modo de teste" (para desenvolvimento)
4. Selecione a região mais próxima

## 3. Ativar Firebase Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Na aba "Método de login", ative "Email/Palavra-passe"
4. Guarde as alterações

## 4. Obter Configuração

1. Vá a Configurações do Projeto (ícone de engrenagem)
2. Na secção "As suas aplicações", clique em "Web" (</>)
3. Registe a aplicação e copie as credenciais

## 5. Configurar Variáveis de Ambiente

Crie um ficheiro `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

## 6. Regras de Segurança (Firestore)

Para produção, configure regras adequadas em Firestore > Regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função auxiliar para verificar se o utilizador está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função para obter o centro de formação do utilizador
    function getUserCenter() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.centroFormacaoId;
    }
    
    // Centros de Formação - apenas admins podem editar
    match /trainingCenters/{centerId} {
      allow read: if isAuthenticated() && getUserCenter() == centerId;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && getUserCenter() == centerId;
    }
    
    // Utilizadores
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.uid;
    }
    
    // Formadores - apenas do mesmo centro
    match /trainers/{trainerId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.centroFormacaoId == getUserCenter());
    }
    
    // Cursos - apenas do mesmo centro
    match /courses/{courseId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.centroFormacaoId == getUserCenter());
    }
    
    // Programas - apenas do mesmo centro
    match /programs/{programId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.centroFormacaoId == getUserCenter());
    }
    
    // Sessões - apenas do mesmo centro
    match /sessions/{sessionId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.centroFormacaoId == getUserCenter());
    }
    
    // Planos de sessão
    match /sessionPlans/{planId} {
      allow read, write: if isAuthenticated();
    }
    
    // Planos de demonstração
    match /demonstrationPlans/{planId} {
      allow read, write: if isAuthenticated();
    }
    
    // Fichas de trabalho
    match /worksheets/{worksheetId} {
      allow read, write: if isAuthenticated();
    }
    
    // Logs de auditoria - apenas leitura, criação automática
    match /auditLogs/{logId} {
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.centroFormacaoId == getUserCenter());
      allow create: if isAuthenticated();
    }
  }
}
```

## 7. Coleções Criadas Automaticamente

- `trainingCenters` - Centros de formação
- `users` - Utilizadores/Contas
- `trainers` - Formadores
- `courses` - Cursos
- `programs` - Programas formativos
- `sessions` - Sessões de formação
- `sessionPlans` - Planos de sessão
- `demonstrationPlans` - Planos de demonstração
- `worksheets` - Fichas de trabalho
- `auditLogs` - Logs de auditoria

## 8. Estrutura de Dados

### Centro de Formação
```javascript
{
  id: "auto-generated",
  nome: "Nome do Centro",
  nif: "123456789",
  email: "geral@centro.pt",
  telefone: "+351 XXX XXX XXX",
  morada: "Morada completa",
  codigoPostal: "0000-000",
  localidade: "Lisboa",
  pais: "Portugal",
  responsavel: "Nome do Responsável",
  emailResponsavel: "responsavel@centro.pt",
  telefoneResponsavel: "+351 XXX XXX XXX",
  certificacoes: [],
  areasFormacao: [],
  status: "ativo",
  dataCriacao: "2024-01-01T00:00:00.000Z",
  dataAtualizacao: "2024-01-01T00:00:00.000Z"
}
```

### Utilizador
```javascript
{
  id: "auto-generated",
  uid: "firebase-auth-uid",
  nome: "Nome Completo",
  email: "email@exemplo.com",
  role: "admin" | "gestor" | "formador",
  centroFormacaoId: "id-do-centro",
  ativo: true,
  dataCriacao: "2024-01-01T00:00:00.000Z",
  ultimoAcesso: "2024-01-01T00:00:00.000Z"
}
```

### Formador
```javascript
{
  id: "auto-generated",
  nome: "Nome Completo",
  email: "email@exemplo.com",
  telefone: "+351 XXX XXX XXX",
  nif: "123456789",
  certificacaoPedagogica: "CCP" | "CAP",
  numeroCertificacao: "F123456/2024",
  validadeCertificacao: "2025-12-31",
  areasCompetencia: ["Área 1", "Área 2"],
  experienciaAnos: 5,
  centroFormacaoId: "id-do-centro",
  status: "ativo",
  dataCriacao: "2024-01-01T00:00:00.000Z",
  dataAtualizacao: "2024-01-01T00:00:00.000Z"
}
```
