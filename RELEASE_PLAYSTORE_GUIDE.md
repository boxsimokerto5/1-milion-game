# Panduan Build APK & AAB Google Play Store via GitHub Actions

Proyek ini telah dikonfigurasi penuh dengan **Capacitor** dan **GitHub Actions** dengan **TANDA TANGAN OTOMATIS (AUTO-SIGNING)**:
1. **APK Release Signed (`Astrocade-Signed-APK`):** Sudah otomatis ditandatangani dengan signature key RSA 2048-bit yang valid. Bisa langsung diinstall di semua HP Android tanpa error "Paket tidak valid" atau "Aplikasi tidak terpasang".
2. **AAB Release Signed (`Astrocade-Signed-GooglePlay-AAB`):** Sudah otomatis ditandatangani dan siap diunggah langsung ke **Google Play Console**.

---

## ⚡ Fitur Baru: Tanda Tangan Otomatis (Auto-Signing)
Anda **tidak perlu lagi repot membuat keystore manual** jika hanya ingin menguji coba APK di HP Android:
* GitHub Actions sekarang secara otomatis men-generate signature key keystore bawaan standar menggunakan `keytool`.
* File APK dan AAB otomatis ditandatangani menggunakan algoritma `SHA256withRSA`.
* Hasil build di tab **Actions** akan menghasilkan artefak:
  - **`Astrocade-Signed-APK`**
  - **`Astrocade-Signed-GooglePlay-AAB`**

---

## (Opsional) Menggunakan Signature Keystore Khusus Pribadi
Jika suatu saat Anda ingin menggunakan kunci tanda tangan milik Anda sendiri:

Buka terminal di komputer Anda (Command Prompt / PowerShell di Windows, atau Terminal di Mac / Linux), lalu jalankan perintah `keytool` berikut:

```bash
keytool -genkeypair -v -keystore release.keystore -alias astrocade -keyalg RSA -keysize 2048 -validity 10000
```

### Keterangan Parameter:
- `-keystore release.keystore`: Nama file keystore yang akan dibuat.
- `-alias astrocade`: Nama alias kunci (akan dimasukkan ke GitHub Secrets).
- `-keyalg RSA -keysize 2048`: Algoritma enkripsi standar Google Play.
- `-validity 10000`: Masa berlaku kunci (kurang lebih 27 tahun).

> **PENTING:** 
> - Anda akan diminta memasukkan kata sandi (password). **Catat dan simpan password ini dengan aman!**
> - Simpan file `release.keystore` di tempat yang aman dan jangan pernah dibagikan ke publik atau dicommit ke repository publik.

---

## 2. Mengubah Keystore Menjadi Base64 untuk GitHub Secrets

Agar GitHub Actions dapat membaca file keystore tanpa menyimpannya secara publik, ubah file keystore menjadi teks Base64:

### Di Linux / macOS:
```bash
base64 -w 0 release.keystore > keystore_base64.txt
# (Di macOS jika -w tidak dikenal: base64 -i release.keystore -o keystore_base64.txt)
```

### Di Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Out-File -Encoding ASCII keystore_base64.txt
```

Buka file `keystore_base64.txt` dan salin seluruh teks di dalamnya.

---

## 3. Menambahkan Secrets di Repository GitHub

1. Buka repositori Anda di GitHub.
2. Klik tab **Settings** > **Secrets and variables** > **Actions**.
3. Klik tombol **New repository secret** dan buat 4 rahasia berikut:

| Secret Name | Nilai (Value) |
|---|---|
| `KEYSTORE_BASE64` | Teks panjang hasil konversi Base64 dari file `release.keystore` |
| `KEY_ALIAS` | `astrocade` (atau alias yang Anda buat saat menjalankan `keytool`) |
| `KEYSTORE_PASSWORD` | Password yang Anda masukkan saat membuat keystore |
| `KEY_PASSWORD` | Password kunci (biasanya sama dengan Keystore Password) |

---

## 4. Cara Menjalankan Build di GitHub Actions

Setiap kali Anda melakukan `git push` ke branch `main` atau `master`:
1. GitHub Actions akan otomatis mendeteksi dan menjalankan workflow `.github/workflows/build-android.yml`.
2. Anda juga bisa menjalankannya secara manual dari tab **Actions** > Pilih **Build Android APK and AAB (Capacitor)** > Klik **Run workflow**.
3. Setelah proses selesai (sekitar 3-5 menit), Anda dapat mengunduh:
   - **`Astrocade-APK`** (File `.apk` untuk instalasi langsung).
   - **`Astrocade-GooglePlay-AAB`** (File `.aab` yang telah ditandatangani untuk di-upload ke Google Play Console).
