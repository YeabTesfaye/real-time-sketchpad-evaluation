import requests
LOGIN_URL = "http://localhost:8000/api/v1/auth/login"
LOGIN_DATA = {
    "username": "test2@example.com",
    "password": "securepassword123"
}
resp = requests.post(LOGIN_URL, data=LOGIN_DATA)
resp.raise_for_status()
data = resp.json()
print(data["access_token"])