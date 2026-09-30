import React, { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Search } from 'lucide-react'
import { storage } from '../../services/storage.js'

const statusMap = {
  pending: { label: 'قيد الانتظار', color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'تم التأكيد', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'تم الشحن', color: 'text-indigo-600 bg-indigo-50' },
  delivered: { label: 'تم التوصيل', color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'ملغي', color: 'text-red-600 bg-red-50' },
}

function formatDateInput(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AdminProfitsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [report, setReport] = useState({ revenue: 0, cost: 0, profit: 0, count: 0, byStatus: [], orders: [] })
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    setFrom(formatDateInput(firstDay))
    setTo(formatDateInput(now))
  }, [])

  const loadReport = async () => {
    setLoading(true)
    const data = await storage.getAdminProfitsReport(from, to)
    setReport(data)
    setLoading(false)
  }

  useEffect(() => {
    if (from && to) {
      loadReport()
    }
  }, [from, to])

  const average = report.count > 0 ? Math.round(report.revenue / report.count) : 0

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-black mb-6">تقرير الأرباح</h1>

        <div className="bg-white rounded-card shadow-card p-5 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-black mb-1.5">من تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-black mb-1.5">إلى تاريخ</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
                />
              </div>
            </div>
            <button
              onClick={loadReport}
              disabled={loading || !from || !to}
              className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'جاري التحميل...' : 'عرض التقرير'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-black-light py-12">جاري التحميل...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gold text-white rounded-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-80" />
                  <p className="text-sm opacity-90">صافي الربح</p>
                </div>
                <p className="text-3xl font-bold">{report.profit} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold text-black">{report.revenue} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">إجمالي التكلفة</p>
                <p className="text-3xl font-bold text-black">{report.cost} ₪</p>
              </div>
              <div className="bg-white rounded-card shadow-card p-5">
                <p className="text-sm text-black-light mb-2">عدد الطلبات</p>
                <p className="text-3xl font-bold text-black">{report.count}</p>
              </div>
            </div>

            {report.byStatus.length > 0 && (
              <div className="bg-white rounded-card shadow-card p-5 mb-6">
                <h2 className="font-bold text-black mb-4">تفاصيل حسب الحالة</h2>
                <div className="flex flex-wrap gap-3">
                  {report.byStatus.map((s) => {
                    const st = statusMap[s.status] || statusMap.pending
                    return (
                      <div key={s.status} className={`rounded-lg px-4 py-3 flex items-center gap-3 ${st.color}`}>
                        <div>
                          <p className="text-xs opacity-80">{st.label}</p>
                          <p className="font-bold">{s.profit} ₪ ربح</p>
                        </div>
                        <div className="text-xs font-medium opacity-70 text-left">
                          <p>{s.count} طلب</p>
                          <p>{s.revenue} ₪ إيراد</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {report.orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-card shadow-card">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-black-light">لا توجد أرباح في هذا النطاق الزمني</p>
              </div>
            ) : (
              <div className="bg-white rounded-card shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">#</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">العميل</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">التاريخ</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">الحالة</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">التكلفة</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">الربح</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-black">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {report.orders.map((order) => {
                        const st = statusMap[order.status] || statusMap.pending
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-black-light">{order.id}</td>
                            <td className="px-4 py-3 text-sm text-black">{order.customer_name}</td>
                            <td className="px-4 py-3 text-sm text-black-light">{new Date(order.created_at).toLocaleString('ar-SA')}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-black-light">{order.cost} ₪</td>
                            <td className="px-4 py-3 text-sm font-bold text-green-600">{order.profit} ₪</td>
                            <td className="px-4 py-3 text-sm font-bold text-gold">{order.revenue} ₪</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </>
  )
}
