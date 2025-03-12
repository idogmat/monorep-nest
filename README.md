## 🚀 Backend

<details>
<summary style="cursor: pointer; color: #58a6ff; font-weight: bold; margin: 10px 0;">⚙️ Setup & Run</summary>
  🔒<b>add env</b>

    DATABASE_URL
    EMAIL_FOR_SENDING
    PASSWORD_FOR_EMAIL
    ACCESS_TOKEN
    REFRESH_TOKEN
    ACCESS_TOKEN_EXPIRATION=15h
    REFRESH_TOKEN_EXPIRATION=30d
    RECAPTCHA_SECRET_KEY

  🏃<b>run dev</b>

    yarn
    yarn prisma generate [service]
    yarn prisma migrate [service]
    yarn start:dev
    
</details>

```
npx prisma migrate dev --name init

npx prisma generate --no-engine
```
```
sudo docker build -t payments -f ./apps/payments/Dockerfile ./
```
docker run -p 3000:3000 --name payments
