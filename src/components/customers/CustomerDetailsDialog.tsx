
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerDetailsProps {
  customerId: string;
  children: React.ReactNode;
}

const CustomerDetailsDialog = ({ customerId, children }: CustomerDetailsProps) => {
  // Mock data - in a real app, this would come from an API call
  const customerDetails = {
    id: customerId,
    name: "bilal",
    email: "b@b.com",
    group: "Default",
    status: "Enabled",
    orders: [
      {
        id: "#10004",
        date: "May 18, 2025",
        status: "Pending",
        payment: "Paid",
        amount: "$157.00",
      },
    ],
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl">
              Editing {customerDetails.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2">
            <div className="border rounded-md p-4 bg-white mb-6">
              <h2 className="text-lg font-semibold mb-4">Order History</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerDetails.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-blue-600">
                        {order.id}
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.payment}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell className="text-right">{order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">FULL NAME</h3>
              <p>{customerDetails.name}</p>
            </div>

            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">EMAIL</h3>
              <p>{customerDetails.email}</p>
            </div>

            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">GROUP</h3>
              <p>{customerDetails.group}</p>
            </div>

            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">STATUS</h3>
              <p>{customerDetails.status}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
