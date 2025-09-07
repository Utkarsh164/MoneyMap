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
export async function createAccount(data) {
  // Data is name,balance,isDeafualt,type

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const balance = parseFloat(data.balance);
    if (isNaN(balance)) {
      throw new Error("Invalid Balance Amount");
    }
    const existingAccount = await db.account.findMany({
      where: {
        userId: user.id,
      },
    });
    const shouldBeDefault =
      existingAccount.length === 0 ? true : data.isDefault;
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    const account = await db.account.create({
      data: {
        ...data,
        userId: user.id,
        balance: balance,
        isDefault: shouldBeDefault,
      },
    });
    const serialized = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serialized };
  } catch (error) {
    console.log(error.message);
  }
}
export async function getUserAccounts() {
  // Data is name,balance,isDeafualt,type


  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");

    const accounts = await db.account.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    
    const serialized=accounts.map((account)=>serializeTransaction(account))
    return { success: true, data: serialized };
  } catch (error) {
    console.log(error.message);
  }
}
export async function getDashBoardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const trasactions = await db.transaction.findMany({
      where:{
        userId:user.id
      },
      orderBy:{
        date:"desc"
      },
    })
    return trasactions.map((trasaction)=>serializeTransaction(trasaction))
    
  } catch (error) {
    console.log(error.message);
    
  }
}