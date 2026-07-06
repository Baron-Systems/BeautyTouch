export const categories = [
  {
    id: 'offers',
    name: 'العروض',
    slug: 'offers',
    hasSubcategories: false,
  },
  {
    id: 'new',
    name: 'جديدنا',
    slug: 'new',
    hasSubcategories: false,
  },
  {
    id: 'bestsellers',
    name: 'الأكثر مبيعاً',
    slug: 'bestsellers',
    hasSubcategories: false,
  },
  {
    id: 'injections',
    name: 'الحقن التجميلية',
    slug: 'injections',
    hasSubcategories: true,
    subcategories: [
      { id: 'filler', name: 'فيلر', slug: 'filler' },
      { id: 'botox', name: 'بوتكس', slug: 'botox' },
      { id: 'skin-booster', name: 'سكين بوستر', slug: 'skin-booster' },
      { id: 'mesotherapy', name: 'ميزوثيرابي', slug: 'mesotherapy' },
      { id: 'collagen', name: 'محفزات الكولاجين', slug: 'collagen' },
    ],
  },
  {
    id: 'skincare',
    name: 'العناية بالبشرة',
    slug: 'skincare',
    hasSubcategories: false,
  },
  {
    id: 'bodycare',
    name: 'العناية بالجسم',
    slug: 'bodycare',
    hasSubcategories: false,
  },
  {
    id: 'haircare',
    name: 'العناية بالشعر',
    slug: 'haircare',
    hasSubcategories: false,
  },
  {
    id: 'sunscreen',
    name: 'واقيات الشمس',
    slug: 'sunscreen',
    hasSubcategories: false,
  },
  {
    id: 'creams',
    name: 'الكريمات والسيرومات',
    slug: 'creams',
    hasSubcategories: false,
  },
  {
    id: 'devices',
    name: 'أجهزة التجميل',
    slug: 'devices',
    hasSubcategories: false,
  },
  {
    id: 'clinic-supplies',
    name: 'مستلزمات العيادات',
    slug: 'clinic-supplies',
    hasSubcategories: false,
  },
  {
    id: 'brands',
    name: 'الماركات',
    slug: 'brands',
    hasSubcategories: false,
  },
  {
    id: 'aftercare',
    name: 'العناية بعد الإجراءات',
    slug: 'aftercare',
    hasSubcategories: false,
  },
]

export const getCategoryBySlug = (slug) => categories.find((c) => c.slug === slug)
export const getSubcategoryBySlug = (categorySlug, subSlug) => {
  const cat = getCategoryBySlug(categorySlug)
  if (!cat || !cat.subcategories) return null
  return cat.subcategories.find((s) => s.slug === subSlug)
}
