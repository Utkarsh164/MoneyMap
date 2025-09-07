"use client";
import { updateBudget } from "@/actions/budget";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/useFetch";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {


  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);


  const handleUpdate = async () => {


    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please Enter Valid Amount");
      return;
    }
    await updateBudgetFn(amount);
  };
  let progressColor;
  if (percentageUsed >= 90) {
    progressColor = "bg-red-500";
  } else if (percentageUsed >= 75) {
    progressColor = "bg-yellow-500";
  } else {
    progressColor = "bg-green-500";
  }
  useEffect(() => {
    if (updatedBudget?.success) {

      setIsEditing(false);
      toast.success("Budget Updated Successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      setIsEditing(false);
      toast.error(error.message || "Failed To Update");
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  return (
    <div>
      <Card>
        <CardHeader
          className={
            "flex flex-row items-center justify-between space-y-0 pb-2"
          }
        >
          <div className="flex-1">
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type={"number"}
                    value={newBudget}
                    className={"w-40"}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="Enter amount..."
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleUpdate} disabled={isLoading}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <CardDescription>
                  {initialBudget
                    ? `$${currentExpenses} of $${initialBudget.amount.toFixed(
                        2
                      )} spent`
                    : "No Budget is Set Yet"}
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className="space-y-4 ">
              <Progress value={percentageUsed} />

              <p className="text-muted-foreground text-right">
                {percentageUsed.toFixed(2)}% used
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetProgress;
