
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, MoreHorizontal, UserPlus, Shield, Store, Truck } from 'lucide-react';
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
import { mockDB } from '@/lib/database/mockDatabase';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const loadUsers = () => {
    const usersData = mockDB.getTable('users');
    setUsers(usersData);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rol filtresi
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Durum filtresi
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredUsers(filtered);
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'customer': { label: 'Müşteri', color: 'bg-blue-500', icon: '👤' },
      'vendor': { label: 'Satıcı', color: 'bg-green-500', icon: '🏪' },
      'courier': { label: 'Kurye', color: 'bg-orange-500', icon: '🚚' },
      'admin': { label: 'Yönetici', color: 'bg-purple-500', icon: '👨‍💼' },
      'super_admin': { label: 'Süper Yönetici', color: 'bg-red-500', icon: '👑' }
    };

    const roleInfo = roleMap[role as keyof typeof roleMap] || { 
      label: role, 
      color: 'bg-gray-500',
      icon: '❓'
    };
    
    return (
      <Badge className={roleInfo.color}>
        {roleInfo.icon} {roleInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Aktif', color: 'bg-green-500' },
      'inactive': { label: 'Pasif', color: 'bg-gray-500' },
      'suspended': { label: 'Askıya Alındı', color: 'bg-red-500' },
      'pending_verification': { label: 'Doğrulama Bekliyor', color: 'bg-yellow-500' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      color: 'bg-gray-500' 
    };
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'vendor':
        return <Store className="h-4 w-4 text-green-600" />;
      case 'courier':
        return <Truck className="h-4 w-4 text-orange-600" />;
      case 'admin':
      case 'super_admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const userStats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    vendors: users.filter(u => u.role === 'vendor').length,
    couriers: users.filter(u => u.role === 'courier').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      mockDB.delete('users', userId);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600">Platform kullanıcılarını yönetin</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Toplam</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Müşteri</p>
              <p className="text-2xl font-bold text-blue-600">{userStats.customers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Satıcı</p>
              <p className="text-2xl font-bold text-green-600">{userStats.vendors}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Kurye</p>
              <p className="text-2xl font-bold text-orange-600">{userStats.couriers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Yönetici</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.admins}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ad, e-posta veya telefon ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="customer">Müşteri</SelectItem>
                <SelectItem value="vendor">Satıcı</SelectItem>
                <SelectItem value="courier">Kurye</SelectItem>
                <SelectItem value="admin">Yönetici</SelectItem>
                <SelectItem value="super_admin">Süper Yönetici</SelectItem>
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
                <SelectItem value="suspended">Askıya Alındı</SelectItem>
                <SelectItem value="pending_verification">Doğrulama Bekliyor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kullanıcılar ({filteredUsers.length})</span>
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
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.phone || 'Belirtilmemiş'}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(user.created_at).toLocaleDateString('tr-TR')}</p>
                        <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleTimeString('tr-TR')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.last_login ? (
                          <>
                            <p className="text-sm">{new Date(user.last_login).toLocaleDateString('tr-TR')}</p>
                            <p className="text-xs text-gray-500">{new Date(user.last_login).toLocaleTimeString('tr-TR')}</p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Hiç giriş yapmamış</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Yetkileri Yönet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Kullanıcı bulunamadı</p>
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
