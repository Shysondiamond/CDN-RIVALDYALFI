(function(){
    // ===== DAFTAR LISENSI =====
    // token lisensi : domain utama (tanpa https://, tanpa path)
    const licenseMap = {
        "jeda30": "jedabusiness.blogspot.com",
        // contoh lisensi lain:
        // "XYZ987ABC": "example.com"
    };

    // ===== AMBIL DOMAIN SEKARANG =====
    const currentDomain = window.location.hostname; // ambil host/domain saja
    const licenseKey = window.JedaLicense || null;

    // ===== VALIDASI LISENSI =====
    if (!licenseKey) {
        console.error("Jeda.js: Lisensi tidak ditemukan ❌");
        return; // hentikan eksekusi
    }

    if (licenseMap[licenseKey] !== currentDomain) {
        console.error("Jeda.js: Lisensi tidak valid untuk domain ini ❌");
        return; // hentikan eksekusi
    }

    console.log("Jeda.js: Lisensi valid ✅, script berjalan di domain:", currentDomain);

    // ===== KODE UTAMA JEDA.JS =====
    function initJeda() {
        // Contoh fitur utama
        document.documentElement.setAttribute('data-jeda-active', 'true');
        console.log("Jeda.js aktif di domain:", currentDomain);

        // Tambahkan fungsi / fitur utama kamu di sini
        // Misal menambahkan notifikasi, manipulasi DOM, dll
    }

    initJeda();

})();
