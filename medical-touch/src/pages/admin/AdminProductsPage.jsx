import React, { useState, useEffect, useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, Search, GripVertical, Package, ChevronLeft, FolderOpen,
} from 'lucide-react'
import { storage } from '../../services/storage.js'
import ProductFormModal from './ProductFormModal.jsx'

/* ─── Sortable Category Row ─── */
function SortableCategoryRow({ category, productCount, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat-${category.id}`, data: { type: 'category' }, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="group flex items-center gap-4 px-4 py-4 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-transparent hover:border-gold/20">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="w-10 h-10 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing text-black-light hover:text-gold hover:bg-gold-50 transition-colors shrink-0"
          aria-label="سحب القسم"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Clickable area */}
        <Link
          to={`/admin/products/category/${category.id}`}
          className="flex items-center gap-4 flex-1 min-w-0"
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center shrink-0 group-hover:bg-gold-100 transition-colors">
            <FolderOpen className="w-6 h-6 text-gold" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-black group-hover:text-gold transition-colors truncate">
              {category.name}
            </h3>
            <p className="text-sm text-black-light mt-0.5">
              {productCount} منتج
            </p>
          </div>
        </Link>

        {/* Arrow */}
        <Link to={`/admin/products/category/${category.id}`} className="shrink-0">
          <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-gold group-hover:-translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  )
}

/* ─── Drag Overlay Category ─── */
function DragOverlayCategory({ category, productCount }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white rounded-card shadow-xl border border-gold/30 opacity-90">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-gold bg-gold-50">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center">
        <FolderOpen className="w-6 h-6 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-black truncate">{category.name}</h3>
        <p className="text-sm text-black-light mt-0.5">{productCount} منتج</p>
      </div>
      <ChevronLeft className="w-5 h-5 text-gray-300" />
    </div>
  )
}

/* ─── Main Page ─── */
export default function AdminProductsPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDragItem, setActiveDragItem] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)

  const isSearching = searchQuery.trim().length > 0

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [cats, prods] = await Promise.all([storage.getCategories(), storage.getAdminProducts()])
        if (!mounted) return
        const realCategories = cats
          .filter((c) => !['offers', 'new', 'bestsellers'].includes(c.slug))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        setCategories(realCategories)
        setProducts(prods)
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const productCountByCategory = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      const cat = categories.find((c) => c.slug === p.category)
      if (cat) {
        map[cat.id] = (map[cat.id] || 0) + 1
      }
    })
    return map
  }, [categories, products])

  const visibleCategories = useMemo(() => {
    if (!isSearching) return categories
    const query = searchQuery.toLowerCase()
    return categories.filter((cat) => cat.name.toLowerCase().includes(query))
  }, [categories, searchQuery, isSearching])

  const categoryIds = useMemo(() => visibleCategories.map((c) => `cat-${c.id}`), [visibleCategories])

  /* ─── DnD ─── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const findCategoryBySortableId = useCallback((sid) => categories.find((c) => `cat-${c.id}` === sid), [categories])

  const handleDragStart = useCallback((event) => {
    const { active } = event
    const id = active.id
    if (String(id).startsWith('cat-')) {
      const category = findCategoryBySortableId(id)
      setActiveDragItem({ type: 'category', data: category })
    }
  }, [findCategoryBySortableId])

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    setActiveDragItem(null)
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId || !activeId.startsWith('cat-') || !overId.startsWith('cat-')) return

    const oldIndex = categories.findIndex((c) => `cat-${c.id}` === activeId)
    const newIndex = categories.findIndex((c) => `cat-${c.id}` === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const nextCategories = arrayMove(categories, oldIndex, newIndex)
    setCategories(nextCategories)

    const ids = nextCategories.map((c) => c.id)
    const result = await storage.reorderCategories(ids)
    if (!result.success) setCategories(categories)
  }, [categories])

  const dropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-black">إدارة المنتجات</h1>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث عن قسم..." className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" dir="rtl" />
            </div>
            <button onClick={() => setShowProductModal(true)} className="btn-gold flex items-center gap-2 text-sm px-4 py-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>إضافة منتج</span>
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light mb-4">لا توجد أقسام</p>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light">لا توجد أقسام مطابقة للبحث</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy} disabled={isSearching}>
              <div className="space-y-3">
                {visibleCategories.map((category) => (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    productCount={productCountByCategory[category.id] || 0}
                    disabled={isSearching}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem && activeDragItem.type === 'category' && activeDragItem.data ? (
                <DragOverlayCategory
                  category={activeDragItem.data}
                  productCount={productCountByCategory[activeDragItem.data.id] || 0}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSaved={async () => {
          const prods = await storage.getAdminProducts()
          setProducts(prods)
        }}
      />
    </>
  )
}
