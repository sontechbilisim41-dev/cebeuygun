# CebeUygun Platform Demo Seed Data

Comprehensive seed dataset for demonstrating the complete e-commerce platform functionality with realistic Turkish market data.

## 🎯 Overview

This seed system generates a complete demo environment with:
- **50 test users** across all roles (customer, courier, seller, admin)
- **5000+ products** with realistic Turkish market data
- **20 courier profiles** with service areas across major Turkish cities
- **Marketing campaigns** with active promotions and coupons
- **Geographic data** covering Istanbul, Ankara, Izmir, Bursa, Antalya, and Adana

## 🚀 Quick Start

### **Prerequisites**
- Node.js 20+
- PostgreSQL database running
- Environment variables configured

### **Installation & Setup**

1. **Install dependencies**
   ```bash
   cd infra/seed
   npm install
   ```

2. **Configure environment**
   ```bash
   # Copy from project root or set manually
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USERNAME=postgres
   export DB_PASSWORD=your_password
   export DB_NAME=cebeuygun
   ```

3. **Run seed command**
   ```bash
   # Interactive mode with confirmation
   npm run seed
   
   # Development mode (faster)
   npm run seed:dev
   ```

## 🎮 Demo Credentials

### **Test User Accounts**
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@cebeuygun.com | admin123 | Platform yöneticisi - tüm özelliklere erişim |
| **Customer** | customer@demo.com | demo123 | Demo müşteri hesabı - sipariş verme ve takip |
| **Courier** | courier@demo.com | demo123 | Demo kurye hesabı - teslimat yapma |
| **Seller** | seller@demo.com | demo123 | Demo satıcı hesabı - ürün yönetimi |

### **Demo URLs**
- **Customer App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001  
- **Courier App**: http://localhost:3002
- **API Documentation**: http://localhost:8000/docs

## 📊 Generated Data Overview

### **User Base (50 users)**
- **35 customers** with varied profiles and preferences
- **7 sellers** representing different business types
- **7 couriers** with different vehicle types and service areas
- **1 admin** with full platform access

### **Product Catalog (5000+ products)**
- **Food & Beverages**: Fast food, Turkish cuisine, international dishes, beverages
- **Electronics**: Smartphones, laptops, accessories, smart home devices
- **Fashion**: Clothing, shoes, accessories for all demographics
- **Home & Living**: Furniture, kitchen appliances, decoration items
- **Grocery**: Fresh produce, dairy, meat, packaged goods

### **Geographic Coverage**
- **6 major Turkish cities**: Istanbul, Ankara, Izmir, Bursa, Antalya, Adana
- **130+ districts** with realistic coordinate data
- **Courier service areas** optimized by vehicle type
- **Delivery zones** with appropriate radius calculations

### **Marketing Campaigns (25 campaigns)**
- **Welcome campaigns** for new users
- **Seasonal promotions** with time-based rules
- **Flash sales** with limited-time offers
- **Loyalty rewards** for repeat customers
- **Free delivery** promotions with minimum order amounts

## 🎯 Demo Scenarios

### **Scenario 1: Customer Order Flow**
1. **Login** as customer@demo.com
2. **Browse products** by category or search
3. **Add items** to cart from different restaurants
4. **Apply coupon** code (try: SAVE1234, DEAL5678)
5. **Place order** with delivery address
6. **Track delivery** in real-time

### **Scenario 2: Courier Workflow**
1. **Login** as courier@demo.com
2. **Go online** to receive order assignments
3. **Accept order** from available list
4. **Navigate** to pickup location
5. **Confirm pickup** and start delivery
6. **Complete delivery** with proof of delivery

### **Scenario 3: Admin Management**
1. **Login** as admin@cebeuygun.com
2. **View dashboard** with real-time metrics
3. **Manage products** and inventory
4. **Monitor orders** and delivery performance
5. **Create campaigns** and promotional offers
6. **Analyze reports** and business intelligence

### **Scenario 4: Seller Operations**
1. **Login** as seller@demo.com
2. **Manage product catalog** and pricing
3. **Update inventory** levels
4. **Process orders** and confirmations
5. **View sales analytics** and performance

## 🔧 Advanced Usage

### **Custom Seed Configuration**
```bash
# Generate more data
export SEED_USERS=100
export SEED_PRODUCTS=10000
export SEED_COURIERS=50

npm run seed
```

### **Partial Data Generation**
```bash
# Only generate users
npm run seed:users

# Only generate products  
npm run seed:products

# Only generate campaigns
npm run seed:campaigns
```

### **Data Verification**
```bash
# Verify data integrity
npm run verify
```

### **Clean Up**
```bash
# Remove all seed data
npm run clean
```

## 📈 Performance Metrics

### **Seed Performance**
- **Execution Time**: < 5 minutes for complete dataset
- **Memory Usage**: < 512MB during generation
- **Database Load**: Optimized batch inserts (1000 records/batch)
- **Error Handling**: Graceful failure recovery

### **Data Quality**
- **Realistic Turkish names** and addresses
- **Valid phone numbers** with Turkish mobile operators
- **Proper geographic coordinates** for all cities
- **Consistent pricing** in Turkish Lira
- **Realistic product descriptions** in Turkish

## 🛠 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   ```bash
   # Check database is running
   pg_isready -h localhost -p 5432
   
   # Verify credentials
   psql -h localhost -U postgres -d cebeuygun
   ```

2. **Memory Issues During Seed**
   ```bash
   # Reduce batch sizes
   export SEED_BATCH_SIZE=500
   
   # Generate in smaller chunks
   npm run seed:users
   npm run seed:products
   ```

3. **Slow Performance**
   ```bash
   # Check database indexes
   npm run verify
   
   # Monitor database performance
   SELECT * FROM pg_stat_activity;
   ```

### **Data Validation**
```bash
# Check data consistency
npm run verify

# View table statistics
psql -d cebeuygun -c "
  SELECT schemaname,tablename,n_tup_ins,n_tup_upd,n_tup_del 
  FROM pg_stat_user_tables 
  ORDER BY n_tup_ins DESC;
"
```

## 🔄 Maintenance

### **Regular Tasks**
- **Weekly**: Verify data integrity with `npm run verify`
- **Monthly**: Update product images and descriptions
- **Quarterly**: Refresh campaign data and promotions

### **Data Updates**
```bash
# Refresh campaigns only
npm run seed:campaigns

# Update product prices
npm run seed:pricing

# Add new courier areas
npm run seed:couriers
```

## 📋 Data Schema

### **Key Tables Populated**
- `users` - User accounts with authentication
- `couriers` - Courier profiles and capabilities  
- `categories` - Hierarchical product categories
- `products` - Complete product catalog
- `product_media` - Product images and media
- `campaigns` - Marketing campaigns and rules
- `coupons` - Discount codes and promotions
- `courier_service_areas` - Geographic service coverage
- `courier_working_hours` - Availability schedules

### **Relationships**
- Users ↔ Couriers (1:1 for courier role)
- Products ↔ Categories (many:1)
- Products ↔ Product Media (1:many)
- Campaigns ↔ Coupons (1:many)
- Couriers ↔ Service Areas (1:many)
- Couriers ↔ Working Hours (1:many)

## 🎨 Visual Assets

### **Product Images**
- **High-quality Pexels images** for all product categories
- **Consistent aspect ratios** and professional photography
- **Category-appropriate** imagery with Turkish context
- **Multiple images** per product (1-4 images)

### **User Avatars**
- **Diverse profile pictures** from Pexels
- **Professional headshots** for business users
- **Consistent sizing** and quality

### **Vendor Images**
- **Restaurant and shop** exterior/interior photos
- **Professional business** imagery
- **Turkish market context** appropriate visuals

## 📞 Support

### **Getting Help**
- Check the troubleshooting section above
- Verify database connection and credentials
- Review logs for specific error messages
- Ensure all prerequisites are installed

### **Contributing**
- Add new product templates in `/src/data/products.ts`
- Extend city data in `/src/data/cities.ts`
- Create new generators in `/src/generators/`
- Update verification checks in `/src/verify.ts`

---

**Seed Version**: 1.0.0  
**Last Updated**: 2024-01-20  
**Estimated Seed Time**: 3-5 minutes  
**Total Records**: ~10,000+