
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const salesData = [
  { name: "Jan", revenue: 4000, orders: 240 },
  { name: "Feb", revenue: 3000, orders: 198 },
  { name: "Mar", revenue: 5000, orders: 305 },
  { name: "Apr", revenue: 4500, orders: 275 },
  { name: "May", revenue: 6000, orders: 349 },
  { name: "Jun", revenue: 5500, orders: 320 },
  { name: "Jul", revenue: 7500, orders: 425 },
];

const productPerformance = [
  { name: "T-Shirts", value: 35 },
  { name: "Hoodies", value: 28 },
  { name: "Sneakers", value: 15 },
  { name: "Jeans", value: 12 },
  { name: "Accessories", value: 10 },
];

export const SalesChart = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>View your store performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="orders" className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--accent-foreground))"
                  fill="hsl(var(--accent) / 0.5)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="products" className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productPerformance}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Sales Percentage"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
