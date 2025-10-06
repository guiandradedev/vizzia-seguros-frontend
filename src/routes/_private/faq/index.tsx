import { useEffect, useState } from 'react'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/faq/')({
  component: FaqPage,
})

interface Faq {
  id: string
  question: string
  answer: string
  isActive?: boolean
}

function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ question: '', answer: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const api = axios.create({
    baseURL: 'http://localhost:3001', // ajuste para o endereço real da sua API Nest
  })

  // 🔹 Carrega todos os FAQs
  const fetchFaqs = async () => {
    try {
      const res = await api.get('/faq')
      setFaqs(res.data)
    } catch (err) {
      console.error('Erro ao carregar FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  // 🔹 Adiciona ou edita um FAQ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.patch(`/faq/${editingId}`, form)
      } else {
        await api.post('/faq', form)
      }
      setForm({ question: '', answer: '' })
      setEditingId(null)
      fetchFaqs()
    } catch (err) {
      console.error('Erro ao salvar FAQ:', err)
    }
  }

  // 🔹 Exclui FAQ
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este FAQ?')) {
      try {
        await api.delete(`/faq/${id}`)
        fetchFaqs()
      } catch (err) {
        console.error('Erro ao excluir FAQ:', err)
      }
    }
  }

  // 🔹 Preenche o formulário para edição
  const handleEdit = (faq: Faq) => {
    setForm({ question: faq.question, answer: faq.answer })
    setEditingId(faq.id)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">FAQs cadastrados</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Pergunta</label>
          <input
            type="text"
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            className="w-full border rounded p-2"
            required
            minLength={20}
            maxLength={150}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Resposta</label>
          <textarea
            value={form.answer}
            onChange={e => setForm({ ...form, answer: e.target.value })}
            className="w-full border rounded p-2"
            required
            minLength={20}
            maxLength={150}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Salvar Alterações' : 'Adicionar FAQ'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ question: '', answer: '' })
              setEditingId(null)
            }}
            className="ml-3 text-gray-600 underline"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista de FAQs */}
      {loading ? (
        <p>Carregando...</p>
      ) : faqs.length === 0 ? (
        <p>Nenhum FAQ cadastrado.</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map(faq => (
            <li key={faq.id} className="border rounded p-4">
              <div className="max-w-full">
                <p className="font-semibold text-gray-800 break-words">{faq.question}</p>
                <p className="text-gray-600 break-words">{faq.answer}</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleEdit(faq)} className="text-blue-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:underline">
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

      )}
    </div>
  )
}
