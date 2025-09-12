import { db, buyers, buyerHistory, users } from './index';
import { eq, and, desc, asc, like, sql, count } from 'drizzle-orm';
import { CreateBuyerInput, UpdateBuyerInput } from '../validations/buyer';
import type { Buyer, BuyerHistory } from './schema';

export async function createBuyer(data: CreateBuyerInput, ownerId: string) {
  const [buyer] = await db.insert(buyers).values({
    ...data,
    ownerId,
  }).returning();

  // Create history entry
  await db.insert(buyerHistory).values({
    buyerId: buyer.id,
    changedBy: ownerId,
    diff: { created: { old: null, new: 'Record created' } },
  });

  return buyer;
}

export async function getBuyerById(id: string, ownerId: string) {
  const [buyer] = await db
    .select()
    .from(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, ownerId)))
    .limit(1);
  
  return buyer;
}

export async function updateBuyer(id: string, data: UpdateBuyerInput, ownerId: string) {
  // Check if buyer exists and belongs to owner
  const existing = await getBuyerById(id, ownerId);
  if (!existing) {
    throw new Error('Buyer not found or access denied');
  }

  // Check for concurrent modification
  if (existing.updatedAt.getTime() !== data.updatedAt.getTime()) {
    throw new Error('Record has been modified by another user. Please refresh and try again.');
  }

  const [updated] = await db
    .update(buyers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, ownerId)))
    .returning();

  // Create history entry for changes
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  Object.keys(data).forEach(key => {
    if (key !== 'id' && key !== 'updatedAt' && existing[key as keyof Buyer] !== data[key as keyof UpdateBuyerInput]) {
      changes[key] = {
        old: existing[key as keyof Buyer],
        new: data[key as keyof UpdateBuyerInput],
      };
    }
  });

  if (Object.keys(changes).length > 0) {
    await db.insert(buyerHistory).values({
      buyerId: id,
      changedBy: ownerId,
      diff: changes,
    });
  }

  return updated;
}

export async function deleteBuyer(id: string, ownerId: string) {
  const result = await db
    .delete(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, ownerId)))
    .returning();
  
  return result.length > 0;
}

export async function getBuyers({
  page = 1,
  limit = 10,
  search = '',
  city,
  propertyType,
  status,
  timeline,
  sortBy = 'updatedAt',
  sortOrder = 'desc',
  ownerId,
}: {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  ownerId: string;
}) {
  const offset = (page - 1) * limit;
  
  const whereConditions = [eq(buyers.ownerId, ownerId)];
  
  if (search) {
    whereConditions.push(
      sql`(${buyers.fullName} LIKE ${`%${search}%`} OR ${buyers.phone} LIKE ${`%${search}%`} OR ${buyers.email} LIKE ${`%${search}%`})`
    );
  }
  
  if (city) {
    whereConditions.push(eq(buyers.city, city as 'Chandigarh' | 'Mohali' | 'Zirakpur' | 'Panchkula' | 'Other'));
  }
  
  if (propertyType) {
    whereConditions.push(eq(buyers.propertyType, propertyType as 'Apartment' | 'Villa' | 'Plot' | 'Office' | 'Retail'));
  }
  
  if (status) {
    whereConditions.push(eq(buyers.status, status as 'New' | 'Qualified' | 'Contacted' | 'Visited' | 'Negotiation' | 'Converted' | 'Dropped'));
  }
  
  if (timeline) {
    whereConditions.push(eq(buyers.timeline, timeline as '0-3m' | '3-6m' | '>6m' | 'Exploring'));
  }

  const orderBy = sortOrder === 'asc' ? asc(buyers.updatedAt) : desc(buyers.updatedAt);

  const [buyersList, totalCount] = await Promise.all([
    db
      .select()
      .from(buyers)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(buyers)
      .where(and(...whereConditions))
  ]);

  return {
    buyers: buyersList,
    totalCount: totalCount[0].count,
    totalPages: Math.ceil(totalCount[0].count / limit),
    currentPage: page,
  };
}

export async function getBuyerHistory(buyerId: string, ownerId: string) {
  // First verify ownership
  const buyer = await getBuyerById(buyerId, ownerId);
  if (!buyer) {
    throw new Error('Buyer not found or access denied');
  }

  return db
    .select()
    .from(buyerHistory)
    .where(eq(buyerHistory.buyerId, buyerId))
    .orderBy(desc(buyerHistory.changedAt))
    .limit(5);
}

export async function createUser(email: string, name?: string) {
  const [user] = await db.insert(users).values({
    email,
    name,
  }).returning();
  
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user;
}

export async function bulkCreateBuyers(buyersData: CreateBuyerInput[], ownerId: string) {
  return db.transaction(async (tx) => {
    const createdBuyers = [];
    
    for (const data of buyersData) {
      const [buyer] = await tx.insert(buyers).values({
        ...data,
        ownerId,
      }).returning();
      
      await tx.insert(buyerHistory).values({
        buyerId: buyer.id,
        changedBy: ownerId,
        diff: { created: { old: null, new: 'Record created via CSV import' } },
      });
      
      createdBuyers.push(buyer);
    }
    
    return createdBuyers;
  });
}
