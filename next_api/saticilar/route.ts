
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

const saticilarCrud = new CrudOperations('saticilar');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  const searchParams = new URL(request.url).searchParams;
  const kategori = searchParams.get('kategori');
  const durum = searchParams.get('durum');
  
  logApiRequest(request, { limit, offset, search, kategori, durum });

  const filters: Record<string, any> = {};
  if (search) {
    filters.sirket_adi = search;
  }
  if (kategori) {
    filters.kategori = kategori;
  }
  if (durum) {
    filters.durum = durum;
  }

  const data = await saticilarCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.kullanici_id || !body.sirket_adi || !body.kategori) {
    return errorResponse('Kullanıcı ID, şirket adı ve kategori alanları zorunludur', 400);
  }

  // Kategori kontrolü
  const validKategoriler = ['genel', 'restoran', 'market'];
  if (!validKategoriler.includes(body.kategori)) {
    return errorResponse('Geçerli kategori seçiniz: genel, restoran, market', 400);
  }

  try {
    const data = await saticilarCrud.create({
      ...body,
      durum: body.durum || 'beklemede',
      performans_puani: body.performans_puani || 0.00,
      komisyon_orani: body.komisyon_orani || 10.00,
      minimum_siparis_tutari: body.minimum_siparis_tutari || 0.00,
      teslimat_suresi_dk: body.teslimat_suresi_dk || 60
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return errorResponse('Bu vergi numarası zaten kullanılıyor', 409);
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
  
  const existing = await saticilarCrud.findById(id);
  if (!existing) {
    return errorResponse('Satıcı bulunamadı', 404);
  }

  // Kategori kontrolü
  if (body.kategori) {
    const validKategoriler = ['genel', 'restoran', 'market'];
    if (!validKategoriler.includes(body.kategori)) {
      return errorResponse('Geçerli kategori seçiniz: genel, restoran, market', 400);
    }
  }

  // Durum kontrolü
  if (body.durum) {
    const validDurumlar = ['beklemede', 'aktif', 'pasif', 'reddedildi'];
    if (!validDurumlar.includes(body.durum)) {
      return errorResponse('Geçerli durum seçiniz: beklemede, aktif, pasif, reddedildi', 400);
    }
  }

  const data = await saticilarCrud.update(id, body);
  return successResponse(data);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await saticilarCrud.findById(id);
  if (!existing) {
    return errorResponse('Satıcı bulunamadı', 404);
  }

  const data = await saticilarCrud.delete(id);
  return successResponse(data);
});
