=========================================
  COMMIT CO., LTD. — Website Package
=========================================

โครงสร้างโฟลเดอร์
-----------------
commit-website/
├── index.html        ← หน้าหลัก (อัปโหลดไฟล์นี้ไปที่ root ของ server)
├── css/
│   └── style.css     ← stylesheet ทั้งหมด
├── js/
│   └── main.js       ← JavaScript (scroll, animation, mobile menu)
├── img/
│   └── logo.png      ← โลโก้บริษัท
└── README.txt        ← ไฟล์นี้

วิธีอัปโหลดขึ้น Server
------------------------
1. อัปโหลดทุกไฟล์และโฟลเดอร์ขึ้น server โดยรักษาโครงสร้างโฟลเดอร์ให้ครบ
2. ไฟล์หลักคือ index.html ต้องอยู่ที่ root เช่น public_html/ หรือ www/
3. ตรวจสอบว่าโฟลเดอร์ css/, js/, img/ อยู่ในระดับเดียวกับ index.html

สำหรับ cPanel / Hosting ทั่วไป
--------------------------------
1. เข้า File Manager → public_html
2. Upload ไฟล์ index.html
3. สร้างโฟลเดอร์ css, js, img
4. อัปโหลดไฟล์เข้าโฟลเดอร์ที่ตรงกัน

สำหรับ VPS / Nginx / Apache
------------------------------
- Document root ชี้ไปที่โฟลเดอร์ commit-website/
- ไม่ต้องติดตั้ง dependency เพิ่มเติม (Static HTML ล้วน)

หมายเหตุ
---------
- เว็บไซต์นี้เป็น Static HTML ไม่ต้องการ PHP / Node.js / Database
- Font โหลดจาก Google Fonts (ต้องมี Internet)
- แก้ไขข้อมูลติดต่อได้ที่ index.html ส่วน FOOTER
  เช่น เบอร์โทร, อีเมล, ที่อยู่

ลงทะเบียน Forum (Supabase)
---------------------------
1. เปิด Supabase Dashboard → SQL Editor
2. รันไฟล์ supabase/setup_forum_registrations.sql
3. แก้ไข js/config.js ใส่ SUPABASE_URL และ SUPABASE_ANON_KEY
   (หาได้ที่ Project Settings → API)
4. เปิดหน้า register.html เพื่อทดสอบฟอร์ม
5. ดูข้อมูลลงทะเบียนได้ที่ Table Editor → forum_registrations

หน้า Admin
----------
1. รันไฟล์ supabase/admin_rls_policy.sql (แก้ email admin ในไฟล์ก่อน)
2. สร้าง user admin: Dashboard → Authentication → Users → Add user
3. เปิด admin.html → login → ดูรายชื่อ + Export Excel
4. ไม่ใส่ลิงก์ admin ในเมนูหลัก (เก็บ URL เป็นความลับ)

=========================================
