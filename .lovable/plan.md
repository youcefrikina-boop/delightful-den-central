## نظرة عامة
الملف المرفوع `dafatek-home-hub-main.zip` يحتوي على مشروع **CRM لإدارة خدمات السباكة والتدفئة والسخانات** مبني بنفس الإطار الحالي (TanStack Start + React 19 + Tailwind v4 + Supabase). الهيكل متطابق تماماً مع القالب الحالي، لذا إعادة البناء تتم بنسخ الملفات وتطبيق قاعدة البيانات.

## مكونات المشروع المكتشفة
- **التوجيه:** `/auth`, `/reset-password`, و `_authenticated` (محمي) مع الصفحة الرئيسية للتطبيق.
- **الواجهة:** `AppShell` متعدد التبويبات بثلاث لغات (عربي/فرنسي/إنجليزي) عبر `src/lib/i18n.ts`.
- **التبويبات:** `QuickEntryForm` (إدخال سريع)، `CustomersGrid` (شبكة الزبائن)، `DailySchedule` (جدول اليوم)، `RadarDispatcher` (الرادار)، `FaultSearch` (بحث الأعطال)، `Accounting` (المحاسبة)، `Statistics` (الإحصاءات)، `ArchivesTimeline` (الأرشيف)، `DataTable`.
- **البطاقات/المكونات:** `CustomerCard`, `PaymentCard`, `WarrantyCard`, `TasksChecklist`, `MaintenanceClock`, `HealthyRunTime`, `AppointmentBadge`, `GpsButton`, `DailyPlanToggle`, `RichDuration`.
- **المنطق:** `brandModels`, `faultCodes`, `payment`, `duration`, `visitNaming`, `calculateTempsAttente`, `seedData`, `crmCloud` + `CRMProvider`.
- **قاعدة البيانات (migration جاهز):**
  - `app_role` enum: `admin | technician | secretary`
  - جداول: `profiles`, `user_roles`, `crm_records` (JSONB)، `crm_settings`
  - دالة `has_role` SECURITY DEFINER + سياسات RLS + تريغر `handle_new_user` لإنشاء profile + دور admin افتراضي.

## خطوات التنفيذ
1. **تفعيل Lovable Cloud** (Supabase) للمشروع.
2. **حذف الملفات المتعارضة** في القالب الحالي: `src/routes/index.tsx` و `src/routeTree.gen.ts` (سيُعاد توليده).
3. **نسخ كامل محتوى `src/`** من الـ zip فوق `src/` الحالي (مع تخطّي أي `.git`):
   - `src/routes/` (auth, reset-password, _authenticated/*)
   - `src/components/` (AppShell, tabs/*, cards/*, ui/* الكاملة)
   - `src/context/CRMProvider.tsx`
   - `src/lib/` (i18n, types, brandModels, faultCodes, payment, duration, visitNaming, calculateTempsAttente, seedData, crmCloud)
   - `src/integrations/supabase/*` (client, client.server, auth-attacher, auth-middleware, types)
   - `src/start.ts`, `src/router.tsx`, `src/styles.css`
4. **تثبيت الحزم الجديدة** المطلوبة (مقارنة بـ package.json الحالي): `@hookform/resolvers`, `@supabase/supabase-js`, `@lovable.dev/cloud-auth-js`, `react-hook-form`, `zod`، وأي مكونات Radix غير موجودة.
5. **تطبيق Migration SQL** لإنشاء الجداول والـ RLS والتريغرات.
6. **التحقق:** التأكد من بناء المشروع، صفحة `/auth` تعمل، التسجيل ينشئ profile + دور admin، الواجهة الرئيسية تعرض التبويبات.

## ملاحظات
- المشروع باللغة العربية كلغة افتراضية مع دعم RTL.
- التخزين يعتمد على JSONB لحقل `data` في `crm_records` للحفاظ على شكل `CRMRecord` الكامل دون كسر الواجهة.
- أول مستخدم يسجّل يحصل تلقائياً على دور **admin**.

هل أتابع تنفيذ الخطة؟
