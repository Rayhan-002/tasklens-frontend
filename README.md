# TaskLens — Frontend

A task management and image annotation web app built with Next.js, TypeScript, and Tailwind CSS.

**Live app:** https://tasklens-frontend.vercel.app  
**Backend repo:** https://github.com/Rayhan-002/tasklens-backend  
**Demo credentials:** `rayhandummy@gmail.com` / `12345678$`

---

## ⚔️ Villains Faced & How I Defeated Them

### Villain 1 — The Timezone Hydra
The initial selected date in the Zustand store used `new Date().toISOString()` which returns UTC. Users in UTC+ timezones past midnight UTC would see the wrong day's tasks by default. Slain by switching to a `toLocalISO()` helper that reads the local calendar date instead of UTC.

### Villain 2 — The Hydration Demon (`<button>` inside `<button>`)
The image list in the annotation tool nested a delete `<button>` inside an outer `<button>` for the image row. Next.js caught this as an invalid HTML hydration error. Defeated by converting the outer element to a `<div role="button">` with keyboard handlers, keeping full accessibility intact.

### Villain 3 — The CORS Phantom (blank canvas)
Uploaded images appeared in the list but the Konva canvas stayed blank. The root cause: DRF's `ImageField` serializer was called without `context={'request': request}`, so it emitted relative paths like `/media/...` instead of absolute URLs. The frontend resolved these against `localhost:3000` — a 404. Fixed by passing request context to every `AnnotationImageSerializer` call in the backend, and adding a `resolveMediaUrl()` helper on the frontend as a safety net.

### Villain 4 — The Drag-and-Drop Phantom Click
With `@dnd-kit`, spreading `{...listeners}` on the card element captured all `pointerdown` events — including clicks on the Edit/Delete buttons, accidentally triggering drags instead of opening modals. Defeated by adding `onPointerDown={(e) => e.stopPropagation()}` to the action button container so those clicks never reach the drag listener.

### Villain 5 — The Race Condition Wraith
Rapidly switching dates fired multiple concurrent API requests; whichever resolved last "won" and showed stale data. Vanquished with `AbortController` — each date change cancels the previous in-flight request.

### Villain 6 — The Zod v4 / RHF Resolver Mismatch
Zod v4's `.default('')` makes the input type `string | undefined`, which conflicted with `useForm<TaskFormData>`. The TypeScript compiler refused to cooperate. Peace was brokered by removing `.default()` from the schema and letting `useForm`'s `defaultValues` handle the empty-string defaults instead.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand (auth + date stores)
- **HTTP:** Axios with JWT interceptors
- **Forms:** react-hook-form + Zod
- **Drag & Drop:** @dnd-kit/core
- **Canvas:** react-konva + konva
- **Toasts:** sonner

---

## ⚙️ Environment

| Tool | Version |
|------|---------|
| Node.js | 24.15.0 |
| npm | bundled with Node |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8000`

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Rayhan-002/tasklens-frontend
cd tasklens-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

