
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, ShoppingCart, User, Menu, Bell, Phone, Store, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CategoryMenu } from './CategoryMenu';

export function CustomerHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Konum Seçin');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this
          setCurrentLocation('Mevcut Konum');
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b bg-navy-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>🚀 10-30 dakikada hızlı teslimat!</span>
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>Müşteri Hizmetleri: 0850-XXX-XXXX</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-white hover:text-white/80">
                Mobil Uygulama
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-navy-900">cebeuygun</span>
              <span className="text-xs text-gray-500">.com</span>
            </div>
          </Link>

          {/* Service Quick Links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/marketplace">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-navy-900 hover:bg-navy-50">
                <ShoppingBag className="h-4 w-4" />
                E-ticaret
              </Button>
            </Link>
            <Link href="/food">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-red-600 hover:bg-red-50">
                <UtensilsCrossed className="h-4 w-4" />
                Yemek
              </Button>
            </Link>
            <Link href="/market">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-green-600 hover:bg-green-50">
                <Store className="h-4 w-4" />
                Market
              </Button>
            </Link>
          </div>

          {/* Location Selector */}
          <Button variant="ghost" className="hidden md:flex items-center gap-2 max-w-xs border border-gray-200 rounded-lg">
            <MapPin className="h-4 w-4 text-navy-900" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Teslimat Adresi</div>
              <div className="text-sm font-medium truncate text-navy-900">{currentLocation}</div>
            </div>
          </Button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ürün, marka, restoran ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 border-2 border-navy-900/20 focus:border-navy-900"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Login Panels */}
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white">
                    Giriş Yap
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/customer/login" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Müşteri Girişi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/seller/login" className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Satıcı Girişi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/courier" className="flex items-center gap-2 text-orange-600">
                      <User className="h-4 w-4" />
                      Kurye Girişi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 text-purple-600">
                      <User className="h-4 w-4" />
                      Yönetici Girişi
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-navy-900" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                  3
                </Badge>
              </Button>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative border border-gray-200 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-navy-900" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="border border-gray-200 rounded-lg">
                    <User className="h-5 w-5 text-navy-900" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Hesabım</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Siparişlerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Favorilerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/addresses">Adreslerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  <Button variant="ghost" className="justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    {currentLocation}
                  </Button>
                  
                  {/* Service Links */}
                  <div className="space-y-2">
                    <Link href="/marketplace">
                      <Button variant="outline" className="w-full justify-start">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        E-ticaret Pazaryeri
                      </Button>
                    </Link>
                    <Link href="/food">
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-200">
                        <UtensilsCrossed className="h-4 w-4 mr-2" />
                        Yemek Siparişi
                      </Button>
                    </Link>
                    <Link href="/market">
                      <Button variant="outline" className="w-full justify-start text-green-600 border-green-200">
                        <Store className="h-4 w-4 mr-2" />
                        Hızlı Market
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex flex-col gap-2">
                      <Link href="/customer/login">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Müşteri Girişi
                        </Button>
                      </Link>
                      <Link href="/seller/login">
                        <Button variant="outline" className="w-full justify-start">
                          <Store className="h-4 w-4 mr-2" />
                          Satıcı Girişi
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-t bg-gray-50">
        <div className="container mx-auto px-4">
          <CategoryMenu />
        </div>
      </div>
    </header>
  );
}
