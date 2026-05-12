/**
 * ScanHistoryRepository Interface
 * Contrato para implementação da persistência de resultados
 */

import { ScanResult } from '../entities/scan-result.entity';

export interface IScanHistoryRepository {
  create(scan: ScanResult): Promise<ScanResult>;
  findById(id: string): Promise<ScanResult | null>;
  findByUserId(userId: number): Promise<ScanResult[]>;
  update(id: string, scan: Partial<ScanResult>): Promise<ScanResult>;
  delete(id: string): Promise<boolean>;
}
