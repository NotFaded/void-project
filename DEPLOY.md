# VØID — Launch Checklist

## Step 1 — Get a domain (~2 min)
Go to **porkbun.com**, search for `void.xyz` or `entervoid.xyz`.
~$2/year, includes free WHOIS privacy. Buy it.

---

## Step 2 — Set up Supabase (~5 min)
1. Go to **supabase.com** → "Start your project" → sign up free
2. Create a new project (name it `void`, pick any region)
3. Wait ~2 min for it to spin up
4. Go to **SQL Editor** → New Query → paste the contents of `supabase-schema.sql` → Run
5. Go to **Project Settings → API**
   - Copy **Project URL** → this is your `SUPABASE_URL`
   - Copy **service_role** key (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`

---

## Step 3 — Push to GitHub (~3 min)
In your terminal:
```cmd
cd C:\Users\mardin\Desktop\mysterysol\void-project
git init
git add .
git commit -m "void launch"
```
Go to **github.com** → New repository → name it `void-project` → Create.
Then follow the "push existing repo" commands GitHub shows you.

---

## Step 4 — Deploy to Vercel (~5 min)
1. Go to **vercel.com** → "Add New Project" → Import from GitHub → select `void-project`
2. Before deploying, add these **Environment Variables** in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_DEPOSIT_WALLET` | Your mainnet Solana wallet address |
| `NEXT_PUBLIC_SOLANA_RPC` | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.xyz` |
| `SUPABASE_URL` | From Supabase project settings |
| `SUPABASE_SERVICE_KEY` | From Supabase project settings (service_role) |
| `NEXT_PUBLIC_REVEAL_DATE` | Leave blank (TBA) or set a date |

3. Click **Deploy**

---

## Step 5 — Connect your domain (~5 min)
1. In Vercel → your project → **Settings → Domains** → Add your domain
2. Vercel shows you two DNS records to add
3. Go to **porkbun.com** → your domain → DNS → add the records Vercel shows
4. Wait 5–30 min for DNS to propagate

---

## Step 6 — Install Supabase package
```cmd
npm install @supabase/supabase-js
```

---

## You're live. 

Run the social pack. Post the first cryptic tweet. Watch the signal spread.
