
import { getUserAccounts } from "@/actions/dashboard";
import React from "react";
import AddTransactionForm from "../_components/AddTransactionForm";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/actions/transaction";

const CreateTransaction = async ({ searchParams }) => {
  const accounts = await getUserAccounts();
  const slu=await searchParams


const editId=slu.edit


if(editId){
  const transaction=await getTransaction(editId)
  var data=transaction
}


  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title">{editId?"Edit":"Add"} Transaction</h1>
      <AddTransactionForm
        accounts={accounts.data}
        catogery={defaultCategories}
        editMode={!!editId}
        intialData={data}
      />
    </div>
  );
};

export default CreateTransaction;
