
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreHorizontal, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { mockDB } from '@/lib/database/mockDatabase';
import { queries } from '@/lib/database/queries';
import { Product, Category } from '@/types';

export function ProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    basePrice: '',
    stock: '',
    isActive: true,
    isFeatured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const loadData = () => {
    const productsData = queries.products.getWithDetails();
    const categoriesData = queries.categories.getHierarchy();
    
    setProducts(productsData);
    setCategories(categoriesData.flatMap(cat => [cat, ...(cat.children || [])]));
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Durum filtresi
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(product => product.is_active);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(product => !product.is_active);
      } else if (selectedStatus === 'low_stock') {
        filtered = filtered.filter(product => product.stock_quantity <= product.min_stock_level);
      }
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.categoryId || !newProduct.basePrice) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    const product = {
      id: `prod_${Date.now()}`,
      vendor_id: 'vendor_1',
      category_id: newProduct.categoryId,
      brand_id: 'brand_1',
      name: newProduct.name,
      slug: newProduct.name.toLowerCase().replace(/\s+/g, '-'),
      description: newProduct.description,
      sku: `SKU-${Date.now()}`,
      base_price: parseFloat(newProduct.basePrice),
      stock_quantity: parseInt(newProduct.stock) || 0,
      min_stock_level: 10,
      is_active: newProduct.isActive,
      is_featured: newProduct.isFeatured,
      rating_average: 0,
      rating_count: 0,
      sold_count: 0,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockDB.insert('products', product);
    loadData();
    setIsAddDialogOpen(false);
    setNewProduct({
      name: '',
      description: '',
      categoryId: '',
      brand: '',
      basePrice: '',
      stock: '',
      isActive: true,
      isFeatured: false
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      brand: product.brand || '',
      basePrice: product.base_price.toString(),
      stock: product.stock_quantity.toString(),
      isActive: product.is_active,
      isFeatured: product.is_featured
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updates = {
      name: newProduct.name,
      description: newProduct.description,
      category_id: newProduct.categoryId,
      base_price: parseFloat(newProduct.basePrice),
      stock_quantity: parseInt(newProduct.stock),
      is_active: newProduct.isActive,
      is_featured: newProduct.isFeatured,
      updated_at: new Date().toISOString()
    };

    mockDB.update('products', editingProduct.id, updates);
    loadData();
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      categoryId: '',
      brand: '',
      basePrice: '',
      stock: '',
      isActive: true,
      isFeatured: false
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      mockDB.delete('products', productId);
      loadData();
    }
  };

  const getStatusBadge = (product: any) => {
    if (!product.is_active) {
      return <Badge variant="secondary">Pasif</Badge>;
    }
    if (product.stock_quantity <= product.min_stock_level) {
      return <Badge variant="destructive">Stok Azalıyor</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Aktif</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h2>
          <p className="text-gray-600">Platform ürünlerini yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            İçe Aktar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ürün Adı *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ürün adını girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori Seç *</Label>
                    <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.level > 0 ? '— ' : ''}{category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ürün açıklamasını girin"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marka</Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Marka adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Fiyat (₺) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.basePrice}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, basePrice: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok Miktarı</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Ürün Durumu</Label>
                      <p className="text-sm text-gray-500">Ürünün sitede görünür olup olmayacağını belirler</p>
                    </div>
                    <Switch
                      checked={newProduct.isActive}
                      onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Öne Çıkan Ürün</Label>
                      <p className="text-sm text-gray-500">Ürünün öne çıkan ürünler bölümünde gösterilmesi</p>
                    </div>
                    <Switch
                      checked={newProduct.isFeatured}
                      onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, isFeatured: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      categoryId: '',
                      brand: '',
                      basePrice: '',
                      stock: '',
                      isActive: true,
                      isFeatured: false
                    });
                  }}>
                    İptal
                  </Button>
                  <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    {editingProduct ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ürün adı, marka veya SKU ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.level > 0 ? '— ' : ''}{category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="low_stock">Stok Azalıyor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ürünler ({filteredProducts.length})</span>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Gelişmiş Filtre
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Satıcı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.vendor?.profile?.business_name || 'Bilinmiyor'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.category?.name || 'Kategori Yok'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">₺{product.base_price}</span>
                        {product.sale_price && (
                          <span className="text-sm text-green-600">İndirimli: ₺{product.sale_price}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.stock_quantity}</span>
                        <span className="text-xs text-gray-500">Min: {product.min_stock_level}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Ürün bulunamadı</p>
              <p className="text-sm text-gray-400 mt-1">
                Arama kriterlerinizi değiştirmeyi deneyin
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
