import api from "@/lib/axios";
import type { Insurance, InsuranceEvaluationRequest } from "@/types/api";

export const insuranceService = {
  // Buscar seguros pendentes
  async getPendingInsurances(): Promise<Insurance[]> {
    const response = await api.get('/insurance/pending');
    return response.data;
  },

  // Avaliar seguro (aprovar/negar)
  async evaluateInsurance(data: InsuranceEvaluationRequest): Promise<void> {
    await api.post('/insurance/evaluate', data);
  },
};