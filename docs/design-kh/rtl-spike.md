# اختبار RTL على `new-york-v4` — الخطوة 1 من خطة السجل

**التاريخ:** 2026-10-04 · **الفرع:** `claude/new-session-fpax4a` · **CLI:** `shadcn` 4.21.0 (مبني من `packages/shadcn` في هذا المستودع)

## ما الذي اختُبر

- المصدر: `apps/v4/registry/new-york-v4/ui/*.tsx` (61 ملف مكوّن).
- الطريقة: نسخة معزولة خارج المستودع + `components.json` أدنى، ثم تشغيل الأمر الحقيقي `shadcn migrate rtl --yes`.
- القياس: `docs/design-kh/rtl-audit.mjs` (تحليل ساكن بالرموز، قابل لإعادة التشغيل).
- لم يُعدَّل أي ملف في `registry/` — الاختبار قابل للتكرار ولا يترك أثراً.

> **حدّ الاختبار:** لم يُعرض أي مكوّن في متصفح. كل ما يلي تحليل ساكن للشيفرة؛ ما يُسمّى «خلل» هنا هو **مرشّح للتأكيد البصري** وليس خللاً مُثبتاً.

## النتائج المُقاسة

| البند | النتيجة |
|---|---|
| ملفات غيّرها `migrate rtl` | 33 من 61 |
| بقايا margin / padding / inset / border / rounded / text-align | **0** |
| `translate-x-*` المقترنة بنظير `rtl:` | 29 (سلوك صحيح) |
| استخدامات داخل `data-[side=left\|right]` الفيزيائي | 28 (مشروعة، مقصودة) |
| رموز حركة `slide-*-left/right` متبقية | **8** (`sheet` 4، `navigation-menu` 4) |
| أيقونات اتجاهية غير مقلوبة | **11** |
| علامة `cn-rtl-flip` | 22 ملفاً في `bases/`، **0** في `new-york-v4` |
| ملفات حذّر منها الـ CLI للمراجعة اليدوية | `calendar`, `pagination`, `sidebar` |

**الخلاصة:** تحويل الـ classes يعمل جيداً على New York v4. ما يفوته الـ CLI ثلاث فئات محصورة وقابلة للعدّ.

## الفجوات (مرشّحات للتأكيد البصري)

1. **أيقونات لا تنقلب (11 موضعاً):** `breadcrumb:77`، `calendar:148,154`، `carousel:198,228`، `context-menu:74`، `dropdown-menu:219`، `menubar:237`، `pagination:79,97`، `sidebar:276`. السبب بنيوي: المحوّل يقلب الأيقونة فقط إن حملت العلامة `cn-rtl-flip`، وهي غير موجودة في `new-york-v4`.
2. **تناقض الموضع والحركة في `sheet.tsx`:** بعد التحويل صار `end-0 border-s` مع بقاء `slide-in-from-right`. في RTL تُثبَّت اللوحة جهة اليسار الفيزيائي وتنزلق من اليمين. (`sheet.tsx:64,66`). وكذلك `navigation-menu.tsx:92` (`data-[motion=from-end]:slide-in-from-right-52`).
3. **منطق غير مغطى بالتحويل النصي:** `carousel` (مفاتيح `ArrowLeft/ArrowRight` وخيار اتجاه Embla)، `calendar` (`orientation === "left"/"right"`)، و`sidebar` (مقبض `group-data-[side=left]:-right-4` فيزيائي بينما موضع اللوحة صار `start-0`).

## تصحيحات لما ورد في التقرير الأصلي

- **«`Direction` يُستورد من `radix-ui` مباشرة في New York» (مصدر ثانوي):** في هذا الـ fork، `new-york-v4/ui/direction.tsx` موجود ومسجَّل في `_registry.ts` كعنصر `registry:ui` (غلاف فوق `Direction.DirectionProvider` من Radix). لم أتحقق من السجل المنشور upstream، فالتصحيح ينطبق على هذا المصدر فقط.
- **«التحويل التلقائي لا يعمل إلا مع الأنماط الجديدة»:** الأدق: يعمل نصّياً على New York v4 ويحوّل الـ classes بنجاح، لكنه لا يعالج الأيقونات ولا الحركة ولا المنطق (الفئات أعلاه).

## لم يُتحقق منه

- سلوك `tw-animate-css` للأدوات المنطقية (`slide-in-from-start/end`): اعتماديات `apps/v4` غير مثبتة هنا، والإصدار المعلن `^1.4.0`.
- أي سلوك بصري أو تفاعلي (لوحات، قوائم فرعية، carousel، أحجام الخطوط العربية).

## التوصية لبوابة القرار

الفجوة محصورة: 11 أيقونة + 8 رموز حركة + 3 ملفات منطق. هذا يرجّح **رقعة codemod فوق New York** على إعادة التأسيس على `radix-nova`، لأن الأخيرة تغيّر نظام الأنماط كله (`cn-*` + ملفات `styles/style-*.css`) مقابل فجوة يمكن عدّها بالأصابع. القرار مشروط بتأكيد بصري.

## الخطوة التالية المقترحة

1. تطبيق الرقعة على النسخة المعزولة: `rtl:rotate-180` للأيقونات الـ11، واستبدال الحركة بالمنطقية في `sheet`/`navigation-menu`.
2. عرض `dir="rtl"` لهذه الملفات الستة (`sheet`, `sidebar`, `calendar`, `carousel`, `pagination`, `navigation-menu`) مع `Noto Sans Arabic` والتقاط لقطات بـ Playwright.
3. بعدها فقط: هيكل `registry.json` (عنصر `registry:theme` + عنصر `registry:ui`).
