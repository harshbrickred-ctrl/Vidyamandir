import requests

print('announcements', requests.get('http://localhost:8000/api/announcements').status_code)
print(requests.get('http://localhost:8000/api/announcements').text[:200])
r = requests.post('http://localhost:8000/api/auth/login', json={'email': 'admin@srtvidyamandir.com', 'password': 'admin123'})
print('login', r.status_code)
print(r.text)
