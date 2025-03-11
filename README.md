```
npx prisma migrate dev --name init

npx prisma generate --no-engine
```
```
sudo docker build -t payments -f ./apps/payments/Dockerfile ./
```
docker run -p 3000:3000 --name payments

add env

PASSWORD_FOR_EMAIL
EMAIL_FOR_SENDING