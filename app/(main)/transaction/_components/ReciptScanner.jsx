"use client"

import { scanReceipt } from "@/actions/transaction"
import { Button } from "@/components/ui/button"
import { useFetch } from "@/hooks/useFetch"
import { Camera, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

const ReciptScanner = ({onScanComplete}) => {
    const fileInputRef=useRef()
    const{loading:scanning,fn:scanFn,data:scannedData}=useFetch(scanReceipt)
    const handleScan=async(file)=>{
        if(file.size> 5*1024*1024){
            toast.error("File size should be less than 5MB")
            return;
        }
await scanFn(file);
    }
    useEffect(() => {
      if(scannedData&&!scanning){
        onScanComplete(scannedData)
        toast.success("Receipt Scanned Successfully")
      }
    }, [scannedData,scanning])
    
  return (
    <div>
        
      <input type="file" ref={fileInputRef}
      accept="image/*"
      className="hidden"
        onChange={(e)=>{
            const file=e.target.files[0]
            if(file){
            handleScan(file)
            }
        }} 
      />
    <Button type="button" variant="finGenie" onClick={()=>fileInputRef.current.click()} className="w-full mt-2 text-white " >

      {scanning?<>
      <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Scanning Receipt...</span>
      </>:<>
      <Camera className="w-6 h-6" />
      <p className="text-sm">Scan Receipt with AI</p>
      </>}
    </Button>
    </div>
  )
}

export default ReciptScanner
