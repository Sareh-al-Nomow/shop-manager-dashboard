
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, Eye, Printer, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import CustomerDetailsDialog from "@/components/customers/CustomerDetailsDialog";

const ordersData = [
  {
    id: "ORD-5523",
    customer: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "",
    },
    status: "completed",
    date: "2023-05-09",
    amount: "$125.99",
    items: 3,
    payment: "credit_card",
  },
  {
    id: "ORD-5522",
    customer: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      avatar: "",
    },
    status: "processing",
    date: "2023-05-09",
    amount: "$89.45",
    items: 2,
    payment: "paypal",
  },
  {
    id: "ORD-5521",
    customer: {
      name: "Michael Brown",
      email: "michael@example.com",
      avatar: "",
    },
    status: "shipped",
    date: "2023-05-08",
    amount: "$254.00",
    items: 4,
    payment: "credit_card",
  },
  {
    id: "ORD-5520",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "",
    },
    status: "completed",
    date: "2023-05-08",
    amount: "$45.30",
    items: 1,
    payment: "credit_card",
  },
  {
    id: "ORD-5519",
    customer: {
      name: "David Wilson",
      email: "david@example.com",
      avatar: "",
    },
    status: "cancelled",
    date: "2023-05-07",
    amount: "$174.25",
    items: 3,
    payment: "paypal",
  },
  {
    id: "ORD-5518",
    customer: {
      name: "Jennifer Lee",
      email: "jennifer@example.com",
      avatar: "",
    },
    status: "processing",
    date: "2023-05-07",
    amount: "$98.50",
    items: 2,
    payment: "credit_card",
  },
  {
    id: "ORD-5517",
    customer: {
      name: "Robert Martinez",
      email: "robert@example.com",
      avatar: "",
    },
    status: "shipped",
    date: "2023-05-06",
    amount: "$312.75",
    items: 5,
    payment: "bank_transfer",
  },
];

const Orders = () => {
  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  const paymentMethods: Record<string, string> = {
    credit_card: "Credit Card",
    paypal: "PayPal",
    bank_transfer: "Bank Transfer",
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            <p className="text-muted-foreground">Manage and process customer orders</p>
          </div>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <OrderDetailsDialog orderId={order.id}>
                      <Button variant="link" className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800">
                        {order.id}
                      </Button>
                    </OrderDetailsDialog>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                        <AvatarFallback>
                          {order.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CustomerDetailsDialog customerId={order.id}>
                          <Button variant="link" className="p-0 h-auto font-medium text-foreground hover:text-blue-600">
                            {order.customer.name}
                          </Button>
                        </CustomerDetailsDialog>
                        <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{paymentMethods[order.payment]}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <OrderDetailsDialog orderId={order.id}>
                            <div className="flex items-center w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </div>
                          </OrderDetailsDialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          <span>Print Invoice</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
