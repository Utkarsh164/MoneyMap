"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};
export async function updateDefaultAccount(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
    const account = await db.account.update({
      where: {
        userId: user.id,
        id: id,
      },
      data: {
        isDefault: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    console.log(error.message);
    return { success: false, error: error.message };
  }
}
export async function getAccountWithTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const account = await db.account.findUnique({
      where: {
        userId: user.id,
        id: id,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });
    if (!account) return null;
    return {
      success: true,
      data: {
        ...serializeTransaction(account),
        transactions: account.transactions.map(serializeTransaction),
      },
    };
  } catch (error) {
    console.log(error.message);
    return { success: false, error: error.message };
  }
}
export async function deleteTransactionBulk(ids) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
    });
    const accBalance = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount); // Make sure it's a number
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      const accountId = transaction.accountId;
    
      acc[accountId] = (acc[accountId] || 0) + change;
      return acc;
    }, {});
    
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id,
        },
      });

      
      for(const [accountId,balanceChange] of Object.entries(accBalance)){
        await tx.account.update({
          where:{
            id:accountId
          },
          data:{
            balance:{
              increment:balanceChange
            }
          }
        })
      }
    });
    revalidatePath('/account/[id]', 'page')

    revalidatePath('/dashboard')
    return {
      success: true,
     
    };
  } catch (error) {
    console.log(error.message);
    return { success: false, error: error.message };
  }
}
