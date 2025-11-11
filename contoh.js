(function(){
    // ===== DAFTAR LISENSI =====
    const licenseMap = {
        "jeda30": ["jedabusiness.blogspot.com", "blog.jedabusiness.com"],
        "ABC123XYZ": ["example.com", "example.org"]
    };

    // ===== AMBIL DOMAIN SEKARANG =====
    const currentDomain = window.location.hostname;

    // ===== AMBIL LISENSI DARI DATA ATTRIBUTE =====
    const licenseKey = document.currentScript
                         ? document.currentScript.getAttribute('data-license')
                         : null;

    // ===== FUNGSI UNTUK MENAMPILKAN OVERLAY =====
    function showOverlay(message) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'red';
        overlay.style.color = '#fff';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 9999;
        overlay.style.textAlign = 'center';
        overlay.style.fontFamily = 'sans-serif';
        overlay.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 22 20 2 20 12 2" fill="red" stroke="white"/>
  <line x1="12" y1="8" x2="12" y2="14" stroke="white" stroke-width="2"/>
  <circle cx="12" cy="17" r="0.20" stroke="white" fill="white"/> <!-- titik lebih kecil -->
</svg>
            <h1 style="font-size:2em;margin-bottom:1em;">Lisensi Tidak Valid</h1>
            <p>${message}</p>
        `;
        document.body.appendChild(overlay);
    }

    // ===== VALIDASI LISENSI =====
    if (!licenseKey) {
        showOverlay("Lisensi tidak ditemukan. Halaman diblokir.");
        return;
    }

    const allowedDomains = licenseMap[licenseKey];
    if (!allowedDomains || !allowedDomains.includes(currentDomain)) {
        showOverlay("Lisensi tidak valid untuk domain ini. Halaman diblokir.");
        return;
    }

    // ===== KODE UTAMA JEDA.JS =====
    // Tempelkan kode utama kamu di sini
    const container = document.getElementById('konten-web');

        // 2. Tentukan Judul dan Paragraf yang Anda inginkan
        const judul = "JEDA.MY.ID";
        const paragraf = "Jeda asik lorem ipsum akan tampil di web";

        // 3. Buat string HTML yang akan dimasukkan
        const kontenHTML = `
            <h1>${judul}</h1>
            <p>${paragraf}</p>
        `;

        // 4. Masukkan string HTML ke dalam container
        container.innerHTML = kontenHTML;

        // Teks "Loading konten..." akan langsung diganti dengan konten di atas saat skrip dijalankan.

})();
