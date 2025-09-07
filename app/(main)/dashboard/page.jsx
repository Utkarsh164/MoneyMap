import { getDashBoardData, getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AccountCard from "./_components/AccountCard";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { Suspense } from "react";
import DashboardOverview from "./_components/DashboardOverview";

const Dashboard = async () => {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.data.find((account) => account.isDefault);
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }
  const transactions = await getDashBoardData();

  return (
    <div className="px-5 flex flex-col gap-8">
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.curreExpense || 0}
      />

          
          <Suspense
            fallback={
              <div className="h-40 w-full bg-muted rounded-md animate-pulse" />
            }
          >
          <DashboardOverview
          accounts={accounts.data}
          transactions={transactions}/>
      </Suspense>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer w-full h-40">
            <CardContent className="flex flex-col justify-center items-center h-full text-muted-foreground pt-5">
              <Plus className="h-10 w-10 mb-4" />
              <p className="text-sm font-medium">Create New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.success && (
          <>
            {accounts.data.map((account) => {
              return <AccountCard key={account.id} account={account} />;
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
