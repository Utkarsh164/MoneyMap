"use server";
import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    //Arject bot Protection
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const req = await request();
    const decision = await aj.protect(req, {
      requested: 1,
      userId,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.log("Rate Limit Exceeded", remaining, reset);
        throw new Error("Rate Limit Exceeded");
      }
    }
    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });
    if (!account) throw new Error("Account Not Found");
    const balaceChange = data.type === "INCOME" ? data.amount : -data.amount;
    const newBalance = account.balance.toNumber() + balaceChange;
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: newBalance,
        },
      });
      return newTransaction;
    });
    revalidatePath("/transaction");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, transaction: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error(error.message || "Failed to create transaction");
  }
}
function calculateNextDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(startDate.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(startDate.getDate() + 7);
      break;
    case "MONTHLY":
      date.setDate(startDate.getMonth() + 1);
      break;
    case "YEARLY":
      date.setDate(startDate.getFullYear() + 1);
      break;
  }
  return date;
}
export async function scanReceipt(file) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

export async function getTransaction(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const transaction = await db.transaction.findUnique({
      where: {
        id,
      },
    });
    if (!transaction) throw new Error("Transaction Not Found");


    return serializeTransaction(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw new Error(error.message || "Failed to fetch transaction");
  }
}
export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) throw new Error("User Not in DataBase");
    const orginalTransaction = await db.transaction.findUnique({
      where: {
        id,
      },
      include: {
        account: true,
      },
    });
    if (!orginalTransaction) throw new Error("Transaction Not Found");
    const newBalance = data.type === "INCOME" ? data.amount : -data.amount;
    const balanceChange = newBalance - orginalTransaction.amount.toNumber();
    const transaction = await db.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: {
          userId: user.id,
          id: id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextDate(data.date, data.recurringInterval)
              : null,
        },
      });
      await tx.account.update({
        where: {
          id: orginalTransaction.accountId,
        },
        data: {
          balance:{
            increment: balanceChange,}
        },
      });
      return updatedTransaction;
    });
    revalidatePath("/dashboard");
    revalidatePath(`/account/${orginalTransaction.accountId}`);
    return {
      success: true,
      transaction: serializeTransaction(transaction),
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw new Error(error.message || "Failed to update transaction");
  }
}
