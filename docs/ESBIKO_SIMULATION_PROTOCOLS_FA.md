# پروتکل‌ها و نقشه راه شبیه‌سازی‌های اسبیکو

نسخه: 1.0

پروژه: Science Web Lab / Esbiko

وضعیت: سند زنده (Living Document)

---

# هدف این سند

این سند مرجع اصلی توسعه شبیه‌سازی‌های اسبیکو است.

این سند مشخص می‌کند:

* چه چیزهایی واقعاً اجباری هستند
* چه چیزهایی استاندارد توسعه هستند
* قوانین طراحی Responsive و Mobile Friendly چیست
* چگونه باید شبیه‌سازی‌های جدید ساخته شوند
* مسیر آینده بهبود شبیه‌سازی‌ها چیست

این فایل باید اولین سندی باشد که هر توسعه‌دهنده یا AI Agent قبل از کار روی شبیه‌سازی‌ها مطالعه می‌کند.

---

# بخش اول — پروتکل‌های واقعاً اجباری

موارد این بخش توسط Runtime فعلی برنامه اعمال می‌شوند.

فقط قوانینی در این بخش قرار می‌گیرند که توسط خود برنامه enforce شده باشند.

---

## 1. مسیر استاندارد اجرای شبیه‌سازی

تمام شبیه‌سازی‌ها از مسیر زیر اجرا می‌شوند:

/experiments/:id/run

هیچ شبیه‌سازی نباید مسیر عمومی مستقل خودش را ایجاد کند.

---

## 2. الزام ثبت در Registry

هر شبیه‌سازی باید در:

simulationRegistry

ثبت شده باشد.

اگر شبیه‌سازی در Registry وجود نداشته باشد، Runtime قادر به اجرای آن نخواهد بود.

---

## 3. بارگذاری Lazy

تمام شبیه‌سازی‌های ثبت‌شده توسط:

lazyWithRetry()

بارگذاری می‌شوند.

مزایا:

* کاهش حجم اولیه برنامه
* پایداری بیشتر بعد از Deploy
* بازیابی خطاهای Chunk Loading

---

## 4. استفاده از Runtime مشترک

تمام شبیه‌سازی‌های ثبت‌شده داخل:

SimulationLayout

رندر می‌شوند.

این موضوع یک Wrapper مشترک برای اجرای Simulationها ایجاد می‌کند.

توجه:

این به معنی استفاده همه شبیه‌سازی‌ها از SimulationShell نیست.

---

## 5. استفاده از Suspense

تمام شبیه‌سازی‌های ثبت‌شده داخل React Suspense اجرا می‌شوند.

این باعث می‌شود زمان بارگذاری Simulation یک وضعیت Loading استاندارد وجود داشته باشد.

---

## 6. Simulation Error Boundary

تمام مسیرهای اجرای Simulation توسط:

SimulationBoundary

و

SimulationErrorBoundary

محافظت می‌شوند.

هدف:

خرابی یک Simulation نباید باعث Crash شدن کل برنامه شود.

---

## 7. ثبت آمار بازدید

هر بار که یک Simulation معتبر اجرا شود:

trackExperimentView(id)

فراخوانی می‌شود.

هدف:

ثبت آمار و تحلیل استفاده از Simulationها.

---

# بخش دوم — استانداردهای توسعه

این موارد هنوز توسط Runtime اجبار نمی‌شوند.

اما باید در تمام توسعه‌های جدید رعایت شوند.

---

## 1. استاندارد شناسه شبیه‌سازی

فرمت:

subject.category.simulation-name

مثال:

physics.mechanics.projectile-motion

astronomy.space.earth-orbit-lab

بعد از انتشار عمومی، شناسه Simulation نباید تغییر کند.

---

## 2. جداسازی Physics از UI

کدهای فیزیک باید از رابط کاربری جدا باشند.

ساختار پیشنهادی:

physics/

components/

hooks/

overlays/

از مخلوط کردن Physics و React UI خودداری شود.

---

## 3. پاکسازی منابع

در زمان Unmount شدن Simulation باید:

* Animation Loopها
* Timerها
* Intervalها
* Event Listenerها
* Audio Contextها

متوقف یا پاکسازی شوند.

---

## 4. سلامت Build

قبل از Merge شدن هر تغییر:

npm run build

باید بدون خطا اجرا شود.

---

# بخش سوم — استاندارد Responsive و Mobile Friendly

وضعیت:

استاندارد رسمی برای تمام توسعه‌های جدید و بهبودهای آینده.

---

## اصل اساسی

هر شبیه‌سازی می‌تواند:

* Layout مخصوص خود را داشته باشد
* Control Panel مخصوص خود را داشته باشد
* HUD مخصوص خود را داشته باشد

اما:

همه شبیه‌سازی‌ها باید روی موبایل قابل استفاده باشند.

---

## قوانین اصلی

تمام شبیه‌سازی‌ها باید:

* Horizontal Scroll ایجاد نکنند
* Stage اصلی را قابل مشاهده نگه دارند
* برای Touch مناسب باشند
* در Portrait کار کنند
* در صورت نیاز در Landscape کار کنند
* HUD قابل مخفی شدن داشته باشند
* Control Panel قابل مخفی شدن داشته باشند
* متن خوانا داشته باشند
* Overlay بیش از حد نداشته باشند

---

## استاندارد کنترل‌های لمسی

حداقل اندازه قابل لمس:

44px × 44px

دکمه‌های مهم نباید کوچک باشند.

---

## استاندارد HUD

HUD باید:

* خوانا باشد
* قابل مخفی شدن باشد
* روی محتوای اصلی شبیه‌سازی سایه نیندازد

---

## استاندارد نمودارها

نمودارها نباید فضای اصلی Simulation را نابود کنند.

در موبایل بهتر است از:

* Tabs
* Drawer
* Bottom Sheet
* Collapsible Panels

استفاده شود.

---

## قوانین شبیه‌سازی‌های سه‌بعدی

مثال:

* Orbit Lab
* Solar System
* Satellites & Telescopes

پیشنهادها:

* پشتیبانی از Landscape
* HUD پیشرفته به صورت پیش‌فرض مخفی باشد
* کنترل‌ها ساده‌تر باشند
* تعداد Labelها محدود باشد

---

# بخش چهارم — نقشه راه Responsive

---

## فاز اول

مستندسازی

نگهداری و به‌روزرسانی همین سند.

---

## فاز دوم

ممیزی Responsive

برای تمام Simulationها ثبت شود:

* شناسه Simulation
* وضعیت موبایل
* وضعیت Landscape
* پیچیدگی HUD
* پیچیدگی Control Panel
* اولویت اصلاح

---

## فاز سوم

ایجاد کامپوننت‌های Responsive مشترک

ساخت:

ResponsiveSimulationFrame

MobileControlDrawer

SimulationTabs

useIsMobile

هدف:

کاهش توسعه تکراری و استانداردسازی رفتار موبایل.

---

## فاز چهارم

بهبود Generatorها

Templateهای ساخت Simulation باید به‌روزرسانی شوند.

Simulationهای جدید باید از ابتدا:

* Responsive باشند
* Mobile Friendly باشند
* Control Panel قابل Collapse داشته باشند

---

## فاز پنجم

بهبود Simulationهای موجود

ترتیب پیشنهادی:

1. Earth Orbit Lab

2. Solar System

3. Doppler Effect

4. Projectile Motion

5. Gravity Simulations

6. Gyroscope

7. Satellites & Telescopes

8. Optics Simulations

9. Wave Simulations

10. سایر Simulationها

تمرکز اولیه:

* Layout
* Controls
* HUD
* Labels
* Usability

تا حد امکان Physics تغییر نکند.

---

## فاز ششم

اعتبارسنجی خودکار

در آینده باید Script زیر ایجاد شود:

npm run mobile:check

وظیفه آن:

* تشخیص عرض ثابت
* تشخیص Horizontal Overflow
* تشخیص تغییر مستقیم Body Style
* تشخیص پنل‌های غیر Responsive
* تشخیص Overlayهای خطرناک

---

## فاز هفتم

چک‌لیست Pull Request

قبل از Merge:

دسکتاپ:

* بدون مشکل کار کند

موبایل Portrait:

* بدون مشکل کار کند

موبایل Landscape:

* در صورت نیاز بدون مشکل کار کند

Controls:

* Touch Friendly باشند

HUD:

* قابل Collapse باشد

Build:

* بدون خطا پاس شود

Simulation Registry:

* معتبر باشد

---

# هدف نهایی

اسبیکو باید به سیستمی تبدیل شود که:

* برای دسکتاپ مناسب باشد
* برای تبلت مناسب باشد
* برای موبایل مناسب باشد
* به عنوان PWA قابل استفاده باشد
* برای توسعه‌دهندگان استاندارد باشد
* برای AI Agentها قابل فهم باشد

و در عین حال کیفیت علمی و دقت شبیه‌سازی‌ها حفظ شود.
