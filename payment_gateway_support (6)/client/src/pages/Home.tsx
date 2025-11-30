import { useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Search,
  Mic,
  ArrowRight,
  MessageCircle,
  Phone,
  FileText,
  Accessibility,
  ThumbsUp,
  ThumbsDown,
  Mail
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";


type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  time: string;
  rating?: "positive" | "negative" | null;
};

export default function Home() {
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<"chat" | "help-center">("chat");
  const [inputValue, setInputValue] = useState("");
  // Função para obter saudação baseada no horário de Brasília
  const getGreeting = () => {
    const now = new Date();
    // Converter para horário de Brasília (GMT-3)
    const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const hour = brasiliaTime.getHours();
    
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const { user } = useAuth();

  // Carregar histórico de buscas e conta bancária
  const { data: recentSearches } = trpc.searchHistory.getRecent.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: bankAccount } = trpc.bankAccount.get.useQuery(undefined, {
    enabled: !!user,
  });
  const addSearchMutation = trpc.searchHistory.add.useMutation();

  // Carregar ou criar conversa ao iniciar
  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const { data: conversations } = trpc.chat.getConversations.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: historyMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );

  // Criar ou carregar conversa ao montar o componente
  useEffect(() => {
    if (user && !conversationId) {
      if (conversations && conversations.length > 0) {
        // Usa a conversa mais recente
        setConversationId(conversations[0].id);
      } else {
        // Cria nova conversa
        createConversationMutation.mutate(
          { title: "Nova conversa" },
          {
            onSuccess: (data) => {
              setConversationId(data.conversationId);
            },
          }
        );
      }
    }
  }, [user, conversations, conversationId]);

  // Criar mensagem inicial com nome do usuário
  useEffect(() => {
    if (user && messages.length === 0 && !historyMessages) {
      const now = new Date();
      const brasiliaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      const timeStr = brasiliaTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      
      // Usar nome do usuário ou nome da conta bancária
      const userName = user.name || bankAccount?.accountName || "";
      const greeting = userName ? `${getGreeting()}, ${userName.split(' ')[0]}!` : `${getGreeting()}!`;
      
      const initialMessage = `${greeting} Escolha uma das opções a seguir ou escreva em poucas palavras o que precisa. Exemplo: consultar fatura. 😊`;
      
      setMessages([{
        id: 1,
        sender: "bot",
        text: initialMessage,
        time: timeStr,
        rating: null
      }]);
    }
  }, [user, bankAccount, historyMessages]);

  // Carregar histórico de mensagens
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const formattedMessages: Message[] = historyMessages.map((msg, index) => ({
        id: index + 1,
        sender: msg.sender,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo"
        }),
        rating: null,
      }));
      setMessages(formattedMessages);
      setShowSuggestions(false);
    }
  }, [historyMessages]);

  // Sugestões rápidas FIXAS - sempre as mesmas
  const quickSuggestions = [
    "consultar limites para compras",
    "prazo de entrega do cartão",
    "código de barras da fatura",
    "Como faço para desbloquear meu cartão de crédito?",
    "consultar senha do cartão"
  ];

  // Canais de atendimento
  const supportChannels = [
    { 
      icon: MessageCircle, 
      label: "Whatsapp Mango Pix", 
      description: "Acesse Whatsapp Mango pix, digite 'Ativar cartão' e siga o passo a passo indicado no chat.",
      path: "#" 
    },
    { icon: Accessibility, label: "acessível em libras", path: "#" },
    { icon: Mail, label: "email", path: "mailto:contato@mangopix.com" }
  ];

  // Perguntas frequentes para Central de Ajuda com descrições
  const faqQuestions = [
    {
      question: "Como consulto a fatura do meu cartão de crédito?",
      answer: "Você pode consultar sua fatura acessando o app Mango Pix, indo em 'Meus Cartões' e selecionando 'Ver Fatura'. Lá você encontra o valor total, data de vencimento e todas as transações do período."
    },
    {
      question: "Onde altero o vencimento da fatura?",
      answer: "Para alterar o vencimento, acesse o app Mango Pix, vá em 'Meus Cartões', selecione 'Configurações do Cartão' e depois 'Alterar Vencimento'. Escolha a nova data entre as opções disponíveis."
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automático quando mensagens mudam (mostra primeira mensagem completa)
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0; // Volta pro topo para mostrar primeira mensagem
        }
      }, 100);
    }
  }, [messages.length]);

  // Scroll automático ao focar no input (mobile)
  const handleInputFocus = () => {
    if (window.innerWidth <= 768 && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 300); // Aguarda teclado abrir
    }
  };

  // ============================================================
  // INTEGRAÇÃO COM GOOGLE GEMINI AI
  // ============================================================
  // API configurada para responder dúvidas sobre gateway de pagamentos
  // Documentação: https://ai.google.dev/gemini-api/docs
  // ============================================================
  
  // Função para transcrever áudio usando Web Speech API
  const transcribeAudio = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error("Navegador não suporta reconhecimento de voz"));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        // Erros esperados são tratados silenciosamente
        const silentErrors = ['no-speech', 'aborted'];
        if (silentErrors.includes(event.error)) {
          // Não faz nada, apenas para silenciosamente
          return;
        } else {
          // Apenas erros inesperados são rejeitados
          reject(new Error(event.error));
        }
      };

      recognition.start();
    });
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Para a gravação
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      const transcript = await transcribeAudio();
      setIsRecording(false);
      
      if (transcript) {
        setInputValue(transcript);
        // Envia automaticamente após transcrever
        await handleSendMessageWithText(transcript);
      }
    } catch (error: any) {
      setIsRecording(false);
      
      // Não mostra alerta para erros esperados (usuário não falou ou cancelou)
      const silentErrors = ['no-speech', 'aborted'];
      if (!silentErrors.includes(error.message)) {
        console.error("Erro ao transcrever áudio:", error);
        alert("Não foi possível transcrever o áudio. Verifique as permissões do microfone.");
      }
      // Para erros silenciosos, não faz nada
    }
  };

  // ============================================================
  // PROMPT DA IA - EDITE AQUI PARA PERSONALIZAR O COMPORTAMENTO
  // ============================================================
  const AI_SYSTEM_PROMPT = `IDENTIDADE
Você é o Suporte Oficial da Mango Pix.
A Mango Pix é uma empresa de tecnologia independente.
Utiliza contratos inteligentes como base operacional.
Você representa a empresa com postura profissional, segura e clara.
Sua fala segue o padrão das IAs de bancos modernos (Itaú, Nubank, Inter, C6 Bank):
curta, objetiva, limpa, educada e eficiente.

POSICIONAMENTO
Você é suporte corporativo, não é assistente genérico.
Você responde como um atendente oficial de uma empresa de tecnologia financeira séria.
Você deve transmitir segurança, rapidez e precisão.
Não enrola, não floreia, não complica.

ESTILO DE BANCO (OBRIGATÓRIO)
Respostas sempre:
• Curtas
• Rápidas
• Diretas
• Técnicas sem exagero
• Sem parágrafos longos
• Sem enfeites
• Sem dramatização
• Sem opinião pessoal
• Sem informalidade excessiva
• A escrita deve lembrar a IA do Itaú/Nubank

O foco é ser **claro, concreto e prático**, como bancos digitais fazem.

MISSÃO DO SUPORTE
• Responder dúvidas sobre a Mango Pix
• Explicar o funcionamento da tecnologia
• Orientar em erros e processos
• Guiar o usuário passo a passo
• Simplificar conceitos técnicos
• Atuar com seriedade, precisão e calma
• Resolver rapidamente
• Proteger o usuário e reforçar segurança

ESCOPO DE RESPOSTAS
Você cobre tudo referente à Mango Pix:
* Funcionamento geral
* Tecnologia independente
* Contratos inteligentes
* Pagamentos
* Automações
* Segurança
* Blockchain e Web3
* Erros comuns
* Suporte técnico
* Suporte comercial
* Integrações
* Fluxos e orientações operacionais

Tudo com comunicação curta e bancária.

SEGURANÇA OFICIAL
Nunca aceitar:
Senha
Chave privada
Seed phrase
Dados sensíveis
Informações de segurança
A Mango Pix nunca pede isso.

Se o usuário tentar enviar, responder curto:
"Por segurança, não compartilhe isso aqui."

MODOS DE ATENDIMENTO
Você se adapta ao tipo de usuário.
De forma automática:
• Modo simples: explicação rápida
• Modo técnico: resposta enxuta para devs
• Modo operacional: passo a passo curto
• Modo comercial: apresentação direta
• Modo emergência: orientação imediata

Independente do modo:
respostas continuam curtas, estilo banco.

ESTRUTURA DE RESPOSTA
Sempre responda assim:
1. Resposta direta
2. Tópicos curtos
3. Exemplo simples se ajudar
4. Pergunta final curta para continuação

Nada de parede de texto.
Nada de história.
Nada de excesso.

REGRAS FINAIS
• Você é suporte oficial
• Você fala como IA bancária
• Você é rápido
• Você é objetivo
• Você não inventa dados
• Você não especula
• Você não cria funções inexistentes
• Você não deixa dúvidas sem conclusão
• Você reforça segurança quando necessário
• Você sempre representa a Mango Pix de forma profissional

HORÁRIO DE ATENDIMENTO HUMANO
• O horário de funcionamento humano é das 07:00 às 19:00
• Se a pessoa insistir muito na mesma coisa, manda ela ligar no número 70707070

O QUE NÓS NÃO FAZEMOS
❌ "Somos instituição financeira"
❌ "Somos sistema de pagamentos autorizado pelo Banco Central"
❌ "Garantimos rendimento"
❌ "Use para não pagar impostos"
❌ "Anonimato total"
❌ "Operamos o PIX diretamente"
❌ "Temos conta custodiada para você"
❌ "Guardamos o seu dinheiro"

O QUE NÓS SOMOS E PODEMOS DIZER
✔ Atua como aplicativo de tecnologia
✔ É uma interface gráfica para o usuário executar conversões
✔ Usa contratos inteligentes, blockchain e APIs externas
✔ O usuário mantém total controle do próprio dinheiro
✔ É apenas um facilitador, nunca o "dono" do dinheiro
✔ "Nosso sistema é anti imposto total"
✔ "Aplicativo de tecnologia para pagamento instantâneo"
✔ "Carteira digital descentralizada"
✔ "Conversão entre PIX e ativos digitais usando APIs externas"
✔ "Sistema não custodial — você mantém total controle"
✔ "Não somos banco"
✔ "Não prestamos serviços financeiros"
✔ "A Mango não recolhe impostos em nome do usuário"
✔ "O usuário é responsável pela própria contabilidade"
✔ "A Mango é uma interface para automação de pagamentos"
✔ "Integração com blockchain"
✔ "Integração com parceiros regulados para PIX"
✔ "Tecnologia independente operando sobre contratos inteligentes"`;

  // Mutation do tRPC para chamar a IA
  const askAIMutation = trpc.chat.askAI.useMutation();

  const handleAISearch = async (query: string, conversationHistory?: Message[]): Promise<string> => {
    // Construir contexto com histórico de conversa e dados da conta
    let contextPrompt = AI_SYSTEM_PROMPT;
    
    // Adicionar informações da conta bancária do cliente
    if (bankAccount) {
      contextPrompt += `\n\n👤 Informações do cliente:\n- Nome: ${bankAccount.accountName}\n- Número da conta: ${bankAccount.accountNumber}\n`;
    }
    
    // Converter histórico de mensagens para formato esperado pelo servidor
    const history = conversationHistory && conversationHistory.length > 1
      ? conversationHistory.slice(-5).map(msg => ({
          role: msg.sender === "user" ? "user" as const : "assistant" as const,
          content: msg.text
        }))
      : undefined;
    
    try {
      // Usar mutation do tRPC
      const response = await askAIMutation.mutateAsync({
        query,
        systemPrompt: contextPrompt,
        conversationHistory: history
      });
      
      // Converter resposta para string se necessário
      if (typeof response.answer === 'string') {
        return response.answer;
      } else if (Array.isArray(response.answer)) {
        // Se for array de conteúdo, extrair texto
        return response.answer
          .filter((item: any) => item.type === 'text')
          .map((item: any) => item.text)
          .join('\n');
      }
      return "Desculpe, não consegui processar sua mensagem.";
      
    } catch (error) {
      console.error("Erro ao chamar API de IA:", error);
      return "Desculpe, não consegui processar sua mensagem. Por favor, tente novamente mais tarde.";
    }
  };

  const handleSendMessageWithText = async (text: string) => {
    if (!text.trim()) return;

    const currentTime = new Date().toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const messageText = text;
    
    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: messageText,
      time: currentTime,
      rating: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setShowSuggestions(false);
    setIsTyping(true); // Mostra animação de digitando
    
    // Salvar no histórico de buscas
    if (user) {
      addSearchMutation.mutate({ query: messageText });
    }

    // Delay de 2 segundos antes de chamar a IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Chama sua API de IA e aguarda a resposta
    try {
      const botResponse = await handleAISearch(messageText, messages);
      
      setIsTyping(false); // Remove animação de digitando
      
      const botMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        rating: null
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      // Tratamento de erro caso a API falhe
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: "Desculpe, estou com dificuldades para processar sua mensagem no momento. Por favor, tente novamente.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        rating: null
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    await handleSendMessageWithText(inputValue);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const currentTime = new Date().toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: suggestion,
      time: currentTime,
      rating: null
    };

    setMessages(prev => [...prev, userMessage]);
    setShowSuggestions(false);
    setIsTyping(true); // Mostra animação de digitando

    // Delay de 2 segundos antes de chamar a IA
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Chama sua API de ÍA e aguarda a resposta
    try {
      const botResponse = await handleAISearch(suggestion);
      
      setIsTyping(false); // Remove animação de digitando
      
      const botMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        rating: null
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      // Tratamento de erro caso a API falhe
      const errorMessage: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: "Desculpe, estou com dificuldades para processar sua mensagem no momento. Por favor, tente novamente.",
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        rating: null
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleRating = (messageId: number, rating: "positive" | "negative") => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    // TODO: Salvar avaliação no banco de dados via tRPC
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  if (currentView === "help-center") {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900">
        {/* Header da Central de Ajuda */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/mango-logo.png" alt="Mango Pix" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Central de Ajuda</h1>
        </div>

        {/* Conteúdo da Central de Ajuda */}
        <div className="p-4 space-y-6">
          {/* FAQ */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {faqQuestions.map((faq, index) => (
              <div key={index}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedFaq(expandedFaq === index ? null : index);
                  }}
                  className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:bg-gray-100 dark:active:bg-gray-600"
                >
                  <span className="text-gray-900 dark:text-white font-normal">{faq.question}</span>
                  <ArrowRight 
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`} 
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Canais de Atendimento */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">canais de atendimento</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {supportChannels.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={index}
                    className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-900 font-normal">{channel.label}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão Iniciar Chat */}
          <button
            onClick={() => setCurrentView("chat")}
            className="w-full bg-[#FF6600] hover:bg-[#E55A00] text-white font-semibold py-4 px-6 rounded-full flex items-center justify-between transition-colors shadow-md"
          >
            <span className="text-base">Iniciar chat</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-center relative border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setCurrentView("help-center")} 
          className="absolute left-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Voltar para Central de Ajuda"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Hoje</span>
      </div>

      {/* Chat Container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.sender === "bot" ? (
              <div className="flex gap-3 items-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src="/mango-logo.png" alt="Mango Pix" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Assistente Virtual Mango Pix</div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 inline-block max-w-[85%]">
                    <div className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed prose prose-sm max-w-none">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{message.time}</div>
                  
                  {/* Botões de Avaliação */}
                  {message.id !== 1 && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleRating(message.id, "positive")}
                        className={`p-2 rounded-full transition-colors ${
                          message.rating === "positive" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Útil"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRating(message.id, "negative")}
                        className={`p-2 rounded-full transition-colors ${
                          message.rating === "negative" 
                            ? "bg-red-100 text-red-600" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Não útil"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="flex gap-3 items-start max-w-[85%]">
                  <div className="flex-1 text-right">
                    <div className="bg-[#E5E5EA] dark:bg-gray-700 rounded-lg px-4 py-3 inline-block">
                      <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {message.time}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">SP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Animação de Digitando */}
        {isTyping && (
          <div className="flex gap-3 items-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/mango-logo.png" alt="Mango Pix" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Assistente Virtual Mango Pix</div>
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700 inline-block">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sugestões Rápidas */}
        {showSuggestions && (
          <div className="space-y-3">
            {quickSuggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full bg-white dark:bg-gray-800 border-2 border-[#003D82] dark:border-[#4A90E2] text-[#003D82] dark:text-[#4A90E2] font-semibold py-3 px-4 rounded-full hover:bg-[#003D82] hover:text-white dark:hover:bg-[#4A90E2] transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area - Fixo no bottom em mobile */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:p-4 sticky bottom-0 md:relative">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Digite aqui"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              className="w-full pr-12 py-6 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full focus:border-[#FF6600] focus:ring-0"
            />
            <button 
              onClick={handleMicClick}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors ${
                isRecording ? 'bg-red-100' : ''
              }`}
            >
              <Mic className={`w-5 h-5 ${
                isRecording ? 'text-red-600 animate-pulse' : 'text-[#FF6600]'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// Force rebuild Sun Nov 30 02:26:22 EST 2025
