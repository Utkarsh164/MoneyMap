"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";

const DashboardOverview = ({ transactions, accounts }) => {
  const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9FA8DA",
  ];
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts?.find((account) => account.isDefault)?.id || null
  );
  const accountTransactions = transactions?.filter(
    (transaction) => transaction.accountId === selectedAccountId
  );
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const currentDate = new Date();
  const currentMonthExpense = accountTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transaction.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });
  const expensesByCategory = currentMonthExpense.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader
          className={
            "flex flex-row items-center justify-between pb-4 space-y-4"
          }
        >
          <CardTitle className={"text-base font-bold"}>
            Recent Transaction
          </CardTitle>
          {accounts?.length > 0 && (
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
                <CreateAccountDrawer >
                  <Button variant={"ghost"} className="w-full text-left">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions?.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">
                No transactions found for this account.
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center",
                        transaction.type === "EXPENSE"
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      ${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className={"text-base font-bold"}>
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className={"p-0 pb-5"}>
          {pieChartData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              No transactions found for this Month.
            </p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) =>
                      `${name} $(${value.toFixed(2)})`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
