# FIE Academy — хостинг, архитектура и сметки

Версия 0.1 · 3 ноември 2026 · допълнение към [PLAN.md](PLAN.md). Диаграмите са в `FIE_Academy_Hosting.pptx`.

> Цените са **ориентировъчни, без ДДС**, от публичните ценоразписи и сравнителни сайтове към ноември 2026 г. Hetzner и Scaleway вдигнаха цени през юни 2026, затова преди договаряне всичко се проверява в калкулаторите на доставчиците. 1 USD ≈ 0,90 EUR.

---

## 1. Входни данни за сметките

| Параметър | Стойност | Бележка |
|---|---|---|
| Акаунти | ~1000 | 3 роли: User / Admin / Super Admin |
| Видеа | ~500 клипа × 20–30 s | общ капацитет за качване **поне 35 GB** (оригинали) |
| Видео при гледане | ≈ 10 MB на гледане | 30 s в 720p H.264 след обработка |
| PDF-и | ~2 GB | правилници × 3 езика |
| База данни | < 1 GB | потребители, прогрес, въпроси, журнал |
| Видео трафик/месец | **нисък 0,3 TB · среден 1 TB · висок 2 TB** | среден = 1000 души × 100 клипа |
| Имейли | ~2–3 хил./месец | потвърждение на имейл, смяна на парола |
| Бюджет | ~€100/месец | |

**Важно за качването:** Vercel не приема заявки над 4,5 MB към функциите, а при собствен сървър не искаме 500 MB да минават през Next.js. И в трите варианта **файлът се качва директно от браузъра в хранилището** с еднократен подписан URL (presigned URL) или TUS (качване на части, което може да продължи след прекъсване). Сървърът само проверява правата, издава URL-а и записва резултата.

---

## 2. Обща архитектура (еднаква за всички варианти)

```
 Браузър (User / Admin / Super Admin)
    │  HTTPS
    ▼
 Next.js приложение ── проверка на роля при всяка заявка, i18n EN/FR/ES
    │            │                     │
    ▼            ▼                     ▼
 Auth +      Хранилище за PDF       Видео доставчик
 PostgreSQL  (S3/Storage, частно)   (Bunny Stream / собствен S3 / YouTube)
 (роли, прогрес, тестове, журнал)
    │
    ▼
 Имейл (Brevo / Scaleway TEM / SMTP) – потвърждение и смяна на парола
```

Каквото и да изберем, кодът има една абстракция `VideoProvider` с полета `provider: 'BUNNY' | 'S3' | 'YOUTUBE'` и `externalId`. Така дори видеа от различни източници могат да съжителстват, а смяната на доставчика не изисква пренаписване.

---

## 3. Вариант 1 — Vercel + Supabase (най-бързо за vibe coding)

| Слой | Услуга | Къде са данните |
|---|---|---|
| Приложение | **Vercel Pro**, функции в региона `fra1` (Франкфурт) | компютингът във Франкфурт; CDN-ът е глобален |
| База + Auth | **Supabase Pro**, регион Frankfurt (eu-central-1) | ЕС (AWS Франкфурт) |
| PDF-и | **Supabase Storage** (частен bucket, подписани URL) | ЕС |
| Видео | **Bunny Stream** (EU) *или* YouTube unlisted | ЕС / САЩ |
| Имейли | **Brevo** (Франция) като custom SMTP в Supabase | ЕС |

**Акаунти:** **Supabase Auth** дава регистрация с имейл и парола, потвърждение на имейла, забравена и смяна на паролата без допълнителен код. Ролята е колона `role` в таблица `profiles`. Задава се ръчно в Supabase Studio или с SQL (`update profiles set role='SUPER_ADMIN' where …`). **Row Level Security** прилага правата и на ниво база: User чете само своя прогрес, Admin чете всичко, Super Admin пише само в `documents` и `videos`. Журналът се пише с Postgres trigger при INSERT/UPDATE/DELETE в съдържанието, така че запис не може да се пропусне.

**Може ли Vercel да е „европейски“?** Частично. Функциите са във Франкфурт, а базата и файловете са в Supabase Frankfurt, така че **данните в покой са в ЕС**. Vercel и Supabase обаче са **американски компании**: попадат под US CLOUD Act, а логовете и метаданните може да минават през САЩ. GDPR съответствието се постига чрез DPA + EU-US Data Privacy Framework / SCC. Това е „EU регион“, а не „европейски суверенитет“. Ако FIE изисква европейска компания, вариантът отпада.

| Позиция | Нисък | Среден | Висок |
|---|---|---|---|
| Vercel Pro (1 място, 1 TB трафик вкл.) | $20 | $20 | $20 |
| Supabase Pro (8 GB DB, 100 GB файлове, Micro compute) | $25 | $25 | $25 |
| Bunny Stream (≈ 40 GB съхранение + доставка $0,005–0,01/GB) | $2–4 | $6–11 | $11–21 |
| Brevo (300 имейла/ден безплатно) | $0 | $0 | $0 |
| **Общо** | **≈ €43–45** | **≈ €46–50** | **≈ €50–60** |

Вместо Bunny може да се ползва Supabase Storage и за видеото: 35 GB влизат в 100 GB, но трафикът над 250 GB е $0,03/GB кеширан, т.е. ≈ +$22 при 1 TB и ≈ +$52 при 2 TB. Плюс това трябва да обработваме видеата сами.

---

## 4. Вариант 2 — Scaleway (изцяло европейски, managed)

| Слой | Услуга (Франция, Paris/Amsterdam) |
|---|---|
| Приложение | **Scaleway Serverless Containers** (Docker образ на Next.js) или малка Instance |
| База | **Scaleway Managed PostgreSQL** DB-DEV-S (2 vCPU / 2 GB), автоматични бекъпи |
| PDF-и | **Scaleway Object Storage** (S3 съвместимо, частно) |
| Видео | **Bunny Stream** (Словения) или собствени MP4 в Object Storage |
| Имейли | **Scaleway TEM** |

**Акаунти:** **Better Auth** в Next.js, с таблиците в нашата Postgres. Дава регистрация, потвърждение на имейл, забравена и смяна на парола, сесии и rate limit. Ролята е колона `role` в `user`. Журналът е с Postgres trigger + `REVOKE UPDATE, DELETE`.

*Вариант 2б, „европейски Supabase“:* **Nhost** (Стокхолм) дава Postgres + Auth + Storage в ЕС по подразбиране, за ≈ $25/месец. Приложението тогава е на Scaleway или Clever Cloud.

| Позиция | Нисък | Среден | Висок |
|---|---|---|---|
| Serverless Containers / Instance | €8–15 | €10–20 | €15–25 |
| Managed PostgreSQL DB-DEV-S (€0,0156/ч) + бекъпи | €12 | €12 | €12 |
| Object Storage за PDF-и | €1 | €1–2 | €2 |
| Bunny Stream | €2–4 | €6–10 | €10–19 |
| Scaleway TEM | €1 | €1 | €1 |
| **Общо** | **≈ €24–33** | **≈ €30–45** | **≈ €40–59** |

---

## 5. Вариант 3 — Hetzner + Coolify (изцяло европейски, най-евтин)

| Слой | Услуга (Германия / Финландия) |
|---|---|
| Сървър | **Hetzner Cloud CX33** (4 vCPU / 8 GB / 80 GB) + **Coolify** (self-hosted „Vercel“: git push → deploy, SSL) |
| База | PostgreSQL в Docker на същия сървър; нощен `pg_dump` в Object Storage |
| PDF-и + видеа + бекъпи | **Hetzner Object Storage** (S3, частно; 1 TB съхранение + 1 TB трафик вкл., после €1/TB) |
| Видео | собствени MP4: ffmpeg worker в Coolify обработва качения файл до 720p/1080p + постер. Алтернатива: Bunny Stream |
| Имейли | **Brevo** |

**Акаунти:** като вариант 2 (Better Auth + Postgres + trigger журнал). *Може и self-hosted Supabase на същия сървър: Coolify го инсталира с един клик, но добавя ~10 контейнера за поддръжка.*

| Позиция | Нисък | Среден | Висок |
|---|---|---|---|
| CX33 + IPv4 + автоматични бекъпи на сървъра (+20 %) | €11 | €11 | €11 |
| Object Storage (1 TB + 1 TB трафик вкл.) | €6,5 | €6,5 | €7,5 |
| Coolify, Postgres, ffmpeg | €0 | €0 | €0 |
| Brevo | €0 | €0 | €0 |
| **Общо** | **≈ €18** | **≈ €18** | **≈ €19** |
| *с Bunny Stream вместо собствено видео* | *€20–22* | *€24–28* | *€29–38* |

Минус: ние отговаряме за обновяването на сървъра, бекъпите и мониторинга (~1–2 часа/месец). Hetzner Object Storage е имал периоди с повишена латентност (юли 2026).

---

## 6. Видео: 4 варианта за съхранение

| | **YouTube (unlisted)** | **Bunny Stream** | **Собствен S3 + MP4** | **Supabase Storage** |
|---|---|---|---|---|
| Компания / данни | Google, САЩ | Словения, EU зони | наш bucket в ЕС | САЩ, регион Франкфурт |
| Цена за 35 GB + 1 TB/месец | **€0** | ≈ €6–10 | ≈ €0–1 (в Hetzner пакета) | ≈ $22 над Pro |
| Качване от нашата платформа | ❌ на практика не (виж долу) | ✅ TUS директно от браузъра | ✅ presigned URL | ✅ TUS |
| Обработка (720p, постер) | автоматично | автоматично, безплатно | нашият ffmpeg worker | сами |
| Защита от споделяне | ❌ всеки с линка гледа | ✅ token URL + само наш домейн | ✅ URL, валиден 15 мин | ✅ подписан URL |
| Следене на изгледания % | ✅ IFrame Player API | ✅ | ✅ | ✅ |
| Реклами / чужд брандинг | ⚠️ възможни реклами, лого, „още видеа“ в края | няма | няма | няма |
| GDPR / бисквитки | ⚠️ трябва съгласие (youtube-nocookie помага частично) | няма бисквитки | няма | няма |

### YouTube подробно

- **Private видеата НЕ могат да се вграждат.** Гледат ги само поканени Google акаунти, затова не са вариант.
- **Unlisted** видеата се вграждат с `<iframe>` и могат да се „викат“ в платформата на точните места. С **YouTube IFrame Player API** следим докъде е изгледал потребителят, така че правилото „≥ 90 % изгледано“ работи.
- **Няма заключване по домейн:** който вземе ID-то, може да гледа и споделя видеото.
- **Качване през платформата:** YouTube Data API таксува 1600 единици за качване от дневна квота от 10 000, т.е. **~6 видеа на ден**. Освен това изисква OAuth към канала на FIE и проверка на приложението от Google. Практичният начин е: Super Admin качва в **YouTube Studio**, после поставя линка в нашия админ панел, а ние записваме ID-то и действието в журнала.
- **Подходящо за:** демо, бързо пускане, нулев бюджет. **Не отговаря** на „всичко европейско“ и на защитено съдържание.

### Препоръка за видео

**Bunny Stream** във всеки от трите варианта. Струва под €10/месец, премахва нуждата от ffmpeg worker (по-малко код за vibe coding), качва се директно от админ панела, има token защита и EU съхранение. Собствените MP4 на Hetzner са най-евтиният fallback. YouTube е само за демо или ако бюджетът е нулев.

---

## 7. Сравнение

| Критерий | В1 Vercel + Supabase | В2 Scaleway | В3 Hetzner + Coolify |
|---|---|---|---|
| Европейска компания | ❌ (EU регион, US компания) | ✅ | ✅ |
| Месечна цена (среден сценарий) | ≈ €46–50 | ≈ €30–45 | ≈ €18 (€24–28 с Bunny) |
| Поддръжка (DevOps) | никаква | ниска | средна |
| Лекота за vibe coding | ⭐⭐⭐ (AI познава отлично Supabase) | ⭐⭐ | ⭐⭐ |
| Бекъпи на базата | автоматични (Supabase) | автоматични | наши (`pg_dump` + тест) |
| Мащабиране над 1000 акаунта | автоматично | автоматично | ръчно (по-голям сървър) |
| Vendor lock-in | среден (Supabase Auth/RLS) | нисък | нисък |

## 8. Препоръка

1. **Първо решение от FIE:** приемлива ли е американска компания с данни в ЕС регион (Vercel/Supabase)?
2. **Ако да →** **Вариант 1 + Bunny Stream** (≈ €50/месец). Без поддръжка на сървъри, най-бърз за разработка. Supabase дава Auth, роли и RLS наготово.
3. **Ако не →** **Вариант 3 + Bunny Stream** (≈ €25–30/месец). Изцяло ЕС, далеч под бюджета, с Better Auth и Prisma. Ако никой не иска да поддържа сървър → **Вариант 2** (≈ €35–45).
4. И в трите варианта остава резерв от ≥ €50/месец спрямо бюджета от €100: за staging среда, мониторинг или растеж.

Ако изберем Supabase (В1), в PLAN.md сменяме Better Auth → Supabase Auth и добавяме RLS политики. Prisma (или Drizzle) остава за типизиран достъп до базата.

---

## Източници

- Vercel регионални цени: https://vercel.com/docs/pricing/regional-pricing/fra1 · разходи 2026: https://makerkit.dev/blog/tutorials/vercel-cost
- Vercel и EU residency: https://velumi.com/articles/why-we-built-vercel-alternative-europe
- Supabase цени: https://supabase.com/pricing.md · https://makerkit.dev/blog/saas/supabase-pricing
- Scaleway Managed DB: https://www.scaleway.com/en/pricing/managed-databases-pricing/ · Serverless Containers: https://scaleway.com/en/docs/serverless-containers/reference-content/containers-billing/
- Hetzner увеличение 2026: https://www.bitdoze.com/hetzner-cloud-cost-optimized-plans · https://northflank.com/blog/hetzner-cloud-server-price-increases
- Hetzner Object Storage: https://sliplane.io/blog/cheap-object-storage-providers-europe
- Bunny Stream: https://bunny.net/pricing/stream/ · https://european-alternatives.eu/product/bunny-stream
- Nhost: https://nhost.io/pricing · https://europeanstack.pages.dev/software/nhost
- YouTube unlisted/private: https://swarmify.com/blog/youtube-unlisted-vs-private/ · https://community.atlassian.com/t5/Confluence-questions/Embed-Private-Youtube-Videos-with-Widget-Connector/qaq-p/934229
- Европейски алтернативи на Vercel: https://european-alternatives.eu/alternative-to/vercel
