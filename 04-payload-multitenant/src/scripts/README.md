# Standalone Tenant Seeding Scripts

This folder contains scripts to programmatically seed or reset individual tenants (neighborhoods) in the database.

## How to Reseed

You can run these scripts directly from the root of `04-payload-multitenant` at any time (even while the Next.js development server is running).

### 1. Reseed North Of Grand (NOG)

To wipe and reseed all pages, posts, media, and navigation menu links for the **North of Grand** neighborhood:

```bash
npx tsx src/scripts/seed-nog.ts
```

### 2. Reseed Beaverdale

To wipe and reseed all pages, posts, media, and navigation menu links for the **Beaverdale** neighborhood:

```bash
npx tsx src/scripts/seed-beaverdale.ts
```

---

## What the Scripts Do

Whenever you execute one of these scripts, it:

1. Initializes Payload's local API.
2. Identifies the target tenant by its slug (`default` for NOG — the platform default tenant — or `beaverdale`).
3. If it already exists, it **deletes all associated pages, posts, media, headers, and footers** to prevent duplicate database records.
4. Safely removes the tenant relationship from all registered user accounts.
5. Recreates the tenant with the selected template configuration (`light` for NOG, `dark` for Beaverdale).
6. Fetches clean assets from the web and uploads them to the media library.
7. Re-seeds the customized homepage, contact page, sample posts, header menus, and footer links.
8. Re-associates all existing admin users so they can access the tenant inside the admin panel.

### Migrate existing `nog` slug to `default`

If production still has tenant slug `nog` from an earlier seed:

```bash
npx tsx src/scripts/migrate-nog-to-default.ts
```

Then redeploy media (`./infra/sync-media.sh` or full `./infra/deploy.sh`).
