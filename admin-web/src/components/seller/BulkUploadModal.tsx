import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    processed: number;
    errors: string[];
  } | null>(null);

  const steps = [
    {
      label: 'Şablon Dosyasını İndirin',
      description: 'Mevcut ürünlerinizin listesini içeren Excel şablonunu indirin',
    },
    {
      label: 'Dosyayı Doldurun',
      description: 'Stok ve fiyat bilgilerini Excel dosyasında güncelleyin',
    },
    {
      label: 'Dosyayı Yükleyin',
      description: 'Güncellenmiş dosyayı sisteme yükleyin',
    },
  ];

  const handleDownloadTemplate = async () => {
    try {
      // Mock template download
      const csvContent = [
        'SKU,Ürün Adı,Kategori,Mevcut Fiyat (₺),Yeni Fiyat (₺),Mevcut Stok,Yeni Stok,Tükendi (true/false)',
        'MCD-BIGMAC-001,Big Mac Menü,Fast Food,45.00,45.00,100,100,false',
        'DOM-MARG-L-001,Margherita Pizza (Büyük),Pizza,38.00,38.00,25,25,false',
        'DK-CHICK-001,Chicken Döner Porsiyon,Türk Mutfağı,28.00,28.00,5,5,false',
        'APL-IP15PM-256,iPhone 15 Pro Max 256GB,Elektronik,64999.00,64999.00,0,0,true',
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'urun_stok_fiyat_sablonu.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setActiveStep(1);
    } catch (error) {
      console.error('Template download error:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActiveStep(2);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simulate processing result
      setUploadResult({
        success: true,
        processed: Math.floor(Math.random() * 50) + 10,
        errors: [],
      });

      setTimeout(() => {
        onClose();
        handleReset();
      }, 2000);
    } catch (error) {
      setUploadResult({
        success: false,
        processed: 0,
        errors: ['Dosya işlenirken hata oluştu'],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      handleReset();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: 600 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon />
          Excel ile Toplu Güncelleme
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Stok ve fiyatları toplu güncellemek için şablon dosyasını indirip doldurun, sonra yükleyin.</strong>
          </Typography>
        </Alert>

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Download Template */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                1. Şablon Dosyasını İndirin
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mevcut ürünlerinizin listesini içeren Excel şablonunu indirin
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DownloadIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="600">
                        Ürün Listesi Şablonu
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mevcut ürünlerinizin fiyat ve stok bilgileri
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadTemplate}
                fullWidth
                size="large"
              >
                Şablon Dosyasını İndir
              </Button>
            </StepContent>
          </Step>

          {/* Step 2: Fill Data */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                2. Dosyayı Doldurun
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Excel dosyasında sadece aşağıdaki sütunları güncelleyin:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Yeni Fiyat (₺)" 
                    secondary="Ürün satış fiyatını güncelleyin (örn: 45.50)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Yeni Stok" 
                    secondary="Mevcut stok miktarını güncelleyin (örn: 100)" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tükendi" 
                    secondary="true (tükendi) veya false (stokta) yazın" 
                  />
                </ListItem>
              </List>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Önemli:</strong> SKU, Ürün Adı ve Kategori sütunlarını değiştirmeyin!
                </Typography>
              </Alert>
              
              <Button
                variant="outlined"
                onClick={() => setActiveStep(2)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Dosyayı Doldurdum, Devam Et
              </Button>
            </StepContent>
          </Step>

          {/* Step 3: Upload File */}
          <Step>
            <StepLabel>
              <Typography variant="h6" fontWeight="600">
                3. Dosyayı Yükleyin
              </Typography>
            </StepLabel>
            <StepContent>
              <Box
                sx={{
                  border: 2,
                  borderColor: selectedFile ? 'success.main' : 'grey.300',
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: selectedFile ? 'success.50' : 'grey.50',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  mb: 2,
                }}
                onClick={() => document.getElementById('bulk-file-upload')?.click()}
              >
                <input
                  id="bulk-file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                
                {selectedFile ? (
                  <Box>
                    <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Dosya Hazır
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Boyut: {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Güncellenmiş Excel Dosyasını Seçin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      .xlsx, .xls veya .csv formatında dosya yükleyin
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedFile && !uploading && !uploadResult && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUpload}
                  fullWidth
                  size="large"
                  sx={{ fontWeight: 600 }}
                >
                  Dosyayı Yükle ve Güncelle
                </Button>
              )}
            </StepContent>
          </Step>
        </Stepper>

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              Dosya işleniyor... {uploadProgress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Lütfen bekleyin, ürünler güncelleniyor...
            </Typography>
          </Box>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={uploadResult.success ? 'success' : 'error'}
              icon={uploadResult.success ? <CheckIcon /> : <ErrorIcon />}
            >
              <Typography variant="body2" fontWeight="600">
                {uploadResult.success 
                  ? `Başarılı! ${uploadResult.processed} ürün güncellendi`
                  : 'Dosya işlenirken hata oluştu'
                }
              </Typography>
              {uploadResult.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Hatalar:
                  </Typography>
                  {uploadResult.errors.map((error, index) => (
                    <Typography key={index} variant="caption" display="block">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          {uploadResult?.success ? 'Kapat' : 'İptal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};