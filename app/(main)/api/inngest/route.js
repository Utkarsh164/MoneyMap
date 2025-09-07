import {
  checkBudgetAlerts,
  generateMonthlyReport,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/function";
import { inngest } from "@/lib/inngest/client";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts,
    triggerRecurringTransactions,
    generateMonthlyReport,
    processRecurringTransaction,
  ],
});
