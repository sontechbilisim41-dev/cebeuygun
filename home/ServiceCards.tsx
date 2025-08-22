
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, UtensilsCrossed, ShoppingCart, Clock, Truck, Star } from "lucide-react";
import Link from "next/link";

export function ServiceCards() {
  const services = [
    {
      icon: ShoppingBag,
      title: "General Marketplace",
      description: "Shop from millions of products across all categories",
      features: ["10,000+ Vendors", "1M+ Products", "Fast Shipping"],
      href: "/marketplace",
      color: "bg-blue-500",
    },
    {
      icon: UtensilsCrossed,
      title: "Food Delivery",
      description: "Order from your favorite restaurants and cafes",
      features: ["Live Tracking", "Hot & Fresh", "30-60 min delivery"],
      href: "/food-delivery",
      color: "bg-green-500",
    },
    {
      icon: ShoppingCart,
      title: "Rapid Grocery",
      description: "Get groceries delivered in just 30 minutes",
      features: ["30-min delivery", "Fresh products", "Dark stores"],
      href: "/grocery",
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Three Services, One Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the convenience of shopping, dining, and grocery delivery all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={service.href}>
                  <Button className="w-full mt-4">
                    Explore Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
