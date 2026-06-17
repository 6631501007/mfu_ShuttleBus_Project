# Demo Project Setup Guide

This project has three parts:

- `frontend/` - Vue 3 + Vite web app
- `backend/` - Node.js + Express API server
- `AI/` - Python YOLOv8 live human detection service

Run them in this order:

1. Backend
2. Frontend
3. AI service, only if you want the live camera feed

---

## English Instructions

### 1. Install Required Software

Install these before running the project.

#### Windows

1. Install Git: https://git-scm.com/download/win
2. Install Node.js 20.19 or newer: https://nodejs.org/
3. Install Python 3.10 or newer: https://www.python.org/downloads/windows/
4. Install MongoDB locally, or use MongoDB Atlas:
   - MongoDB Community Server: https://www.mongodb.com/try/download/community
   - MongoDB Atlas: https://www.mongodb.com/atlas
5. Optional for RTSP camera streams: install FFmpeg and make sure `ffmpeg` works in PowerShell or Command Prompt.

#### Linux

Ubuntu/Debian example:

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip ffmpeg
```

Install Node.js 20.19 or newer. One common option is `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

Install MongoDB locally, or use MongoDB Atlas.

### 2. Clone the Project

#### Windows

```powershell
git clone <your-repository-url>
cd demo
```

#### Linux

```bash
git clone <your-repository-url>
cd demo
```

### 3. Backend Setup

Open terminal 1 in the project root.

#### Windows

```powershell
cd backend
npm install
copy .env.example .env
```

#### Linux

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`.

For local MongoDB, use:

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
LIVEFEED_SOURCE_STREAM_URL=http://localhost:8090/stream
LIVEFEED_PUBLIC_STREAM_URL=/api/livefeed/stream
```

If you use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:3000
```

Keep this terminal open.

### 4. Frontend Setup

Open terminal 2 in the project root.

#### Windows

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

#### Linux

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

If Vite prints a different URL, use the URL shown in the terminal.

### 5. AI Service Setup

Open terminal 3 in the project root.

#### Windows

```powershell
cd AI
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If PowerShell blocks virtual environment activation, run this once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate the virtual environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

#### Linux

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Run the AI service with a webcam:

```bash
python detect_humans_live-api.py --source 0
```

For an RTSP camera:

```bash
python detect_humans_live-api.py --source "rtsp://username:password@camera-ip/path"
```

AI stream URL:

```text
http://localhost:8090/stream
```

The AI service sends live detection counts to:

```text
http://localhost:3000/api/livefeed/update
```

### 6. Recommended Run Order

Use three terminals.

Terminal 1, backend:

```bash
cd backend
npm run dev
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Terminal 3, AI:

Windows:

```powershell
cd AI
.\.venv\Scripts\Activate.ps1
python detect_humans_live-api.py --source 0
```

Linux:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source 0
```

### 7. Login and Admin Access

The app has `/register` and `/login` endpoints. New registered users are created with the `user` role, but most dashboard pages require the `admin` role.

For local development:

1. Open the frontend.
2. Register a new user.
3. Update that user's role to `admin` in MongoDB.

MongoDB shell example:

```javascript
use demo
db.users.updateOne({ username: "your-username" }, { $set: { role: "admin" } })
```

Then log out and log back in.

### 8. Useful URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- AI MJPEG stream: `http://localhost:8090/stream`
- Backend proxied live stream: `http://localhost:3000/api/livefeed/stream`

### 9. Common Problems

#### Backend says missing environment variables

Make sure `backend/.env` exists and contains `JWT_SECRET` and `MONGO_URI`.

#### Backend cannot connect to MongoDB

Make sure MongoDB is running. If you use Atlas, check the connection string, username, password, IP allowlist, and database name.

#### Frontend cannot call backend

Make sure `frontend/.env` contains:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Restart `npm run dev` after changing `.env`.

#### AI cannot open webcam on Linux

Try another camera source:

```bash
python detect_humans_live-api.py --source /dev/video0
python detect_humans_live-api.py --source 1
```

Also make sure no other program is using the camera.

#### AI install is slow or downloads a large file

The `ultralytics` package may download YOLO model weights the first time it runs.

---

## คำแนะนำภาษาไทย

โปรเจกต์นี้มี 3 ส่วน:

- `frontend/` - หน้าเว็บ Vue 3 + Vite
- `backend/` - API Server ด้วย Node.js + Express
- `AI/` - ระบบตรวจจับคนจากกล้องด้วย Python YOLOv8

ให้รันตามลำดับนี้:

1. Backend
2. Frontend
3. AI service เฉพาะตอนที่ต้องการใช้งาน live camera feed

### 1. ติดตั้งโปรแกรมที่จำเป็น

ติดตั้งโปรแกรมเหล่านี้ก่อนเริ่มรันโปรเจกต์

#### Windows

1. ติดตั้ง Git: https://git-scm.com/download/win
2. ติดตั้ง Node.js เวอร์ชัน 20.19 หรือใหม่กว่า: https://nodejs.org/
3. ติดตั้ง Python 3.10 หรือใหม่กว่า: https://www.python.org/downloads/windows/
4. ติดตั้ง MongoDB ในเครื่อง หรือใช้ MongoDB Atlas:
   - MongoDB Community Server: https://www.mongodb.com/try/download/community
   - MongoDB Atlas: https://www.mongodb.com/atlas
5. ถ้าจะใช้กล้อง RTSP แนะนำให้ติดตั้ง FFmpeg และตรวจว่าใช้คำสั่ง `ffmpeg` ได้ใน PowerShell หรือ Command Prompt

#### Linux

ตัวอย่างสำหรับ Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip ffmpeg
```

ติดตั้ง Node.js เวอร์ชัน 20.19 หรือใหม่กว่า ตัวอย่างนี้ใช้ `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

ติดตั้ง MongoDB ในเครื่อง หรือใช้ MongoDB Atlas

### 2. Clone โปรเจกต์

#### Windows

```powershell
git clone <your-repository-url>
cd demo
```

#### Linux

```bash
git clone <your-repository-url>
cd demo
```

### 3. ตั้งค่า Backend

เปิด terminal ที่ 1 ในโฟลเดอร์หลักของโปรเจกต์

#### Windows

```powershell
cd backend
npm install
copy .env.example .env
```

#### Linux

```bash
cd backend
npm install
cp .env.example .env
```

แก้ไขไฟล์ `backend/.env`

ถ้าใช้ MongoDB ในเครื่อง ให้ตั้งค่าแบบนี้:

```env
PORT=3000
JWT_SECRET=change-me-to-a-long-random-secret
MONGO_URI=mongodb://127.0.0.1:27017/demo
LIVEFEED_SOURCE_STREAM_URL=http://localhost:8090/stream
LIVEFEED_PUBLIC_STREAM_URL=/api/livefeed/stream
```

ถ้าใช้ MongoDB Atlas ให้เปลี่ยน `MONGO_URI` เป็น connection string ของ Atlas

เริ่มรัน backend:

```bash
npm run dev
```

Backend จะอยู่ที่:

```text
http://localhost:3000
```

เปิด terminal นี้ค้างไว้

### 4. ตั้งค่า Frontend

เปิด terminal ที่ 2 ในโฟลเดอร์หลักของโปรเจกต์

#### Windows

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

#### Linux

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend จะอยู่ที่:

```text
http://localhost:5173
```

ถ้า Vite แสดง URL อื่นใน terminal ให้ใช้ URL นั้นแทน

### 5. ตั้งค่า AI Service

เปิด terminal ที่ 3 ในโฟลเดอร์หลักของโปรเจกต์

#### Windows

```powershell
cd AI
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

ถ้า PowerShell ไม่ยอม activate virtual environment ให้รันคำสั่งนี้ 1 ครั้ง:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

จากนั้น activate virtual environment อีกครั้ง:

```powershell
.\.venv\Scripts\Activate.ps1
```

#### Linux

```bash
cd AI
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

รัน AI service ด้วย webcam:

```bash
python detect_humans_live-api.py --source 0
```

ถ้าใช้กล้อง RTSP:

```bash
python detect_humans_live-api.py --source "rtsp://username:password@camera-ip/path"
```

AI stream จะอยู่ที่:

```text
http://localhost:8090/stream
```

AI service จะส่งจำนวนคนที่ตรวจจับได้ไปที่:

```text
http://localhost:3000/api/livefeed/update
```

### 6. ลำดับการรันที่แนะนำ

ใช้ 3 terminals

Terminal 1, backend:

```bash
cd backend
npm run dev
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Terminal 3, AI:

Windows:

```powershell
cd AI
.\.venv\Scripts\Activate.ps1
python detect_humans_live-api.py --source 0
```

Linux:

```bash
cd AI
source .venv/bin/activate
python detect_humans_live-api.py --source 0
```

### 7. การ Login และสิทธิ์ Admin

ระบบมี endpoint `/register` และ `/login` ผู้ใช้ที่สมัครใหม่จะได้ role เป็น `user` แต่หน้า dashboard ส่วนใหญ่ต้องใช้ role `admin`

สำหรับการใช้งานในเครื่อง:

1. เปิด frontend
2. สมัคร user ใหม่
3. เปลี่ยน role ของ user นั้นเป็น `admin` ใน MongoDB

ตัวอย่างคำสั่ง MongoDB shell:

```javascript
use demo
db.users.updateOne({ username: "your-username" }, { $set: { role: "admin" } })
```

จากนั้น logout แล้ว login ใหม่

### 8. URL ที่ใช้บ่อย

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- AI MJPEG stream: `http://localhost:8090/stream`
- Live stream ผ่าน backend: `http://localhost:3000/api/livefeed/stream`

### 9. ปัญหาที่พบบ่อย

#### Backend แจ้งว่า missing environment variables

ตรวจว่าไฟล์ `backend/.env` มีอยู่จริง และมีค่า `JWT_SECRET` กับ `MONGO_URI`

#### Backend ต่อ MongoDB ไม่ได้

ตรวจว่า MongoDB กำลังรันอยู่ ถ้าใช้ Atlas ให้ตรวจ connection string, username, password, IP allowlist และ database name

#### Frontend เรียก backend ไม่ได้

ตรวจว่า `frontend/.env` มีค่านี้:

```env
VITE_API_BASE_URL=http://localhost:3000
```

หลังแก้ `.env` ให้ restart คำสั่ง `npm run dev`

#### AI เปิด webcam บน Linux ไม่ได้

ลองเปลี่ยน camera source:

```bash
python detect_humans_live-api.py --source /dev/video0
python detect_humans_live-api.py --source 1
```

และตรวจว่าไม่มีโปรแกรมอื่นกำลังใช้กล้องอยู่

#### AI install ช้าหรือมีการ download ไฟล์ใหญ่

แพ็กเกจ `ultralytics` อาจ download YOLO model weights ตอนรันครั้งแรก
