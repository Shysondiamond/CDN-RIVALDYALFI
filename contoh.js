(function(){
    const licenseMap = {
        "jeda30": "jedabusiness.blogspot.com" // domain utama tanpa https://
    };

    const currentDomain = window.location.hostname; // ambil domain saja
    const licenseKey = window.JedaLicense || null;

    if (!licenseKey || licenseMap[licenseKey] !== currentDomain) {
        console.error("Lisensi tidak valid untuk domain ini");
        return;
    }

    console.log("Lisensi valid ✅, script berjalan di domain:", currentDomain);

    // Kode utama jeda.js di sini
})();
