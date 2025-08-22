
import { NextRequest } from 'next/server';
import { 
  CrudOperations, 
  withErrorHandling, 
  parseQueryParams, 
  validateRequestBody,
  successResponse,
  errorResponse 
} from '@/lib/api-utils';
import { logApiRequest } from '@/lib/debug-log';

// Products tablosu için CRUD işlemleri
const productsCrud = new CrudOperations('products');
const approvalsCrud = new CrudOperations('product_approvals');

// GET - Ürünleri getir
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const approvalStatus = searchParams.get('approval_status');
  
  logApiRequest(request, { limit, offset, search, approvalStatus });

  // Filtreler
  const filters: Record<string, any> = {};
  if (approvalStatus && approvalStatus !== 'all') {
    filters.approval_status = approvalStatus;
  }

  const data = await productsCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

// PUT - Ürün durumunu güncelle (onay/red)
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return errorResponse('ID parameter is required', 400);
  }

  const body = await validateRequestBody(request);
  logApiRequest(request, { id, body });
  
  // Ürünün var olup olmadığını kontrol et
  const existing = await productsCrud.findById(id);
  if (!existing) {
    return errorResponse('Product not found', 404);
  }

  // Güncelleme verilerini hazırla
  const updateData: Record<string, any> = {};
  
  if (body.approval_status) {
    updateData.approval_status = body.approval_status;
    updateData.modify_time = new Date().toISOString();
    
    // Onaylandıysa aktif yap ve onay tarihini kaydet
    if (body.approval_status === 'approved') {
      updateData.is_active = true;
      updateData.approved_at = new Date().toISOString();
      // approved_by alanını da ekleyebiliriz (admin user id)
    } else if (body.approval_status === 'rejected') {
      updateData.is_active = false;
    }
  }

  // Diğer alanları da güncelle
  if (body.is_active !== undefined) {
    updateData.is_active = body.is_active;
  }
  
  if (body.is_featured !== undefined) {
    updateData.is_featured = body.is_featured;
  }

  if (body.stock_quantity !== undefined) {
    updateData.stock_quantity = body.stock_quantity;
  }

  const data = await productsCrud.update(id, updateData);

  // Ürün onay tablosuna da kayıt ekle
  if (body.approval_status) {
    try {
      await approvalsCrud.create({
        product_id: parseInt(id),
        vendor_id: existing.vendor_id,
        status: body.approval_status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: body.reviewed_by || null,
        rejection_reason: body.rejection_reason || null,
        admin_notes: body.admin_notes || null,
        create_time: new Date().toISOString(),
        modify_time: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to create approval record:', error);
      // Ana işlem başarılı olduğu için hata fırlatmıyoruz
    }
  }

  return successResponse(data);
});

// POST - Yeni ürün ekle
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.name || !body.sku || !body.price || !body.category_id || !body.vendor_id) {
    return errorResponse('Name, SKU, price, category_id and vendor_id are required', 400);
  }

  // Slug oluştur
  if (!body.slug) {
    body.slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Varsayılan değerleri ayarla
  const productData = {
    ...body,
    approval_status: body.approval_status || 'pending',
    is_active: body.is_active || false,
    is_featured: body.is_featured || false,
    stock_quantity: body.stock_quantity || 0,
    min_stock_level: body.min_stock_level || 0,
    create_time: new Date().toISOString(),
    modify_time: new Date().toISOString()
  };

  const data = await productsCrud.create(productData);
  return successResponse(data, 201);
});
