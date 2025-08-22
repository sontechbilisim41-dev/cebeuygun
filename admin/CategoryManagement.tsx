
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderTree, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockDB } from '@/lib/database/mockDatabase';
import { queries } from '@/lib/database/queries';
import { Category } from '@/types';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: 1
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const hierarchicalCategories = queries.categories.getHierarchy();
    const flatCategories = flattenCategories(hierarchicalCategories);
    setCategories(flatCategories);
  };

  const flattenCategories = (categories: any[], level = 0): Category[] => {
    let result: Category[] = [];
    
    categories.forEach(category => {
      result.push({
        ...category,
        level
      });
      
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    });
    
    return result;
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert('Kategori adı zorunludur');
      return;
    }

    const category = {
      id: `cat_${Date.now()}`,
      name: newCategory.name,
      slug: newCategory.name.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
      description: newCategory.description,
      parent_id: newCategory.parentId || null,
      level: newCategory.parentId ? 1 : 0,
      sort_order: newCategory.sortOrder,
      is_active: newCategory.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockDB.insert('categories', category);
    loadCategories();
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    const updates = {
      name: newCategory.name,
      slug: newCategory.name.toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
      description: newCategory.description,
      parent_id: newCategory.parentId || null,
      level: newCategory.parentId ? 1 : 0,
      sort_order: newCategory.sortOrder,
      is_active: newCategory.isActive,
      updated_at: new Date().toISOString()
    };

    mockDB.update('categories', editingCategory.id, updates);
    loadCategories();
    setIsAddDialogOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Check if category has children
    const hasChildren = categories.some(cat => cat.parentId === categoryId);
    if (hasChildren) {
      alert('Bu kategorinin alt kategorileri var. Önce alt kategorileri silin.');
      return;
    }

    // Check if category has products
    const products = mockDB.getTable('products');
    const hasProducts = products.some((product: any) => product.category_id === categoryId);
    if (hasProducts) {
      alert('Bu kategoride ürünler var. Önce ürünleri başka kategoriye taşıyın.');
      return;
    }

    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      mockDB.delete('categories', categoryId);
      loadCategories();
    }
  };

  const resetForm = () => {
    setNewCategory({
      name: '',
      description: '',
      parentId: '',
      isActive: true,
      sortOrder: 1
    });
  };

  const getParentCategories = () => {
    return categories.filter(cat => cat.level === 0);
  };

  const getCategoryIcon = (category: Category) => {
    if (category.level === 0) {
      return <FolderTree className="h-4 w-4 text-blue-600" />;
    }
    return <Folder className="h-4 w-4 text-gray-500" />;
  };

  const getCategoryProductCount = (categoryId: string) => {
    const products = mockDB.getTable('products');
    return products.filter((product: any) => product.category_id === categoryId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h2>
          <p className="text-gray-600">Ürün kategorilerini yönetin</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kategori Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı *</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Kategori adını girin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Üst Kategori</Label>
                <Select value={newCategory.parentId} onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Üst kategori seçin (isteğe bağlı)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ana Kategori</SelectItem>
                    {getParentCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kategori açıklamasını girin"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sıralama</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={newCategory.sortOrder}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Kategori Durumu</Label>
                  <p className="text-sm text-gray-500">Kategorinin sitede görünür olup olmayacağını belirler</p>
                </div>
                <Switch
                  checked={newCategory.isActive}
                  onCheckedChange={(checked) => setNewCategory(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingCategory(null);
                  resetForm();
                }}>
                  İptal
                </Button>
                <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  {editingCategory ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Ana Kategoriler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.filter(cat => cat.level === 0).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">
                      {getCategoryProductCount(category.id)} ürün
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.isActive ? (
                    <Badge variant="default" className="bg-green-500">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Pasif</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {categories.filter(cat => cat.level === 0).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderTree className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz ana kategori yok</p>
                <p className="text-sm">İlk kategorinizi ekleyin</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sub Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Alt Kategoriler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.filter(cat => cat.level > 0).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">
                      {categories.find(c => c.id === category.parentId)?.name} altında • {getCategoryProductCount(category.id)} ürün
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.isActive ? (
                    <Badge variant="default" className="bg-green-500">Aktif</Badge>
                  ) : (
                    <Badge variant="secondary">Pasif</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {categories.filter(cat => cat.level > 0).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Henüz alt kategori yok</p>
                <p className="text-sm">Ana kategoriler altında alt kategoriler oluşturun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kategori</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <FolderTree className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ana Kategori</p>
                <p className="text-2xl font-bold">{categories.filter(cat => cat.level === 0).length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alt Kategori</p>
                <p className="text-2xl font-bold">{categories.filter(cat => cat.level > 0).length}</p>
              </div>
              <Folder className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Kategori</p>
                <p className="text-2xl font-bold">{categories.filter(cat => cat.isActive).length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
