# Test Credentials

## Admin
- Email: admin@srtvidyamandir.com
- Password: admin123
- Role: admin

## Auth Endpoints
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

## All Endpoints
- GET /api/announcements?search=
- GET /api/events?search=&category=
- GET /api/admissions?search=&status=&class_filter=
- PUT /api/admissions/{id}/status (body: {"status": "approved"})
- GET /api/admissions/export?search=&status=&class_filter=
- GET /api/contact?search=
- GET /api/contact/export?search=
- POST /api/gallery/upload (multipart, query: title, category, description)
- GET /api/gallery/image/{id}
- DELETE /api/gallery/{id}
- GET /api/email-logs
