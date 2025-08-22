
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
import { postgrestClient } from '@/lib/postgrest';

const basvurularCrud = new CrudOperations('satici_basvurulari');

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { limit, offset, search } = parseQueryParams(request);
  const searchParams = new URL(request.url).searchParams;
  const durum = searchParams.get('durum');
  const kategori = searchParams.get('kategori');
  
  logApiRequest(request, { limit, offset, search, durum, kategori });

  const filters: Record<string, any> = {};
  if (search) {
    filters.sirket_adi = search;
  }
  if (durum) {
    filters.durum = durum;
  }
  if (kategori) {
    filters.kategori = kategori;
  }

  const data = await basvurularCrud.findMany(filters, limit, offset);
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
    const data = await basvurularCrud.create({
      ...body,
      durum: body.durum || 'beklemede'
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return errorResponse('Bu başvuru zaten mevcut', 409);
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
  
  const existing = await basvurularCrud.findById(id);
  if (!existing) {
    return errorResponse('Başvuru bulunamadı', 404);
  }

  try {
    // Eğer onaylama işlemi ise, satıcı kaydı oluştur
    if (body.durum === 'onaylandi' && existing.durum !== 'onaylandi') {
      // Satıcı kaydı oluştur
      const { data: saticiData, error: saticiError } = await postgrestClient
        .from('saticilar')
        .insert([{
          kullanici_id: existing.kullanici_id,
          sirket_adi: existing.sirket_adi,
          vergi_no: existing.vergi_no,
          kategori: existing.kategori,
          durum: 'aktif',
          onay_tarihi: new Date().toISOString(),
          performans_puani: 0.00,
          komisyon_orani: existing.kategori === 'restoran' ? 15.00 : existing.kategori === 'market' ? 12.00 : 10.00,
          minimum_siparis_tutari: existing.kategori === 'restoran' ? 35.00 : existing.kategori === 'market' ? 25.00 : 0.00,
          teslimat_suresi_dk: existing.kategori === 'market' ? 15 : existing.kategori === 'restoran' ? 45 : 120,
          iletisim_bilgileri: existing.iletisim_bilgileri,
          aciklama: existing.basvuru_notu
        }])
        .select()
        .single();

      if (saticiError) {
        console.error('Satıcı oluşturma hatası:', saticiError);
        return errorResponse(`Satıcı kaydı oluşturulamadı: ${saticiError.message}`, 500);
      }

      // Başvuru durumunu güncelle
      body.onay_tarihi = new Date().toISOString();
      body.onaylayan_admin_id = body.admin_id || 1;
      
      // Onay sürecini kaydet
      await postgrestClient
        .from('satici_onay_sureci')
        .insert([{
          basvuru_id: parseInt(id),
          satici_id: saticiData.id,
          admin_id: body.admin_id || 1,
          onceki_durum: existing.durum,
          yeni_durum: 'onaylandi',
          islem_tipi: 'basvuru_onay',
          aciklama: body.admin_notu || 'Başvuru onaylandı ve satıcı hesabı oluşturuldu'
        }]);

    } else if (body.durum === 'reddedildi' && existing.durum !== 'reddedildi') {
      // Red işlemi
      body.red_tarihi = new Date().toISOString();
      body.onaylayan_admin_id = body.admin_id || 1;
      
      // Onay sürecini kaydet
      await postgrestClient
        .from('satici_onay_sureci')
        .insert([{
          basvuru_id: parseInt(id),
          admin_id: body.admin_id || 1,
          onceki_durum: existing.durum,
          yeni_durum: 'reddedildi',
          islem_tipi: 'basvuru_red',
          aciklama: body.admin_notu || 'Başvuru reddedildi'
        }]);
    }

    // Başvuru durumunu güncelle
    const data = await basvurularCrud.update(id, body);
    return successResponse(data);
    
  } catch (error) {
    console.error('Başvuru güncelleme hatası:', error);
    if (error instanceof Error) {
      return errorResponse(`İşlem başarısız: ${error.message}`, 500);
    }
    return errorResponse('Beklenmeyen bir hata oluştu', 500);
  }
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return errorResponse('ID parametresi gereklidir', 400);
  }

  const existing = await basvurularCrud.findById(id);
  if (!existing) {
    return errorResponse('Başvuru bulunamadı', 404);
  }

  const data = await basvurularCrud.delete(id);
  return successResponse(data);
});
