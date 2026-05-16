# Asteria Space V1 後台接駁說明

V1 只做一件事：令客人有一個私人空間，登入後可以補回聯絡資料、send message、upload screenshot，客服可以在後台回覆。

今次先不要做：

- journal
- relationship update
- timeline
- recommendations
- 教學偏好

呢啲之後再慢慢長出來。

## V1 功能

- 系統登入：由 Asteria 開 account 名 + password 比客人 / staff
- Basic Profile：稱呼、自己名、電話、WhatsApp、IG、Telegram、Email
- Message Thread：客人同客服的對話 history
- Upload Screenshot：客人 / 客服都可以放多張圖
- Staff Inbox：客服睇 chatlist，再入每個客人對話
- Email Notification 預留：客服回覆後，之後可以接 email function 通知客人

## Supabase 要做

只可以在 Supabase project `Asteria inbox chat` 入面做，唔好郁其他 project。

1. 入 SQL Editor
2. 貼上 `supabase/schema.sql` 全部內容
3. Run SQL
4. 去 Storage 開 bucket：
   - Name: `space-uploads`
   - Private bucket
5. 去 Authentication 開 Email login
6. 去 Project Settings -> API，拎：
   - Project URL
   - anon public key
7. Netlify / local `.env` 加：

```env
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 anon public key
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_ANON_KEY=你的 anon public key
SUPABASE_SERVICE_ROLE_KEY=你的 service role key
```

`VITE_` 開頭會俾 browser 用，可以公開。`SUPABASE_SERVICE_ROLE_KEY` 只可以放 Netlify Environment Variables / server function，唔可以寫入網頁或 GitHub。

## 私隱規則

Schema 已經加 Row Level Security。正式版要靠呢層保護，而唔係靠前端隱藏按鈕：

- 普通客人只可以睇 / 改自己的 profile
- 普通客人只可以睇自己的 message thread
- 普通客人只可以 upload / read 自己 folder 入面的 screenshot
- Admin 先可以睇全部客人同全部對話
- Admin 先可以管理 account mapping / audit log

重要：正式版必須連 Supabase Auth + Database + Storage。若 Netlify env 未設定好，Asteria Space 會直接提示 backend 未連接，不會再建立本機 account 或用 browser localStorage 假裝成功。

## Admin 權限

當你第一個 staff/admin account 在 Supabase Auth 建好後，要在 Supabase SQL Editor 加：

```sql
insert into public.admin_users (user_id)
values ('你的 auth.users.id');
```

`auth.users.id` 可以在 Supabase Authentication -> Users 入面找到。

## Account 名登入點做

Supabase Auth 本身係 email/password。因為 Asteria Space 想用 account 名登入，正式版會用 Netlify server function 做中間層：

- 客人輸入 account 名 + password
- server function 將 account 名對應到內部 login email
- frontend 只收到正常 Supabase session
- 真 email 只放在 profile/contact_email，作備用聯絡
- 內部 auth email 會用 `account名@accounts.asteria-space.local`

不要將 service role key 放入 frontend。新增 account、reset password、delete account 全部要經 server function，並檢查操作者係 admin。

## Netlify Functions

已加入：

- `space-login`
- `space-create-account`
- `space-reset-password`
- `space-delete-account`

部署到 Netlify 後，frontend 會 call：

```text
/.netlify/functions/space-login
/.netlify/functions/space-create-account
/.netlify/functions/space-reset-password
/.netlify/functions/space-delete-account
```

本地 Vite preview 未必會自動跑 Netlify Functions；正式測試 backend 時，用 Netlify deploy preview 或 Netlify CLI。

## Email Notification

Database 已經有 `notification_events`。客服一回覆，系統會自動放一條 `staff_reply` event。

之後要再接 Netlify Function / Supabase Edge Function 去 send email，例如：

> Asteria has replied to your message.

未接 email function 前，message record 仍然會正常儲存，只係未會自動寄 email。
