# คู่มือการใช้งาน PHP & MySQL (XAMPP & InfinityFree)

โปรเจกต์นี้ได้รับการแปลงระบบจาก Node.js / Express เป็น **PHP & MySQL** เรียบร้อยแล้ว เพื่อให้สามารถรันบน **XAMPP (Localhost)** และนำขึ้นฟรีโฮสติ้ง **InfinityFree** ได้ทันที

---

## 📁 1. โครงสร้างไฟล์ในระบบ

```
china-hanzi/
├── api/
│   ├── config.php       # ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL (XAMPP / InfinityFree)
│   ├── db.php           # PDO MySQL Connection & Auto Table Seeder
│   ├── health.php       # API เช็กสถานะการเชื่อมต่อ DB
│   ├── words.php        # API รับ-ส่ง และลบข้อมูลคำศัพท์ (GET, POST, DELETE)
│   └── .htaccess        # URL Rewrite สำหรับ API
├── css/                 # สไตล์ชีต CSS
├── js/                  # ไฟล์ JavaScript ฝั่งหน้าบ้าน (script.js, add-word.js, ฯลฯ)
├── json/                # vocab.json สำหรับ Seeding / Fallback
├── view/                # หน้า HTML เพิ่มคำศัพท์ และ บัตรคำศัพท์
├── .htaccess            # Apache URL Rewriting สำหรับ root folder
├── database.sql         # ไฟล์ฐานข้อมูล SQL สำหรับนำเข้าผ่าน phpMyAdmin
├── index.html           # หน้าหลัก (ฝึกเขียน)
└── hsk-words-visualized.pdf
```

---

## 🛠️ 2. วิธีการทดสอบบนเครื่องคอมพิวเตอร์ (XAMPP Localhost)

1. **คัดลอกโฟลเดอร์โปรเจกต์:**
   - นำโฟลเดอร์ `china-hanzi` ไปวางไว้ที่ `C:\xampp\htdocs\china-hanzi`
2. **เปิด XAMPP Control Panel:**
   - กด **Start** ที่โมดูล **Apache** และ **MySQL**
3. **เปิดใช้งานบน Web Browser:**
   - เข้าเว็บผ่าน: `http://localhost/china-hanzi/`
   - *หมายเหตุ:* ระบบ PHP จะทำการสร้างฐานข้อมูลชื่อ `china_hanzi` และตาราง `words` พร้อมนำเข้าคำศัพท์เริ่มต้น 510 คำให้โดยอัตโนมัติ!
   - หรือหากต้องการนำเข้าฐานข้อมูลเอง:
     - เข้าไปที่ `http://localhost/phpmyadmin/`
     - สร้าง Database ชื่อ `china_hanzi`
     - ไปที่แท็บ **Import** เลือกไฟล์ `database.sql` ในโฟลเดอร์โปรเจกต์ แล้วกด **Go**

---

## 🚀 3. วิธีการอัปโหลดขึ้น InfinityFree Hosting

### ขั้นตอนที่ 3.1: สร้าง MySQL Database บน InfinityFree
1. เข้าสู่ระบบ InfinityFree Control Panel (vPanel)
2. ไปที่เมนู **MySQL Databases**
3. สร้างฐานข้อมูลใหม่ (เช่น ตั้งชื่อว่า `china_hanzi`)
4. บันทึกข้อมูลที่โฮสต์ให้มา ได้แก่:
   - **MySQL Hostname** (เช่น `sql123.infinityfree.com`)
   - **MySQL Database Name** (เช่น `if0_38000000_china_hanzi`)
   - **MySQL Username** (เช่น `if0_38000000`)
   - **MySQL Password** (รหัสผ่านเดียวกับ vPanel)

### ขั้นตอนที่ 3.2: นำเข้าฐานข้อมูล SQL
1. ในหน้า **MySQL Databases** บน InfinityFree ให้กดปุ่ม **phpMyAdmin** ตรงฐานข้อมูลที่คุณเพิ่งสร้าง
2. ไปที่แท็บ **Import**
3. เลือกไฟล์ `database.sql` จากเครื่องคอมพิวเตอร์ของคุณ
4. กด **Go** เพื่อนำเข้าคำศัพท์ทั้งหมดลงฐานข้อมูล

### ขั้นตอนที่ 3.3: แก้ไขไฟล์ `api/config.php`
เปิดไฟล์ `api/config.php` บนเครื่องของคุณ แล้วแก้ไขข้อมูลเชื่อมต่อให้ตรงกับ InfinityFree:

```php
define('DB_HOST', 'sql123.infinityfree.com');        // ใส่ MySQL Hostname ของ InfinityFree
define('DB_NAME', 'if0_38000000_china_hanzi');     // ใส่ ชื่อ Database ของ InfinityFree
define('DB_USER', 'if0_38000000');                 // ใส่ Username ของ InfinityFree
define('DB_PASS', 'รหัสผ่านของคุณ');                 // ใส่ Password ของ InfinityFree
```

### ขั้นตอนที่ 3.4: อัปโหลดไฟล์ขึ้นเว็บโฮสติ้ง
1. เปิด **Online File Manager** บน InfinityFree หรือใช้โปรแกรม **FileZilla (FTP)**
2. เข้าไปที่โฟลเดอร์ `htdocs`
3. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดในโปรเจกต์ `china-hanzi` เข้าไปใน `htdocs`
4. เมื่ออัปโหลดเสร็จเรียบร้อย สามารถเปิดเข้าโดเมนของคุณบน InfinityFree เพื่อใช้งานได้ทันที! 🎉
