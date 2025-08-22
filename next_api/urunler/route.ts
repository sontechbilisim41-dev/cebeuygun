
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

const urunlerCrud = new CrudOperations('urunler');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  const searchParams = new URL(request.url).searchParams;
  const kategori_id = searchParams.get('kategori_id');
  const satici_id = searchParams.get('satici_id');
  const durum = searchParams.get('durum') || 'aktif';
  
  logApiRequest(request, { limit, offset, search, kategori_id, satici_id, durum });

  const filters: Record<string, any> = { durum };
  if (search) {
    filters.ad = search;
  }
  if (kategori_id) {
    filters.kategori_id = kategori_id;
  }
  if (satici_id) {
    filters.satici_id = satici_id;
  }

  const data = await urunlerCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.satici_id || !body.kategori_id || !body.ad || !body.fiyat) {
    return errorResponse('Satıcı ID, kategori ID, ürün adı ve fiyat alanları zorunludur', 400);
  }

  // Fiyat kontrolü
  if (body.fiyat <= 0) {
    return errorResponse('Fiyat 0\'dan büyük olmalıdır', 400);
  }

  // İndirimli fiyat kontrolü
  if (body.indirimli_fiyat && body.indirimli_fiyat >= body.fiyat) {
    return errorResponse('İndirimli fiyat normal fiyattan düşük olmalıdır', 400);
  }

  // Slug oluştur
  const slug = body.slug || body.ad
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  try {
    const data = await urunlerCrud.create({
      ...body,
      slug,
      durum: body.durum || 'aktif',
      stok_miktari: body.stok_miktari || 0,
      minimum_stok: body.minimum_stok || 0,
      birim: body.birim || 'adet',
      sira_no: body.sira_no || 0
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return errorResponse('Bu slug zaten kullanılıyor', 409);
    }
    throw error;
  }
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const body = await validateRequestBody(request);
  
  const existing = await urunlerCrud.findById(id);
  if (!existing) {
    return errorResponse('Ürün bulunamadı', 404);
  }

  // Fiyat kontrolü
  if (body.fiyat && body.fiyat <= 0) {
    return errorResponse('Fiyat 0\'dan büyük olmalıdır', 400);
  }

  // İndirimli fiyat kontrolü
  if (body.indirimli_fiyat && body.fiyat && body.indirimli_fiyat >= body.fiyat) {
    return errorResponse('İndirimli fiyat normal fiyattan düşük olmalıdır', 400);
  }

  const data = await urunlerCrud.update(id, body);
  return successResponse(data);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await urunlerCrud.findById(id);
  if (!existing) {
    return errorResponse('Ürün bulunamadı', 404);
  }

  const data = await urunlerCrud.delete(id);
  return successResponse(data);
});
