import { useEffect, useState } from 'react'
import axios from 'axios'
import { createFileRoute } from '@tanstack/react-router'
import { Listbox } from '@headlessui/react'

export const Route = createFileRoute('/_private/faq/')({
  component: FaqPage,
})

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  isActive?: boolean
}

function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: '', // 🔹 novo campo
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const api = axios.create({
    baseURL: 'http://localhost:3001',
  })

  useEffect(() => {
    document.title = "Página de FAQ";
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.patch(`/faq/${editingId}`, form)
      } else {
        await api.post('/faq', form)
      }
      setForm({ question: '', answer: '', category: '' })
      setEditingId(null)
      fetchFaqs()
    } catch (err) {
      console.error('Erro ao salvar FAQ:', err)
    }
  }

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

  const handleEdit = (faq: Faq) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
    })
    setEditingId(faq.id)
  }

  // 🔹 Enum de categories — deve corresponder ao enum do NestJS
  const categories = ['assistência', 'pagamento', 'cobertura']

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

      {/* 🆕 Campo de category */}
      <div>
        <label className="block text-gray-700 mb-1">Categoria</label>
        <Listbox
          value={form.category}
          onChange={(value) => setForm({ ...form, category: value })}
        >
          <div className="relative">
            <Listbox.Button className="w-full border rounded p-2 text-left bg-white">
              {form.category || 'Selecione uma categoria'}
            </Listbox.Button>
            <Listbox.Options className="absolute w-full mt-1 bg-white border rounded shadow-lg z-50">
              {categories.map((cat) => (
                <Listbox.Option
                  key={cat}
                  value={cat}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {cat}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {editingId ? 'Salvar Alterações' : 'Adicionar FAQ'}
      </button>
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
                <p className="text-sm text-gray-500 italic">categoria: {faq.category}</p>
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
