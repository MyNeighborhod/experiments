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

Run with these so it's easier to debug and live preview changes: 
```
docker compose up -d postgres 
pnpm dev
```


3. Payload CMS Website template project:

```bash
npx create-payload-app@latest -n 03-payload-website -t website --use-pnpm
```

This will bootstrap a ready-to-go website template featuring:
- Premade collections (Pages, Posts, Categories, Media, Users)
- A complete frontend built on Next.js App Router
- Configured PostgreSQL / MongoDB database connection settings

Automating with a script (non-interactive):

```bash
# 1. Clone the website template directly (bypasses prompts completely)
npx -y degit payloadcms/payload/templates/website 03-payload-website

# 2. Configure .env file
cd 03-payload-website
cp .env.example .env
sed -i '' 's|DATABASE_URL=.*|DATABASE_URL=postgres://postgres:local@127.0.0.1:5432/03-payload-website|g' .env

```


4. Payload CMS Multi-Tenant project :
A:
Run via npx `npx create-payload-app --example multi-tenant --use-pnpm`
[brokern out of the box] other examples: https://github.com/payloadcms/payload/tree/main/examples

B:
`npx create-payload-app@latest -n 04-payload-multitenant -t website --use-pnpm`
then (once the db is setup in docker and .env):
`pnpm add @payloadcms/plugin-multi-tenant@3.85.0`
`pnpm dev`
go to admin http://localhost:3000/admin/login 



