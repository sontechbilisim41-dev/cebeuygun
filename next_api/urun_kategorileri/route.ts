
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

const kategorilerCrud = new CrudOperations('urun_kategorileri');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  const searchParams = new URL(request.url).searchParams;
  const parent_id = searchParams.get('parent_id');
  const aktif = searchParams.get('aktif') !== 'false'; // Default true
  
  logApiRequest(request, { limit, offset, search, parent_id, aktif });

  const filters: Record<string, any> = { aktif };
  if (search) {
    filters.ad = search;
  }
  if (parent_id) {
    filters.parent_id = parent_id;
  }

  const data = await kategorilerCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.ad) {
    return errorResponse('Kategori adı zorunludur', 400);
  }

  // Slug oluştur
  const slug = body.slug || body.ad
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  try {
    const data = await kategorilerCrud.create({
      ...body,
      slug,
      aktif: body.aktif !== false,
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
  
  const existing = await kategorilerCrud.findById(id);
  if (!existing) {
    return errorResponse('Kategori bulunamadı', 404);
  }

  // Slug güncelleme
  if (body.ad && !body.slug) {
    body.slug = body.ad
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  const data = await kategorilerCrud.update(id, body);
  return successResponse(data);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await kategorilerCrud.findById(id);
  if (!existing) {
    return errorResponse('Kategori bulunamadı', 404);
  }

  const data = await kategorilerCrud.delete(id);
  return successResponse(data);
});
