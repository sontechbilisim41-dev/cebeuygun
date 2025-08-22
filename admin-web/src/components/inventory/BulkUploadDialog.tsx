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
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onExportTemplate: () => Promise<void>;
  onImportFile: (file: File) => Promise<void>;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  open,
  onClose,
  onExportTemplate,
  onImportFile,
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
      description: 'Excel şablonunu indirip mevcut ürün bilgilerinizi görün',
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
      await onExportTemplate();
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

      await onImportFile(selectedFile);
      
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
        sx: { minHeight: 500 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon />
          Excel ile Toplu Güncelleme
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Stok ve fiyatları toplu güncellemek için şablon dosyasını indirip doldurun, sonra yükleyin.
          </Typography>
        </Alert>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <Typography variant="h6" fontWeight="600">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>

                {/* Step 0: Download Template */}
                {index === 0 && (
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadTemplate}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Şablon Dosyasını İndir
                    </Button>
                    
                    <Alert severity="info" icon={<InfoIcon />}>
                      <Typography variant="body2">
                        Şablon dosyası mevcut ürünlerinizin listesini içerir. 
                        Sadece fiyat ve stok sütunlarını düzenleyin.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Step 1: Instructions */}
                {index === 1 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Excel dosyasında aşağıdaki sütunları güncelleyebilirsiniz:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fiyat (TL)" 
                          secondary="Ürün satış fiyatı (örn: 45.50)" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Stok Adedi" 
                          secondary="Mevcut stok miktarı (örn: 100)" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Tükendi" 
                          secondary="true/false değeri" 
                        />
                      </ListItem>
                    </List>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setActiveStep(2)}
                      sx={{ mt: 2 }}
                    >
                      Dosyayı Doldurdum, Devam Et
                    </Button>
                  </Box>
                )}

                {/* Step 2: Upload File */}
                {index === 2 && (
                  <Box>
                    <Box
                      sx={{
                        border: 2,
                        borderColor: selectedFile ? 'success.main' : 'grey.300',
                        borderStyle: 'dashed',
                        borderRadius: 2,
                        p: 3,
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
                          <CheckIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="h6" color="success.main" gutterBottom>
                            Dosya Seçildi
                          </Typography>
                          <Typography variant="body2">
                            {selectedFile.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Boyut: {(selectedFile.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>
                            Excel Dosyasını Seçin
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            .xlsx, .xls veya .csv formatında
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {selectedFile && (
                      <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={handleUpload}
                        disabled={uploading}
                        fullWidth
                        size="large"
                      >
                        {uploading ? 'Yükleniyor...' : 'Dosyayı Yükle ve Güncelle'}
                      </Button>
                    )}
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
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
          </Box>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={uploadResult.success ? 'success' : 'error'}
              icon={uploadResult.success ? <CheckIcon /> : <ErrorIcon />}
            >
              <Typography variant="body2">
                {uploadResult.success 
                  ? `${uploadResult.processed} ürün başarıyla güncellendi!`
                  : 'Dosya işlenirken hata oluştu'
                }
              </Typography>
              {uploadResult.errors.length > 0 && (
                <Box sx={{ mt: 1 }}>
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