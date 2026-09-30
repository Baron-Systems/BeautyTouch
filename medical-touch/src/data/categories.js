export const categories = [
  {
    id: 'offers',
    name: 'العروض',
    slug: 'offers',
    sortOrder: -4,
    hasSubcategories: false,
  },
  {
    id: 'new',
    name: 'جديدنا',
    slug: 'new',
    sortOrder: -3,
    hasSubcategories: false,
  },
  {
    id: 'bestsellers',
    name: 'الأكثر مبيعاً',
    slug: 'bestsellers',
    sortOrder: -2,
    hasSubcategories: false,
  },
  {
    id: 'packages',
    name: 'البكجات',
    slug: 'packages',
    sortOrder: -1,
    hasSubcategories: false,
  },
  {
    id: 'skincare',
    name: 'العناية بالبشرة',
    slug: 'skincare',
    sortOrder: 0,
    hasSubcategories: false,
  },
  {
    id: 'haircare',
    name: 'العناية بالشعر',
    slug: 'haircare',
    sortOrder: 1,
    hasSubcategories: false,
  },
  {
    id: 'face-masks',
    name: 'ماسكات الوجه',
    slug: 'face-masks',
    sortOrder: 2,
    hasSubcategories: false,
  },
  {
    id: 'eye-care',
    name: 'العناية بمحيط العين',
    slug: 'eye-care',
    sortOrder: 3,
    hasSubcategories: false,
  },
  {
    id: 'bodycare',
    name: 'العناية بالجسم',
    slug: 'bodycare',
    sortOrder: 4,
    hasSubcategories: false,
  },
  {
    id: 'creams',
    name: 'الكريمات والسيرومات',
    slug: 'creams',
    sortOrder: 5,
    hasSubcategories: false,
  },
  {
    id: 'sunscreen',
    name: 'واقيات الشمس',
    slug: 'sunscreen',
    sortOrder: 6,
    hasSubcategories: false,
  },
  {
    id: 'face-wash',
    name: 'غسولات الوجه',
    slug: 'face-wash',
    sortOrder: 7,
    hasSubcategories: false,
  },
  {
    id: 'devices',
    name: 'أجهزة التجميل',
    slug: 'devices',
    sortOrder: 8,
    hasSubcategories: false,
  },
  {
    id: 'aftercare',
    name: 'العناية بعد الإجراءات',
    slug: 'aftercare',
    sortOrder: 9,
    hasSubcategories: false,
  },
  {
    id: 'injections',
    name: 'الحقن التجميلية',
    slug: 'injections',
    sortOrder: 10,
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
    id: 'clinic-supplies',
    name: 'مستلزمات العيادات',
    slug: 'clinic-supplies',
    sortOrder: 11,
    hasSubcategories: false,
  },
]

export const getCategoryBySlug = (slug) => categories.find((c) => c.slug === slug)
export const getSubcategoryBySlug = (categorySlug, subSlug) => {
  const cat = getCategoryBySlug(categorySlug)
  if (!cat || !cat.subcategories) return null
  return cat.subcategories.find((s) => s.slug === subSlug)
}
