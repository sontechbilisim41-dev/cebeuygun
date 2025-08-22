
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

const kullanicilarCrud = new CrudOperations('kullanicilar');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  logApiRequest(request, { limit, offset, search });

  const filters: Record<string, any> = {};
  if (search) {
    // Email veya ad-soyad ile arama
    filters.email = search;
  }

  const data = await kullanicilarCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body: { ...body, sifre_hash: '[HIDDEN]' } });
  
  // Gerekli alanları kontrol et
  if (!body.email || !body.sifre_hash || !body.ad || !body.soyad) {
    return errorResponse('Email, şifre, ad ve soyad alanları zorunludur', 400);
  }

  // Email formatını kontrol et
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return errorResponse('Geçerli bir email adresi giriniz', 400);
  }

  try {
    const data = await kullanicilarCrud.create({
      ...body,
      durum: body.durum || 'aktif',
      email_dogrulandi: body.email_dogrulandi || false,
      telefon_dogrulandi: body.telefon_dogrulandi || false
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return errorResponse('Bu email adresi zaten kullanılıyor', 409);
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
  
  const existing = await kullanicilarCrud.findById(id);
  if (!existing) {
    return errorResponse('Kullanıcı bulunamadı', 404);
  }

  // Email güncelleniyorsa format kontrolü
  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return errorResponse('Geçerli bir email adresi giriniz', 400);
    }
  }

  const data = await kullanicilarCrud.update(id, body);
  return successResponse(data);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await kullanicilarCrud.findById(id);
  if (!existing) {
    return errorResponse('Kullanıcı bulunamadı', 404);
  }

  const data = await kullanicilarCrud.delete(id);
  return successResponse(data);
});
