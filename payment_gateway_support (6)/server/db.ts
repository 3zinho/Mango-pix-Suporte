import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  conversations, 
  messages, 
  messageRatings,
  InsertConversation,
  InsertMessage,
  InsertMessageRating,
  bankAccounts,
  InsertBankAccount,
  searchHistory,
  InsertSearchHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// CHAT & CONVERSATIONS
// ============================================================

export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create conversation: database not available");
    return null;
  }

  const result = await db.insert(conversations).values({
    userId,
    title: title || "Nova conversa"
  });

  return result[0].insertId;
}

export async function getConversationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversations: database not available");
    return [];
  }

  return await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
}

export async function saveMessage(conversationId: number, sender: "user" | "bot", content: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save message: database not available");
    return null;
  }

  const result = await db.insert(messages).values({
    conversationId,
    sender,
    content
  });

  return result[0].insertId;
}

export async function getMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
}

export async function saveMessageRating(messageId: number, rating: "positive" | "negative") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save rating: database not available");
    return null;
  }

  await db.insert(messageRatings).values({
    messageId,
    rating
  }).onDuplicateKeyUpdate({
    set: { rating }
  });

  return true;
}

// ============================================================
// BANK ACCOUNTS
// ============================================================

export async function getBankAccountByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bank account: database not available");
    return null;
  }
  
  const result = await db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createBankAccount(account: InsertBankAccount) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create bank account: database not available");
    return undefined;
  }
  
  await db.insert(bankAccounts).values(account);
  return await getBankAccountByUserId(account.userId);
}

// ============================================================
// SEARCH HISTORY
// ============================================================

export async function addSearchHistory(userId: number, query: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add search history: database not available");
    return;
  }
  
  await db.insert(searchHistory).values({ userId, query });
}

export async function getRecentSearches(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get recent searches: database not available");
    return [];
  }
  
  const results = await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
  
  return results;
}
