import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus, Pencil, Trash2, Power, Search, X, ChevronLeft, GripVertical, Package,
} from 'lucide-react'
import { storage } from '../../services/storage.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import ProductFormModal from './ProductFormModal.jsx'

/* ─── Admin Product Card (non-sortable view) ─── */
function AdminProductCard({ product, onToggle, onDelete, onImageClick, onEdit }) {
  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer" onClick={() => onImageClick?.(product.image)}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
          {product.isActive ? 'مفعّل' : 'غير مفعّل'}
        </span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-black leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-bold text-gold">{product.price} ₪</span>
          <span className="text-xs text-black-light">{product.costPrice ? `${product.costPrice} ₪` : '—'}</span>
        </div>
        <div className="text-[10px] text-black-light mb-3">التكلفة: {product.costPrice ? `${product.costPrice} ₪` : '—'}</div>
        <div className="mt-auto flex items-center justify-between gap-1 pt-2 border-t border-gray-100">
          <button onClick={() => onEdit?.(product.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-button text-xs font-medium text-black-light hover:text-gold hover:bg-gold-50 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
            <span>تعديل</span>
          </button>
          <button onClick={() => onToggle(product.id)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-button text-xs font-medium transition-colors ${product.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Power className="w-3.5 h-3.5" />
            <span>{product.isActive ? 'تعطيل' : 'تفعيل'}</span>
          </button>
          <button onClick={() => onDelete(product.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-button text-xs font-medium text-black-light hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Sortable Product Card ─── */
function SortableProductCard({ product, onToggle, onDelete, onImageClick, onEdit, disabled }) {
  const sortableId = String(product.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { type: 'product' },
    disabled,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
    touchAction: 'none',
  }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute top-2 left-2 z-10" style={{ touchAction: 'none' }}>
        <button
          {...attributes}
          {...listeners}
          className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing text-black-light hover:text-gold transition-colors"
          aria-label="سحب المنتج"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4 pointer-events-none" />
        </button>
      </div>
      <AdminProductCard product={product} onToggle={onToggle} onDelete={onDelete} onImageClick={onImageClick} onEdit={onEdit} />
    </div>
  )
}

/* ─── Main Page ─── */
export default function AdminCategoryProductsPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams()

  const [category, setCategory] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [activeDragItem, setActiveDragItem] = useState(null)
  const [productModal, setProductModal] = useState({ open: false, productId: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null })

  const isSearching = searchQuery.trim().length > 0

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [cats, prods] = await Promise.all([storage.getCategories(), storage.getAdminProducts()])
        if (!mounted) return
        const cat = cats.find((c) => String(c.id) === String(categoryId))
        if (!cat) {
          navigate('/admin/products')
          return
        }
        setCategory(cat)
        const catProducts = prods
          .filter((p) => p.category === cat.slug)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        setAllProducts(catProducts)
        setProducts(catProducts)
      } catch {
        navigate('/admin/products')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [categoryId, navigate])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts(allProducts)
      return
    }
    const query = searchQuery.toLowerCase()
    setProducts(allProducts.filter((p) => p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)))
  }, [searchQuery, allProducts])

  const reloadProducts = useCallback(async () => {
    if (!category) return
    const prods = await storage.getAdminProducts()
    const catProducts = prods
      .filter((p) => p.category === category.slug)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    setAllProducts(catProducts)
  }, [category])

  const openAddModal = useCallback(() => setProductModal({ open: true, productId: null }), [])
  const openEditModal = useCallback((id) => setProductModal({ open: true, productId: id }), [])
  const closeProductModal = useCallback(() => setProductModal({ open: false, productId: null }), [])

  const handleDelete = useCallback((id) => {
    const product = allProducts.find((p) => p.id === id) || products.find((p) => p.id === id)
    if (product) setDeleteModal({ open: true, product })
  }, [allProducts, products])

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.product) return
    await storage.deleteProduct(deleteModal.product.id)
    setAllProducts((prev) => prev.filter((p) => p.id !== deleteModal.product.id))
    setProducts((prev) => prev.filter((p) => p.id !== deleteModal.product.id))
    setDeleteModal({ open: false, product: null })
  }, [deleteModal.product])

  const handleToggle = useCallback(async (id) => {
    await storage.toggleProduct(id)
    setAllProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }, [])

  /* ─── DnD ─── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event) => {
    const { active } = event
    const product = products.find((p) => String(p.id) === String(active.id))
    if (product) {
      setActiveDragItem({ type: 'product', data: product })
    }
  }, [products])

  const productsRef = useRef(products)
  productsRef.current = products

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event
    setActiveDragItem(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    const current = productsRef.current
    const oldIndex = current.findIndex((p) => String(p.id) === activeId)
    const newIndex = current.findIndex((p) => String(p.id) === overId)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    const prevProducts = current
    // Move item AND rewrite sortOrder sequentially (0,1,2...) so nothing re-sorts it back
    const reordered = arrayMove(current, oldIndex, newIndex).map((p, idx) => ({
      ...p,
      sortOrder: idx,
    }))

    // Optimistic update — cards swap immediately
    setProducts(reordered)
    setAllProducts((prev) => [...prev.filter((p) => p.category !== category?.slug), ...reordered])

    const result = await storage.reorderProducts(reordered.map((p) => p.id))
    if (!result.success) {
      setProducts(prevProducts)
      setAllProducts((prev) => [...prev.filter((p) => p.category !== category?.slug), ...prevProducts])
    }
  }, [category])

  const dropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }
  const productIds = useMemo(() => products.map((p) => String(p.id)), [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!category) return null

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-black-light mb-6">
          <Link to="/admin/products" className="hover:text-gold transition-colors">إدارة المنتجات</Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-black font-medium">{category.name}</span>
        </nav>

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">{category.name}</h1>
            <p className="text-sm text-black-light mt-1">{products.length} منتج</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-light" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث في منتجات القسم..." className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" dir="rtl" />
            </div>
            <button onClick={openAddModal} className="btn-gold flex items-center gap-2 text-sm px-4 py-2 shrink-0">
              <Plus className="w-4 h-4" />
              <span>إضافة منتج</span>
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card shadow-card">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-black-light mb-4">
              {isSearching ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد منتجات في هذا القسم'}
            </p>
            {!isSearching && (
              <button onClick={openAddModal} className="btn-gold inline-block text-sm">إضافة منتج جديد</button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={productIds} strategy={rectSortingStrategy} disabled={isSearching}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <SortableProductCard
                    key={product.id}
                    product={product}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onImageClick={setSelectedImage}
                    onEdit={openEditModal}
                    disabled={isSearching}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem && activeDragItem.type === 'product' && activeDragItem.data ? (
                <div className="opacity-90">
                  <AdminProductCard product={activeDragItem.data} onToggle={() => {}} onDelete={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={productModal.open}
        productId={productModal.productId}
        defaultCategory={category.slug}
        onClose={closeProductModal}
        onSaved={reloadProducts}
      />

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, product: null })}
        onConfirm={confirmDelete}
        message="هل أنت متأكد من حذف هذا المنتج"
        itemName={deleteModal.product?.name}
      />

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)} role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/80" />
          <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-4 left-4 z-10 p-2 text-white hover:text-gold transition-colors" aria-label="إغلاق"><X className="w-6 h-6" /></button>
          <img src={selectedImage} alt="صورة المنتج" className="relative max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}
