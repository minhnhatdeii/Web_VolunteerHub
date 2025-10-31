Node.js + Express (nhanh, phổ biến) hoặc NestJS (cấu trúc hơn).

ORM: Prisma hoặc TypeORM (Prisma recommended cho dev nhanh).

DB (dev/prod): Postgres (Supabase) — free tier.

Storage: Google Cloud Storage (nếu dùng Cloud Run) hoặc Supabase Storage.

Auth: JWT + bcrypt cho hash password.

Realtime: socket.io + Redis (nếu cần scale) — hoặc Supabase Realtime.

Notification: web-push (web push) + lưu subscription endpoint trong DB.

CI/CD: GitHub Actions → build image → deploy lên Cloud Run.

3) Mô hình dữ liệu (Postgres) — bảng chính

users

id UUID PK
name TEXT
email TEXT UNIQUE
password_hash TEXT
role TEXT CHECK IN ('volunteer','manager','admin')
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP


events

id UUID PK
title TEXT
description TEXT
thumbnail_url TEXT
location TEXT
category TEXT
start_time TIMESTAMP
end_time TIMESTAMP
capacity INT
created_by UUID -> users(id)  -- manager id
status TEXT CHECK ('draft','pending','approved','rejected','cancelled')
created_at TIMESTAMP
updated_at TIMESTAMP


registrations

id UUID PK
event_id UUID -> events(id)
user_id UUID -> users(id)
status TEXT CHECK ('pending','approved','rejected','cancelled','attended')
registered_at TIMESTAMP
updated_at TIMESTAMP


posts (kênh trao đổi mỗi event)

id UUID PK
event_id UUID -> events(id)
author_id UUID -> users(id)
content TEXT
media_urls JSON[]  -- list of image URLs
created_at TIMESTAMP
updated_at TIMESTAMP
is_hidden BOOLEAN DEFAULT false


comments

id UUID PK
post_id UUID -> posts(id)
author_id UUID -> users(id)
content TEXT
created_at TIMESTAMP


likes

id UUID PK
target_type TEXT CHECK ('post','comment')
target_id UUID
user_id UUID
created_at TIMESTAMP


notifications

id UUID PK
user_id UUID
title TEXT
body TEXT
data JSON
is_read BOOLEAN DEFAULT false
created_at TIMESTAMP


web_push_subscriptions

id UUID PK
user_id UUID
subscription JSON -- store endpoint, keys
created_at TIMESTAMP


Các bảng trên đảm bảo đủ nghiệp vụ: tạo/duyệt event, đăng ký/hủy, channel post/comment/like, notifications, export báo cáo. Nhu cầu dashboard (count, stats) có thể truy vấn bằng aggregate SQL. 

chi tiết giao diện VolunteerHub

4) API endpoints (REST) — mapping trực tiếp tới UI

Authentication headers: Authorization: Bearer <accessToken>

Auth

POST /api/auth/register
body: { name, email, password, role } → tạo user (role: volunteer|manager). (UI gửi POST /api/auth/register). 

chi tiết giao diện VolunteerHub

POST /api/auth/login
body: { email, password } → returns { accessToken, refreshToken, user }. (UI gọi POST /api/auth/login). 

chi tiết giao diện VolunteerHub

POST /api/auth/refresh — đổi refresh → access token

POST /api/auth/logout — huỷ refresh token

Users / Profile

GET /api/users/me — lấy profile

PUT /api/users/me — cập nhật tên, avatar (upload image → Cloud Storage), settings (push on/off)

POST /api/users/:id/lock (admin) — khóa/mở tài khoản

Events

GET /api/events — list (params: q, category, status, time_from, time_to, highlight=true) — (Home uses /api/events?highlight=true). 

chi tiết giao diện VolunteerHub

GET /api/events/:id — chi tiết event (nếu approved thì show channel link)

POST /api/events — create event (manager) — status default draft or pending nếu gửi duyệt

PUT /api/events/:id — edit (manager owns it)

DELETE /api/events/:id — delete

POST /api/events/:id/submit — submit for approval (status -> pending)

GET /api/managers/:id/events — lấy danh sách event do manager tạo

Event Approval (Admin)

GET /api/admin/events?status=pending — list pending

POST /api/admin/events/:id/approve — approve (tự động tạo channel, gửi notification)

POST /api/admin/events/:id/reject — reject (kèm lý do)

Registrations (Volunteer sign-up)

POST /api/events/:id/register — đăng ký (creates registrations.status='pending' hoặc auto-approved tùy config)

POST /api/events/:id/cancel — hủy đăng ký

GET /api/users/me/registrations — lịch sử tham gia

POST /api/events/:id/registrations/:regId/approve (manager) — duyệt volunteer (manager / admin)

Channel (posts/comments)

GET /api/events/:id/posts?limit=... — lấy posts (nếu event.approved)

POST /api/events/:id/posts — tạo post (content + optional file upload)

POST /api/posts/:id/comments — comment

POST /api/posts/:id/like — like post

DELETE /api/posts/:id — (manager/admin to hide/delete)

Realtime: socket namespace /events/:id để push new posts/comments. UI yêu cầu auto-load every 10s OR WebSocket. 

chi tiết giao diện VolunteerHub

Reports / Export (Admin)

GET /api/admin/reports/events-by-month?year=2025 → JSON for charts

GET /api/admin/export/events.csv — download CSV

GET /api/admin/export/registrations.csv

Notifications

GET /api/users/me/notifications

POST /api/users/me/webpush — register subscription (store to web_push_subscriptions)

POST /api/notify/send — admin-triggered (or system push on approve/registration)

5) Flow authentication & RBAC (ngắn gọn)

Đăng nhập → server trả accessToken (ngắn hạn, e.g. 15-60 phút) + refreshToken (long).

Middleware auth parses JWT, attach req.user = {id, role}.

Middleware requireRole('manager') / requireRole('admin') kiểm tra req.user.role.

Truy cập tài nguyên: e.g., editing event chỉ owner (manager) hoặc admin.

6) Validations & security (theo yêu cầu chấm điểm: input validation, an ninh)

Validate input bằng schema (Joi / Yup / Zod). UI doc nhắc validate forms. 

VolunteerHub

Hash password bằng bcrypt (cost 10-12).

Store only hashed password.

Use HTTPS; set HSTS, CORS whitelist cho frontend domain (Cloud Storage static site).

Rate-limit endpoints auth (prevent brute-force).

Protect file uploads: verify mime-type, size limits; serve via signed URLs (Cloud Storage signed URL) nếu private.

Sanitize content to prevent XSS (posts/comments).

Use prepared statements / ORM to avoid SQL injection.

Use CSP headers for frontend.

7) File uploads & media

Upload images via /api/uploads (multipart/form-data) → backend streams to Cloud Storage and returns public/private URL. For avatars/thumbnails store the URL in DB.

For Cloud Run: prefer signed uploads (frontend requests signed upload URL from backend, uploads directly to storage) to reduce backend bandwidth.

8) Realtime & Notifications (kênh trao đổi)

Minimal approach (fast): implement polling every 10s (UI doc suggests) for posts. 

chi tiết giao diện VolunteerHub

Better: socket.io on Cloud Run. On event approval, notify connected clients. If scaling across instances, use Redis/adapter or use Supabase Realtime.

Web Push: store subscription from frontend, send push when: event approved, registration status changed, admin message, new post in event they joined.

9) Queries/aggregation cho Dashboard & Reports

Volunteer dashboard: COUNT(registrations where user_id=me and status='attended'), upcoming events, notifications. 

chi tiết giao diện VolunteerHub

Manager dashboard: COUNT(events where created_by=me), pending registrations per event.

Admin dashboard: total users, events pending approval, total registrations; events-by-month: GROUP BY date_trunc('month', start_time).

10) Example request / response (selected)

POST /api/auth/register
Request:

{
  "name":"Nguyen A",
  "email":"a@example.com",
  "password":"P@ssw0rd!",
  "role":"volunteer"
}


Response (201):

{ "message":"registered", "user": { "id":"...", "email":"a@example.com", "role":"volunteer" } }


POST /api/events
Request (manager):

{
 "title":"Trồng cây ven sông",
 "description":"...",
 "location":"Quận X",
 "start_time":"2025-12-05T07:30:00Z",
 "end_time":"2025-12-05T11:30:00Z",
 "capacity":50,
 "category":"Môi trường",
 "thumbnail_url":"https://storage/...."
}


Response:

{ "id":"...", "status":"draft", "created_by":"manager-uuid" }

11) Triển khai / CI

Containerize app (Docker).

GitHub Actions: build image → push to Google Container Registry → deploy to Cloud Run.

Set environment variables in Cloud Run: DATABASE_URL, JWT_SECRET, STORAGE_BUCKET, FCM_SERVER_KEY (or web-push VAPID keys).

Migrations: use Prisma Migrate or Flyway.

12) Tasks ưu tiên thực hiện (minimum viable backend cho đồ án)

Auth (register/login/jwt) + user profile. 

chi tiết giao diện VolunteerHub

Events CRUD (manager) + list/filter (public). 

chi tiết giao diện VolunteerHub

Registrations (volunteer) + manager approve flow. 

chi tiết giao diện VolunteerHub

Admin approve event flow + notifications. 

chi tiết giao diện VolunteerHub

Posts/comments basic (polling every 10s) — nếu còn thời gian, nâng lên socket.io. 

chi tiết giao diện VolunteerHub

Export CSV & simple charts endpoints for admin.