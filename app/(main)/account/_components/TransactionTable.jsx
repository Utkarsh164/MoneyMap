"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit,
  MoreHorizontal,
  RefreshCcw,
  SearchIcon,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/useFetch";
import { deleteTransactionBulk } from "@/actions/account";

import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const TransactionTable = ({ transactions }) => {
  const [currPage, setCurrPage] = useState(1);
  const Recurring_Interval = {
    DAILY: "Daily",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
    WEEKLY: "Weekly",
  };
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reccuringFilter, setReccuringFilter] = useState("");
  const {
    fn: deleteFn,
    loading: deleting,
    data: deleted,
  } = useFetch(deleteTransactionBulk);
  const filteredAndSortedTransactions = useMemo(() => {
    let res = transactions;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      res = res.filter((transaction) =>
        transaction.description?.toLowerCase().includes(search)
      );
    }
    if (reccuringFilter) {
      res = res.filter((transaction) => {
        if (reccuringFilter === "recurring") {
          return transaction.isRecurring;
        } else {
          return !transaction.isRecurring;
        }
      });
    }
    if (typeFilter) {
      res = res.filter((transaction) => transaction.type === typeFilter);
    }
    res.sort((a, b) => {
      let comp = 0;
      switch (sortConfig.field) {
        case "date":
          comp = new Date(a.date) - new Date(b.date);
          break;

        case "amount":
          comp = a.amount - b.amount;
          break;

        case "category":
          comp = a.category.localeCompare(b.category);
          break;

        default:
          comp = 0;
          break;
      }
      return sortConfig.direction === "asc" ? comp : -comp;
    });
    return res;
  }, [transactions, sortConfig, searchTerm, typeFilter, reccuringFilter]);

  const router = useRouter();
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };
  const clearFIlter = () => {
    setReccuringFilter("");
    setTypeFilter("");
    setSearchTerm("");
  };
  const handleSelectMany = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    deleteFn(selectedIds);
  };
  useEffect(() => {
    if (deleted && !deleting) {
      setSelectedIds([]);
      toast.success("Transaction Deleted SuccesFully");
    }
  }, [deleted, deleting]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / 10);
  const paginatedTransaction = useMemo(() => {
    const startIndex = (currPage - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredAndSortedTransactions.slice(startIndex, endIndex);
  }, [currPage, filteredAndSortedTransactions,sortConfig, searchTerm, typeFilter, reccuringFilter]);
  const handlePageChange = (page) => {
    setCurrPage(page);
  };
  return (
    <div className="space-y-4 mb-20">
      {deleting && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 2-4 text-muted-foreground" />
          <Input
            className={"pl-8"}
            placeholder={"Search Transaction..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reccuringFilter} onValueChange={setReccuringFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Transaction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 && (
            <Button onClick={handleBulkDelete} variant={"destructive"}>
              <Trash2 className="h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          )}
          {(reccuringFilter || typeFilter || searchTerm) && (
            <Button variant={"outline"} size={"icon"} onClick={clearFIlter}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  onCheckedChange={handleSelectMany}
                  checked={
                    filteredAndSortedTransactions.length ===
                      selectedIds.length &&
                    filteredAndSortedTransactions.length !== 0
                  }
                />
              </TableHead>
              <TableHead
                onClick={() => handleSort("date")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span>Date</span>
                  <span>
                    {sortConfig.field === "date" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ))}
                  </span>
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("description")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span>Description</span>
                  <span>
                    {sortConfig.field === "description" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ))}
                  </span>
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("category")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span>Category</span>
                  <span>
                    {sortConfig.field === "category" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ))}
                  </span>
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("amount")}
                className="text-right cursor-pointer flex justify-end items-center"
              >
                Amount{" "}
                {sortConfig.field === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ))}
              </TableHead>
              <TableHead className="text-right">Recurring</TableHead>
              <TableHead> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransaction?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground text-center"
                >
                  No Transactions Yet
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransaction.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds?.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell className={"truncate max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"}>{transaction.description}</TableCell>
                  <TableCell className={"capitalize"}>
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    style={{
                      color: transaction.type === "EXPENSE" ? "red" : "green",
                    }}
                    className="text-right font-medium"
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {parseFloat(transaction.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right ">
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={"outline"}
                              className={
                                "gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                              }
                            >
                              <RefreshCcw />
                              {
                                Recurring_Interval[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="">
                              <div className="text-sm">
                                <span className="font-medium">Next Date:</span>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant={"outline"} className={"gap-1"}>
                        <Clock />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={"text-right"}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 p-0" />
                            Edit
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteFn([transaction.id])}
                        >
                          <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4 p-0 text-destructive" />
                            <span className="text-destructive">Delete</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            onClick={() => handlePageChange(currPage - 1)}
            disabled={currPage === 1}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currPage} of {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currPage + 1)}
            disabled={currPage === totalPages}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
