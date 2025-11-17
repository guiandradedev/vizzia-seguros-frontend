import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePendingInsurances } from '@/hooks/usePendingInsurances'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getBrandName } from '@/lib/vehicleBrands'
import type { Insurance } from '@/types/api'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_private/dashboard/insurance/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { insurances, loading, error, evaluateInsurance } = usePendingInsurances()
  const [evaluatingIds, setEvaluatingIds] = useState<Set<number>>(new Set())

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEvaluate = async (id_insurance: number, status: 'Approved' | 'Denied') => {
    setEvaluatingIds(prev => new Set(prev).add(id_insurance))

    try {
      await evaluateInsurance(id_insurance, status)
    } catch (error) {
      console.error('Erro ao avaliar seguro:', error)
      // Aqui você pode adicionar um toast de erro
    } finally {
      setEvaluatingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id_insurance)
        return newSet
      })
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'approved':
        return 'approved'
      case 'denied':
        return 'denied'
      case 'cancel':
        return 'cancel'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendente'
      case 'approved':
        return 'Aprovado'
      case 'denied':
        return 'Negado'
      case 'cancel':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando seguros pendentes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Avaliação de Seguros</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as solicitações de seguro pendentes de aprovação
        </p>
      </div>

      {insurances.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum seguro pendente
          </h3>
          <p className="text-gray-600">
            Todos os seguros foram avaliados ou não há solicitações pendentes.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Valor Estimado</TableHead>
                <TableHead>Data de Solicitação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurances.map((insurance: Insurance) => (
                <TableRow key={insurance.id_insurance}>
                  <TableCell className="font-medium">
                    #{insurance.id_insurance}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {insurance.vehicle ? `${getBrandName(insurance.vehicle.brand)} ${insurance.vehicle.model || ''}` : 'Veículo não informado'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {insurance.vehicle ? `${insurance.vehicle.plate || '—'} • ${insurance.vehicle.year || '—'}` : '—'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {insurance.vehicle ? `${insurance.vehicle.color || '—'} • ${insurance.vehicle.odometer || '0'} km` : '—'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{insurance.user?.name || 'Nome não informado'}</div>
                      <div className="text-sm text-gray-600">{insurance.user?.email || 'Email não informado'}</div>
                      <div className="text-sm text-gray-600">
                        CNH: {insurance.user?.cnhNumber || 'Não informado'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {insurance.estimated_price ? formatCurrency(insurance.estimated_price) : '—'}
                  </TableCell>
                  <TableCell>
                    {insurance.created_at ? formatDate(insurance.created_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(insurance.status || 'pending')}>
                      {getStatusLabel(insurance.status || 'pending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEvaluate(insurance.id_insurance, 'Approved')}
                        disabled={evaluatingIds.has(insurance.id_insurance)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        {evaluatingIds.has(insurance.id_insurance) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEvaluate(insurance.id_insurance, 'Denied')}
                        disabled={evaluatingIds.has(insurance.id_insurance)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {evaluatingIds.has(insurance.id_insurance) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
