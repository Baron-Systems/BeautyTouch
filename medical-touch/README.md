# Beauty Touch

Beauty Touch — متجر التجميل الطبي الفاخر. موقع تجارة إلكترونية عربي (RTL) بتصميم فاخر أبيض/ذهبي، يعمل كـ PWA ويدعم إدارة المنتجات عبر لوحة تحكم بسيطة.

## التقنية
- React 18 + Vite
- Tailwind CSS
- React Router (HashRouter)
- PWA (vite-plugin-pwa)
- localStorage لتخزين البيانات

## التشغيل
```bash
npm install
npm run dev
```

## البناء
```bash
npm run build
```

## المسارات
- `/` — الرئيسية
- `/category/:slug` — تصنيف المنتجات
- `/category/:slug/:subslug` — تصنيف فرعي
- `/product/:id` — تفاصيل المنتج
- `/cart` — سلة التسوق
- `/wishlist` — المفضلة
- `/admin/login` — تسجيل دخول المسؤول
- `/admin/products` — إدارة المنتجات
- `/admin/products/new` — إضافة منتج
- `/admin/products/edit/:id` — تعديل منتج

## بيانات الاعتماد
- كلمة مرور لوحة التحكم: `medical2024`

## طريقة الطلب
الطلبات ترسل عبر واتساب مباشرة إلى: `970595330105`

## المنتجات التجريبية
يتم إدراج 12 منتج تجريبي تلقائياً عند أول تشغيل.
