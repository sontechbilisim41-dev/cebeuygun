import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useAppStore } from '@/stores/app-store';
import type { BulkOperation, BulkOperationError } from '@/types';

interface BulkUploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (operation: BulkOperation) => void;
  onError?: (error: string) => void;
}

export const useBulkOperations = () => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();
  const { addNotification } = useAppStore();

  // Get bulk operations list
  const {
    data: operations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bulk-operations'],
    queryFn: async () => {
      const response = await apiService.getPaginated<BulkOperation>('/bulk-operations');
      return response.data || [];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for status updates
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      type, 
      options 
    }: { 
      file: File; 
      type: string; 
      options?: BulkUploadOptions 
    }) => {
      const operationId = `upload_${Date.now()}`;
      
      setUploadProgress(prev => ({ ...prev, [operationId]: 0 }));

      try {
        const response = await apiService.uploadFile<BulkOperation>(
          `/bulk-operations/${type}`,
          file,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [operationId]: progress }));
            options?.onProgress?.(progress);
          }
        );

        if (response.success && response.data) {
          options?.onSuccess?.(response.data);
          
          addNotification({
            type: 'success',
            title: 'Dosya Yüklendi',
            message: `${file.name} başarıyla yüklendi ve işleme alındı`,
          });

          // Refetch operations list
          queryClient.invalidateQueries({ queryKey: ['bulk-operations'] });
          
          return response.data;
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        options?.onError?.(errorMessage);
        
        addNotification({
          type: 'error',
          title: 'Yükleme Hatası',
          message: errorMessage,
        });
        
        throw error;
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[operationId];
          return newProgress;
        });
      }
    },
  });

  // Download template mutation
  const downloadTemplateMutation = useMutation({
    mutationFn: async (type: string) => {
      await apiService.downloadFile(`/bulk-operations/templates/${type}`, `${type}_template.csv`);
      
      addNotification({
        type: 'success',
        title: 'Şablon İndirildi',
        message: `${type} şablonu başarıyla indirildi`,
      });
    },
  });

  // Download results mutation
  const downloadResultsMutation = useMutation({
    mutationFn: async (operationId: string) => {
      const operation = operations?.find(op => op.id === operationId);
      if (!operation?.downloadUrl) {
        throw new Error('Download URL not available');
      }

      await apiService.downloadFile(operation.downloadUrl, `${operation.fileName}_results.csv`);
      
      addNotification({
        type: 'success',
        title: 'Sonuçlar İndirildi',
        message: 'İşlem sonuçları başarıyla indirildi',
      });
    },
  });

  // Retry failed operation mutation
  const retryMutation = useMutation({
    mutationFn: async (operationId: string) => {
      const response = await apiService.post(`/bulk-operations/${operationId}/retry`);
      
      if (response.success) {
        addNotification({
          type: 'info',
          title: 'İşlem Yeniden Başlatıldı',
          message: 'Başarısız işlem yeniden başlatıldı',
        });
        
        queryClient.invalidateQueries({ queryKey: ['bulk-operations'] });
      }
      
      return response;
    },
  });

  // Helper functions
  const uploadProductsCsv = useCallback((file: File, options?: BulkUploadOptions) => {
    return uploadMutation.mutateAsync({ file, type: 'products', options });
  }, [uploadMutation]);

  const uploadInventoryCsv = useCallback((file: File, options?: BulkUploadOptions) => {
    return uploadMutation.mutateAsync({ file, type: 'inventory', options });
  }, [uploadMutation]);

  const uploadPricingCsv = useCallback((file: File, options?: BulkUploadOptions) => {
    return uploadMutation.mutateAsync({ file, type: 'pricing', options });
  }, [uploadMutation]);

  const downloadTemplate = useCallback((type: string) => {
    return downloadTemplateMutation.mutateAsync(type);
  }, [downloadTemplateMutation]);

  const downloadResults = useCallback((operationId: string) => {
    return downloadResultsMutation.mutateAsync(operationId);
  }, [downloadResultsMutation]);

  const retryOperation = useCallback((operationId: string) => {
    return retryMutation.mutateAsync(operationId);
  }, [retryMutation]);

  const getOperationProgress = useCallback((operationId: string) => {
    const operation = operations?.find(op => op.id === operationId);
    if (!operation) return 0;
    
    return operation.totalRows > 0 
      ? Math.round((operation.processedRows / operation.totalRows) * 100)
      : 0;
  }, [operations]);

  const getOperationErrors = useCallback((operationId: string): BulkOperationError[] => {
    const operation = operations?.find(op => op.id === operationId);
    return operation?.errors || [];
  }, [operations]);

  return {
    // State
    operations: operations || [],
    isLoading,
    error,
    uploadProgress,
    
    // Actions
    uploadProductsCsv,
    uploadInventoryCsv,
    uploadPricingCsv,
    downloadTemplate,
    downloadResults,
    retryOperation,
    refetch,
    
    // Helpers
    getOperationProgress,
    getOperationErrors,
    
    // Loading states
    isUploading: uploadMutation.isPending,
    isDownloadingTemplate: downloadTemplateMutation.isPending,
    isDownloadingResults: downloadResultsMutation.isPending,
    isRetrying: retryMutation.isPending,
  };
};