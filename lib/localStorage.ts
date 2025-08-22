
// localStorage utilities for NO_DATABASE application

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  // Generic methods
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Specific data methods
  getUsers() {
    return this.get('users') || [];
  }

  setUsers(users: any[]) {
    this.set('users', users);
  }

  getProducts() {
    return this.get('products') || [];
  }

  setProducts(products: any[]) {
    this.set('products', products);
  }

  getOrders() {
    return this.get('orders') || [];
  }

  setOrders(orders: any[]) {
    this.set('orders', orders);
  }

  getCategories() {
    return this.get('categories') || [];
  }

  setCategories(categories: any[]) {
    this.set('categories', categories);
  }

  getCart(userId: string) {
    return this.get(`cart_${userId}`) || { items: [], total: 0 };
  }

  setCart(userId: string, cart: any) {
    this.set(`cart_${userId}`, cart);
  }

  getCurrentUser() {
    return this.get('currentUser');
  }

  setCurrentUser(user: any) {
    this.set('currentUser', user);
  }

  getWishlist(userId: string) {
    return this.get(`wishlist_${userId}`) || [];
  }

  setWishlist(userId: string, wishlist: any[]) {
    this.set(`wishlist_${userId}`, wishlist);
  }

  getAddresses(userId: string) {
    return this.get(`addresses_${userId}`) || [];
  }

  setAddresses(userId: string, addresses: any[]) {
    this.set(`addresses_${userId}`, addresses);
  }

  getReviews() {
    return this.get('reviews') || [];
  }

  setReviews(reviews: any[]) {
    this.set('reviews', reviews);
  }

  getCoupons() {
    return this.get('coupons') || [];
  }

  setCoupons(coupons: any[]) {
    this.set('coupons', coupons);
  }

  getCampaigns() {
    return this.get('campaigns') || [];
  }

  setCampaigns(campaigns: any[]) {
    this.set('campaigns', campaigns);
  }

  getNotifications(userId: string) {
    return this.get(`notifications_${userId}`) || [];
  }

  setNotifications(userId: string, notifications: any[]) {
    this.set(`notifications_${userId}`, notifications);
  }
}

export const storage = LocalStorageManager.getInstance();
