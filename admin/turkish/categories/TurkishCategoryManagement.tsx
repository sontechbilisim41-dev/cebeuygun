
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { mockCategories } from '@/data/mockData';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  product_count: number;
}

export function TurkishCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: null as number | null,
    image_url: ''
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: Date.now(),
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: newCategory.description,
      parent_id: newCategory.parent_id,
      image_url: newCategory.image_url,
      is_active: true,
      sort_order: categories.length + 1,
      product_count: 0
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '', parent_id: null, image_url: '' });
    setShowAddForm(false);
  };

  const toggleCategoryStatus = (id: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, is_active: !cat.is_active } : cat
    ));
  };

  const moveCategory = (id: number, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === categories.length - 1)
    ) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newCategories[index], newCategories[targetIndex]] = 
    [newCategories[targetIndex], newCategories[index]];

    // Update sort orders
    newCategories.forEach((cat, idx) => {
      cat.sort_order = idx + 1;
    });

    setCategories(newCategories);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kategori Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kategori hiyerarşisi ve ürün sınıflandırması yönetimi
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-red-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Toplam Kategori
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aktif Kategoriler
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.filter(cat => cat.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ana Kategoriler
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.filter(cat => !cat.parent_id).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Toplam Ürün
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.reduce((sum, cat) => sum + cat.product_count, 0).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Kategori Ekle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori Adı *
                </label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Kategori adını girin"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Görsel URL
                </label>
                <Input
                  value={newCategory.image_url}
                  onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Açıklama
              </label>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Kategori açıklaması"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddCategory} className="bg-gradient-to-r from-cyan-500 to-red-500 text-white">
                Kategori Ekle
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              Filtrele
            </Button>
            <Button variant="outline">
              Dışa Aktar
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Ürün Sayısı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.sort_order}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveCategory(category.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveCategory(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            /{category.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description || 'Açıklama yok'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {category.product_count.toLocaleString('tr-TR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.is_active ? 'default' : 'secondary'}
                        className={category.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      >
                        {category.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Pasif
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleCategoryStatus(category.id)}
                          className={category.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {category.is_active ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
