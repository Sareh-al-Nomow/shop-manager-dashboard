import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const monthlySales = [
  { name: "Jan", sales: 4000, profit: 2400, costs: 1600 },
  { name: "Feb", sales: 3000, profit: 1398, costs: 1602 },
  { name: "Mar", sales: 5000, profit: 3000, costs: 2000 },
  { name: "Apr", sales: 2780, profit: 908, costs: 1872 },
  { name: "May", sales: 1890, profit: 800, costs: 1090 },
  { name: "Jun", sales: 2390, profit: 1200, costs: 1190 },
  { name: "Jul", sales: 3490, profit: 2300, costs: 1190 },
  { name: "Aug", sales: 3000, profit: 2000, costs: 1000 },
  { name: "Sep", sales: 2000, profit: 980, costs: 1020 },
  { name: "Oct", sales: 2780, profit: 1608, costs: 1172 },
  { name: "Nov", sales: 1890, profit: 1100, costs: 790 },
  { name: "Dec", sales: 3490, profit: 2300, costs: 1190 },
];

const categoryData = [
  { name: "Electronics", value: 35 },
  { name: "Clothing", value: 25 },
  { name: "Home & Garden", value: 15 },
  { name: "Sports", value: 10 },
  { name: "Beauty", value: 15 },
];

const COLORS = ["#4F46E5", "#818CF8", "#A5B4FC", "#C7D2FE", "#DDD6FE"];

const customersData = [
  { name: "New", value: 35 },
  { name: "Returning", value: 65 },
];

const CUSTOMER_COLORS = ["#4F46E5", "#9333EA"];

const trafficSourceData = [
  { name: "Direct", value: 20 },
  { name: "Social Media", value: 30 },
  { name: "Organic Search", value: 25 },
  { name: "Referral", value: 15 },
  { name: "Email", value: 10 },
];

const TRAFFIC_COLORS = ["#4F46E5", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"];

const weeklyVisitors = [
  { name: "Mon", visitors: 120 },
  { name: "Tue", visitors: 160 },
  { name: "Wed", visitors: 180 },
  { name: "Thu", visitors: 220 },
  { name: "Fri", visitors: 200 },
  { name: "Sat", visitors: 240 },
  { name: "Sun", visitors: 180 },
];

const Analytics = () => {
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales data for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="profit">Profit</TabsTrigger>
                <TabsTrigger value="combined">Combined View</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlySales}
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
                    <Tooltip 
                      formatter={(value) => [`$${value}`, "Sales"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="profit" className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlySales}
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
                    <Tooltip 
                      formatter={(value) => [`$${value}`, "Profit"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#8B5CF6"
                      fill="rgba(139, 92, 246, 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="combined" className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlySales}
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
                    <Tooltip 
                      formatter={(value, name) => {
                        if (typeof name === 'string') {
                          return [`$${value}`, name.charAt(0).toUpperCase() + name.slice(1)];
                        }
                        return [`$${value}`, String(name)];
                      }}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="costs"
                      stroke="#F43F5E"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Distribution of sales across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Types</CardTitle>
              <CardDescription>New vs. returning customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customersData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {customersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your customers are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {trafficSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Website Visitors</CardTitle>
            <CardDescription>Number of visitors by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyVisitors}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, "Visitors"]} />
                  <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
