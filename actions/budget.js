"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const getCurrentBudget = async (accountId) => {
  try {
    //auth
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    //main
    const budget=await db.budget.findFirst({
        where:{
            userId:user.id
        }
    })
    const currDate=new Date()

    const startOfMonth=new Date(currDate.getFullYear(),currDate.getMonth(),1)
    const endOfMonth=new Date(currDate.getFullYear(),currDate.getMonth()+1,0)
    const expenses=await db.transaction.aggregate({
        where:{
            userId:user.id,
            type:"EXPENSE",
            date:{
                gte:startOfMonth,
                lte:endOfMonth
            },
            accountId
        },
        _sum:{
            amount:true
        }
    })

    
    return {
        budget:budget?{...budget,amount:budget.amount.toNumber()}:null,
        curreExpense:expenses._sum.amount?expenses._sum.amount.toNumber():0
    }
  } catch (error) {
    console.log(error.message);
    return { success: false, error: error.message };
  }
};
export const updateBudget = async (amount) => {
  try {
    //auth
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    //main
    const budget=await db.budget.upsert({
        where:{
            userId:user.id
        },
        create:{
            userId:user.id,
            amount
        },
        update:{
            amount
        }

    })
    revalidatePath("/dashboard")
return {success:true,
    budget:budget?{...budget,amount:budget.amount.toNumber()}:null,
}
  } catch (error) {
    console.log(error.message);
    return { success: false, error: error.message };
  }
};
