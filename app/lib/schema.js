import { z } from "zod";

export const accountSchema=z.object({
    name:z.string().min(1,"Name Is required"),
    type:z.enum(["CURRENT","SAVINGS"]),
    balance:z.string().min(1,"Intial Balance Is Required"),
    isDefault:z.boolean().default(false)
})
export const transactionSchema=z.object({
    amount:z.string().min(1,"Amount Is required"),
    type:z.enum(["EXPENSE","INCOME"]),
    description:z.string().optional(),
    date:z.date({required_error:"Date Is Required"}),
    category: z.string().min(1, "Category is required"),
    accountId:z.string().min(1,"Account Is Required"),
    isRecurring:z.boolean().default(false),
    recurringInterval:z.enum(["DAILY","WEEKLY","MONTHLY","YEARLY"]).optional(),

}).superRefine((data,ctx)=>{
    if(data.isRecurring && !data.recurringInterval){
        ctx.addIssue({
            code:z.ZodIssueCode.custom,
            message:"Recurring Interval Is Required for Recurring Transaction",
            path:["recurringInterval"]
        }

        )
    }
})