# FIE Academy — схема на базата данни

Версия 0.1 · 5 ноември 2026 · допълнение към [PLAN.md](PLAN.md). **Този файл заменя раздел 5.2 от PLAN.md.**

PostgreSQL 17 + Prisma. Автентикация с Better Auth (таблиците му са в раздел 3).

---

## 1. Решения, на които стъпва схемата

| Тема | Решение (5 ноември 2026) |
|---|---|
| Текстът на уроците | **Хардкоднат в кода.** Урокът е React view (текст, редуващ се със снимки и видеа). В базата пазим само **регистър** на уроците: slug + път към view-а, за да има към какво да вържем прогреса. От админ панела не се редактира. |
| Какво управлява Super Admin | **PDF-ите** (отделна страница, публични), **видео папката на всеки модул**, видеата във Video Library и към правилата, **банката с въпроси**, онлайн срещите, кредитите и достъпа до нивата. |
| Плащания | **Засега кредити, без Stripe.** Super Admin ръчно добавя (или отнема) кредити на профил. Всяко ниво (оръжие × ниво) струва N кредита. Потребителят сам харчи кредитите, за да отключи нивото. |
| Кой дава кредити и отключва | **Само Super Admin.** Admin вижда балансите, движенията и отключванията, но не ги променя. |
| Ред на нивата | Потребителят може да купи ниво с кредити само ако е издържал предишното ниво на същото оръжие. **Super Admin може да отключи всяко ниво директно**, без кредити и без да спазва реда (причината е задължителна и отива в журнала). |
| Роли | Задават се директно в базата (`UPDATE "user" SET role = ...` или `pnpm set-role`). Новите регистрации са винаги `USER`. |
| Резултати | Super Admin и Admin виждат за всеки потребител: колко пъти е правил всеки тест, резултатите, кои въпроси е сгрешил, прогреса по модули и уроци, въведените кодове, кредитите. |

---

## 2. Обща картина

```
                         ┌──────────────┐
                         │ SubjectArea  │  refereeing (+ 4 по-късно)
                         └──────┬───────┘
                                │
         ┌──────────────────────┼─────────────────────────┬───────────────┐
         ▼                      ▼                         ▼               ▼
   ┌──────────┐          ┌────────────┐            ┌──────────┐    ┌──────────┐
   │  Course  │ 12 бр.   │  Document  │ PDF-и      │   Rule   │    │ Question │
   │ weapon × │          │ (публични) │            │ + тълк.  │    │  банка   │
   │  level   │          └─────┬──────┘            └────┬─────┘    └────┬─────┘
   └────┬─────┘                ▼                        │               │
        │               DocumentFile (EN/FR/ES)         ▼               │
        │                                          RuleVideo ──┐        │
        ├──► Module (2) ──► Lesson (хардкод view)              │        │
        │        │                                              ▼        │
        │        └──► VideoFolder ──► VideoFolderItem ──►   Video (Bunny)
        │                              (Video Library по оръжие също е VideoFolder)
        │
        ├──► Meeting (Zoom, 6-цифрен код)
        │
        └──► за всеки потребител:
               CourseAccess (отключено ли е)  ◄── CreditTransaction (кредити)
               SectionProgress (cycle, код, опити)
               LessonProgress / VideoProgress
               TestAttempt ──► TestAttemptAnswer
               CourseCompletion
               MeetingAnnulment

   AuditLog — всичко, което прави Super Admin (append-only)
```

### 2.1 ER диаграма (всички таблици, колони и връзки)

Изходникът е [DATABASE-ER.mmd](DATABASE-ER.mmd) (Mermaid). GitHub и VS Code (с Mermaid разширение) го показват като диаграма. Отваря се и на [mermaid.live](https://mermaid.live), ако поставиш съдържанието там. При промяна на схемата обновявай `.mmd` файла заедно с Prisma схемата.

Легенда: `PK` първичен ключ · `FK` външен ключ · `UK` уникален · `||--o{` едно към много · `||--|{` едно към едно-или-много · `||--o|` едно към нула-или-едно · `|o--o{` незадължителна връзка.

---

## 3. Таблици по групи

Конвенции:
- ID-тата са `cuid()` текст. Времената са `timestamptz` (UTC).
- Всичко, което вижда потребителят и идва от базата, има `*Translation` таблица с по един ред за `en`, `fr`, `es`. Изключение: уроците, защото текстът им е в кода.
- „Изтриване“ от админ панела е **soft delete** (`deletedAt`, `deletedById`). Истинско `DELETE` няма, за да може Admin да вижда историята.

### 3.1 Потребители и автентикация (Better Auth)

| Таблица | Колони | Бележки |
|---|---|---|
| **user** | id, email (unique), emailVerified, name, image?, **role** (`USER` \| `ADMIN` \| `SUPER_ADMIN`), **locale** (`en`\|`fr`\|`es`), **creditBalance** (int, ≥ 0), **preferredWeapon**?, banned, deletedAt?, createdAt, updatedAt | `creditBalance` е кеш на сумата от `credit_transaction`; сменя се само в същата транзакция като движението. `preferredWeapon` е последно избраното оръжие в Refereeing. `deletedAt` е за анонимизация (GDPR) |
| **session** | id, userId, token (unique), expiresAt, ipAddress, userAgent, createdAt, updatedAt | Better Auth |
| **account** | id, userId, providerId (`credential`), accountId, password (scrypt hash), createdAt, updatedAt | Better Auth; паролата е тук, не в `user` |
| **verification** | id, identifier, value, expiresAt, createdAt | потвърждение на имейл, смяна на парола |
| **rate_limit** | id, key, count, lastRequest | Better Auth; използваме го и за въвеждане на код от среща |

### 3.2 Структура и съдържание

| Таблица | Колони | Бележки |
|---|---|---|
| **subject_area** | id, slug (unique: `refereeing`, `coach`, ...), order, isActive | 5 области, сега активна е само Refereeing |
| subject_area_translation | subjectAreaId, locale, title, description | PK (subjectAreaId, locale) |
| **course** | id, subjectAreaId, **weapon** (`SABRE`\|`EPEE`\|`FOIL`), **level** (`BEGINNER`\|`INTERMEDIATE`\|`ADVANCED`\|`HIGH_PERFORMANCE`), **priceCredits** (int), isActive, createdAt, updatedAt | **Секция** = оръжие × ниво → 12 реда за Refereeing. unique (subjectAreaId, weapon, level). Цената се сменя от Super Admin (с журнал) |
| course_translation | courseId, locale, title, summary | |
| **module** | id, courseId, order (1\|2), slug, createdAt | unique (courseId, order). Напр. „Referee Duties & AI“, „Referee Gestures“ |
| module_translation | moduleId, locale, title, description | заглавията се seed-ват; не се редактират от панела |
| **lesson** | id, moduleId, order, **slug**, **viewPath**, isRequired (default true), isActive, createdAt | **Регистър на хардкоднатите уроци.** `viewPath` е пътят до React компонента (напр. `refereeing/sabre/beginner/duties/role-of-the-referee`). Заглавието и текстът са в кода (next-intl / view-а). Редовете идват от seed скрипт, който чете регистъра в кода; от админ панела не се пипат. unique (moduleId, slug) |

> **Защо уроците все пак имат ред в базата:** за да има FK за прогреса, за да може Admin да вижда „урок 3 от 5“ и за да може seed-ът да маркира урок като `isActive = false`, когато го махнем от кода, без да губим старата история.

**Видеата, вградени в хардкоднатите уроци**, са записани в кода по `mediaKey` (напр. `role-of-the-referee#intro`) с Bunny ID. Прогресът им се пази в `lesson_progress.mediaProgress` (раздел 3.6). Те **не** са в `video` таблицата и Super Admin не ги сменя.

### 3.3 Видео (Bunny Stream) и видео папки

| Таблица | Колони | Бележки |
|---|---|---|
| **video** | id, subjectAreaId, weapon?, **bunnyVideoId** (unique), bunnyLibraryId, durationSec?, thumbnailUrl?, **status** (`UPLOADING`\|`PROCESSING`\|`READY`\|`FAILED`), sizeBytes?, uploadedById, createdAt, updatedAt, deletedAt?, deletedById? | Видеата са без говор: един файл за всички езици. Качва се веднъж и може да е в няколко папки и към няколко правила |
| video_translation | videoId, locale, title, description? | |
| **video_folder** | id, subjectAreaId, **kind** (`MODULE`\|`LIBRARY`), **moduleId?** (unique), **weapon?**, order, isRequired (default false), createdAt, deletedAt? | `MODULE`: видео папката към модул (една на модул). `LIBRARY`: Video Library (по една на оръжие; по желание и подпапки). CHECK: `kind = MODULE ⇒ moduleId NOT NULL`, `kind = LIBRARY ⇒ weapon NOT NULL` |
| video_folder_translation | folderId, locale, title, description? | |
| **video_folder_item** | folderId, videoId, order, addedById, addedAt | PK (folderId, videoId). Super Admin добавя, маха и пренарежда видеа в папката |

`video_folder.isRequired`: ако Super Admin го включи, видеата в папката на модула трябва да са изгледани ≥ 90 %, за да се брои модулът за минат. По подразбиране е изключено: задължителни са само хардкоднатите уроци.

### 3.4 PDF-и (публични) и правила

| Таблица | Колони | Бележки |
|---|---|---|
| **document** | id, subjectAreaId, **category** (`FIE_RULES`\|`TECHNICAL`\|`ADMINISTRATIVE`\|`ORGANIZATION`\|`OTHER`), order, publishedAt?, uploadedById, createdAt, updatedAt, deletedAt?, deletedById? | PDF-ите се виждат от **всички, без вход и без плащане**, и не следим кой ги е отворил |
| document_translation | documentId, locale, title, description? | |
| **document_file** | id, documentId, **locale**, storageKey, sizeBytes, pageCount?, sha256, uploadedById, createdAt, replacedAt? | Отделен файл за всеки език. При „замени“ старият ред получава `replacedAt`, а новият става текущ. Партиален unique: (documentId, locale) WHERE replacedAt IS NULL |
| **rule** | id, subjectAreaId, category (`TECHNICAL`\|`ADMINISTRATIVE`\|`ORGANIZATION`), ruleNumber (напр. `t.42`), weapon?, order, createdAt, updatedAt, deletedAt? | Rules & Interpretation; импорт с `pnpm import:rules` |
| rule_translation | ruleId, locale, title, text, interpretation | |
| **rule_video** | ruleId, videoId, order | Видеата към тълкуването на правилото; Super Admin ги сменя |

### 3.5 Банка с въпроси

| Таблица | Колони | Бележки |
|---|---|---|
| **question** | id, subjectAreaId, **category** (`SABRE`\|`EPEE`\|`FOIL`\|`GENERAL`), **level**, **correct** (`A`\|`B`\|`C`), **active** (bool), externalRef? (unique, от импорта), createdById?, updatedById?, createdAt, updatedAt | Без истинско изтриване, само `active = false`. Индекс (subjectAreaId, category, level, active) за избора на теста |
| question_translation | questionId, locale, text, optionA, optionB, optionC, explanation? | `explanation` е само за Super Admin (на потребителя верните отговори не се показват) |

Тестът на секция (weapon W, level L) = 10 активни въпроса с `category = W, level = L` + 5 с `category = GENERAL, level = L`. Админ панелът показва броя активни въпроси по секция и предупреждава, ако са под 10 + 5.

### 3.6 Прогрес на потребителя

| Таблица | Колони | Бележки |
|---|---|---|
| **section_progress** | id, userId, courseId, **cycle** (1, 2, ...), startedAt, contentCompletedAt?, meetingId?, codeEnteredAt?, attemptsUsed (0–3), passedAt?, **resetAt?**, resetReason? (`THREE_FAILS`\|`ADMIN`) | Един ред на (потребител, секция, cycle). Текущият е този с `resetAt IS NULL`. При 3-ти неуспех редът получава `resetAt` и се създава нов с `cycle + 1`. Партиален unique: (userId, courseId) WHERE resetAt IS NULL |
| **lesson_progress** | id, userId, lessonId, cycle, firstOpenedAt, lastOpenedAt, scrolledToEndAt?, timeSpentSec, **mediaProgress** (jsonb: `{ "<mediaKey>": { "maxContinuousSec": 41, "durationSec": 45, "doneAt": "..." } }`), completedAt? | Урокът е минат, когато е изскролиран до края **и** всяко вградено видео е ≥ 90 % (изчислява се на сървъра). unique (userId, lessonId, cycle) |
| **video_progress** | id, userId, videoId, folderId?, cycle?, maxContinuousSec, durationSec, completedAt?, updatedAt | За видеата от папките (модул / Video Library). `cycle` е попълнен само за папки на модул. unique (userId, videoId, folderId, cycle) |
| **test_attempt** | id, userId, courseId, sectionProgressId, cycle, attemptNumber (1–3), startedAt, expiresAt, submittedAt?, score? (0–15), passed?, **status** (`IN_PROGRESS`\|`SUBMITTED`\|`EXPIRED`), locale | Партиален unique: (userId, courseId) WHERE status = 'IN_PROGRESS' → най-много един отворен опит. Изтекъл опит се брои за неуспешен |
| **test_attempt_answer** | attemptId, questionId, position (1–15), optionOrder (напр. `CAB`), chosen? (`A`\|`B`\|`C`), isCorrect? | PK (attemptId, questionId). Snapshot на избраните въпроси и отговорите. Така Super Admin вижда кои въпроси е сгрешил човекът и кои въпроси се грешат най-често |
| **course_completion** | id, userId, courseId, attemptId (unique), passedAt, annulledAt?, annulledById?, annulReason? | Неанулирано завършване ⇒ следващото ниво става „може да се купи“. Партиален unique: (userId, courseId) WHERE annulledAt IS NULL |

### 3.7 Онлайн срещи (Zoom)

| Таблица | Колони | Бележки |
|---|---|---|
| **meeting** | id, courseId, startsAt, endsAt, hostName, zoomUrl, **code** (6 цифри, unique), codeValidUntil (= endsAt + 24 ч), createdById, createdAt, updatedAt, cancelledAt?, deletedAt? | Кодът се генерира от сървъра (`crypto.randomInt`, проверка за уникалност) |
| meeting_translation | meetingId, locale, title, description? | |
| **meeting_code_entry** | id, userId, meetingId?, courseId, enteredCode, **result** (`OK`\|`WRONG_CODE`\|`WRONG_SECTION`\|`EXPIRED`\|`RATE_LIMITED`), ip, createdAt | Всеки опит за въвеждане (и грешните). Admin вижда по среща кой е въвел кода и кога, за сверяване със записа |
| **meeting_annulment** | id, userId, meetingId, courseId, sectionProgressId, annulledById, reason?, createdAt | Super Admin анулира среща на потребител, който не е бил там: изчиства `meetingId`/`codeEnteredAt` в `section_progress`; ако тестът вече е издържан с този код, `course_completion.annulledAt` се попълва |

### 3.8 Кредити и достъп до нивата

| Таблица | Колони | Бележки |
|---|---|---|
| **credit_transaction** | id, userId, **amount** (int, + или −), **type** (`ADMIN_GRANT`\|`ADMIN_DEDUCT`\|`SPEND`\|`REFUND`\|`PURCHASE`), balanceAfter, courseAccessId?, actorId?, reason?, createdAt | **Append-only дневник.** `ADMIN_GRANT`/`ADMIN_DEDUCT`: Super Admin ръчно (причината е задължителна). `SPEND`: потребителят отключва ниво. `REFUND`: Super Admin връща кредитите при отнемане на достъп. `PURCHASE`: за бъдещ Stripe. CHECK: `balanceAfter >= 0` |
| **course_access** | id, userId, courseId, **source** (`CREDITS`\|`ADMIN_UNLOCK`), creditsSpent (0 при ADMIN_UNLOCK), grantedById?, reason?, grantedAt, revokedAt?, revokedById?, revokeReason? | **Отключено ниво.** Партиален unique: (userId, courseId) WHERE revokedAt IS NULL. Нулирането след 3 неуспеха **не** отнема достъпа: нивото остава платено |

Бъдещ Stripe (не е в първата версия): таблица `payment` (stripeSessionId unique, amountCents, currency, status, creditsGranted, paidAt), която при успех записва `credit_transaction` с тип `PURCHASE`. Логиката „харча кредити → отключвам“ остава същата.

### 3.9 Журнал

| Таблица | Колони | Бележки |
|---|---|---|
| **audit_log** | id (bigserial), actorId, actorEmail (snapshot), actorRole, **action**, entityType, entityId, entityTitle?, targetUserId?, before (jsonb), after (jsonb), ip?, userAgent?, createdAt | **Append-only:** `REVOKE UPDATE, DELETE ON audit_log FROM app_user`. Индекси: (createdAt), (actorId), (entityType, entityId), (targetUserId) |

Действия (`action`): `VIDEO_UPLOAD`, `VIDEO_REPLACE`, `VIDEO_DELETE`, `VIDEO_RESTORE`, `FOLDER_ADD_VIDEO`, `FOLDER_REMOVE_VIDEO`, `FOLDER_REORDER`, `FOLDER_SET_REQUIRED`, `DOCUMENT_UPLOAD`, `DOCUMENT_REPLACE`, `DOCUMENT_DELETE`, `DOCUMENT_RESTORE`, `RULE_VIDEO_SET`, `QUESTION_CREATE`, `QUESTION_UPDATE`, `QUESTION_DEACTIVATE`, `QUESTION_ACTIVATE`, `QUESTION_IMPORT`, `MEETING_CREATE`, `MEETING_UPDATE`, `MEETING_CANCEL`, `MEETING_ANNUL_USER`, `CREDITS_GRANT`, `CREDITS_DEDUCT`, `COURSE_UNLOCK`, `COURSE_REVOKE`, `COURSE_PRICE_CHANGE`, `SECTION_RESET`, `ROLE_CHANGE` (от скрипта `set-role`).

Ролята **не** се сменя от панела. `pnpm set-role` пише ред в журнала с `actorEmail = 'cli'`.

---

## 4. Prisma схема

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────────────────────── Enums ─────────────────────────────

enum Role            { USER ADMIN SUPER_ADMIN }
enum Locale          { en fr es }
enum Weapon          { SABRE EPEE FOIL }
enum Level           { BEGINNER INTERMEDIATE ADVANCED HIGH_PERFORMANCE }
enum QuestionCategory { SABRE EPEE FOIL GENERAL }
enum AnswerOption    { A B C }
enum VideoStatus     { UPLOADING PROCESSING READY FAILED }
enum VideoFolderKind { MODULE LIBRARY }
enum DocumentCategory { FIE_RULES TECHNICAL ADMINISTRATIVE ORGANIZATION OTHER }
enum RuleCategory    { TECHNICAL ADMINISTRATIVE ORGANIZATION }
enum ResetReason     { THREE_FAILS ADMIN }
enum AttemptStatus   { IN_PROGRESS SUBMITTED EXPIRED }
enum CodeEntryResult { OK WRONG_CODE WRONG_SECTION EXPIRED RATE_LIMITED }
enum CreditTxType    { ADMIN_GRANT ADMIN_DEDUCT SPEND REFUND PURCHASE }
enum AccessSource    { CREDITS ADMIN_UNLOCK }

// ─────────────────────── Users / Better Auth ──────────────────────

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  emailVerified   Boolean   @default(false)
  name            String
  image           String?
  role            Role      @default(USER)
  locale          Locale    @default(en)
  creditBalance   Int       @default(0)          // CHECK (credit_balance >= 0)
  preferredWeapon Weapon?
  banned          Boolean   @default(false)
  deletedAt       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]
  creditTx        CreditTransaction[]  @relation("CreditTxUser")
  courseAccess    CourseAccess[]       @relation("AccessUser")
  sectionProgress SectionProgress[]
  lessonProgress  LessonProgress[]
  videoProgress   VideoProgress[]
  testAttempts    TestAttempt[]
  completions     CourseCompletion[]   @relation("CompletionUser")
  codeEntries     MeetingCodeEntry[]
  annulments      MeetingAnnulment[]   @relation("AnnulledUser")

  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id         String   @id @default(cuid())
  userId     String
  providerId String
  accountId  String
  password   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([identifier])
  @@map("verification")
}

model RateLimit {
  id          String @id @default(cuid())
  key         String @unique
  count       Int
  lastRequest BigInt

  @@map("rate_limit")
}

// ───────────────────────── Structure ─────────────────────────

model SubjectArea {
  id        String  @id @default(cuid())
  slug      String  @unique
  order     Int
  isActive  Boolean @default(false)

  translations SubjectAreaTranslation[]
  courses      Course[]
  videos       Video[]
  folders      VideoFolder[]
  documents    Document[]
  rules        Rule[]
  questions    Question[]

  @@map("subject_area")
}

model SubjectAreaTranslation {
  subjectAreaId String
  locale        Locale
  title         String
  description   String?
  subjectArea   SubjectArea @relation(fields: [subjectAreaId], references: [id], onDelete: Cascade)

  @@id([subjectAreaId, locale])
  @@map("subject_area_translation")
}

model Course {
  id            String   @id @default(cuid())
  subjectAreaId String
  weapon        Weapon
  level         Level
  priceCredits  Int      @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  subjectArea   SubjectArea         @relation(fields: [subjectAreaId], references: [id])
  translations  CourseTranslation[]
  modules       Module[]
  meetings      Meeting[]
  access        CourseAccess[]
  progress      SectionProgress[]
  attempts      TestAttempt[]
  completions   CourseCompletion[]

  @@unique([subjectAreaId, weapon, level])
  @@map("course")
}

model CourseTranslation {
  courseId String
  locale   Locale
  title    String
  summary  String?
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@id([courseId, locale])
  @@map("course_translation")
}

model Module {
  id        String   @id @default(cuid())
  courseId  String
  order     Int
  slug      String
  createdAt DateTime @default(now())

  course       Course              @relation(fields: [courseId], references: [id])
  translations ModuleTranslation[]
  lessons      Lesson[]
  videoFolder  VideoFolder?

  @@unique([courseId, order])
  @@unique([courseId, slug])
  @@map("module")
}

model ModuleTranslation {
  moduleId    String
  locale      Locale
  title       String
  description String?
  module      Module @relation(fields: [moduleId], references: [id], onDelete: Cascade)

  @@id([moduleId, locale])
  @@map("module_translation")
}

/// Регистър на хардкоднатите уроци. Съдържанието е в кода (viewPath).
model Lesson {
  id         String   @id @default(cuid())
  moduleId   String
  order      Int
  slug       String
  viewPath   String
  isRequired Boolean  @default(true)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())

  module   Module           @relation(fields: [moduleId], references: [id])
  progress LessonProgress[]

  @@unique([moduleId, slug])
  @@map("lesson")
}

// ─────────────────────────── Video ───────────────────────────

model Video {
  id             String      @id @default(cuid())
  subjectAreaId  String
  weapon         Weapon?
  bunnyVideoId   String      @unique
  bunnyLibraryId String
  durationSec    Int?
  thumbnailUrl   String?
  status         VideoStatus @default(UPLOADING)
  sizeBytes      BigInt?
  uploadedById   String
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?
  deletedById    String?

  subjectArea  SubjectArea        @relation(fields: [subjectAreaId], references: [id])
  translations VideoTranslation[]
  folderItems  VideoFolderItem[]
  ruleVideos   RuleVideo[]
  progress     VideoProgress[]

  @@index([subjectAreaId, weapon])
  @@map("video")
}

model VideoTranslation {
  videoId     String
  locale      Locale
  title       String
  description String?
  video       Video  @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@id([videoId, locale])
  @@map("video_translation")
}

model VideoFolder {
  id            String          @id @default(cuid())
  subjectAreaId String
  kind          VideoFolderKind
  moduleId      String?         @unique
  weapon        Weapon?
  order         Int             @default(0)
  isRequired    Boolean         @default(false)
  createdAt     DateTime        @default(now())
  deletedAt     DateTime?

  subjectArea  SubjectArea               @relation(fields: [subjectAreaId], references: [id])
  module       Module?                   @relation(fields: [moduleId], references: [id])
  translations VideoFolderTranslation[]
  items        VideoFolderItem[]
  progress     VideoProgress[]

  // CHECK (kind <> 'MODULE'  OR module_id IS NOT NULL)
  // CHECK (kind <> 'LIBRARY' OR weapon    IS NOT NULL)
  @@map("video_folder")
}

model VideoFolderTranslation {
  folderId    String
  locale      Locale
  title       String
  description String?
  folder      VideoFolder @relation(fields: [folderId], references: [id], onDelete: Cascade)

  @@id([folderId, locale])
  @@map("video_folder_translation")
}

model VideoFolderItem {
  folderId  String
  videoId   String
  order     Int
  addedById String
  addedAt   DateTime @default(now())

  folder VideoFolder @relation(fields: [folderId], references: [id])
  video  Video       @relation(fields: [videoId], references: [id])

  @@id([folderId, videoId])
  @@index([folderId, order])
  @@map("video_folder_item")
}

// ───────────────────── Documents & Rules ─────────────────────

model Document {
  id            String           @id @default(cuid())
  subjectAreaId String
  category      DocumentCategory
  order         Int              @default(0)
  publishedAt   DateTime?
  uploadedById  String
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  deletedAt     DateTime?
  deletedById   String?

  subjectArea  SubjectArea           @relation(fields: [subjectAreaId], references: [id])
  translations DocumentTranslation[]
  files        DocumentFile[]

  @@index([subjectAreaId, category])
  @@map("document")
}

model DocumentTranslation {
  documentId  String
  locale      Locale
  title       String
  description String?
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@id([documentId, locale])
  @@map("document_translation")
}

model DocumentFile {
  id           String    @id @default(cuid())
  documentId   String
  locale       Locale
  storageKey   String
  sizeBytes    BigInt
  pageCount    Int?
  sha256       String
  uploadedById String
  createdAt    DateTime  @default(now())
  replacedAt   DateTime?

  document Document @relation(fields: [documentId], references: [id])

  // UNIQUE (document_id, locale) WHERE replaced_at IS NULL  — в SQL миграция
  @@index([documentId, locale])
  @@map("document_file")
}

model Rule {
  id            String       @id @default(cuid())
  subjectAreaId String
  category      RuleCategory
  ruleNumber    String
  weapon        Weapon?
  order         Int          @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  subjectArea  SubjectArea       @relation(fields: [subjectAreaId], references: [id])
  translations RuleTranslation[]
  videos       RuleVideo[]

  @@unique([subjectAreaId, ruleNumber])
  @@map("rule")
}

model RuleTranslation {
  ruleId         String
  locale         Locale
  title          String
  text           String
  interpretation String?
  rule           Rule   @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@id([ruleId, locale])
  @@map("rule_translation")
}

model RuleVideo {
  ruleId  String
  videoId String
  order   Int    @default(0)

  rule  Rule  @relation(fields: [ruleId], references: [id])
  video Video @relation(fields: [videoId], references: [id])

  @@id([ruleId, videoId])
  @@map("rule_video")
}

// ───────────────────────── Questions ─────────────────────────

model Question {
  id            String           @id @default(cuid())
  subjectAreaId String
  category      QuestionCategory
  level         Level
  correct       AnswerOption
  active        Boolean          @default(true)
  externalRef   String?          @unique
  createdById   String?
  updatedById   String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  subjectArea  SubjectArea           @relation(fields: [subjectAreaId], references: [id])
  translations QuestionTranslation[]
  answers      TestAttemptAnswer[]

  @@index([subjectAreaId, category, level, active])
  @@map("question")
}

model QuestionTranslation {
  questionId  String
  locale      Locale
  text        String
  optionA     String
  optionB     String
  optionC     String
  explanation String?
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([questionId, locale])
  @@map("question_translation")
}

// ───────────────────────── Progress ─────────────────────────

model SectionProgress {
  id                 String       @id @default(cuid())
  userId             String
  courseId           String
  cycle              Int          @default(1)
  startedAt          DateTime     @default(now())
  contentCompletedAt DateTime?
  meetingId          String?
  codeEnteredAt      DateTime?
  attemptsUsed       Int          @default(0)   // CHECK (attempts_used BETWEEN 0 AND 3)
  passedAt           DateTime?
  resetAt            DateTime?
  resetReason        ResetReason?

  user       User               @relation(fields: [userId], references: [id])
  course     Course             @relation(fields: [courseId], references: [id])
  meeting    Meeting?           @relation(fields: [meetingId], references: [id])
  attempts   TestAttempt[]
  annulments MeetingAnnulment[]

  // UNIQUE (user_id, course_id) WHERE reset_at IS NULL  — в SQL миграция
  @@unique([userId, courseId, cycle])
  @@map("section_progress")
}

model LessonProgress {
  id              String    @id @default(cuid())
  userId          String
  lessonId        String
  cycle           Int
  firstOpenedAt   DateTime  @default(now())
  lastOpenedAt    DateTime  @default(now())
  scrolledToEndAt DateTime?
  timeSpentSec    Int       @default(0)
  mediaProgress   Json      @default("{}")
  completedAt     DateTime?

  user   User   @relation(fields: [userId], references: [id])
  lesson Lesson @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId, cycle])
  @@map("lesson_progress")
}

model VideoProgress {
  id               String    @id @default(cuid())
  userId           String
  videoId          String
  folderId         String?
  cycle            Int?
  maxContinuousSec Int       @default(0)
  durationSec      Int
  completedAt      DateTime?
  updatedAt        DateTime  @updatedAt

  user   User         @relation(fields: [userId], references: [id])
  video  Video        @relation(fields: [videoId], references: [id])
  folder VideoFolder? @relation(fields: [folderId], references: [id])

  @@unique([userId, videoId, folderId, cycle])
  @@map("video_progress")
}

model TestAttempt {
  id                String        @id @default(cuid())
  userId            String
  courseId          String
  sectionProgressId String
  cycle             Int
  attemptNumber     Int
  status            AttemptStatus @default(IN_PROGRESS)
  locale            Locale
  startedAt         DateTime      @default(now())
  expiresAt         DateTime
  submittedAt       DateTime?
  score             Int?
  passed            Boolean?

  user            User                @relation(fields: [userId], references: [id])
  course          Course              @relation(fields: [courseId], references: [id])
  sectionProgress SectionProgress     @relation(fields: [sectionProgressId], references: [id])
  answers         TestAttemptAnswer[]
  completion      CourseCompletion?

  // UNIQUE (user_id, course_id) WHERE status = 'IN_PROGRESS'  — в SQL миграция
  @@unique([sectionProgressId, attemptNumber])
  @@index([userId, courseId])
  @@map("test_attempt")
}

model TestAttemptAnswer {
  attemptId   String
  questionId  String
  position    Int
  optionOrder String         // напр. "CAB" — как са разбъркани опциите
  chosen      AnswerOption?
  isCorrect   Boolean?

  attempt  TestAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id])

  @@id([attemptId, questionId])
  @@index([questionId])
  @@map("test_attempt_answer")
}

model CourseCompletion {
  id           String    @id @default(cuid())
  userId       String
  courseId     String
  attemptId    String    @unique
  passedAt     DateTime
  annulledAt   DateTime?
  annulledById String?
  annulReason  String?

  user    User        @relation("CompletionUser", fields: [userId], references: [id])
  course  Course      @relation(fields: [courseId], references: [id])
  attempt TestAttempt @relation(fields: [attemptId], references: [id])

  // UNIQUE (user_id, course_id) WHERE annulled_at IS NULL  — в SQL миграция
  @@index([userId, courseId])
  @@map("course_completion")
}

// ───────────────────────── Meetings ─────────────────────────

model Meeting {
  id             String    @id @default(cuid())
  courseId       String
  startsAt       DateTime
  endsAt         DateTime
  hostName       String
  zoomUrl        String
  code           String    @unique @db.Char(6)
  codeValidUntil DateTime
  createdById    String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  cancelledAt    DateTime?
  deletedAt      DateTime?

  course       Course               @relation(fields: [courseId], references: [id])
  translations MeetingTranslation[]
  progress     SectionProgress[]
  codeEntries  MeetingCodeEntry[]
  annulments   MeetingAnnulment[]

  @@index([courseId, startsAt])
  @@map("meeting")
}

model MeetingTranslation {
  meetingId   String
  locale      Locale
  title       String
  description String?
  meeting     Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  @@id([meetingId, locale])
  @@map("meeting_translation")
}

model MeetingCodeEntry {
  id          String          @id @default(cuid())
  userId      String
  meetingId   String?
  courseId    String
  enteredCode String
  result      CodeEntryResult
  ip          String?
  createdAt   DateTime        @default(now())

  user    User     @relation(fields: [userId], references: [id])
  meeting Meeting? @relation(fields: [meetingId], references: [id])

  @@index([meetingId])
  @@index([userId, createdAt])
  @@map("meeting_code_entry")
}

model MeetingAnnulment {
  id                String   @id @default(cuid())
  userId            String
  meetingId         String
  courseId          String
  sectionProgressId String
  annulledById      String
  reason            String?
  createdAt         DateTime @default(now())

  user            User            @relation("AnnulledUser", fields: [userId], references: [id])
  meeting         Meeting         @relation(fields: [meetingId], references: [id])
  sectionProgress SectionProgress @relation(fields: [sectionProgressId], references: [id])

  @@index([meetingId])
  @@map("meeting_annulment")
}

// ───────────────────── Credits & Access ─────────────────────

model CreditTransaction {
  id             String       @id @default(cuid())
  userId         String
  amount         Int          // + добавя, − отнема
  type           CreditTxType
  balanceAfter   Int          // CHECK (balance_after >= 0)
  courseAccessId String?
  actorId        String?      // кой Super Admin; null при SPEND от самия потребител
  reason         String?      // задължително при ADMIN_* и REFUND (проверка в кода)
  createdAt      DateTime     @default(now())

  user         User          @relation("CreditTxUser", fields: [userId], references: [id])
  courseAccess CourseAccess? @relation(fields: [courseAccessId], references: [id])

  @@index([userId, createdAt])
  @@map("credit_transaction")
}

model CourseAccess {
  id           String       @id @default(cuid())
  userId       String
  courseId     String
  source       AccessSource
  creditsSpent Int          @default(0)
  grantedById  String?
  reason       String?
  grantedAt    DateTime     @default(now())
  revokedAt    DateTime?
  revokedById  String?
  revokeReason String?

  user         User                @relation("AccessUser", fields: [userId], references: [id])
  course       Course              @relation(fields: [courseId], references: [id])
  transactions CreditTransaction[]

  // UNIQUE (user_id, course_id) WHERE revoked_at IS NULL  — в SQL миграция
  @@index([userId, courseId])
  @@map("course_access")
}

// ───────────────────────── Audit ─────────────────────────

model AuditLog {
  id           BigInt   @id @default(autoincrement())
  actorId      String?
  actorEmail   String
  actorRole    Role?
  action       String
  entityType   String
  entityId     String
  entityTitle  String?
  targetUserId String?
  before       Json?
  after        Json?
  ip           String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([createdAt])
  @@index([actorId])
  @@index([entityType, entityId])
  @@index([targetUserId])
  @@map("audit_log")
}
```

### 4.1 Допълнителна SQL миграция (Prisma не ги поддържа директно)

```sql
-- баланс никога под нула
ALTER TABLE "user"             ADD CONSTRAINT credit_balance_nonneg CHECK ("creditBalance" >= 0);
ALTER TABLE credit_transaction ADD CONSTRAINT balance_after_nonneg  CHECK ("balanceAfter"  >= 0);
ALTER TABLE section_progress   ADD CONSTRAINT attempts_range        CHECK ("attemptsUsed" BETWEEN 0 AND 3);
ALTER TABLE meeting            ADD CONSTRAINT code_six_digits       CHECK (code ~ '^[0-9]{6}$');
ALTER TABLE video_folder       ADD CONSTRAINT folder_kind_target    CHECK (
  (kind = 'MODULE'  AND "moduleId" IS NOT NULL) OR
  (kind = 'LIBRARY' AND weapon     IS NOT NULL));

-- „текущ“ ред
CREATE UNIQUE INDEX section_progress_current ON section_progress ("userId","courseId") WHERE "resetAt"    IS NULL;
CREATE UNIQUE INDEX test_attempt_open        ON test_attempt     ("userId","courseId") WHERE status = 'IN_PROGRESS';
CREATE UNIQUE INDEX course_completion_valid  ON course_completion("userId","courseId") WHERE "annulledAt" IS NULL;
CREATE UNIQUE INDEX course_access_active     ON course_access    ("userId","courseId") WHERE "revokedAt"  IS NULL;
CREATE UNIQUE INDEX document_file_current    ON document_file    ("documentId",locale) WHERE "replacedAt" IS NULL;

-- журналът и дневникът с кредити са само за добавяне
REVOKE UPDATE, DELETE ON audit_log          FROM app_user;
REVOKE UPDATE, DELETE ON credit_transaction FROM app_user;
```

---

## 5. Бизнес правила върху схемата

### 5.1 Достъп

```
Ниво L на оръжие W е ОТКЛЮЧЕНО   ⇔  course_access(user, W, L) с revokedAt IS NULL
Потребителят може да го КУПИ     ⇔  не е отключено
                                    И (L = BEGINNER ИЛИ неанулиран course_completion(user, W, L-1))
                                    И user.creditBalance >= course.priceCredits
Super Admin може да го ОТКЛЮЧИ   ⇔  винаги (без кредити, без проверка на реда; reason е задължително)
```

PDF-ите, FIE Rules, Rules, Rules & Interpretation и Video Library са публични и не зависят от `course_access`. Видео папката на модула се вижда само при отключено ниво.

### 5.2 Харчене на кредити (една транзакция)

```sql
BEGIN;
SELECT "creditBalance" FROM "user" WHERE id = $user FOR UPDATE;
-- проверки от 5.1 (ред на нивата, няма активен достъп, баланс >= цена)
INSERT INTO course_access (... source = 'CREDITS', "creditsSpent" = price ...);
UPDATE "user" SET "creditBalance" = "creditBalance" - price WHERE id = $user;
INSERT INTO credit_transaction (... type = 'SPEND', amount = -price, "balanceAfter" = new_balance, "courseAccessId" = ...);
INSERT INTO section_progress (... cycle = 1 ...) ON CONFLICT DO NOTHING;
COMMIT;
```

Двойно кликане не може да вземе кредити два пъти заради `FOR UPDATE` и `course_access_active`.

### 5.3 Действия на Super Admin с кредити и достъп

| Действие | Какво записва |
|---|---|
| Добавя кредити | `credit_transaction` (`ADMIN_GRANT`, +N, reason) + `user.creditBalance` + `audit_log CREDITS_GRANT` |
| Отнема кредити | `ADMIN_DEDUCT`, −N; не може под 0 |
| Отключва ниво | `course_access` (`ADMIN_UNLOCK`, creditsSpent = 0, grantedById, reason) + `audit_log COURSE_UNLOCK` |
| Отнема достъп | `course_access.revokedAt/revokedById/revokeReason`; по избор `credit_transaction REFUND` за `creditsSpent` + `audit_log COURSE_REVOKE` |
| Сменя цената на ниво | `course.priceCredits` + `audit_log COURSE_PRICE_CHANGE`; вече отключените не се засягат |

### 5.4 Съдържание, код, тест

- **Модулът е минат** ⇔ всички `lesson` с `isRequired AND isActive` имат `lesson_progress.completedAt` в текущия cycle, **и** ако `video_folder.isRequired`, всички видеа в папката имат `video_progress.completedAt` в текущия cycle.
- **Секцията е мината** ⇔ двата модула са минати → `section_progress.contentCompletedAt`.
- **Код:** приема се, ако `meeting.courseId` = секцията, `now() BETWEEN startsAt AND codeValidUntil`, срещата не е отменена/изтрита и има по-малко от 5 грешни опита за час. Всеки опит → `meeting_code_entry`.
- **Тестът е достъпен** ⇔ `course_access` активен **И** `contentCompletedAt` **И** `codeEnteredAt` **И** `attemptsUsed < 3` **И** няма отворен опит.
- **Старт:** избират се 10 + 5 въпроса → `test_attempt` + 15 реда `test_attempt_answer` (без `chosen`), `attemptsUsed + 1`.
- **Предаване:** оценка на сървъра; `score >= 12` → `course_completion` + `section_progress.passedAt`.
- **3-ти неуспех:** `section_progress.resetAt = now(), resetReason = 'THREE_FAILS'` и нов ред с `cycle + 1`. `course_access` остава. Старите редове остават за Admin.
- **Анулиране на среща:** `meeting_annulment` + изчистване на `meetingId`/`codeEnteredAt`; ако има `course_completion` от този cycle → `annulledAt`. Достъпът до вече отключени по-високи нива не се отнема.

---

## 6. Какво виждат Admin и Super Admin за всеки потребител

Всичко идва от таблиците по-горе, без отделни „отчетни“ таблици:

| Екран | Източник |
|---|---|
| Профил: имейл, роля, регистрация, баланс | `user` |
| История на кредитите | `credit_transaction` (кой, кога, колко, защо) |
| Отключени нива и как | `course_access` |
| Прогрес по оръжие и ниво (текущ cycle и предишни) | `section_progress` |
| Прогрес по модул и урок (% изскролирано, гледани видеа, време) | `lesson_progress`, `video_progress` |
| Колко пъти е правил всеки тест, резултати, дати | `test_attempt` (групирано по курс и cycle) |
| Кои въпроси е сгрешил | `test_attempt_answer` + `question_translation` |
| Въведени кодове и анулирани срещи | `meeting_code_entry`, `meeting_annulment` |
| Статистика по въпрос (% верни) | `test_attempt_answer` по `questionId` |
| Кой Super Admin какво е променил | `audit_log` |

Admin вижда всичко това само за четене; Super Admin има и бутоните от 5.3, управлението на въпроси, видео папки, PDF-и и срещи.

---

## 7. Seed

`pnpm db:seed` (идемпотентен):
1. `subject_area`: 5 реда, само `refereeing` е `isActive`.
2. `course`: 3 оръжия × 4 нива = 12 реда с `priceCredits` по подразбиране (напр. 1).
3. `module`: 2 на курс, с преводи.
4. `lesson`: от регистъра на view-овете в кода (`src/lessons/registry.ts`); липсващите в регистъра стават `isActive = false`.
5. `video_folder`: по една `MODULE` папка за всеки модул (24) и по една `LIBRARY` папка за всяко оръжие (3), празни.
6. Въпросите идват отделно с `pnpm import:questions`, правилата с `pnpm import:rules`.

## 8. Отворено

1. Колко кредита струва всяко ниво и дали цената е еднаква за всички оръжия.
2. Дали при отнемане на достъп кредитите се връщат автоматично или Super Admin решава всеки път (схемата позволява и двете).
3. Кога и дали идва Stripe за купуване на кредити (таблицата `payment` е описана в 3.8, но не е в първата миграция).
