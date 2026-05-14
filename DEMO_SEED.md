# E-Memo Demo Seed

สคริปต์ `npm run seed:demo` จะสร้างข้อมูล demo ที่ path `ememo/data` และสร้าง Firebase Auth users ให้ครบทุก role

## Demo Accounts

ทุกบัญชีใช้รหัสผ่านเดียวกัน: `Demo@12345`

| Role | Email |
| --- | --- |
| Super Admin | `demo.superadmin@example.com` |
| Admin | `demo.admin@example.com` |
| User | `demo.user@example.com` |
| User / Finance Approver | `demo.finance@example.com` |
| User / HR Approver | `demo.hr@example.com` |

## วิธีรัน

ต้องมี Firebase service account ก่อน เพราะสคริปต์ต้องสร้าง Auth users และเขียน Realtime Database

วิธีที่แนะนำ:

1. Firebase Console -> Project settings -> Service accounts -> Generate new private key
2. ตั้ง environment variable:
   - `GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json`
3. ตรวจว่า `.env.local` มี `VITE_FIREBASE_DATABASE_URL`
4. รัน:

```powershell
npm run seed:demo
```

สคริปต์จะ overwrite ข้อมูลที่ `ememo/data` เพื่อให้ demo เริ่มจากชุดข้อมูลเดียวกันทุกครั้ง