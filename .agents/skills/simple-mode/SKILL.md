---
name: simple-mode
description: Builds and maintains "Simple Mode", a guided, low-anxiety UI for a gym coach who is a novice computer user, in the Angular 17 + PrimeNG gym management app (EL-Halawany GYM). Use this skill whenever the task mentions Simple Mode, simple view, the coach/trainer experience, simplifying a screen, guided flows, wizards, the mode switch in the user menu, or making any screen easier for non-technical users, even if the user does not say "Simple Mode" explicitly.
---

# Simple Mode (الوضع المبسط)

## 1. Goal

Make the gym app usable by a coach who is **not comfortable with software** and does not want to memorize steps.

The coach is the **only employee** of a small gym in Egypt (about 100 m²). He does everything: check-in, new members, subscriptions, renewals and payments. He plays games on his phone without problems, but he feels **anxious** about running his business inside an app. He told us the system is good, but he needs time and effort to learn it and remember the steps.

So Simple Mode must solve two things:

1. **Complexity**: fewer choices, fewer steps, fewer screens.
2. **Confidence**: the coach must always feel in control and never feel he can break something.

The core idea: **the system holds his hand, so he never has to memorize anything.**

## 2. Design principles

Apply these to every screen, in this order of priority.

1. **No memorization.** Every task has one fixed path. The system always shows the next step. Use step indicators such as "الخطوة 2 من 3".
2. **Safety before speed.** Anything risky needs a clear confirmation in plain words. Anything reversible should offer undo.
3. **Do the thinking for him.** Pre-fill and auto-select whatever can be known: dates, end date, price, the sport from an active subscription, a single matching member. Never ask for something the system can compute.
4. **One thing per screen.** One main action, one primary button. No competing choices.
5. **Say what will happen.** Before confirming, show a plain sentence, for example "هتسجل دخول أحمد لتمرين كمال أجسام".
6. **Always show the result.** After every action, show a clear success state, for example "تم تسجيل الدفع ✅", so he knows it worked.
7. **Friendly errors.** Never show technical errors. Say what happened and what to do next.
8. **Gym language, not software language.** Use words from the gym world (see the glossary in section 8).

## 3. Mode behavior

- **Default mode is Simple Mode.** The app must open in Simple Mode when no choice has been saved.
- The choice is **per user** and saved in `LocalStorage` (the app already uses it). Use one clear key, such as `gym.uiMode`, with the values `simple` or `standard`. Wrap reads and writes in try/catch and fall back to `simple`.
- **The switch lives inside the user menu** (the avatar dropdown at the top left). It must **not** appear in the header or on the home screen.
  - In Simple Mode the menu item says: "التبديل إلى الوضع العادي"
  - In Standard Mode the menu item says: "التبديل إلى الوضع المبسط"
- Switching must be instant, keep the user logged in, and never lose unsaved data without warning.
- Follow the project's existing state pattern (a reactive service with `BehaviorSubject`, like `GymDataService`). Create a small `UiModeService` rather than scattering the logic.

## 4. How to build it

- Build Simple Mode as a **separate layout and separate simple pages** that reuse the existing services, models and business rules. Do **not** just hide things with CSS, because hiding cannot create guided flows.
- **Do not change Standard Mode.** Existing screens, routes and behavior must keep working exactly as before.
- **Do not duplicate business logic.** Reuse `GymDataService` and the existing guardrails (anti-duplicate check-in, subscription overlap guard, automatic end-date calculation). If the logic is buried inside a component, extract it into a shared service first, then use it from both modes.
- Place new code in a clear folder, such as `src/app/simple/` (layout, pages, components), so it stays easy to find and remove.
- Use Angular 17 standalone components, PrimeNG 17 and PrimeFlex, the existing design tokens, the Cairo font and the RTL rules in `styles.scss`. Do not add new UI libraries.
- Simple Mode is designed for a **laptop**, used while standing or moving around the gym. Use large text, large click targets and generous spacing. Support mouse and keyboard.

## 5. Simple Home screen

The home screen of Simple Mode is basically **five big buttons** and nothing else that competes with them:

| Button (Arabic) | Task |
|---|---|
| حضور سريع | Check-in / check-out |
| عضو جديد | Register a new member |
| اشتراك جديد | Create a subscription |
| تجديد اشتراك | Renew a subscription |
| استلام دفعة | Receive a payment |

Also show, below the buttons:

- A **"اشتراكات تنتهي قريباً"** area with the members whose subscription ends within 7 days, each with a **"تجديد الآن"** button. This already works well in the current app, so keep the same idea.
- A small **"داخل الصالة الآن"** list with a one-click exit button for each athlete.

Hide on the Simple Home: the sidebar, KPI cards, the subscription distribution matrix, revenue totals, and admin items. Do not remove those from Standard Mode.

## 6. Guided flows

Each flow is a short wizard with a step indicator, a clear back button and a final confirmation sentence.

### 6.1 حضور سريع (Check-in / Check-out)

1. Search for the athlete by name or phone (one search box, results appear as he types).
2. Show a big status card: green = valid, yellow = already inside, red = subscription expired.
3. If valid: one big button "سجّل دخول". If already inside: offer "سجّل خروج" instead. If expired: offer "تجديد الاشتراك" instead of check-in.
4. Sport is auto-selected from the active subscription. Ask only if there is more than one.
5. Success message with the athlete's name.

Keep the existing duplicate check-in protection.

### 6.2 عضو جديد (New member)

1. Ask only for the required fields (full name, phone, gender, birth date), one clear field at a time or in one short form.
2. Confirm, then offer a big button: **"كمّل واعمل اشتراك له"** so the coach moves straight to the subscription flow without searching for the new member.

### 6.3 اشتراك جديد (New subscription)

1. Choose the athlete (skip if coming from the new member flow).
2. Choose the sport, then the plan: شهري / ربع سنوي / سنوي.
3. Start date defaults to today. **End date and price are calculated automatically and shown clearly.**
4. If the existing overlap guard blocks it, explain in plain words why and what to do (for example, "العضو عنده اشتراك سارٍ في نفس الرياضة، عايز تجدده بدل ما تعمل اشتراك جديد؟").
5. Then offer the payment step right away: **"استلم الدفعة دلوقتي"**.

### 6.4 تجديد اشتراك (Renew)

1. Show members whose subscription is expiring or expired first, so he does not have to search.
2. One tap on **"تجديد الآن"** pre-fills the same sport and same plan, and shows the new start and end dates.
3. Offer payment right after.

### 6.5 استلام دفعة (Receive payment)

1. The amount is pre-filled from the subscription. Ask only for the payment method: كاش / فيزا.
2. Show a confirmation sentence with the member name, amount and method.
3. Show a clear success state and an optional receipt view.

## 7. Safety rules

- Dangerous actions (factory reset, import, delete, bulk checkout) **never** appear in Simple Mode.
- Any action that changes money or subscriptions ends with a confirmation sentence in plain Arabic before saving.
- Offer **undo** for the last action when possible (for example, undo a wrong check-in right after it happens).
- Never lose data silently. If something fails, say so and keep what the coach already typed.
- Do not weaken or bypass any existing guardrail.

## 8. Language and glossary

- Write all agent instructions, code, comments and commit messages in **English**.
- Write all text **shown to the coach in Arabic**, simple, short and friendly, in the Egyptian-friendly tone of the current app. Avoid English words on screen.
- Reuse the labels the app already has where they exist. Use the glossary below for consistency.

| Concept | Arabic label |
|---|---|
| Member / athlete | بطل / عضو |
| Currently inside the gym | داخل الصالة |
| Quick check-in | حضور سريع |
| Check out | خروج |
| New member | عضو جديد |
| New subscription | اشتراك جديد |
| Renew now | تجديد الآن |
| Receive payment | استلام دفعة |
| Expiring soon | تنتهي قريباً |
| Cash / Visa | كاش / فيزا |
| Next / Back | التالي / رجوع |
| Confirm | تأكيد |
| Done | تم |

If a label is missing, prefer a short everyday phrase over a technical one. Never use words such as dashboard, ledger, KPI, sync, entity or token on screen.

## 9. Do and don't

**Do**

- Make every new screen Simple-first, then check that Standard Mode still works.
- Keep wizards to 3 steps or fewer when possible.
- Keep one primary button per screen, large and clearly labeled.
- Keep RTL correct: icon and arrow directions, spacing and alignment.

**Don't**

- Don't hide features by CSS only.
- Don't add settings, filters, tabs or tables to Simple Mode screens.
- Don't change the data model, storage format or backup format.
- Don't add new dependencies.
- Don't show technical messages, IDs or English text to the coach.

## 10. Definition of done

Before saying a screen or flow is finished, check every item:

- [ ] The app opens in Simple Mode by default when nothing is saved.
- [ ] The mode switch exists only inside the user menu, in both modes, with the correct Arabic label.
- [ ] The saved choice survives a page reload.
- [ ] Standard Mode screens and routes behave exactly as before.
- [ ] Each of the 5 tasks can be completed in 3 steps or fewer, with no searching for menus.
- [ ] Auto-filled values (dates, end date, price, sport) are correct.
- [ ] Every flow ends with a clear success message in Arabic.
- [ ] Every risky action has a plain-language confirmation, and no dangerous action is reachable.
- [ ] Existing guardrails still work (duplicate check-in, subscription overlap).
- [ ] Text and buttons are large and readable on a laptop screen, and RTL looks correct.
- [ ] No English or technical wording appears in the coach's screens.
- [ ] The project builds without errors.

## 11. Test with a real coach

When the first version works, ask the developer to let the real coach try the five tasks without any help. Note where he hesitates or asks "now what?", and fix those points first. The goal is that after one week he works without remembering any steps.
