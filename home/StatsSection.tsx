
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, Clock, Star } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "1M+",
      label: "Happy Customers",
      description: "Trusted by millions across Turkey",
    },
    {
      icon: ShoppingBag,
      value: "10K+",
      label: "Active Vendors",
      description: "Quality partners nationwide",
    },
    {
      icon: Clock,
      value: "30min",
      label: "Average Delivery",
      description: "Fast and reliable service",
    },
    {
      icon: Star,
      value: "4.8",
      label: "Customer Rating",
      description: "Excellent service quality",
    },
  ];

  return (
    <section className="py-20 px-4 bg-red-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Millions
          </h2>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Join the largest multi-service platform in Turkey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-red-100">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
