# راشد | RASHID

**راشد** منصة حوار إسلامي موثّق بالذكاء الاصطناعي، صُممت بالعربية أولًا مع دعم الإنجليزية.  
لا يكتفي راشد بإعطاء إجابة، بل يحاول أن يجعل **مسار الوصول إليها قابلًا للتتبع والتحقق**: من فهم السؤال، إلى استرجاع المصادر، إلى بناء الادعاءات والتحقق منها، ثم صياغة الإجابة وعرض أدلتها للمستخدم.

> **الفكرة الأساسية:** الانتقال من "إجابة جاهزة" إلى **فهم موثّق، سياقي، وقابل للحوار**.

### 🔗 العرض المباشر | Live Demo
https://rashid-islamic-dialogue-platform.onrender.com/

---

## المشكلة | Problem

المحتوى الإسلامي الرقمي اليوم واسع ومتناثر، والمستخدم غير المتخصص قد يواجه عدة مشكلات:

- إجابات دينية بلا مصدر واضح أو باقتباسات خارج سياقها.
- صعوبة الوصول إلى القرآن والحديث والتفسير والمصادر الموثوقة من سؤال طبيعي بسيط.
- خلط بين الرأي، والدليل، والخلاف العلمي، والحكم الشخصي.
- أنظمة ذكاء اصطناعي قد تصوغ إجابة مقنعة لغويًا رغم ضعف الدليل.
- فقدان سياق الحوار عند الأسئلة المتتابعة.
- صعوبة معرفة: **ما الذي استندت إليه الإجابة؟ ولماذا؟**

---

## الحل | Solution

راشد يبني الإجابة داخل **Evidence-Linked Dialogue Architecture** تربط بين حالة الحوار والأدلة.

المسار الرئيسي:

```text
User Question
   ↓
Adaptive Router
   ↓
Retrieval Planner + Source Routing
   ↓
Trusted Sources / APIs / MCP
   ↓
Evidence Pack
   ↓
Claim Builder
   ↓
Claim-Evidence Gate
   ↓
Dialogue Planner
   ↓
Writer
   ↓
Final Verifier
   ↓
Structured Response + Citations + Dialogue/Evidence Graph
```

### ما الذي يميز راشد؟

- **استرجاع متعدد المصادر الموثوقة** بدل الاعتماد على ذاكرة النموذج وحدها.
- **Claim-Evidence Gate** للتحقق من أن الادعاءات المهمة مدعومة بأدلة.
- **Final Verifier** لمراجعة الإجابة بعد صياغتها.
- **Clarification** عند غموض السؤال بدل التخمين.
- **Referral** عند الأسئلة التي تتطلب حكمًا شخصيًا أو مختصًا.
- **Insufficient Evidence** عند عدم كفاية الأدلة بدل اختلاق إجابة.
- دعم **الخلاف العلمي** كمسار مستقل.
- حفظ سياق الحوار والأسئلة المتتابعة.
- **Inline citations** وفتح المصدر الأصلي.
- **Dialogue & Evidence Graph** تفاعلية توضّح العلاقة بين السؤال، الادعاءات، والأدلة.

---

## مصادر المعرفة | Knowledge Sources

يسترجع النظام المعرفة من مصادر وخدمات موثوقة، منها:

- **QuranEnc**
- **HadeethEnc**
- **Dorar**
- **Islamic Content MCP**
- Corpus محلي منظم
- **Approved Web Search** محصور بقائمة مواقع موثوقة فقط

البحث على الويب ليس بحثًا مفتوحًا؛ يتم تقييده إلى نطاقات معتمدة مثل:
`dorar.net`, `tafsir.net`, `quranenc.com`, `hadeethenc.com`, `islamenc.com`, `shamela.ws` وغيرها.

---

## الموثوقية والسلامة | Reliability & Safety

الموثوقية في راشد جزء من المسار نفسه، وليست خطوة تجميلية بعد توليد الإجابة:

- **Zod schemas** تتحقق من بنية البيانات عند الحدود المهمة بين مراحل النظام.
- التحقق من الأدلة قبل السماح للادعاءات بالوصول إلى الكاتب.
- الكاتب يصوغ من الادعاءات المقبولة والأدلة المسترجعة.
- التحقق النهائي من الإجابة بعد الصياغة.
- إعادة صياغة محدودة عند فشل التحقق بدل loop غير محدود.
- مسار منفصل للأسئلة الغامضة.
- عدم إصدار فتوى شخصية مستقلة.
- الامتناع أو الإحالة عند عدم كفاية الأدلة.
- حفظ مصدر كل دليل وإظهاره للمستخدم.

---

## التقنيات | Technology Stack

### Frontend
- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **React Flow / @xyflow/react** لعرض Dialogue & Evidence Graph

### Backend & AI
- **Next.js API Routes**
- **Google Gemini API** عبر `@google/genai`
- Multi-model fallback مع cooldown عند quota/rate-limit أو temporary unavailability
- **Zod** لعقود البيانات والتحقق من المخرجات بين المراحل

### Data & State
- **Neon PostgreSQL**
- Session / Conversation / Turn persistence
- Dialogue State
- Verified evidence reuse للحالات المناسبة
- `sessionStorage` + React Context لحالة الجلسة في الواجهة

### Retrieval
- QuranEnc API
- HadeethEnc API
- Dorar API
- Islamic Content MCP
- Local corpus
- Approved-domain web fallback

### Delivery
- **GitHub**
- **GitHub Actions**
- **Render**

---

## المطورون | Developers

تم تطوير المشروع بواسطة **فريق ثُلّة الأثر | Thullat Al-Athar Team** ضمن الهاكاثون الإسلامي للذكاء الاصطناعي.

- Core repository: **0-Artha-0/Rashid-Islamic-Dialogue-Platform**
- Development, AI pipeline, retrieval, verification, UI/UX, and deployment were built collaboratively by the RASHID team.

---

## لماذا طُوّر راشد؟ | Why RASHID?

طُوّر راشد لأن المشكلة ليست نقص المعلومات فقط، بل **كيفية الوصول إلى المعلومة الدينية، وفهم سياقها، ومعرفة دليلها، والتمييز بين القطعي والخلافي والشخصي**.

الهدف طويل المدى هو المساهمة في نقل تجربة المستخدم من:

> **"أعطني جوابًا سريعًا"**

إلى:

> **"أرني الدليل، والسياق، وما هو محل اتفاق أو خلاف، ودعني أتحقق بنفسي."**

---

## التشغيل محليًا | Local Setup

### 1. Clone

```bash
git clone https://github.com/0-Artha-0/Rashid-Islamic-Dialogue-Platform.git
cd Rashid-Islamic-Dialogue-Platform
```

### 2. Install dependencies

يفضّل استخدام:

```bash
npm ci
```

أو:

```bash
npm install
```

### 3. Environment variables

انسخ ملف البيئة:

```bash
cp .env.example .env.local
```

على Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

ثم أضف القيم المطلوبة في `.env.local`:

```env
GEMINI_API_KEY=
DATABASE_URL=

LLM_MODELS=
EMBEDDING_MODEL=

RASHID_DISABLE_WEB_SEARCH=false
RASHID_APPROVED_WEB_DOMAINS=
WEB_SEARCH_MODEL=
```

أهم متغيرين للتشغيل الكامل هما:

- `GEMINI_API_KEY`
- `DATABASE_URL` لقاعدة Neon PostgreSQL

> لا ترفع `.env.local` أو أي مفاتيح سرية إلى GitHub.

### 4. Run

```bash
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

### 5. Production build

```bash
npm run build
npm start
```

---

## الاختبار | Validation

أهم أوامر التحقق قبل الدمج أو النشر:

```bash
npm run typecheck
npm run build
```

كما يحتوي المشروع على اختبارات ومسارات فحص للـpipeline والاسترجاع والتحقق.

---

## النشر | Deployment

النسخة الرئيسية معدّة للنشر عبر **Render Web Service**.

### Build Command

```bash
npm ci && npm run build
```

### Start Command

```bash
npm start
```

أضف متغيرات البيئة نفسها الموجودة في `.env.local` داخل إعدادات Render.

---

## هيكل المشروع | Project Structure

```text
src/
├── app/                 # Pages + API routes
├── components/          # UI and chat components
├── lib/
│   ├── ai/              # Router, planner, writer, verifier, LLM client
│   ├── rag/             # Retrieval and source connectors
│   ├── graphs/          # Dialogue / evidence graph logic
│   ├── db/              # Persistence layer
│   └── schemas/         # Zod contracts
├── prompts/
└── types/

data/
├── raw/
├── normalized/
├── processed/
└── tests/

scripts/
docs/
public/
└── brand/
```

---

## English

### What is RASHID?

**RASHID** is an Arabic-first, evidence-linked Islamic dialogue platform powered by AI.

### Live Demo
https://rashid-islamic-dialogue-platform.onrender.com/ It is designed not only to answer questions, but to make the reasoning path **traceable, source-grounded, and verifiable**.

### The Problem

Users searching for Islamic knowledge often face fragmented sources, decontextualized quotations, unclear scholarly disagreement, unsourced AI answers, and difficulty distinguishing general information from cases that require a qualified specialist.

### The Solution

RASHID combines dialogue state, trusted-source retrieval, claim extraction, claim-evidence verification, dialogue planning, answer generation, and final verification in one pipeline.

It can:

- retrieve from trusted Islamic sources;
- keep conversation context across follow-up turns;
- attach citations to the final response;
- ask for clarification instead of guessing;
- refer personalized rulings to a qualified specialist;
- abstain when evidence is insufficient;
- visualize dialogue points, claims, and evidence in an interactive graph.

### Core Architecture

```text
User
→ Router
→ Retrieval Planner
→ Trusted Retrieval
→ Evidence Pack
→ Claim Builder
→ Claim-Evidence Gate
→ Dialogue Planner
→ Writer
→ Final Verifier
→ Structured Answer + Citations + Graph
```

### Technology

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, React Flow  
**AI:** Google Gemini, multi-model fallback, structured prompting  
**Validation:** Zod  
**Database:** Neon PostgreSQL  
**Retrieval:** QuranEnc, HadeethEnc, Dorar, Islamic Content MCP, local corpus, approved-domain web fallback  
**Deployment:** Render  
**Version control / CI:** GitHub, GitHub Actions

### Developers

Developed by **Thullat Al-Athar Team** for the Islamic AI Hackathon.

Repository: **0-Artha-0/Rashid-Islamic-Dialogue-Platform**

### Why We Built It

RASHID was built to move users from simply receiving an instant answer toward understanding **what the evidence is, where it came from, how it relates to the question, and where uncertainty or scholarly disagreement remains**.

### Run Locally

```bash
git clone https://github.com/0-Artha-0/Rashid-Islamic-Dialogue-Platform.git
cd Rashid-Islamic-Dialogue-Platform
npm ci
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

Required environment variables for the full experience include:

```env
GEMINI_API_KEY=
DATABASE_URL=
```

For a production build:

```bash
npm run typecheck
npm run build
npm start
```

---

## ملاحظة | Note

راشد **ليس محرك فتاوى شخصية** ولا يستبدل العلماء أو المختصين. الهدف هو دعم الفهم الموثّق والحوار القابل للتتبع، مع الإحالة عند الحاجة.
