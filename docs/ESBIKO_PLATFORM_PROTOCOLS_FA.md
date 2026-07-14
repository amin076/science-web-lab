# پروتکل‌های پلتفرم اسبیکو

نسخه: 0.1

وضعیت: Audit Draft

پروژه: Science Web Lab / Esbiko

هدف: معماری، حاکمیت (Governance) و استانداردهای توسعه پلتفرم

---

# 1. هدف این سند

این سند پروتکل‌های فعلی و آینده پلتفرم Esbiko را تعریف می‌کند.

این سند قوانین را به چهار سطح تقسیم می‌کند:

* HARD ENFORCED
* SOFT ENFORCED
* DOCUMENTED ONLY
* MISSING / TO BE ADDED

این سند نهایی نیست و با Audit بخش‌های مختلف پروژه به‌روزرسانی خواهد شد.

---

# 2. تعریف وضعیت‌ها

## HARD ENFORCED

کد فعلی برنامه این قانون را واقعاً اعمال می‌کند.

اگر این قانون نقض شود، برنامه از اجرا جلوگیری می‌کند، خطا نمایش می‌دهد یا رفتار طبیعی سیستم مختل می‌شود.

---

## SOFT ENFORCED

این قانون در بخشی از پروژه رعایت شده است اما در همه قسمت‌ها تضمین نشده است.

---

## DOCUMENTED ONLY

این قانون فقط در مستندات یا توضیحات وجود دارد و Runtime آن را اجبار نمی‌کند.

---

## MISSING / TO BE ADDED

این قانون باید وجود داشته باشد اما هنوز پیاده‌سازی یا Enforcement قابل اعتماد ندارد.

---

# 3. پروتکل‌های هسته برنامه

## Providerهای اصلی برنامه

وضعیت: HARD ENFORCED

کل برنامه داخل Providerهای اصلی اجرا می‌شود:

* AuthProvider
* ThemeModeProvider
* HelmetProvider
* AppErrorBoundary
* Router

هدف:

* مدیریت احراز هویت
* مدیریت تم
* مدیریت SEO
* مدیریت خطاهای سراسری
* مدیریت مسیرها

---

## Error Boundary سراسری

وضعیت: HARD ENFORCED

برنامه از Error Boundary سراسری استفاده می‌کند تا خطاهای React باعث سفید شدن کل صفحه نشوند.

---

## پروتکل Theme

وضعیت: HARD ENFORCED

کل برنامه از سیستم تم مشترک استفاده می‌کند.

تمام صفحات باید با سیستم تم مرکزی سازگار باشند.

---

## پروتکل SEO

وضعیت: HARD ENFORCED

برنامه از HelmetProvider استفاده می‌کند.

تمام صفحات باید عنوان و Metadata خود را از طریق سیستم مشترک SEO مدیریت کنند.

---

# 4. پروتکل‌های Routing

## React Router

وضعیت: HARD ENFORCED

تمام صفحات اصلی از طریق React Router مدیریت می‌شوند.

هیچ صفحه‌ای نباید خارج از معماری Routing ساخته شود.

---

## مسیرهای عمومی

وضعیت: HARD ENFORCED

نمونه‌ها:

* Home
* About
* Contact
* Login
* Register
* Experiments
* Experiment Details

---

## ProtectedRoute

وضعیت: HARD ENFORCED

برای ورود به صفحات محافظت‌شده باید کاربر Login باشد.

محدودیت فعلی:

فقط Login بودن را بررسی می‌کند و الزاماً نقش Teacher یا Student را بررسی نمی‌کند.

---

## AdminRoute

وضعیت: HARD ENFORCED

صفحات مدیریت از AdminRoute استفاده می‌کنند.

AdminRoute نقش Admin را از طریق Claims بررسی می‌کند.

---

## TeacherRoute

وضعیت: MISSING

باید ایجاد شود.

فقط Teacher و Admin باید بتوانند وارد صفحات مخصوص معلم شوند.

---

## StudentRoute

وضعیت: MISSING

باید ایجاد شود.

فقط نقش‌های مجاز باید بتوانند وارد صفحات دانش‌آموزی شوند.

---

# 5. پروتکل‌های احراز هویت و نقش‌ها

## Authentication

وضعیت: HARD ENFORCED

برای دسترسی به صفحات محافظت‌شده، Login الزامی است.

---

## نقش‌های رسمی سیستم

وضعیت: HARD ENFORCED

نقش‌های رسمی عبارت‌اند از:

* student
* teacher
* admin

نقش دیگری نباید استفاده شود.

---

## Role Claims

وضعیت: SOFT ENFORCED

بخش Admin از Claims استفاده می‌کند.

کنترل Teacher و Student هنوز کامل نیست.

---

## پروفایل کاربران

وضعیت: SOFT ENFORCED

پروفایل کاربران در Firestore وجود دارد.

اما قوانین همگام‌سازی و مالکیت هنوز نیاز به Audit دارند.

---

# 6. پروتکل‌های سیستم مدیریت

## محافظت Backend مدیریت

وضعیت: HARD ENFORCED

Cloud Functionهای مدیریتی قبل از اجرای عملیات حساس، نقش Admin را بررسی می‌کنند.

---

## مدیریت کاربران

وضعیت: HARD ENFORCED

مدیر می‌تواند نقش کاربران و وضعیت فعال بودن آن‌ها را تغییر دهد.

---

## حفاظت از آخرین مدیر

وضعیت: HARD ENFORCED

سیستم اجازه حذف یا غیرفعال کردن آخرین مدیر را نمی‌دهد.

---

## لاگ مدیریتی

وضعیت: HARD ENFORCED

برخی عملیات مدیریتی در adminLogs ثبت می‌شوند.

محدودیت فعلی:

هنوز مشخص نیست همه عملیات مدیریتی ثبت می‌شوند یا خیر.

---

## نسخه موبایل پنل مدیریت

وضعیت: MISSING / WEAK

پنل مدیریت بیشتر برای دسکتاپ طراحی شده است.

نیاز به بازطراحی Responsive دارد.

---

# 7. پروتکل‌های سیستم شبیه‌سازی

## مسیر استاندارد اجرای شبیه‌سازی

وضعیت: HARD ENFORCED

تمام شبیه‌سازی‌ها از مسیر:

/experiments/:id/run

اجرا می‌شوند.

---

## Simulation Registry

وضعیت: HARD ENFORCED

هر شبیه‌سازی باید در Registry ثبت شود.

---

## Lazy Loading

وضعیت: HARD ENFORCED

تمام Simulationهای ثبت‌شده از lazyWithRetry استفاده می‌کنند.

---

## SimulationLayout

وضعیت: HARD ENFORCED

تمام Simulationها داخل SimulationLayout اجرا می‌شوند.

---

## Suspense

وضعیت: HARD ENFORCED

تمام Simulationها داخل React Suspense بارگذاری می‌شوند.

---

## Simulation Error Boundary

وضعیت: HARD ENFORCED

تمام Simulationها توسط SimulationBoundary محافظت می‌شوند.

---

## ثبت بازدید Simulation

وضعیت: HARD ENFORCED

اجرای Simulation معتبر باعث ثبت بازدید می‌شود.

---

## SimulationShell

وضعیت: SOFT ENFORCED

فقط بخشی از Simulationها از SimulationShell استفاده می‌کنند.

SimulationShell استاندارد سراسری کل پروژه نیست.

---

## استاندارد موبایل Simulationها

وضعیت: MISSING

هنوز استاندارد اجباری برای Mobile Friendly بودن همه Simulationها وجود ندارد.

---

# 8. پروتکل‌های LMS و Classroom

## Teacher Dashboard

وضعیت: SOFT ENFORCED

وجود دارد اما نیاز به Audit دقیق‌تر دارد.

---

## Student Dashboard

وضعیت: SOFT ENFORCED

وجود دارد اما نیاز به Audit دقیق‌تر دارد.

---

## مالکیت کلاس‌ها

وضعیت: NOT FULLY VERIFIED

به نظر می‌رسد کلاس‌ها متعلق به Teacher هستند اما هنوز Audit کامل انجام نشده است.

---

## فرآیند عضویت در کلاس

وضعیت: SOFT ENFORCED

مکانیزم درخواست عضویت و تأیید وجود دارد.

نیاز به بررسی امنیت و دسترسی‌ها دارد.

---

## Assignment System

وضعیت: NOT FULLY VERIFIED

مالکیت، دسترسی و ارسال Assignmentها هنوز Audit نشده‌اند.

---

## فایل‌ها و ضمیمه‌ها

وضعیت: NOT FULLY VERIFIED

قوانین دسترسی Storage هنوز نیاز به بررسی کامل دارند.

---

# 9. پروتکل‌های امنیت Firestore

## User Documents

وضعیت: NOT FULLY VERIFIED

نیاز به Audit کامل Firestore Rules دارد.

---

## Experiment Stats

وضعیت: NOT FULLY VERIFIED

محدودیت‌های خواندن و نوشتن باید بررسی شوند.

---

## Classroom Rules

وضعیت: NOT FULLY VERIFIED

نیاز به Audit امنیتی مستقل دارد.

---

## Admin Collections

وضعیت: NOT FULLY VERIFIED

نیاز به بررسی کامل دسترسی‌ها دارد.

---

# 10. پروتکل‌های امنیت Storage

## Storage Rules

وضعیت: NOT FULLY VERIFIED

باید بررسی شوند:

* دسترسی Teacher
* دسترسی Student
* مالکیت فایل‌ها
* جلوگیری از دسترسی غیرمجاز

---

# 11. پروتکل‌های Analytics

## ثبت Page View

وضعیت: HARD ENFORCED

بازدید صفحات ثبت می‌شود.

---

## ثبت بازدید Simulation

وضعیت: HARD ENFORCED

اجرای Simulation ثبت می‌شود.

---

## Google Analytics

وضعیت: SOFT ENFORCED

فعال است اما نیاز به Audit بیشتر دارد.

---

## Microsoft Clarity

وضعیت: SOFT ENFORCED

فعال است اما مدیریت تنظیمات آن نیاز به بررسی دارد.

---

## Learning Analytics

وضعیت: MISSING

در آینده باید اضافه شود:

* فعالیت کلاس
* پیشرفت دانش‌آموز
* تکمیل Assignment
* فعالیت معلمان
* میزان استفاده از Simulationها

---

# 12. پروتکل‌های PWA

## Manifest

وضعیت: HARD ENFORCED

فایل Manifest وجود دارد.

---

## Service Worker

وضعیت: HARD ENFORCED

در Production ثبت می‌شود.

---

## Offline Experience

وضعیت: WEAK

نیاز به بهبود دارد.

---

## Install Experience

وضعیت: SOFT ENFORCED

برنامه قابل نصب است اما تجربه نصب نیاز به بهبود دارد.

---

# 13. پروتکل‌های Responsive و Mobile Friendly

## Responsive Design

وضعیت: SOFT ENFORCED

برخی صفحات Responsive هستند اما کل برنامه هنوز Mobile Friendly کامل نیست.

---

## Mobile UX برای Simulationها

وضعیت: MISSING

نیاز به استاندارد رسمی دارد.

---

## Mobile UX برای Admin

وضعیت: WEAK

نیاز به بازطراحی دارد.

---

## Mobile UX برای Dashboardها

وضعیت: SOFT ENFORCED

تا حدی Responsive هستند اما نیاز به Audit دارند.

---

## Accessibility

وضعیت: MISSING

نیاز به استاندارد رسمی برای:

* Keyboard Navigation
* Button Size
* Contrast
* Labels
* Focus State
* ARIA

---

# 14. پروتکل‌های Loading و Error

## Loading State

وضعیت: SOFT ENFORCED

در برخی صفحات وجود دارد.

---

## Empty State

وضعیت: SOFT ENFORCED

نیاز به استانداردسازی دارد.

---

## Error State

وضعیت: SOFT ENFORCED

وجود دارد اما یکپارچه نیست.

---

# 15. پروتکل‌های توسعه

## Build

وضعیت: SHOULD BE REQUIRED

تمام تغییرات باید:

npm run build

را با موفقیت پاس کنند.

---

## Simulation Validation

وضعیت: SHOULD BE REQUIRED

تمام تغییرات Simulation باید:

npm run sim:check

را پاس کنند.

---

## Mobile Validation

وضعیت: MISSING

در آینده:

npm run mobile:check

باید ایجاد شود.

---

## Security Validation

وضعیت: MISSING

باید برای Firestore و Storage ایجاد شود.

---

# 16. مهم‌ترین پروتکل‌های مفقود

1. TeacherRoute
2. StudentRoute
3. RoleGuard
4. Firestore Audit
5. Storage Audit
6. Classroom Ownership Protocol
7. Assignment Permission Protocol
8. Platform Responsive Standard
9. Simulation Mobile Standard
10. Admin Mobile Standard
11. Accessibility Standard
12. Loading / Empty / Error Standard
13. Mobile Validation Script
14. Security Review Checklist
15. Platform PR Checklist

---

# 17. مراحل بعدی Audit

نسخه بعدی این سند باید پس از بررسی موارد زیر به‌روزرسانی شود:

1. firestore.rules
2. storage.rules
3. Teacher Dashboard
4. Student Dashboard
5. Classroom Services
6. Enrollment Services
7. Assignment Services
8. Admin Pages
9. Contact System
10. PWA Files
11. Analytics Services

---

# 18. هدف نهایی

اسبیکو باید به پلتفرمی تبدیل شود که برای همه این بخش‌ها پروتکل مشخص داشته باشد:

* معماری برنامه
* Authentication
* Authorization
* LMS
* Classroom
* Simulation
* مدیریت
* Analytics
* PWA
* Responsive Design
* Accessibility
* Security
* Development Workflow

این سند اولین نسخه از قانون اساسی فنی پلتفرم Esbiko است.

<!-- JULY_2026_PROTOCOL_STATUS_FA -->
## وضعیت پیاده‌سازی پروتکل در ژوئیهٔ ۲۰۲۶

نخستین نسخهٔ عملیاتی و فقط‌خواندنی رابط عمومی پلتفرم اسبیکو در مخزن پروژه پیاده‌سازی شده است.

### نسخهٔ فعلی

`esbiko-platform-api.v1`

### قابلیت‌های فعلی

- بررسی سلامت سرویس.
- دریافت فهرست شبیه‌سازی‌ها.
- جست‌وجوی متنی.
- فیلتر بر اساس موضوع و قابلیت.
- محدودسازی تعداد نتایج.
- دریافت جزئیات یک شبیه‌سازی.

### روش ارتباط

درخواست‌های مسیر زیر توسط میزبانی فایربیس به تابع `platformApi` هدایت می‌شوند:

```text
/api/**
```

### محدودیت‌های امنیتی فعلی

- اجرای آزادانهٔ فرمان‌های سیستم مجاز نیست.
- عملیات نوشتن عمومی وجود ندارد.
- اطلاعات محرمانه و مسیرهای محلی نباید در پاسخ‌ها آشکار شوند.
- افزودن عملیات نوشتن فقط پس از طراحی احراز هویت، مجوزدهی، اعتبارسنجی، ثبت رویداد و کنترل تکرار درخواست مجاز است.

### اعتبارسنجی انجام‌شده

```bash
node scripts/test-platform-api.mjs
npm run build
```
