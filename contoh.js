(function(){
    // Daftar lisensi yang valid untuk setiap domain
    const licenseMap = {
        "jeda30": "jedabusiness.blogspot.com",
        "XYZ987ABC": "example.com"
    };

    const currentDomain = window.location.hostname;
    const licenseKey = window.JedaLicense || null;

    if (!licenseKey || licenseMap[licenseKey] !== currentDomain) {
        console.error("Lisensi tidak valid untuk domain ini");
        return; // hentikan eksekusi script
    }

    console.log("Lisensi valid ✅, script berjalan di domain:", currentDomain);

    // ===== Kode utama jeda.js di bawah ini =====
    function initJeda() {
        console.log("Jeda.js aktif di domain:", currentDomain);
        // Tambahkan fitur / fungsi utama di sini
    }

    initJeda();
})();
