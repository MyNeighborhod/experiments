# Experiments projects

1. Vanila nextjs app. Website to learn more for how to get started with nextjs: 
https://nextjs.org/docs
Useful templates: https://vercel.com/templates

```
pnpm create next-app 01-vanilla-nextjs --ts --no-tailwind --eslint --app --src-dir --import-alias "@/*"

cd 01-vanilla-nextjs
pnpm dev

```

use `corepack enable` to allow different pnpm versions

2. Standalone Payload CMS project:

```bash
npx create-payload-app@latest -n 02-payload-init -t blank --use-pnpm
```

This will prompt you for:
- Database: Choose **MongoDB** or **Postgres** (Next.js & Payload require a database to store collections and users).
- Database Connection String: Enter your local or cloud database URI (e.g. `mongodb://localhost:27017/payload-init`).
