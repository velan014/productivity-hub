import { api } from './api';
import { ExportBackupData, ApiResponse } from '../types';

export const backupApi = {
  exportData: async (): Promise<ExportBackupData> => {
    // Export endpoint directly returns ExportBackupData JSON
    const res = await api.get<ExportBackupData>('/backup/export');
    return res;
  },

  importData: async (
    payload: any
  ): Promise<{ importedCounts: Record<string, number>; message: string }> => {
    const res = await api.post<
      ApiResponse<{ importedCounts: Record<string, number>; message: string }>
    >('/backup/import', payload);
    return res.data;
  },
};
