# Project TODO

## Funcionalidades Principais - Design 100% Itaú

### Interface de Chat Conversacional
- [x] Logo laranja circular do Itaú com texto "Assistente Virtual Itaú"
- [x] Mensagens do bot com fundo branco e avatar laranja
- [x] Mensagens do usuário com fundo cinza claro e avatar "SP"
- [x] Horários das mensagens (formato 16:52)
- [x] Saudação personalizada "Oi, [Nome]! Escolha uma das opções a seguir ou escreva em poucas palavras o que precisa."
- [x] Exemplo de uso com emoji "Exemplo: consultar fatura. 😊"

### Botões de Sugestão Rápida
- [x] Botões com borda azul escuro (2px) e fundo branco
- [x] Texto azul escuro centralizado
- [x] Cantos arredondados (rounded-full)
- [x] Espaçamento adequado entre botões
- [x] Sugestões contextuais de gateway de pagamento

### Campo de Input
- [x] Input com placeholder "Digite aqui"
- [x] Ícone de microfone laranja à direita
- [x] Borda cinza clara com cantos arredondados
- [x] Fixo na parte inferior da tela

### Botão "Iniciar chat"
- [x] Botão laranja grande (#EC7000)
- [x] Texto branco "Iniciar chat"
- [x] Ícone de seta à direita
- [x] Largura total com margem lateral

### Seção "canais de atendimento"
- [x] Título em negrito "canais de atendimento"
- [x] Lista de canais com ícones à esquerda
- [x] WhatsApp Itaú (ícone de WhatsApp)
- [x] acessível em libras (ícone de mão)
- [x] telefones (ícone de telefone)
- [x] ouvidoria (ícone de documento)
- [x] Setas de navegação à direita de cada item

### Página Central de Ajuda
- [x] Header com "Central de Ajuda" e ícone de busca
- [x] Lista de perguntas frequentes
- [x] Navegação entre chat e central de ajuda
- [x] Botão "Carregar mensagens anteriores" com borda azul

### Funcionalidades Técnicas
- [x] Placeholder para integração de API de IA (handleAISearch)
- [x] Responsividade mobile-first
- [x] Animações suaves de transição
- [x] Estados de loading ("Carregando...")
- [x] Navegação entre telas (voltar)

### Design e Estilo
- [x] Paleta de cores Itaú: Laranja #EC7000, Azul escuro #003C7E
- [x] Fonte Inter ou similar
- [x] Fundo cinza claro #F5F5F5
- [x] Sombras suaves nos cards
- [x] Espaçamentos consistentes

## Ajustes Solicitados - Integração com API de IA do Usuário

- [x] Remover respostas automáticas simuladas do bot
- [x] Manter apenas envio de mensagens do usuário
- [x] Preparar placeholder limpo para API de IA do usuário
- [x] Documentar claramente onde conectar a API de IA
- [x] Garantir que apenas a API do usuário gere respostas

## Integração Google Gemini AI

- [x] Configurar endpoint da API do Google Gemini
- [x] Adicionar chave de API fornecida pelo usuário
- [x] Implementar chamada à API do Gemini
- [x] Configurar contexto do assistente (gateway de pagamentos)
- [x] Testar respostas da IA em tempo real
- [x] Adicionar tratamento de erros específico do Gemini

## Correção de Erro - API Gemini

- [x] Corrigir endpoint da API Gemini (erro 404)
- [x] Ajustar para URL correta v1 da API
- [x] Testar chamada à API com novo endpoint

## Investigação e Correção - Erro 404 Persistente

- [x] Testar API do Gemini via curl/shell
- [x] Identificar formato correto da URL e body
- [x] Corrigir implementação no código (modelo gemini-2.0-flash)
- [x] Validar funcionamento completo

## Novas Funcionalidades Solicitadas

### 1. Animação de "Digitando..."
- [x] Adicionar estado de loading/digitando
- [x] Criar componente visual de três pontinhos animados
- [x] Mostrar enquanto aguarda resposta da IA

### 2. Histórico de Conversas no Banco
- [x] Criar tabela conversations no schema
- [x] Criar tabela messages no schema
- [x] Implementar salvamento automático de mensagens
- [x] Adicionar procedimento tRPC para buscar histórico
- [ ] Carregar histórico ao iniciar chat (frontend)

### 3. Sistema de Avaliação de Respostas
- [x] Adicionar botões 👍 Útil / 👎 Não útil
- [x] Criar tabela message_ratings no schema
- [x] Implementar procedimento tRPC para salvar avaliação
- [x] Mostrar feedback visual após avaliação

### 4. Botões de Sugestão Personalizados
- [x] Atualizar sugestões para contexto de gateway de pagamentos
- [x] Adicionar "consultar limites para compras"
- [x] Adicionar "prazo de entrega do cartão"
- [x] Adicionar "código de barras da fatura"
- [x] Adicionar "desbloquear cartão"
- [x] Adicionar "consultar senha do cartão"

## Novas Funcionalidades - Áudio, Delay, Notificações e Memória

### 5. Gravação de Áudio e Transcrição
- [x] Implementar gravação de áudio ao clicar no microfone
- [x] Adicionar transcrição automática de voz para texto (Web Speech API)
- [x] Enviar texto transcrito para a IA
- [x] Mostrar feedback visual durante gravação (microfone vermelho pulsando)

### 6. Delay de 4 Segundos
- [x] Adicionar delay fixo de 4 segundos antes da IA responder
- [x] Manter animação de "digitando..." durante o delay

### 7. Sistema de Notificações de Status
- [x] Criar componente de notificações (StatusNotifications.tsx)
- [x] Implementar notificações de transação aprovada
- [x] Implementar notificações de estorno concluído
- [x] Implementar notificações de limite alterado

### 8. Documentação do Prompt da IA
- [x] Documentar claramente onde editar o prompt (constante AI_SYSTEM_PROMPT)
- [x] Adicionar comentários explicativos no código
- [x] Criar guia de personalização do prompt

### 9. Sistema de Memória de Clientes
- [x] Carregar histórico de conversas ao iniciar chat
- [x] Enviar contexto de conversas anteriores para a IA
- [x] Implementar resumo de interações passadas (últimas 5 mensagens)
- [x] Permitir IA lembrar preferências do cliente

### 10. Otimização para Mobile/App
- [x] Garantir responsividade total (design mobile-first)
- [x] Otimizar touch targets para mobile (botões grandes)
- [x] Testar integração com WebView (pronto para app)
- [x] Ajustar espaçamentos para telas pequenas

## Correção - Tratamento de Erros de Áudio

- [x] Melhorar tratamento de erro "no-speech" (usuário não falou)
- [x] Melhorar tratamento de erro "aborted" (usuário cancelou)
- [x] Não mostrar alertas para erros esperados
- [x] Adicionar feedback visual mais suave

## Novas Melhorias Solicitadas

### 1. Correção Definitiva do Erro de Áudio
- [x] Remover evento onend que causa rejeição duplicada
- [x] Testar gravação sem erros no console

### 2. Tela de Central de Ajuda Antes do Chat
- [x] Criar componente de Central de Ajuda
- [x] Adicionar FAQ expansível (accordion)
- [x] Adicionar canais de atendimento clicáveis
- [x] Mostrar texto explicativo ao clicar em cada canal
- [x] Botão "Iniciar chat" laranja grande
- [x] Integrar navegação entre Central de Ajuda e Chat

### 3. IA com Emojis Formais
- [x] Atualizar prompt para usar emojis apropriados
- [x] Manter tom educado e profissional
- [x] Testar respostas com emojis

## Correção Final - Erro no-speech

- [x] Tratar erro no-speech silenciosamente sem rejeitar Promise
- [x] Não mostrar erro no console para casos esperados
- [x] Testar gravação sem erros visíveis

## Novas Funcionalidades - Histórico, Contas e Melhorias de CSS

### 1. Histórico de Buscas
- [x] Salvar últimas 5 perguntas do usuário
- [x] Mostrar como sugestões rápidas ao abrir chat
- [x] Permitir clicar para repetir pergunta

### 2. Banco de Dados de Contas Bancárias
- [x] Criar tabela bank_accounts no schema
- [x] Campos: userId, accountName, accountNumber
- [x] Criar tabela search_history no schema
- [x] Adicionar procedimentos tRPC para gerenciar contas
- [x] Integrar dados de contas no contexto da IA
- [x] IA deve ter acesso ao nome e número da conta do cliente

### 3. Melhorias de Interface
- [x] Remover ícone de lupa do header da Central de Ajuda
- [x] Melhorar CSS da Central de Ajuda (cores, espaçamentos, sombras)
- [x] Adicionar efeitos hover mais suaves (blue-50 e orange-50)
- [x] Cards com bordas arredondadas e sombras (rounded-lg shadow-sm)
## Correção - Erro bankAccount.get

- [x] Corrigir procedimento tRPC bankAccount.get para retornar null em vez de undefined
- [x] Testar quando usuário não tem conta cadastrada

## Ajuste - Sugestões Fixas

- [x] Remover lógica de histórico de buscas que substitui as sugestões
- [x] Manter as 5 sugestões de gateway de pagamentos sempre fixas no chat

## Correção - Recolocar Prompt Manga Pay

- [x] Atualizar AI_SYSTEM_PROMPT com conteúdo completo da Manga Pay

## Atualização - Prompt Curto Estilo Itaú

- [x] Substituir prompt longo pelo novo prompt curto e direto no estilo Itaú

## Correção - Recolocar Seta de Voltar

- [x] Adicionar seta de voltar no header do chat para retornar à Central de Ajuda

## Melhorias - Horário Brasília e Dados do Cliente

- [x] Ajustar horário para horário de Brasília (GMT-3) na mensagem de boas-vindas
- [x] Buscar nome e informações pessoais do cliente no banco de dados
- [x] Exibir nome do cliente na mensagem de boas-vindas personalizada

## Atualização - Prompt Mango Pix

- [x] Substituir prompt atual pelo novo prompt da Mango Pix com estilo bancário profissional

## Ajustes Central de Ajuda - Mango Pix

- [x] Trocar "desbloquear cartão" por "Como faço para desbloquear meu cartão de crédito?"
- [x] Trocar "Whatsapp Itaú" por "Whatsapp Mango Pix" com nova descrição
- [x] Manter apenas 2 perguntas FAQ (consultar fatura e alterar vencimento)
- [x] Remover lupa de busca do header da Central de Ajuda
- [x] Atualizar prompt da IA com novo arquivo

## Correções e Melhorias - UX e Layout

- [x] Restaurar 5 sugestões automáticas no chat (não apenas 1)
- [x] Manter apenas 2 perguntas no FAQ da Central de Ajuda
- [x] Adicionar descrição/resposta expansível para cada pergunta do FAQ
- [x] Corrigir bugs do modo dark no mobile
- [x] Ajustar posição da barra de digitação no mobile (sticky bottom)
- [x] Melhorar layout para desktop (responsivo)
- [x] Atualizar prompt com novo arquivo (incluindo horário, telefone 70707070, restrições e o que podemos dizer)

## Melhorias Finais - Branding e UX

- [x] Trocar "ouvidoria" por "email" nos canais de atendimento
- [x] Remover "telefones" dos canais de atendimento
- [x] Substituir logo do Itaú pela logo da Mango Pix (manga laranja)
- [x] Fazer input subir automaticamente ao digitar no mobile
- [x] Implementar renderização de markdown (negrito com **)
- [x] Aplicar design mais minimalista (removido badge "Hoje", checkmarks duplos, simplificado cores)

## Sistema de Áudio - Transcrição Automática

- [ ] Implementar Web Speech API para captura de áudio em tempo real
- [ ] Transcrever automaticamente fala do microfone para texto
- [ ] Enviar transcrição automaticamente como mensagem no chat

## Correções UX - Delay e Mensagem Inicial

- [x] Adicionar delay de 3 segundos antes da IA responder
- [x] Mostrar animação de digitação durante o delay
- [x] Corrigir mensagem inicial cortada no mobile (agora mostra mensagem completa com exemplo)

## Correções Mobile - FAQ e Scroll

- [x] Corrigir FAQ expansível que não está funcionando no mobile (adicionado type="button" e e.preventDefault())
- [x] Ajustar scroll para mostrar primeira mensagem completa (scroll para topo ao carregar)
- [x] Garantir que chat inicie mostrando a mensagem de boas-vindas inteira (useEffect com scrollTop = 0)

## Melhorias UX - Animação e Performance

- [x] Adicionar animação de fade-in nas mensagens do bot (fadeIn 0.4s ease-out com translateY)
- [x] Reduzir delay de resposta da IA de 3s para 2s

## Otimização Cuidadosa para Lovable.ai

- [ ] Analisar quais componentes shadcn/ui são realmente usados no projeto
- [ ] Remover APENAS componentes comprovadamente não utilizados
- [ ] Preservar todas funcionalidades visuais (logo, FAQ, canais, CSS)
- [ ] Testar que tudo continua funcionando perfeitamente

## Correção Erro API Gemini 403

- [x] Investigar causa do erro 403 (chave de API hardcoded no frontend)
- [x] Verificar se está usando a API correta (agora usa invokeLLM do servidor via tRPC)
- [x] Corrigir chamada da API Gemini (criado procedimento chat.askAI no servidor)
- [x] Melhorar tratamento de erros para usuário (mensagem amigável)

## Correção Erro 400 tRPC

- [x] Investigar formato correto de requisição tRPC (formato batch: {"0": {"json": input}})
- [x] Corrigir body da requisição para seguir padrão tRPC
- [x] Adicionar log de erro detalhado para debug

## Correção Formato Batch tRPC

- [x] Ajustar estrutura da requisição (usar useMutation do tRPC em vez de fetch manual)
- [x] Corrigir tipo de retorno (converter array para string se necessário)

## Correção Header Central de Ajuda

- [x] Adicionar logo Mango Pix no header da Central de Ajuda


## Otimização para Lovable.ai (< 100 arquivos)

- [x] Contar arquivos atuais do projeto (127 arquivos)
- [x] Identificar componentes shadcn/ui não utilizados
- [x] Remover 51 componentes shadcn/ui não utilizados (mantendo apenas button e input)
- [x] Remover 7 componentes auxiliares não utilizados
- [x] Corrigir imports quebrados em App.tsx, NotFound.tsx e input.tsx
- [x] Testar todas funcionalidades após remoção
- [x] Verificar que projeto tem menos de 100 arquivos (69 arquivos finais)


## Otimização Adicional (Remover mais arquivos)

- [x] Contar arquivos atuais (69 arquivos após primeira otimização)
- [x] Identificar 10 arquivos não essenciais para remoção
- [x] Remover 2 snapshots antigos de migration (drizzle/meta)
- [x] Remover 1 página duplicada (HelpCenter.tsx)
- [x] Remover 2 hooks não utilizados (useMobile, usePersistFn)
- [x] Remover 4 arquivos _core não utilizados (map, imageGeneration, voiceTranscription, dataApi)
- [x] Remover 1 arquivo shared não utilizado (types.ts)
- [x] Corrigir useComposition.ts para usar useCallback em vez de usePersistFn
- [x] Testar todas funcionalidades após remoção
- [x] Verificar que projeto tem 59 arquivos (bem abaixo de 100)
