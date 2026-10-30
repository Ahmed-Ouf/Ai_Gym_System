# 🏋️‍♂️ نظام جيم الحلواني لإدارة الصالات الرياضية | AI Gym Management System

> **نظام ويب حديث وذكي لإدارة صالات الجيم والأندية الرياضية**  
> **A modern, intelligent web application for Gym & Fitness Center Management**

---

## 📖 أدلة وتوثيق النظام (System Documentation)

يتوفر دليل شامل ومبسط ومستقل لكل لغة:
- 🇸🇦 **[الدليل الشامل باللغة العربية (SYSTEM_OVERVIEW.md)](./SYSTEM_OVERVIEW.md)**
- 🇬🇧 **[Full Comprehensive Guide in English (SYSTEM_OVERVIEW.en.md)](./SYSTEM_OVERVIEW.en.md)**

---

## ✨ أبرز المزايا في سطور / Key Features

- ⚡ **تسجيل حضور في أقل من 3 ثوانٍ (Sub-3s Check-in):** بحث فوري مزدوج بالاسم أو برقم الهاتف.
- 🛡️ **حماية ضد الحضور المكرر (Anti-Duplicate Check-in):** منع تسجيل دخول اللاعب مرتين أثناء وجوده بالصالة.
- 🎟️ **إدارة مرنة للاشتراكات (Flexible Subscriptions):** احتساب آلي لتواريخ الانتهاء وحماية تضارب الفترات.
- 👤 **ملف متكامل للعضو (Member 360° Profile):** تتبع الحضور، الاشتراكات، المدفوعات، جدول التمرين، وتطور الوزن.
- 💰 **خزينة وإيرادات دقيقة (Financial Ledger):** تسجيل مدفوعات كاش وفيزا وتقارير مالية يومية وشهرية.
- 💾 **تخزين آمن ونسخ احتياطي (Zero Data Loss):** حفظ تلقائي محلي بدون خادم خارجي، مع تصدير واستيراد قاعدة البيانات كـ JSON بنقرة واحدة.
- 🎨 **تصميم رياضي عربي (RTL First):** مبني بالكامل بخط Cairo وبمعايير واجهات رياضية متناسقة.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Framework:** Angular 17 (Standalone Architecture)
- **UI & Components:** PrimeNG 17 + PrimeFlex
- **State Management:** Reactive RxJS Data Store
- **Typography:** Google Cairo Font
- **Icons:** PrimeIcons

---

## 🚀 التشغيل السريع (Quick Start)

```bash
# 1. تثبيت الاعتماديات / Install dependencies
npm install

# 2. تشغيل النظام في بيئة التطوير / Run development server
npm start

# 3. فتح النظام في المتصفح / Open in browser
# http://localhost:4200
```

### فحص البناء والإنتاج (Production Build):
```bash
npm run build
```

---

لمزيد من التفاصيل المعمارية ودليل المستخدم الإداري:
- راجع ملف **[`SYSTEM_OVERVIEW.md`](./SYSTEM_OVERVIEW.md)** للنسخة العربية.
- راجع ملف **[`SYSTEM_OVERVIEW.en.md`](./SYSTEM_OVERVIEW.en.md)** للنسخة الإنجليزية.
