import { desc, and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  dealDecodeUsage,
  creatorRateCards,
  dealDecodes,
  NewDealDecode
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getUsage(userId: number) {
  const rows = await db
    .select()
    .from(dealDecodeUsage)
    .where(eq(dealDecodeUsage.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function ensureUsage(userId: number) {
  const existing = await getUsage(userId);
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(dealDecodeUsage)
    .values({ userId })
    .onConflictDoNothing()
    .returning();

  return created ?? (await getUsage(userId))!;
}

export async function incrementUsage(userId: number) {
  await ensureUsage(userId);

  const [updated] = await db
    .update(dealDecodeUsage)
    .set({
      decodeCount: sql`${dealDecodeUsage.decodeCount} + 1`,
      updatedAt: new Date()
    })
    .where(eq(dealDecodeUsage.userId, userId))
    .returning();

  return updated;
}

export async function getRateCard(userId: number) {
  const rows = await db
    .select()
    .from(creatorRateCards)
    .where(eq(creatorRateCards.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function upsertRateCard(
  userId: number,
  rates: {
    ratePerVideo: number | null;
    ratePerPhoto: number | null;
    ratePerReel: number | null;
  }
) {
  const existing = await getRateCard(userId);

  if (existing) {
    const [updated] = await db
      .update(creatorRateCards)
      .set({ ...rates, updatedAt: new Date() })
      .where(eq(creatorRateCards.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(creatorRateCards)
    .values({ userId, ...rates })
    .returning();

  return created;
}

export async function createDealDecode(entry: NewDealDecode) {
  const [created] = await db.insert(dealDecodes).values(entry).returning();
  return created;
}

export async function getDealDecodesForUser(userId: number) {
  return db
    .select()
    .from(dealDecodes)
    .where(eq(dealDecodes.userId, userId))
    .orderBy(desc(dealDecodes.createdAt));
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}
