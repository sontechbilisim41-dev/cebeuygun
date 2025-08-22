
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  MessageSquare,
  Image,
  TrendingUp,
  Settings
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { toast } from "sonner";

interface ModerationResult {
  id: number;
  hedef_id: number;
  hedef_tipi: string;
  moderasyon_tipi: string;
  sonuc: string;
  guven_skoru: number;
  detaylar: any;
  create_time: string;
}

interface ModerationStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  avgConfidence: number;
}

export function AIModeration() {
  const [results, setResults] = useState<ModerationResult[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    avgConfidence: 0
  });
  const [loading, setLoading] = useState(false);

  // Moderasyon sonuçlarını getir
  const fetchModerationResults = async () => {
    setLoading(true);
    try {
      // Bu endpoint henüz mevcut değil, örnek veri kullanıyoruz
      const mockResults: ModerationResult[] = [
        {
          id: 1,
          hedef_id: 1,
          hedef_tipi: 'urun',
          moderasyon_tipi: 'icerik_moderasyonu',
          sonuc: 'onaylandi',
          guven_skoru: 95.5,
          detaylar: {
            kontrol_edilen: ['baslik', 'aciklama', 'resimler'],
            risk_seviyesi: 'dusuk'
          },
          create_time: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          hedef_id: 7,
          hedef_tipi: 'urun',
          moderasyon_tipi: 'icerik_moderasyonu',
          sonuc: 'inceleme_gerekli',
          guven_skoru: 78.2,
          detaylar: {
            kontrol_edilen: ['baslik', 'aciklama', 'resimler'],
            risk_seviyesi: 'orta',
            uyari: 'Ürün görselleri kalite standartlarının altında'
          },
          create_time: '2024-01-15T11:15:00Z'
        },
        {
          id: 3,
          hedef_id: 1,
          hedef_tipi: 'yorum',
          moderasyon_tipi: 'spam_tespiti',
          sonuc: 'onaylandi',
          guven_skoru: 88.7,
          detaylar: {
            spam_riski: 'dusuk',
            duygu_analizi: 'pozitif'
          },
          create_time: '2024-01-15T12:00:00Z'
        }
      ];

      setResults(mockResults);
      
      // İstatistikleri hesapla
      const newStats = {
        total: mockResults.length,
        approved: mockResults.filter(r => r.sonuc === 'onaylandi').length,
        rejected: mockResults.filter(r => r.sonuc === 'reddedildi').length,
        pending: mockResults.filter(r => r.sonuc === 'inceleme_gerekli').length,
        avgConfidence: mockResults.reduce((sum, r) => sum + r.guven_skoru, 0) / mockResults.length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Moderasyon sonuçları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sonuç badge'i
  const getResultBadge = (result: string, confidence: number) => {
    switch (result) {
      case 'onaylandi':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Onaylandı</Badge>;
      case 'reddedildi':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Reddedildi</Badge>;
      case 'inceleme_gerekli':
        return <Badge className="bg-yellow-100 text-yellow-800"><Eye className="h-3 w-3 mr-1" />İnceleme Gerekli</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  // Güven skoru rengi
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Hedef tipi ikonu
  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'urun':
        return <Eye className="h-4 w-4" />;
      case 'yorum':
        return <MessageSquare className="h-4 w-4" />;
      case 'resim':
        return <Image className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchModerationResults();
  }, []);

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Toplam Kontrol</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Onaylandı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Reddedildi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">İnceleme Bekliyor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Ortalama Güven</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Moderasyon Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Moderasyon Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">İçerik Moderasyonu</label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                <span className="text-sm text-muted-foreground">Güven Eşiği: 80%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Spam Tespiti</label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                <span className="text-sm text-muted-foreground">Güven Eşiği: 75%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Görsel Analizi</label>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>
                <span className="text-sm text-muted-foreground">Güven Eşiği: 85%</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Ayarları Düzenle
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performans Raporu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Moderasyon Sonuçları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Son Moderasyon Sonuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Sonuçlar yükleniyor...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz moderasyon sonucu bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTargetIcon(result.hedef_tipi)}
                      <div>
                        <div className="font-medium">
                          {result.moderasyon_tipi.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.hedef_tipi} ID: {result.hedef_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`font-bold ${getConfidenceColor(result.guven_skoru)}`}>
                          {result.guven_skoru}%
                        </div>
                        <div className="text-xs text-muted-foreground">Güven Skoru</div>
                      </div>
                      {getResultBadge(result.sonuc, result.guven_skoru)}
                    </div>
                  </div>

                  <Progress value={result.guven_skoru} className="h-2" />

                  {result.detaylar && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="text-sm font-medium">Detaylar:</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {result.detaylar.kontrol_edilen && (
                          <div>
                            <span className="font-medium">Kontrol Edilen:</span> {result.detaylar.kontrol_edilen.join(', ')}
                          </div>
                        )}
                        {result.detaylar.risk_seviyesi && (
                          <div>
                            <span className="font-medium">Risk Seviyesi:</span> 
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${
                                result.detaylar.risk_seviyesi === 'dusuk' ? 'text-green-600' :
                                result.detaylar.risk_seviyesi === 'orta' ? 'text-yellow-600' : 'text-red-600'
                              }`}
                            >
                              {result.detaylar.risk_seviyesi}
                            </Badge>
                          </div>
                        )}
                        {result.detaylar.uyari && (
                          <div className="text-yellow-600">
                            <span className="font-medium">Uyarı:</span> {result.detaylar.uyari}
                          </div>
                        )}
                        {result.detaylar.spam_riski && (
                          <div>
                            <span className="font-medium">Spam Riski:</span> {result.detaylar.spam_riski}
                          </div>
                        )}
                        {result.detaylar.duygu_analizi && (
                          <div>
                            <span className="font-medium">Duygu Analizi:</span> {result.detaylar.duygu_analizi}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {new Date(result.create_time).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Detay
                      </Button>
                      {result.sonuc === 'inceleme_gerekli' && (
                        <Button variant="ghost" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Manuel Onayla
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
