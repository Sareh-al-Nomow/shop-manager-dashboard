
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, UserPlus, Edit, Trash2, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const customersData = [
  {
    id: "CUST-1001",
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    orders: 12,
    totalSpent: "$1,234.56",
    status: "active",
    joined: "May 12, 2023",
    avatar: "",
  },
  {
    id: "CUST-1002",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678",
    orders: 7,
    totalSpent: "$892.45",
    status: "active",
    joined: "June 23, 2023",
    avatar: "",
  },
  {
    id: "CUST-1003",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 345-6789",
    orders: 5,
    totalSpent: "$542.15",
    status: "inactive",
    joined: "April 17, 2023",
    avatar: "",
  },
  {
    id: "CUST-1004",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 456-7890",
    orders: 19,
    totalSpent: "$2,156.77",
    status: "active",
    joined: "February 8, 2023",
    avatar: "",
  },
  {
    id: "CUST-1005",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+1 (555) 567-8901",
    orders: 3,
    totalSpent: "$187.25",
    status: "active",
    joined: "July 1, 2023",
    avatar: "",
  },
  {
    id: "CUST-1006",
    name: "Jennifer Lee",
    email: "jennifer@example.com",
    phone: "+1 (555) 678-9012",
    orders: 8,
    totalSpent: "$945.30",
    status: "active",
    joined: "March 15, 2023",
    avatar: "",
  },
  {
    id: "CUST-1007",
    name: "Robert Martinez",
    email: "robert@example.com",
    phone: "+1 (555) 789-0123",
    orders: 6,
    totalSpent: "$612.90",
    status: "inactive",
    joined: "January 29, 2023",
    avatar: "",
  },
];

const Customers = () => {
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">Manage your customer information</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8 w-full md:w-80"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersData.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar} alt={customer.name} />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[customer.status]}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{customer.totalSpent}</TableCell>
                  <TableCell>{customer.joined}</TableCell>
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
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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

export default Customers;
