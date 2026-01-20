# Money Management 2026

Aplikasi manajemen pribadi berbasis **Laravel 12 + React (Vite)**.

## Fitur

- **Kelola Keuangan**: catat pemasukan/pengeluaran/saldo awal, ringkasan harian, tren mingguan, export CSV & export bulanan.
- **Kelola Kegiatan**: jadwal 24 jam, checklist selesai, otomatis “Tidak dikerjakan” kalau sudah lewat waktunya.
- **Kelola Kendaraan**: data kendaraan (merek/model/tahun 2010–2025), update KM, pengingat ganti oli & **checklist perawatan motor matic** (interval KM bisa diubah).

Rute utama:
- `/keuangan`
- `/kegiatan`
- `/kendaraan`

Autentikasi:
- Login & register via API (token **Laravel Sanctum** disimpan di localStorage, dipakai sebagai Bearer token).

## Teknologi

- Backend: Laravel 12, PHP 8.2+, MySQL/MariaDB
- Auth/API: Laravel Sanctum (token)
- Frontend: React + Vite + TailwindCSS + Framer Motion

## Kebutuhan Server Hosting

Minimal:
- PHP **8.2+**
- MySQL/MariaDB
- Ekstensi PHP umum Laravel (pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, json, fileinfo, curl)
- Composer

Opsional (kalau build di server):
- Node.js 18+ dan npm

## Setup Lokal (Development)

1) Install dependency backend

```bash
composer install
```

2) Copy env & generate key

```bash
copy .env.example .env
php artisan key:generate
```

3) Atur database di `.env`

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_db
DB_USERNAME=user
DB_PASSWORD=pass
```

4) Migrasi

```bash
php artisan migrate
```

5) Install & build frontend

```bash
npm install
npm run build
```

6) Jalankan server lokal

```bash
php artisan serve
```

## Deploy ke Hosting (Production)

### A. Paling disarankan (Shared Hosting / tanpa Node di server)

1) Di komputer lokal:

```bash
composer install --no-dev
npm install
npm run build
```

2) Upload semua file project ke hosting (via Git/FTP/SFTP).

3) Pastikan **document root** mengarah ke folder `public/`.
   - cPanel: set domain/subdomain document root ke `public`.
   - Apache/Nginx: root harus `.../public`.

4) Buat `.env` di server (jangan upload `.env` dari lokal).
   - Set:
     - `APP_ENV=production`
     - `APP_DEBUG=false`
     - `APP_URL=https://domainkamu.com`
     - konfigurasi `DB_*`

5) Generate key di server (sekali saja):

```bash
php artisan key:generate --force
```

6) Migrasi database:

```bash
php artisan migrate --force
```

7) Cache & optimize (opsional tapi disarankan):

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

8) Permission folder:
- `storage/` dan `bootstrap/cache/` harus writable oleh server.

### B. Deploy di VPS (punya Node di server)

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Catatan Penting Hosting

- Pastikan **rewrite** aktif (Apache: `mod_rewrite`) karena ini SPA (semua route non-API diarahkan ke `resources/views/welcome.blade.php`).
- Kalau document root hosting tidak bisa diarahkan ke `public/`, gunakan metode “public_html → symlink ke public” atau konfigurasi vhost (lebih aman tetap pakai `public/`).
- Jangan pernah commit/upload `.env` ke repo publik.

## Public Website (URL Rute)

- Set `APP_URL` di `.env` ke domain publik, contoh `https://domainkamu.com`.
- Setelah live, halaman dapat diakses:
  - `https://domainkamu.com/keuangan`
  - `https://domainkamu.com/kegiatan`
  - `https://domainkamu.com/kendaraan`
- Jika memakai subdomain: `https://app.domainkamu.com/keuangan` (document root subdomain diarahkan ke folder `public/`).
- Jika memakai subfolder: `https://domainkamu.com/app/keuangan` pastikan vhost/subdomain untuk `app` mengarah ke `app/public` (atau buat subdomain khusus agar aman).
- API (proteksi token Sanctum): contoh `https://domainkamu.com/api/transactions`, `https://domainkamu.com/api/vehicles`.

## Deploy di Hosting dengan Subdomain (Full Tutorial)

### Prasyarat
- Domain aktif dan akses ke DNS (Cloudflare/cPanel/Panel lain).
- Hosting shared/VPS dengan PHP 8.2+, Composer tersedia (atau bisa via SSH).
- Database MySQL/MariaDB sudah dibuat (nama DB, user, password).

### Langkah 1: Buat Subdomain
- Tambahkan DNS A record untuk subdomain, contoh: `app.domainkamu.com` → IP server.
- Di cPanel/Plesk/panel hosting:
  - Buat subdomain: `app.domainkamu.com`.
  - Set **Document Root** ke folder `public/` dari aplikasi, contoh:
    - `/home/username/moneymenagement/public`
  - Pastikan versi PHP untuk subdomain adalah 8.2+.

### Langkah 2: Upload Kode Aplikasi
- Upload seluruh folder project ke server (via Git/SSH/FTP/SFTP).
- Struktur aman: kode Laravel berada di luar `public/`, hanya file publik di `public/`.
- Jangan upload `.env` dari lokal, buat `.env` baru di server.

### Langkah 3: Siapkan Environment `.env`
Contoh minimal:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.domainkamu.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_db
DB_USERNAME=user_db
DB_PASSWORD=pass_db
```
- Token autentikasi pakai Sanctum via Bearer token di localStorage, jadi tidak perlu set `SANCTUM_STATEFUL_DOMAINS`.

### Langkah 4: Install & Inisialisasi Backend
```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
- Permission: pastikan `storage/` dan `bootstrap/cache/` writable oleh web server.

### Langkah 5: Build Frontend (di Lokal) dan Upload
```bash
npm install
npm run build
```
- Upload hasil build `public/build/*` ke server.
- Tidak perlu menjalankan Vite dev server di hosting.

### Langkah 6: SSL/HTTPS
- Aktifkan SSL untuk subdomain (cPanel AutoSSL / Cloudflare / Let’s Encrypt).
- Gunakan URL `https://` di `APP_URL`.

### Langkah 7: Verifikasi
- Buka:
  - `https://app.domainkamu.com/keuangan`
  - `https://app.domainkamu.com/kegiatan`
  - `https://app.domainkamu.com/kendaraan`
- Coba API:
  - `https://app.domainkamu.com/api/transactions`
  - `https://app.domainkamu.com/api/vehicles`
- Jika blank/404: pastikan Document Root subdomain ke `public/`, rewrite aktif, dan route catch-all sudah benar.

### Contoh Konfigurasi (Opsional)
- Apache vhost:
```
<VirtualHost *:80>
    ServerName app.domainkamu.com
    DocumentRoot /home/username/moneymenagement/public
    <Directory "/home/username/moneymenagement/public">
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/app-domain-error.log
    CustomLog ${APACHE_LOG_DIR}/app-domain-access.log combined
</VirtualHost>
```
- Nginx server block:
```
server {
    server_name app.domainkamu.com;
    root /var/www/moneymenagement/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
    }
}
```

### Troubleshooting Subdomain
- 404 pada halaman SPA: Document Root tidak ke `public/` atau rewrite belum aktif.
- Aset CSS/JS 404: `public/build` belum diupload atau terhapus.
- Mixed content (http/https): pastikan `APP_URL` pakai `https://`, aktifkan SSL.
- Error 500: cek `storage/logs/laravel.log`, permission `storage/` & `bootstrap/cache/`, `APP_KEY` terisi.

## Struktur Route

- Web:
  - `/` dan semua route selain `/api/*` akan mengarah ke SPA (React).
- API:
  - Prefix `/api/*` diproteksi token untuk fitur utama.

## Troubleshooting Cepat

- Halaman blank setelah deploy:
  - pastikan `npm run build` sudah menghasilkan `public/build/*`
  - cek `APP_URL` benar
  - cek web server mengarah ke `public/`
- Error 500:
  - cek permission `storage/` dan `bootstrap/cache/`
  - cek `APP_KEY` sudah terisi
  - lihat log di `storage/logs/laravel.log`

## Upload ke GitHub (Tutorial)

### Prasyarat
- Sudah punya akun GitHub
- Git terpasang di komputer (Windows: install dari git-scm.com)

### Buat Repository di GitHub
- Masuk ke GitHub → New repository
- Pilih nama repo, visibility (Public/Private), lalu Create repository
- Salin URL repo:
  - HTTPS: `https://github.com/username/nama-repo.git`
  - atau SSH: `git@github.com:username/nama-repo.git`

### Inisialisasi Git di Project
```bash
# dari folder project, contoh: D:\laragon\www\moneymenagement
git init
git config user.name "Nama Anda"
git config user.email "email@domain.com"
```

### Pastikan File Sensitif Terskip
- `.gitignore` sudah ada dan mengabaikan:
  - `.env`, `vendor/`, `node_modules/`, `public/build`, dll.
- Jangan pernah commit `.env` atau rahasia lainnya.

### Commit Awal dan Hubungkan ke Remote
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
# jika memakai SSH:
# git remote add origin git@github.com:username/nama-repo.git
git push -u origin main
```
- Untuk HTTPS, Git akan meminta login/patok akses via browser/PAT.
- Untuk SSH, pastikan sudah menambahkan SSH key di GitHub (lihat di bawah).

### Menambahkan SSH Key (Opsional, Disarankan)
```bash
# buat SSH key baru
ssh-keygen -t ed25519 -C "email@domain.com"
# lalu tampilkan public key
type $env:USERPROFILE\.ssh\id_ed25519.pub
```
- Salin isi file public key dan tambah di GitHub → Settings → SSH and GPG keys → New SSH key
- Ubah remote ke SSH jika sebelumnya HTTPS:
```bash
git remote set-url origin git@github.com:username/nama-repo.git
```

### Workflow Update Kode
```bash
# setelah mengubah kode
git add -A
git commit -m "Perbarui fitur X"
git push
```

### Clone di Mesin Lain (Jika Perlu)
```bash
git clone https://github.com/username/nama-repo.git
# atau
git clone git@github.com:username/nama-repo.git
```
