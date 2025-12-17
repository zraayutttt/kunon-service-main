# Plan: Build "AI Short Generator" Web App (Next.js + Tailwind)

You are an AI pair programmer running inside Cursor.  
Follow this plan step by step to set up a working Next.js project with Tailwind, including:

- A dashboard home page.
- A **Niche Finder** page with a modern yellow/pink UI.
- A reusable form component to search dummy ideas.
- Proper Tailwind configuration so all styles work.

---

## 0. Assumptions

- Use **Next.js App Router** (the `app/` directory).
- Use **TypeScript**.
- Use **Tailwind CSS**.
- Project root is the current folder.

If a file already exists, **overwrite it with the content specified here** unless stated otherwise.

---

## 1. Initialize Next.js project

**Terminal tasks:**

1. Run:

   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
