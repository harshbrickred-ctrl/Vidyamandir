import requests

try:
    r = requests.get('http://localhost:3000/')
    print('frontend', r.status_code)
    print(r.text[:200])
except Exception as e:
    print('frontend error', e)
