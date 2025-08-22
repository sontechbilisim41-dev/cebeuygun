
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function SellerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/seller/dashboard');
      } else {
        alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-navy-900 hover:text-navy-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfaya Dön
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-green-600 text-white rounded-t-lg">
            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Satıcı Girişi</CardTitle>
            <CardDescription className="text-green-100">
              Satıcı panelinize giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="satici@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-green-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-green-600 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/seller/forgot-password" className="text-green-600 hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Satıcı Paneline Giriş'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Satıcı hesabınız yok mu?
              </p>
              <Link href="/seller/register">
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  Satıcı Ol
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500 mb-2">Farklı bir hesap türü mü arıyorsunuz?</p>
              <div className="flex justify-center gap-4 text-sm">
                <Link href="/customer/login" className="text-navy-900 hover:underline">
                  Müşteri Girişi
                </Link>
                <Link href="/courier" className="text-orange-600 hover:underline">
                  Kurye Girişi
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
