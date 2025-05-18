
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Package } from "lucide-react";

interface OrderDetailsProps {
  orderId: string;
  children: React.ReactNode;
}

interface OrderItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

const OrderDetailsDialog = ({ orderId, children }: OrderDetailsProps) => {
  // Mock data - in a real app, this would come from an API call
  const orderDetails = {
    id: orderId,
    status: "Pending - Cash On Delivery",
    date: "May 18, 2025",
    customer: {
      name: "Alex Johnson",
      email: "alex@example.com",
      phone: "+962777642963",
    },
    items: [
      {
        id: 1,
        name: "Product Name",
        sku: "32232",
        quantity: 5,
        price: 333.00,
        total: 1665.00,
      },
    ],
    shipping: {
      method: "aramex",
      address: {
        name: "b",
        line1: "vvdfvdf",
        city: "amman",
        postalCode: "125665",
        state: "Al 'Asimah",
        country: "Jordan",
        phone: "+962777642963",
      },
      cost: 10.00,
    },
    billing: {
      address: {
        name: "b",
        line1: "vvdfvdf",
        city: "amman",
        postalCode: "125665",
        state: "Al 'Asimah",
        country: "Jordan",
        phone: "+962777642963",
      },
    },
    subtotal: 1665.00,
    discount: 416.25,
    tax: 0.00,
    total: 1258.75,
    notes: "",
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
              Editing #{orderDetails.id}
            </DialogTitle>
            <Badge variant="outline" className="ml-2">
              New
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="border rounded-md p-4 bg-white">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Badge className="h-2 w-2 rounded-full bg-yellow-500" />
                {orderDetails.status}
              </div>
            </div>

            {/* Order Items */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end p-4">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Ship Items
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border rounded-md p-4 bg-white">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${orderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping</span>
                <span>${orderDetails.shipping.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Discount</span>
                <span>${orderDetails.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax</span>
                <span>${orderDetails.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t mt-2 pt-2">
                <span>Total</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Capture Payment
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Notes */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-semibold mb-2">Customer notes</h3>
              <p className="text-muted-foreground">
                {orderDetails.notes || "No notes from customer"}
              </p>
            </div>

            {/* Customer Info */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-semibold mb-2">Customer</h3>
              <p>{orderDetails.customer.email}</p>
              <p>{orderDetails.customer.phone}</p>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-semibold mb-2">SHIPPING ADDRESS</h3>
              <p>{orderDetails.shipping.address.name}</p>
              <p>{orderDetails.shipping.address.line1}</p>
              <p>{orderDetails.shipping.address.postalCode}, {orderDetails.shipping.address.city}</p>
              <p>{orderDetails.shipping.address.state}, {orderDetails.shipping.address.country}</p>
              <p>{orderDetails.shipping.address.phone}</p>
            </div>

            {/* Billing Address */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="font-semibold mb-2">BILLING ADDRESS</h3>
              <p>{orderDetails.billing.address.name}</p>
              <p>{orderDetails.billing.address.line1}</p>
              <p>{orderDetails.billing.address.postalCode}, {orderDetails.billing.address.city}</p>
              <p>{orderDetails.billing.address.state}, {orderDetails.billing.address.country}</p>
              <p>{orderDetails.billing.address.phone}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
