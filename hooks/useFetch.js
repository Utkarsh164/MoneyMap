"use client"
import { useState } from "react";
import { toast } from "sonner";
export const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const fn=async(...args)=>{
    setLoading(true)
    setError(null)
    try {
        const response=await cb(...args)
        setData(response)
    } catch (error) {
        setError(error)
        toast.error(error.message)
    }
finally{
    setLoading(false)
}

  }
  return {data,error,loading,fn,setData}
};
