
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

// Vendors tablosu için CRUD işlemleri
const vendorsCrud = new CrudOperations('vendors');

// GET - Satıcıları getir
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  logApiRequest(request, { limit, offset, search });

  // Arama filtresi
  const filters: Record<string, any> = {};
  if (search) {
    // PostgREST'te text arama için ilike kullanıyoruz
    // Ancak bu basit implementasyonda exact match kullanacağız
  }

  const data = await vendorsCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

// PUT - Satıcı durumunu güncelle (onay/red)
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return errorResponse('ID parameter is required', 400);
  }

  const body = await validateRequestBody(request);
  logApiRequest(request, { id, body });
  
  // Satıcının var olup olmadığını kontrol et
  const existing = await vendorsCrud.findById(id);
  if (!existing) {
    return errorResponse('Vendor not found', 404);
  }

  // Güncelleme verilerini hazırla
  const updateData: Record<string, any> = {};
  
  if (body.status) {
    updateData.status = body.status;
    updateData.modify_time = new Date().toISOString();
    
    // Onaylandıysa aktif yap
    if (body.status === 'approved') {
      updateData.is_active = true;
    } else if (body.status === 'rejected' || body.status === 'suspended') {
      updateData.is_active = false;
    }
  }

  // Diğer alanları da güncelle
  if (body.is_active !== undefined) {
    updateData.is_active = body.is_active;
  }
  
  if (body.commission_rate !== undefined) {
    updateData.commission_rate = body.commission_rate;
  }

  const data = await vendorsCrud.update(id, updateData);
  return successResponse(data);
});

// POST - Yeni satıcı ekle
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.company_name || !body.email || !body.phone) {
    return errorResponse('Company name, email and phone are required', 400);
  }

  // Slug oluştur
  if (!body.company_slug) {
    body.company_slug = body.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Varsayılan değerleri ayarla
  const vendorData = {
    ...body,
    status: body.status || 'pending',
    is_active: body.is_active || false,
    commission_rate: body.commission_rate || 15.00,
    rating: 0.00,
    total_sales: 0.00,
    warning_count: 0,
    suspension_count: 0,
    create_time: new Date().toISOString(),
    modify_time: new Date().toISOString()
  };

  const data = await vendorsCrud.create(vendorData);
  return successResponse(data, 201);
});
