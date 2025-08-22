
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

const siparislerCrud = new CrudOperations('siparisler');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = new URL(request.url).searchParams;
  const kullanici_id = searchParams.get('kullanici_id');
  const satici_id = searchParams.get('satici_id');
  const durum = searchParams.get('durum');
  const siparis_tipi = searchParams.get('siparis_tipi');
  
  logApiRequest(request, { limit, offset, kullanici_id, satici_id, durum, siparis_tipi });

  const filters: Record<string, any> = {};
  if (kullanici_id) {
    filters.kullanici_id = kullanici_id;
  }
  if (satici_id) {
    filters.satici_id = satici_id;
  }
  if (durum) {
    filters.durum = durum;
  }
  if (siparis_tipi) {
    filters.siparis_tipi = siparis_tipi;
  }

  const data = await siparislerCrud.findMany(filters, limit, offset);
  return successResponse(data);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await validateRequestBody(request);
  logApiRequest(request, { body });
  
  // Gerekli alanları kontrol et
  if (!body.kullanici_id || !body.satici_id || !body.siparis_tipi || !body.ara_toplam || !body.toplam_tutar || !body.teslimat_adresi) {
    return errorResponse('Kullanıcı ID, satıcı ID, sipariş tipi, ara toplam, toplam tutar ve teslimat adresi alanları zorunludur', 400);
  }

  // Sipariş tipi kontrolü
  const validSiparisTipleri = ['genel', 'yemek', 'market'];
  if (!validSiparisTipleri.includes(body.siparis_tipi)) {
    return errorResponse('Geçerli sipariş tipi seçiniz: genel, yemek, market', 400);
  }

  // Tutar kontrolü
  if (body.ara_toplam <= 0 || body.toplam_tutar <= 0) {
    return errorResponse('Tutarlar 0\'dan büyük olmalıdır', 400);
  }

  // Sipariş numarası oluştur
  const siparis_no = `SP${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  try {
    const data = await siparislerCrud.create({
      ...body,
      siparis_no,
      durum: body.durum || 'beklemede',
      kargo_ucreti: body.kargo_ucreti || 0.00,
      indirim_tutari: body.indirim_tutari || 0.00,
      vergi_tutari: body.vergi_tutari || 0.00,
      para_birimi: body.para_birimi || 'TRY',
      odeme_durumu: body.odeme_durumu || 'beklemede'
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return errorResponse('Sipariş numarası çakışması', 409);
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
  
  const existing = await siparislerCrud.findById(id);
  if (!existing) {
    return errorResponse('Sipariş bulunamadı', 404);
  }

  // Durum kontrolü
  if (body.durum) {
    const validDurumlar = ['beklemede', 'onaylandi', 'hazirlaniyor', 'kargoda', 'teslim_edildi', 'iptal_edildi'];
    if (!validDurumlar.includes(body.durum)) {
      return errorResponse('Geçerli durum seçiniz', 400);
    }
  }

  // Ödeme durumu kontrolü
  if (body.odeme_durumu) {
    const validOdemeDurumlari = ['beklemede', 'odendi', 'basarisiz', 'iade_edildi'];
    if (!validOdemeDurumlari.includes(body.odeme_durumu)) {
      return errorResponse('Geçerli ödeme durumu seçiniz', 400);
    }
  }

  const data = await siparislerCrud.update(id, body);
  return successResponse(data);
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await siparislerCrud.findById(id);
  if (!existing) {
    return errorResponse('Sipariş bulunamadı', 404);
  }

  // Sadece beklemede olan siparişler silinebilir
  if (existing.durum !== 'beklemede') {
    return errorResponse('Sadece beklemede olan siparişler silinebilir', 400);
  }

  const data = await siparislerCrud.delete(id);
  return successResponse(data);
});
