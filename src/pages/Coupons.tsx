
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgePercent } from "lucide-react";

const couponsData = [
  { id: 1, code: "SUMMER25", discount: "25%", type: "percentage", usageLimit: 100, usageCount: 42, expiryDate: "2025-08-31", status: "active" },
  { id: 2, code: "WELCOME10", discount: "10%", type: "percentage", usageLimit: 500, usageCount: 213, expiryDate: "2025-12-31", status: "active" },
  { id: 3, code: "FREESHIP", discount: "$15", type: "fixed", usageLimit: 200, usageCount: 178, expiryDate: "2025-07-15", status: "active" },
  { id: 4, code: "FLASH50", discount: "50%", type: "percentage", usageLimit: 50, usageCount: 50, expiryDate: "2025-06-10", status: "expired" },
  { id: 5, code: "HOLIDAY20", discount: "20%", type: "percentage", usageLimit: 300, usageCount: 0, expiryDate: "2025-12-25", status: "scheduled" },
];

export default function Coupons() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground">Manage your discount coupons</p>
          </div>
          <Link to="/create-coupon">
            <Button>
              <BadgePercent className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search coupons..."
            className="max-w-sm"
          />
          <Button variant="outline">Search</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponsData.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.id}</TableCell>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discount}</TableCell>
                  <TableCell>{coupon.usageCount}/{coupon.usageLimit}</TableCell>
                  <TableCell>{coupon.expiryDate}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        coupon.status === "active" ? "default" : 
                        coupon.status === "expired" ? "destructive" : 
                        "outline"
                      }
                    >
                      {coupon.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
