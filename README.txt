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

=========================================
