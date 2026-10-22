
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, GitBranch, ShieldCheck,
  ClipboardCheck, Truck, Search, Bell, Plus, Milk,
  RefreshCw, ArrowLeft, Save, AlertCircle
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Batch Passport', icon: Package },
  { label: 'Batch Traceability', icon: GitBranch },
  { label: 'Quality Records', icon: ClipboardCheck },
  { label: 'Recall Management', icon: ShieldCheck },
  { label: 'Shipments', icon: Truck },
]

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [batches, setBatches] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const [form, setForm] = useState({
    batch_code: '',
    product_name: 'Raw Milk',
    production_date: new Date().toISOString().slice(0, 10),
    status: 'created',
    notes: '',
  })

  async function fetchBatches() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/batches`)
      if (!response.ok) throw new Error('Unable to fetch batches')
      setBatches(await response.json())
    } catch {
      setError('Cannot load batches. Make sure the backend terminal is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  async function createBatch(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API}/api/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          supplier_id: null,
          production_date: form.production_date || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Could not create batch')
      }

      setNotice(`Batch ${data.batch_code} was saved successfully.`)
      setForm({
        batch_code: '',
        product_name: 'Raw Milk',
        production_date: new Date().toISOString().slice(0, 10),
        status: 'created',
        notes: '',
      })
      await fetchBatches()
      setActivePage('Dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong while saving.')
    } finally {
      setSaving(false)
    }
  }

  const filteredBatches = batches.filter((batch) =>
    `${batch.batch_code} ${batch.product_name} ${batch.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="w-full shrink-0 bg-slate-950 p-5 text-white md:min-h-screen md:w-64">
        <div className="mb-9 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
            <Milk size={25} />
          </div>
          <div>
            <h1 className="text-xl font-bold">DairyTrace</h1>
            <p className="text-xs text-slate-400">Dairy batch traceability</p>
          </div>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActivePage(label)
                setError('')
                setNotice('')
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                activePage === label
                  ? 'bg-emerald-400 font-semibold text-slate-950'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-slate-800 p-4">
          <p className="text-sm font-semibold">Connected prototype</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Batch data is retrieved from the DairyTrace API.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">TRACE / Dairy supply chain</p>
            <h2 className="mt-1 text-3xl font-bold">{activePage}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Track every batch. Connect every record.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBatches} title="Refresh batches"
              className="rounded-xl border border-slate-200 bg-white p-3">
              <RefreshCw size={19} />
            </button>
            <Bell size={21} className="text-slate-500" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800">
              DT
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        {activePage === 'Dashboard' && (
          <>
            <section className="mb-6 rounded-2xl bg-emerald-950 p-7 text-white">
              <p className="text-sm text-emerald-200">DairyTrace · Prototype</p>
              <h3 className="mt-3 text-3xl font-bold">
                Every batch has a history.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100">
                Trace milk to paneer, review quality evidence, and identify
                downstream batches during a recall.
              </p>
              <button onClick={() => setActivePage('Batch Passport')}
                className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
                <Plus size={18} /> Create a batch
              </button>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Database batches', batches.length],
                ['Quality records', '—'],
                ['Linked products', '—'],
                ['Active recalls', '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {label === 'Database batches' ? 'From PostgreSQL' : 'Not implemented yet'}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Batch records</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Live records from your database
                  </p>
                </div>
                <button onClick={() => setActivePage('Batch Passport')}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                  <Plus size={16} /> New batch
                </button>
              </div>

              <div className="relative mb-5">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search batch code, product or status..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600" />
              </div>

              {loading ? (
                <p className="py-8 text-center text-slate-500">Loading batches...</p>
              ) : filteredBatches.length === 0 ? (
                <p className="py-8 text-center text-slate-500">No matching batches found.</p>
              ) : (
                <div className="space-y-3">
                  {filteredBatches.map((batch) => (
                    <div key={batch.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center gap-3">
                        <Package className="text-emerald-700" size={22} />
                        <div>
                          <p className="font-semibold">{batch.batch_code}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {batch.product_name} · {batch.supplier_id ? `Supplier #${batch.supplier_id}` : 'Supplier not assigned'}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {batch.production_date || 'Date not recorded'}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                        {batch.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Demo data is fictional. Traceability records do not guarantee food safety.
            </p>
          </>
        )}

        {activePage === 'Batch Passport' && (
          <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <button onClick={() => setActivePage('Dashboard')}
              className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft size={17} /> Back to dashboard
            </button>
            <h3 className="text-2xl font-bold">Create a new batch</h3>
            <p className="mt-2 mb-6 text-sm text-slate-500">
              Enter fictional demo details to create a database record.
            </p>

            <form onSubmit={createBatch} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Batch code *</label>
                <input required maxLength={80} value={form.batch_code}
                  onChange={(e) => setForm({ ...form, batch_code: e.target.value })}
                  placeholder="e.g. MILK-DEMO-002"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Product *</label>
                <select value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3">
                  <option>Raw Milk</option>
                  <option>Pasteurized Milk</option>
                  <option>Paneer</option>
                  <option>Curd</option>
                  <option>Ghee</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Production date</label>
                <input type="date" value={form.production_date}
                  onChange={(e) => setForm({ ...form, production_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <textarea rows={3} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional batch notes"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              </div>

              <button disabled={saving} type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                <Save size={18} /> {saving ? 'Saving...' : 'Save batch'}
              </button>
            </form>
          </section>
        )}

        {activePage !== 'Dashboard' && activePage !== 'Batch Passport' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="text-xl font-bold">{activePage}</h3>
            <p className="mt-2 text-sm text-slate-500">
              This section will be implemented in a later step.
            </p>
            <button onClick={() => setActivePage('Dashboard')}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-white">
              Back to dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
