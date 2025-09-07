"use client";
import { accountSchema } from "@/app/lib/schema";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useFetch } from "@/hooks/useFetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";

const CreateAccountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);
  const {
    data: newAccount,
    error,
    loading: isCreating,
    fn: createAccountFn,
  } = useFetch(createAccount);
  const {
    register,
    formState: { errors },
    handleSubmit,

    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });
  useEffect(() => {
    if (newAccount?.success && !isCreating) {
      toast.success("Account Created Successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, isCreating]);
  

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to Create");
    }
  }, [error]);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };
  return (
    <div className="">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Account</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Account Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g Main Checking"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="type">
                  Account Type
                </label>
                <Select onValueChange={(value) => setValue("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select the type...." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                  </SelectContent>
                </Select>

                {errors.type && (
                  <p className="text-red-500 text-sm">{errors.type.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="balance">
                  Intial Balance
                </label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.0"
                  {...register("balance")}
                />
                {errors.balance && (
                  <p className="text-red-500 text-sm">
                    {errors.balance.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0 5">
                  <label
                    className="text-sm font-medium cursor-pointer"
                    htmlFor="isDefault"
                  >
                    Set as Default Account
                  </label>
                  <p className="text-muted-foreground">
                    This action will set this as your default account for
                    transaction
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  onCheckedChange={(checked) => setValue("isDefault", checked)}
                />
                {errors.isDefault && (
                  <p className="text-red-500 text-sm">
                    {errors.isDefault.message}
                  </p>
                )}
              </div>
              <div className=" flex gap-3 w-fit">
                <DrawerClose asChild>
                  <Button
                    variant={"destructive"}
                    type="button"
                    className={"flex-1"}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  variant={"finGenie"}
                  type="submit"
                  className={"flex-1"}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Creating.....
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CreateAccountDrawer;
