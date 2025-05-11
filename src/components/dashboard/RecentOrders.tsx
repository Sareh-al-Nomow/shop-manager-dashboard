
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const recentOrders = [
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
  },
];

export const RecentOrders = () => {
  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Manage and track your recent orders</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
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
                          <div className="font-medium">{order.customer.name}</div>
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
                    <TableCell>{order.items}</TableCell>
                    <TableCell className="text-right font-medium">{order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
