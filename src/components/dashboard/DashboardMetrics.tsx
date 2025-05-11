import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ReactNode;
}

export const MetricCard = ({ title, value, trend, trendValue, icon }: MetricCardProps) => {
  const trendColor = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : TrendingUp;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`mt-1 flex items-center text-sm ${trendColor[trend]}`}>
          <TrendIcon className="mr-1 h-4 w-4" />
          <span>{trendValue} vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardMetrics = () => {
  return (
    <div className="dashboard-grid">
      <MetricCard
        title="Total Revenue"
        value="$24,345"
        trend="up"
        trendValue="+12.3%"
        icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
      />
      <MetricCard
        title="Orders"
        value="345"
        trend="up"
        trendValue="+5.4%"
        icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>}
      />
      <MetricCard
        title="Customers"
        value="1,245"
        trend="up"
        trendValue="+2.7%"
        icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 1 0 7.75"></path></svg>}
      />
      <MetricCard
        title="Avg. Order Value"
        value="$67.34"
        trend="down"
        trendValue="-1.5%"
        icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
      />
    </div>
  );
};
