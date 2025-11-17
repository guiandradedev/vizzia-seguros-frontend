import { useState, useEffect } from 'react';
import { insuranceService } from '@/services/insurance';
import type { Insurance } from '@/types/api';

export const usePendingInsurances = () => {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await insuranceService.getPendingInsurances();

      // Validar e filtrar dados para garantir que temos objetos válidos
      const validInsurances = Array.isArray(data) ? data.filter((insurance: any) =>
        insurance &&
        typeof insurance === 'object' &&
        insurance.id_insurance
      ) : [];

      setInsurances(validInsurances);
    } catch (err) {
      setError('Erro ao carregar seguros pendentes');
      console.error('Error fetching pending insurances:', err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateInsurance = async (id_insurance: number, status: 'Approved' | 'Denied') => {
    try {
      await insuranceService.evaluateInsurance({ id_insurance, status });
      // Remove o seguro da lista após avaliação
      setInsurances(prev => prev.filter(insurance => insurance.id_insurance !== id_insurance));
    } catch (err) {
      console.error('Error evaluating insurance:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  return {
    insurances,
    loading,
    error,
    refetch: fetchInsurances,
    evaluateInsurance,
  };
};