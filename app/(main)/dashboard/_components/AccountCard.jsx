"use client"
import React, { useEffect } from "react";
import {
  Card,
  CardContent,

  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, isDefault, balance, id } = account;
  const {loading:updatingDefault,fn:updateDefaultFn,data:updatedAccount,error}=useFetch(updateDefaultAccount)
  const handleDefaultChange=async()=>{
  if(isDefault){
    toast.error("You Atleast Need One Default Account")
    return
  }
  await updateDefaultFn(id)
  }
  useEffect(() => {
    if(updatedAccount?.success){
        toast.success("Default Account updated Successfully")
    }
    
  }, [updatedAccount,updatingDefault])
  
  useEffect(() => {
    if(error){
        toast.error(`${error.message}`)
    }

  }, [error])
  
  return (
    <div>
        <Card className={"hover:shadow-md transition-shadow group relative"}>
      <Link href={`account/${id}`}>
          <CardHeader className={"flex flex-row justify-between items-center pb-2 space-y-0"}>
            <CardTitle className={"text-sm capitalize font-medium"}>{name}</CardTitle>
            <Switch checked={isDefault} disabled={updatingDefault}
            onCheckedChange={handleDefaultChange}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(balance).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </div>
          </CardContent>
          <CardFooter className={"flex justify-between text-sm text-muted-foreground"}>
            <div className="flex items-center">
              <ArrowUpRight className="text-green-500 mr-1 h-4 w-4" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownLeft className="text-red-500 mr-1 h-4 w-4" />
              Expense
            </div>
          </CardFooter>
      </Link>
        </Card>
    </div>
  );
};

export default AccountCard;
