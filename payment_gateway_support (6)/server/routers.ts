import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const conversationId = await db.createConversation(ctx.user.id, input.title);
        return { conversationId };
      }),

    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getConversationsByUserId(ctx.user.id);
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByConversationId(input.conversationId);
      }),

    saveMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        sender: z.enum(["user", "bot"]),
        content: z.string()
      }))
      .mutation(async ({ input }) => {
        const messageId = await db.saveMessage(input.conversationId, input.sender, input.content);
        return { messageId };
      }),

    rateMessage: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        rating: z.enum(["positive", "negative"])
      }))
      .mutation(async ({ input }) => {
        await db.saveMessageRating(input.messageId, input.rating);
        return { success: true };
      }),

    askAI: protectedProcedure
      .input(z.object({
        query: z.string(),
        systemPrompt: z.string(),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string()
        })).optional()
      }))
      .mutation(async ({ input }) => {
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: input.systemPrompt }
        ];
        
        // Adicionar histórico de conversa se fornecido
        if (input.conversationHistory) {
          messages.push(...input.conversationHistory);
        }
        
        // Adicionar pergunta atual
        messages.push({ role: "user", content: input.query });
        
        const response = await invokeLLM({ messages });
        const answer = response.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";
        
        return { answer };
      }),
  }),

  bankAccount: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getBankAccountByUserId(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        accountName: z.string(),
        accountNumber: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBankAccount({
          userId: ctx.user.id,
          accountName: input.accountName,
          accountNumber: input.accountNumber
        });
      }),
  }),

  searchHistory: router({
    add: protectedProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db.addSearchHistory(ctx.user.id, input.query);
        return { success: true };
      }),

    getRecent: protectedProcedure
      .query(async ({ ctx }) => {
        return await db.getRecentSearches(ctx.user.id, 5);
      }),
  }),
});

export type AppRouter = typeof appRouter;
