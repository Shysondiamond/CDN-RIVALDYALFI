/*=====================
  Lisensi Templae
  =====================*/

// Kode lisensi yang valid
const VALID_LICENSES = [
  { key: "ABC123XYZ", domains: ["example.com", "www.example.com"] },
  { key: "DEF456XYZ", domains: ["bloguser.com"] }
];

// Fungsi cek lisensi
function checkLicense(userKey) {
  const currentDomain = location.hostname;
  const license = VALID_LICENSES.find(l => l.key === userKey);
  if (!license) return false;
  return license.domains.includes(currentDomain);
}

// Minta user memasukkan lisensi
const userKey = prompt("Masukkan kode lisensi:");
if (checkLicense(userKey)) {
  console.log("Lisensi valid! Template jalan...");
  initTemplate(); // panggil fungsi utama template
} else {
  console.warn("Lisensi tidak valid! Template tidak jalan.");
  document.body.innerHTML = "<h2>Lisensi tidak valid! Hubungi penjual.</h2>";
}

// Fungsi utama template
function initTemplate() {
  // kode template di sini
  console.log("Template dijalankan...");
}

/*=====================*/
        



/* Sidebar logic */
const sidebar=document.getElementById('sidebar'),
      toggleBtn=document.getElementById('sidebar-toggle'),
      closeBtn=document.getElementById('sidebar-close'),
      overlay=document.getElementById('overlay');
toggleBtn.onclick=()=>{sidebar.classList.add('show');overlay.classList.add('show');};
closeBtn.onclick=overlay.onclick=()=>{sidebar.classList.remove('show');overlay.classList.remove('show');};

/* Splash Screen Typing Effect (sama) */
const texts = [
    "Selamat Datang di Jeda Chat!",
    "Tempat kamu ngobrol dan berbagi cerita.",
    "Nikmati suasana obrolan yang seru dan ramah."
];
const typedEl = document.getElementById('typed-text');
let textIndex = 0;
let charIndex = 0;
let typing = true;
 
function type() {
    const current = texts[textIndex];
    if (typedEl) { 
        if (typing) {
            typedEl.textContent = current.slice(0, ++charIndex);
            if (charIndex === current.length) {
                typing = false;
                setTimeout(type, 2000);
                return;
            }
            setTimeout(type, 50);
        } else {
            typedEl.textContent = current.slice(0, --charIndex);
            if (charIndex === 0) {
                typing = true;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 300);
                return;
            }
            setTimeout(type, 30);
        }
    }
}
 
document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById('login-section');
    const mainChat = document.getElementById('main-chat');
    
    updateAudioButtonUI(); 

    if(loginSection.style.display !== 'none' || mainChat.style.display !== 'flex') {
        setTimeout(type, 400);
    }
});


/* =========================
    DOM refs & Global State
    ========================= */
 
const googleLogin = document.getElementById('google-login'),
      chatList = document.getElementById('chat-list'),
      userList = document.getElementById('user-list'),
      chatBody = document.getElementById('chat-body'),
      chatText = document.getElementById('chat-text'),
      chatSend = document.getElementById('chat-send'),
      roomName = document.getElementById('room-name'),
      roomAvatar = document.getElementById('room-avatar'),
      roomDesc = document.getElementById('room-desc'),
      roomInfo = document.getElementById('room-info'), // <-- REF BARU UNTUK KLIK HEADER
      addRoomBtn = document.getElementById('add-room'),
      popupOverlay = document.getElementById('popup-overlay'),
      popupBox = document.getElementById('popup-box'),
      searchRoomInput = document.getElementById('search-room'),
      searchUserInput = document.getElementById('search-user'),
      notificationSound = document.getElementById('notification-sound'),
      toggleAudioBtn = document.getElementById('toggle-audio-btn'),
      // >>> REF BARU: Profile Popup <<<
      profilePopupOverlay = document.getElementById('profile-popup-overlay'),
      profilePopupBox = document.getElementById('profile-popup-box'); 

let currentRoom = null, currentUser = null;
let lastMessageKeys = {}; 
let lastReadKeyCache = {}; 
let activeMessageListener = null; 
let notificationListeners = {};
let isAudioEnabled = false;
// >>> STATE BARU: Tipe Room & UID Lawan <<<
let currentRoomType = 'public'; // 'public' atau 'private'
let currentOtherUid = null; 
let currentRoomData = null; // <--- SIMPAN DATA ROOM YANG SEDANG DIBUKA

/* ==============================================================
    Fungsi Baru: Mengelola Status Tombol & Audio
    ============================================================== */
function updateAudioButtonUI() {
    if (currentUser) {
        toggleAudioBtn.style.display = 'block';
    } else {
        toggleAudioBtn.style.display = 'none';
    }

    if (isAudioEnabled) {
        toggleAudioBtn.innerHTML = '<i class="fas fa-bell"></i>'; 
        toggleAudioBtn.style.color = '#10b981'; 
        toggleAudioBtn.title = "Notifikasi Suara: AKTIF";
        notificationSound.muted = false;
    } else {
        toggleAudioBtn.innerHTML = '<i class="fas fa-bell-slash"></i>'; 
        toggleAudioBtn.style.color = '#9ca3af'; 
        toggleAudioBtn.title = "Notifikasi Suara: SILENT";
        notificationSound.muted = true;
    }
}

function tryEnableAudio() {
    if (isAudioEnabled) return;
    
    notificationSound.muted = false;
    const playPromise = notificationSound.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isAudioEnabled = true; 
            updateAudioButtonUI();
            console.log('Audio notifikasi diaktifkan.');
        }).catch(error => {
            notificationSound.muted = true;
            isAudioEnabled = false; 
            updateAudioButtonUI();
            console.log('Audio diblokir oleh browser.', error);
        });
    } else {
        notificationSound.muted = true;
        isAudioEnabled = false; 
        updateAudioButtonUI();
    }
}

/* ==============================================================
    Logika Tombol Toggle Audio
    ============================================================== */
toggleAudioBtn.onclick = () => {
    if (!currentUser) return;

    if (isAudioEnabled) {
        isAudioEnabled = false;
        notificationSound.muted = true;
        updateAudioButtonUI();
        alert('Notifikasi suara dimatikan.');
    } else {
        tryEnableAudio(); 
        if (isAudioEnabled) {
             alert('Notifikasi suara diaktifkan.');
        }
    }
};

/* =========================
    Popup helpers (umum)
    ========================= */
function openPopup(html, onConfirm, opts = {}) {
    popupBox.innerHTML = html;
    popupOverlay.classList.add('show');

    const btnConfirm = popupBox.querySelector('[data-popup-confirm]');
    const btnCancel = popupBox.querySelector('[data-popup-cancel]');

    function close() {
        popupOverlay.classList.remove('show');
        setTimeout(() => { popupBox.innerHTML=''; }, 220);
        popupOverlay.onclick = null;
    }

    if (btnCancel) {
        btnCancel.onclick = () => { close(); if (opts.onCancel) opts.onCancel(); };
    }
    if (btnConfirm) {
        btnConfirm.onclick = () => {
            if (onConfirm) onConfirm();
            // JANGAN close di sini jika form validasi gagal
            // close(); 
        };
    }
    
    // Tambahkan event listener untuk penutupan pop-up edit profil
    popupOverlay.onclick = (e) => {
        if (e.target === popupOverlay) {
            if (opts.allowOutsideClose === false) return;
            close();
        }
    };

    if (opts.focus) setTimeout(() => { const el = popupBox.querySelector(opts.focus); if(el) el.focus(); }, 80);
}

// >>> FUNGSI KHUSUS UNTUK MENUTUP POPUP PROFIL <<<
function closeProfilePopup() {
    profilePopupOverlay.classList.remove('show');
    setTimeout(() => { 
        profilePopupBox.innerHTML = '';
    }, 220);
}
profilePopupOverlay.onclick = (e) => {
    if (e.target === profilePopupOverlay) {
        closeProfilePopup();
    }
};
 
/* =========================
    Utility: escapeHTML and scrollToBottom
    ========================= */
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#039;');
}
 
function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

/* =========================
    Auth & Profile (UPDATE: last -> bio)
    ========================= */
function saveUserProfile(u) {
    if (!u) return;
    const userRef = db.ref('users/' + u.uid);
    
    // Ambil data user yang sudah ada
    userRef.once('value').then(s => {
        const userData = s.val() || {};
        userRef.update({
            name: u.displayName || 'Tamu',
            email: u.email || '',
            photo: u.photoURL || 'https://i.ibb.co/4pDNDk1/avatar-default.png',
            isOnline: true,
            // Pertahankan bio jika sudah ada, jika tidak, set default kosong
            bio: userData.bio || '' 
        });
    });
}
 
// Atur status offline saat logout atau tutup tab
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        db.ref('users/' + currentUser.uid).update({ isOnline: false });
    }
});

googleLogin.onclick = () => {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(r => {
            currentUser = r.user;
            saveUserProfile(currentUser);
            tryEnableAudio(); 
        })
        .catch(e => console.error('Login gagal:', e));
};
 
document.getElementById('logout-btn').onclick = () => {
    isAudioEnabled = false; 
    updateAudioButtonUI(); 
    auth.signOut();
};

auth.onAuthStateChanged(u => {
    const loginSection = document.getElementById('login-section');
    const mainChat = document.getElementById('main-chat');

    if (u) {
        currentUser = u;
        saveUserProfile(u);
        loginSection.style.display='none';
        mainChat.style.display='flex';
        
        updateAudioButtonUI(); 

        listenRoomsRealtime();
        listenUsersRealtime();
        
        const adminEmail = 'shysondiamond@gmail.com'; 
        if (currentUser.email === adminEmail) {
            addRoomBtn.style.display = 'block';
        } else {
            addRoomBtn.style.display = 'none';
        }

    } else {
        if (currentUser) {
            db.ref('users/' + currentUser.uid).update({ isOnline: false });
        }
        currentUser = null;
        loginSection.style.display='flex';
        mainChat.style.display='none';
        
        updateAudioButtonUI(); 

        chatList.innerHTML=''; userList.innerHTML='';
        chatBody.innerHTML=''; 
        roomName.textContent='Jeda Chat'; roomAvatar.textContent='SC'; roomDesc.textContent='';
        currentRoomType = 'public';
        currentOtherUid = null;
        currentRoomData = null;
        
        if (activeMessageListener) {
            activeMessageListener.off('child_added'); 
            activeMessageListener = null;
        }
        Object.values(notificationListeners).forEach(ref => {
            if (typeof ref.off === 'function') ref.off();
        });
        notificationListeners = {};

        db.ref('rooms').off();
        db.ref('users').off();
    }
});


/* ==============================================================
    FITUR BARU: POPUP PROFIL & EDIT
    ============================================================== */
 
// 1. Tampilkan Halaman Profil
window.showProfilePopup = (uid) => {
    if (!currentUser) return;
    
    profilePopupOverlay.classList.add('show');
    profilePopupBox.innerHTML = 'Memuat...';

    db.ref('users/' + uid).once('value', s => {
        const d = s.val();
        if (!d) {
            profilePopupBox.innerHTML = 'Profil tidak ditemukan.';
            return;
        }
        
        const isMe = uid === currentUser.uid;
        const av = d.photo
            ? `<div class='profile-avatar'><img src='${escapeHtml(d.photo)}' alt='Avatar'></div>`
            : `<div class='profile-avatar'>${(d.name || 'T').charAt(0)}</div>`;
        
        const html = `
            ${av}
            <h3>${escapeHtml(d.name || 'Pengguna Tidak Dikenal')}</h3>
            <p class='email'>${escapeHtml(d.email || '')}</p>
            <p class='bio'>${escapeHtml(d.bio || 'Belum ada deskripsi diri.')}</p>
            ${isMe ? `<button class="btn primary" onclick="showEditProfilePopup(); closeProfilePopup();">Edit Profil</button>` : ''}
            <button class="btn ghost" onclick="closeProfilePopup()">Tutup</button><br
        `;
        profilePopupBox.innerHTML = html;
    })
    .catch(e => {
        profilePopupBox.innerHTML = 'Gagal memuat profil: ' + e.message;
    });
};

// 2. Tampilkan Halaman Edit Profil
window.showEditProfilePopup = () => {
    if (!currentUser) return alert('Anda harus login untuk mengedit profil.');

    db.ref('users/' + currentUser.uid).once('value', s => {
        const d = s.val() || {};
        
        const html = `
            <h3>Edit Profil Anda</h3>
            <label for="edit-name">Nama Lengkap</label>
            <input type="text" id="edit-name" value="${escapeHtml(d.name || currentUser.displayName || '')}" maxlength="50" required />
            
            <label for="edit-photo">URL Foto Profil</label>
            <input type="url" id="edit-photo" value="${escapeHtml(d.photo || currentUser.photoURL || '')}" placeholder="Opsional" />
            
            <label for="edit-bio">Bio / Deskripsi Diri</label>
            <textarea id="edit-bio" rows="3" maxlength="120" placeholder="Maks. 120 karakter">${escapeHtml(d.bio || '')}</textarea>
            
            <div style="text-align:right; margin-top:15px;">
                <button data-popup-cancel class="btn ghost">Batal</button>
                <button data-popup-confirm class="btn primary">Simpan Perubahan</button>
            </div>
        `;

        openPopup(html, () => {
            const newName = popupBox.querySelector('#edit-name').value.trim();
            const newPhoto = popupBox.querySelector('#edit-photo').value.trim();
            const newBio = popupBox.querySelector('#edit-bio').value.trim();
            
            if (newName.length < 3) {
                alert('Nama minimal 3 karakter.');
                return false; // Jangan tutup popup
            }

            db.ref('users/' + currentUser.uid).update({
                name: newName,
                photo: newPhoto,
                bio: newBio 
            })
            .then(() => {
                alert('Profil berhasil diperbarui!');
                // Opsional: Perbarui profile di Firebase Auth juga (hanya nama/foto)
                currentUser.updateProfile({
                    displayName: newName,
                    photoURL: newPhoto
                }).catch(e => console.error("Gagal update Firebase Auth profile:", e));
                
                // Tutup popup
                popupOverlay.classList.remove('show');
                setTimeout(() => { popupBox.innerHTML=''; }, 220);
            })
            .catch(e => {
                alert('Gagal menyimpan profil: ' + e.message);
                return false; // Jangan tutup popup
            });

        }, { focus: '#edit-name', allowOutsideClose: false }); // Biar nggak ketutup saat klik luar
    });
};

/* =======================================
    NOTIFIKASI & MESSAGING (Sama)
    ======================================= */
function updateLastReadMessage(chatId, type, messageKey) {
    if (!currentUser || !messageKey) return;

    const path = `user_status/${currentUser.uid}/last_read_messages/${type}/${chatId}`;
    
    if (lastReadKeyCache[chatId] === messageKey) return; 

    db.ref(path).set(messageKey)
        .then(() => {
            lastReadKeyCache[chatId] = messageKey; 
            let elementId;
            if (type === 'room') { elementId = 'room-' + chatId; }
            else { elementId = 'user-' + chatId.split('_').filter(uid => uid !== currentUser.uid)[0]; }
            const el = document.getElementById(elementId);
            if (el) el.classList.remove('has-notification');
        })
        .catch(e => console.error("Gagal update last read:", e));
}

function listenNotificationStatus(chatId, type) {
    if (!currentUser) return;
    
    const pathPrefix = type === 'room' ? 'messages/' : 'messages_private/';
    const lastMsgRef = db.ref(pathPrefix + chatId).limitToLast(1); 
    const userLastReadRef = db.ref(`user_status/${currentUser.uid}/last_read_messages/${type}/${chatId}`);
    
    let elementId;
    if (type === 'room') { elementId = 'room-' + chatId; } 
    else { 
        const otherUid = chatId.split('_').filter(uid => uid !== currentUser.uid)[0];
        elementId = 'user-' + otherUid;
    }
    const el = document.getElementById(elementId);
    
    if (notificationListeners[chatId + '_read']) { notificationListeners[chatId + '_read'].off('value'); }
    if (notificationListeners[chatId + '_msg']) { notificationListeners[chatId + '_msg'].off('child_added'); }

    let latestMsgKey = null; 
    let latestMsgData = null;

    const updateNotificationUI = (lastReadKey) => {
        if (!el) return;
        
        const isMyOwnMessage = latestMsgData && latestMsgData.uid === currentUser.uid;

        if (!isMyOwnMessage && latestMsgKey && latestMsgKey !== lastReadKey) {
             el.classList.add('has-notification');
             
             if (currentRoom !== chatId && latestMsgKey !== lastMessageKeys[chatId]) {
                 if (notificationSound && isAudioEnabled) { 
                      notificationSound.currentTime = 0; 
                      notificationSound.play().catch(e => console.log('Gagal memutar suara notif:', e));
                 }
             }
        } else {
            el.classList.remove('has-notification');
        }
        lastMessageKeys[chatId] = latestMsgKey; 
    };

    const readListener = userLastReadRef.on('value', readSnap => {
        const lastReadKey = readSnap.val();
        lastKeyCache[chatId] = lastReadKey; 
        
        lastMsgRef.once('value', s => {
            s.forEach(child => {
                latestMsgKey = child.key;
                latestMsgData = child.val();
            });
            updateNotificationUI(lastReadKey);
        });
    });
    notificationListeners[chatId + '_read'] = userLastReadRef; 

    const msgListener = lastMsgRef.on('child_added', s => {
        latestMsgKey = s.key;
        latestMsgData = s.val();
        
        const currentLastReadKey = lastReadKeyCache[chatId] || null; 
        
        if (currentRoom === chatId) {
            updateLastReadMessage(chatId, type, latestMsgKey);
        }
        
        updateNotificationUI(currentLastReadKey);
        // Pindahkan item ke atas jika pesan baru datang (bukan dari diri sendiri)
        if (latestMsgData && latestMsgData.uid !== currentUser.uid) {
            if (type === 'room') {
                const el = document.getElementById('room-' + chatId);
                if (el && el.parentElement) el.parentElement.prepend(el);
            } else {
                const otherUid = chatId.split('_').filter(uid => uid !== currentUser.uid)[0];
                const el = document.getElementById('user-' + otherUid);
                if (el && el.parentElement) el.parentElement.prepend(el);
            }
        }

    });
    notificationListeners[chatId + '_msg'] = lastMsgRef; 
}

/* =========================
    Render & Update Chat Item (Group) (MODIFIKASI: Hapus 'last' pesan)
    ========================= */
function renderChatItem(id, d) {
    const i = document.createElement('div');
    i.className = 'chat-item';
    i.id = 'room-' + id;
    const av = d.photo
        ? `<div class='avatar'><img src='${d.photo}'></div>`
        : `<div class='avatar'>${(d.name || 'T').charAt(0)}</div>`;
    // const lastMsg = d.last ? `${d.last.length > 30 ? d.last.substring(0, 30) + '...' : d.last}` : 'Belum ada pesan.'; // Baris ini dihapus
    
    // MODIFIKASI: Mengganti d.last dengan deskripsi default grup.
    const groupDesc = d.description || 'Grup Chat'; 
    
    i.innerHTML = `${av}<div class='info'><div class='name'>${escapeHtml(d.name || 'Grup')} <div class="notification-dot"></div></div><div class='last'>${escapeHtml(groupDesc)}</div></div>`; // Menggunakan class 'last' untuk deskripsi

    // GANTI: gunakan attemptOpenRoom sehingga bisa cek PIN terlebih dahulu
    i.onclick = () => {
        attemptOpenRoom(id, d);
        if(window.innerWidth <= 768) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    };
    chatList.prepend(i); 

    listenNotificationStatus(id, 'room'); 
}
 
function updateRoomItem(id, d) {
    const i = document.getElementById('room-' + id);
    if (!i) return renderChatItem(id, d);
    
    // MODIFIKASI: Mengganti d.last dengan deskripsi default grup.
    const groupDesc = d.description || 'Grup Chat'; 
    const nameEl = i.querySelector('.name').firstChild;
    const lastEl = i.querySelector('.last');

    if (nameEl) nameEl.textContent = escapeHtml(d.name || 'Grup');
    if (lastEl) lastEl.textContent = escapeHtml(groupDesc); // Diperbarui untuk menampilkan deskripsi

    // Pindahkan ke atas jika ada pesan baru (tergantung d.last_at)
    if (d.last_at && i.parentElement) {
        i.parentElement.prepend(i); 
    }
}
 
function listenRoomsRealtime() {
    chatList.innerHTML = '';
    const roomsRef = db.ref('rooms').orderByChild('last_at'); 
    roomsRef.off();
    roomsRef.on('child_added', s => renderChatItem(s.key, s.val()));
    roomsRef.on('child_changed', s => updateRoomItem(s.key, s.val()));
    roomsRef.on('child_removed', s => {
        const el = document.getElementById('room-' + s.key);
        if (el) el.remove();
    });

    searchRoomInput.oninput = () => {
        const query = searchRoomInput.value.toLowerCase();
        document.querySelectorAll('#chat-list .chat-item').forEach(el => {
            const name = el.querySelector('.name').textContent.toLowerCase();
            el.style.display = name.includes(query) ? 'flex' : 'none';
        });
    };
}

/* =========================
    Render & Update Chat Item (User/Private) (MODIFIKASI: last -> bio)
    ========================= */
function renderUserItem(uid, d) {
    if (uid === currentUser.uid) return;
    const i = document.createElement('div');
    i.className = 'chat-item user-item';
    i.id = 'user-' + uid;
    
    // Avatar memiliki onclick showProfilePopup
    const av = d.photo
        ? `<div class='avatar' onclick='event.stopPropagation(); showProfilePopup("${uid}")'><img src='${d.photo}' alt='Avatar'></div>`
        : `<div class='avatar' onclick='event.stopPropagation(); showProfilePopup("${uid}")'>${(d.name || 'T').charAt(0)}</div>`;
    
    // Tampilkan Bio di daftar pengguna sebagai pengganti 'last'
    const bio = d.bio ? `<div class='bio'>${escapeHtml(d.bio)}</div>` : `<div class='last'>Belum ada deskripsi diri.</div>`;
    
    i.innerHTML = `${av}<div class='online-dot'></div><div class='info'><div class='name'>${escapeHtml(d.name || 'Pengguna')} <div class="notification-dot"></div></div>${bio}</div>`; // MODIFIKASI: Menggunakan 'bio'

    i.onclick = () => {
        const chatId = [currentUser.uid, uid].sort().join('_');
        openChat(chatId, d, true, uid);
        if(window.innerWidth <= 768) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    };
    userList.append(i); 

    const chatId = [currentUser.uid, uid].sort().join('_');
    listenNotificationStatus(chatId, 'private');
}
 
function updateUserItem(uid, d) {
    const i = document.getElementById('user-' + uid);
    if (!i) return renderUserItem(uid, d);

    const nameEl = i.querySelector('.name').firstChild;
    const infoEl = i.querySelector('.info');

    if (nameEl) nameEl.textContent = escapeHtml(d.name || 'Pengguna');

    // --- MODIFIKASI LOGIKA TAMPILAN 'LAST' UNTUK CHAT PRIVAT DIGANTI DENGAN 'BIO' ---
    
    // Tentukan konten yang akan ditampilkan (hanya Bio)
    let newLastHtml = d.bio 
        ? `<div class='bio'>${escapeHtml(d.bio)}</div>` 
        : `<div class='last'>Belum ada deskripsi diri.</div>`;
    
    // Hapus elemen terakhir yang merupakan .last atau .bio
    const lastChild = infoEl.lastElementChild;
    // Hapus .last atau .bio yang lama
    if (lastChild && (lastChild.classList.contains('last') || lastChild.classList.contains('bio'))) {
        infoEl.removeChild(lastChild);
    }

    // Tambahkan kembali elemen baru (Bio)
    infoEl.insertAdjacentHTML('beforeend', newLastHtml);
    // --- AKHIR MODIFIKASI ---

    // Update status online
    if (d.isOnline) {
        i.classList.add('is-online');
    } else {
        i.classList.remove('is-online');
    }
    
    // Pindahkan ke atas jika ada indikator pesan baru (bisa dihilangkan jika tidak ada logic 'last message' di user/db)
    // if (d.last && i.parentElement) { // Baris ini mungkin perlu dihilangkan atau diganti dengan logic update pesan terakhir
    //      i.parentElement.prepend(i); 
    // }
}

function listenUsersRealtime() {
    userList.innerHTML = '';
    // Mengubah orderByChild('last') menjadi orderByChild('bio') atau menghapusnya jika tidak ada field 'bio' di DB
    // Saya asumsikan Anda ingin urutan tetap sama, jadi saya biarkan orderByChild('last') untuk saat ini,
    // tetapi perlu diingat bahwa 'last' di sini merujuk pada urutan di DB, bukan tampilan UI.
    const usersRef = db.ref('users'); //.orderByChild('last'); // Dihapus karena 'last' sudah dihapus di user item
    usersRef.off();
    usersRef.on('child_added', s => renderUserItem(s.key, s.val()));
    usersRef.on('child_changed', s => updateUserItem(s.key, s.val()));
    usersRef.on('child_removed', s => {
        const el = document.getElementById('user-' + s.key);
        if (el) el.remove();
    });
    
    searchUserInput.oninput = () => {
        const query = searchUserInput.value.toLowerCase();
        document.querySelectorAll('#user-list .chat-item').forEach(el => {
            const name = el.querySelector('.name').textContent.toLowerCase();
            // Cek juga bio untuk pencarian
            const bioEl = el.querySelector('.bio') || el.querySelector('.last');
            const bio = bioEl ? bioEl.textContent.toLowerCase() : '';
            el.style.display = (name.includes(query) || bio.includes(query)) ? 'flex' : 'none';
        });
    };
}

/* =========================
    Open Chat & Messaging (UPDATE: Set State Room Info dan OnClick Header)
    ========================= */
function attemptOpenRoom(id, d) {
    // Jika ruangan memiliki PIN (d.pin !== false), minta PIN dulu (simpan unlocked di localStorage)
    if (d && d.pin && d.pin !== false && d.pin !== '' && d.pin !== null) {
        const storageKey = 'room_unlocked_' + id;
        const unlocked = localStorage.getItem(storageKey);
        if (unlocked === d.pin) {
            // sudah unlocked
            openChat(id, d, false);
            return;
        }
        // tampilkan popup input PIN
        const html = `
            <h3>Masukkan PIN untuk "${escapeHtml(d.name || 'Grup')}"</h3>
            <input id="room-pin-input" type="password" placeholder="PIN Ruangan" maxlength="10" style="width:100%; padding:8px; margin-top:8px;" />
            <div style="text-align:right; margin-top:12px;">
                <button data-popup-cancel class="btn ghost">Batal</button>
                <button data-popup-confirm class="btn primary">Masuk</button>
            </div>
        `;
        openPopup(html, () => {
            const pinVal = popupBox.querySelector('#room-pin-input').value.trim();
            if (pinVal === '') {
                alert('Masukkan PIN.');
                return false;
            }
            if (pinVal === String(d.pin)) {
                // simpan di localStorage agar tidak diminta lagi
                localStorage.setItem(storageKey, pinVal);
                popupOverlay.classList.remove('show');
                setTimeout(() => { popupBox.innerHTML = ''; }, 220);
                openChat(id, d, false);
            } else {
                alert('PIN salah. Silakan coba lagi.');
                return false;
            }
        }, { focus: '#room-pin-input', allowOutsideClose: false });
    } else {
        // Tidak terkunci
        openChat(id, d, false);
    }
}

function openChat(id, d, isPrivate = false, otherUid = null) {
    if (!currentUser) return;
    if (currentRoom === id) return;

    if (activeMessageListener) {
        activeMessageListener.off('child_added');
        activeMessageListener = null;
    }
    
    chatBody.innerHTML = '';
    currentRoom = id;
    currentRoomType = isPrivate ? 'private' : 'public'; // Set state
    currentOtherUid = otherUid; // Set state
    currentRoomData = d || null; // <-- SIMPAN DATA ROOM (dipakai di sendMessage)

    // --- Logika Header ---
    roomName.textContent = escapeHtml(d.name || (isPrivate ? 'Privat Chat' : 'Grup Chat'));
    
    // Tampilkan Bio/Deskripsi untuk Chat Privat/Grup & Atur OnClick
    const descText = isPrivate ? (d.bio || 'Privat Chat') : (d.description || 'Grup Chat'); // Menggunakan 'description' untuk grup
    roomDesc.textContent = escapeHtml(descText);
    
    // Hapus event listener lama
    roomAvatar.onclick = null;
    roomInfo.onclick = null;
    
    if (isPrivate) {
        // Tambahkan event listener baru untuk menampilkan profil
        roomAvatar.onclick = () => showProfilePopup(currentOtherUid);
        roomInfo.onclick = () => showProfilePopup(currentOtherUid);
    } else {
        // Biarkan null atau set untuk info grup jika ada
        roomAvatar.onclick = null;
        roomInfo.onclick = null;
      
      
      
      // Jika admin, tambahkan event klik untuk edit grup
if (!isPrivate && currentUser && currentUser.email === 'shysondiamond@gmail.com') {
  roomInfo.onclick = () => showEditRoomPopup(id, d);
} else {
        roomInfo.onclick = () => showGroupInfoPopup(d);
    }

    }
    
    roomAvatar.innerHTML = d.photo
        ? `<img src='${d.photo}'>`
        : (d.name || 'T').charAt(0);
        
    let elId = isPrivate ? 'user-' + otherUid : 'room-' + id;
    const sidebarEl = document.getElementById(elId);
    if (sidebarEl) sidebarEl.classList.remove('has-notification');
    
    const path = isPrivate ? 'messages_private/' + id : 'messages/' + id;
    
    const messagesRef = db.ref(path).limitToLast(50);
            activeMessageListener = messagesRef;

            messagesRef.on('child_added', s => {
                renderMessage(s.key, s.val(), s.ref.key);
                updateLastReadMessage(id, isPrivate ? 'private' : 'room', s.key); 
            }, e => console.error("Gagal listen pesan:", e));
            
            chatText.disabled = false;
            chatSend.disabled = false;
            
            setTimeout(() => { chatText.focus(); }, 100);
  
  /* ==============================================================
   FITUR BARU: EDIT ROOM / GRUP
   ============================================================== */

// --- Fungsi untuk menampilkan popup edit grup ---
window.showEditRoomPopup = (roomId, roomData) => {
  if (!currentUser) return alert('Anda harus login.');
  
  const adminEmail = 'shysondiamond@gmail.com';
  if (currentUser.email !== adminEmail) {
    return alert('Hanya admin yang bisa mengedit grup.');
  }

  const html = `
    <h3>Edit Grup</h3>
    <label>Nama Grup</label>
    <input id="edit-room-name" type="text" value="${escapeHtml(roomData.name || '')}" maxlength="50" required />

    <label>URL Foto Grup</label>
    <input id="edit-room-photo" type="url" value="${escapeHtml(roomData.photo || '')}" placeholder="Opsional" />

    <label>Deskripsi Grup</label>
    <textarea id="edit-room-desc" rows="3" maxlength="120" placeholder="Maks. 120 karakter">${escapeHtml(roomData.description || '')}</textarea>

    <label>PIN (kosongkan jika tidak ingin pakai)</label>
    <input id="edit-room-pin" type="password" value="${escapeHtml(roomData.pin || '')}" maxlength="10" />

    <div style="text-align:right; margin-top:15px;">
        <button id="delete-room-btn" class="btn danger" style="float:left;background:#dc2626;color:#fff;">Hapus Grup</button>
        <button data-popup-cancel class="btn ghost">Batal</button>
        <button data-popup-confirm class="btn primary">Simpan</button>
    </div>
  `;

  openPopup(html, () => {
    const newName = popupBox.querySelector('#edit-room-name').value.trim();
    const newPhoto = popupBox.querySelector('#edit-room-photo').value.trim();
    const newDesc = popupBox.querySelector('#edit-room-desc').value.trim();
    const newPin = popupBox.querySelector('#edit-room-pin').value.trim();

    if (newName.length < 3) {
      alert('Nama grup minimal 3 karakter.');
      return false;
    }

    db.ref('rooms/' + roomId).update({
      name: newName,
      photo: newPhoto || '',
      description: newDesc || '',
      pin: newPin || false
    })
    .then(() => {
      alert('Data grup berhasil diperbarui.');
      popupOverlay.classList.remove('show');
      setTimeout(() => { popupBox.innerHTML = ''; }, 220);
    })
    .catch(e => alert('Gagal menyimpan perubahan: ' + e.message));
  }, { focus: '#edit-room-name', allowOutsideClose: false });

  // Tombol hapus grup
  const deleteBtn = popupBox.querySelector('#delete-room-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm('Apakah Anda yakin ingin menghapus grup ini?\nTindakan ini tidak dapat dibatalkan.')) {
        db.ref('rooms/' + roomId).remove()
          .then(() => {
            alert('Grup berhasil dihapus.');
            popupOverlay.classList.remove('show');
            setTimeout(() => { popupBox.innerHTML = ''; }, 220);
            // Kosongkan chat jika sedang di grup yang dihapus
            if (currentRoom === roomId) {
              chatBody.innerHTML = '';
              roomName.textContent = 'Jeda Chat';
              roomDesc.textContent = '';
            }
          })
          .catch(e => alert('Gagal menghapus grup: ' + e.message));
      } else {
        alert('Dibatalkan.');
      }
    };
  }
};

        }
      /* ==============================================================
   FITUR: POPUP INFORMASI GRUP UNTUK USER BIASA
   ============================================================== */
window.showGroupInfoPopup = (roomData) => {
  const html = `
    <h3>Informasi Grup</h3>
    <div style="text-align:center;">
      <img src="${roomData.photo || 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png'}" 
           alt="Foto Grup" 
           style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:10px;">
      <h4>${escapeHtml(roomData.name || 'Grup Tanpa Nama')}</h4>
      <p style="font-size:14px;color:#555;margin-top:4px;">${escapeHtml(roomData.description || 'Tidak ada deskripsi')}</p>
    </div>
    
    <div style="text-align:right;margin-top:15px;">
      <button data-popup-cancel class="btn primary">Tutup</button>
    </div>
  `;

  openPopup(html, null, { allowOutsideClose: true });
};

      
        
        function renderMessage(key, d, parentKey) {
            const isYou = d.uid === currentUser.uid;
            const messageEl = document.createElement('div');
            messageEl.className = 'msg ' + (isYou ? 'you' : 'other');
            
            const time = new Date(d.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            const avatarHtml = d.photo
                ? `<div class='avatar'><img src='${d.photo}' alt='Avatar'></div>`
                : `<div class='avatar'>${(d.name || 'T').charAt(0)}</div>`; // Menggunakan backtick `

            messageEl.innerHTML = `
                ${isYou ? '' : avatarHtml}
                <div class='meta'>
                    ${isYou ? '' : `<div class='name'>${escapeHtml(d.name || 'Pengguna')}</div>`}
                    <div class='text'>${escapeHtml(d.text)}</div>
                    <div class='time'>${time}</div>
                </div>
                ${isYou ? avatarHtml : ''}
            `; // Menggunakan backtick `           
            chatBody.appendChild(messageEl);
            scrollToBottom();
        }

       chatSend.onclick = () => sendMessage();
chatText.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

function sendMessage() {
    if (!currentUser || !currentRoom) return alert("Pilih ruang obrolan terlebih dahulu.");
    const text = chatText.value.trim();
    if (text === '') return;

    const isPrivate = currentRoomType === 'private';
    const path = isPrivate ? 'messages_private/' + currentRoom : 'messages/' + currentRoom;

    // ======= CEK PERMISSION berdasarkan canSend (hanya untuk room/public) =======
    if (!isPrivate && currentRoomData && currentRoomData.canSend === 'admin') {
        // hanya admin room boleh mengirim
        const adminEmail = currentRoomData.adminEmail || '';
        if (!currentUser.email || currentUser.email !== adminEmail) {
            return alert('Hanya admin ruangan yang dapat mengirim pesan di ruangan ini.');
        }
    }

    const message = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Pengguna',
        photo: currentUser.photoURL || '',
        text: text,
        at: firebase.database.ServerValue.TIMESTAMP
    };

    // 1. Kirim Pesan
    db.ref(path).push(message)
        .then(() => {
            chatText.value = '';

            // Setelah pesan terkirim, pindahkan chat ke atas
            if (isPrivate) {
                const uids = currentRoom.split('_');
                const myUid = currentUser.uid;
                const otherUid = uids.find(uid => uid !== myUid);
                const el = document.getElementById('user-' + otherUid);
                if (el && el.parentElement) el.parentElement.prepend(el);
            } else {
                const el = document.getElementById('room-' + currentRoom);
                if (el && el.parentElement) el.parentElement.prepend(el);
            }

        })
        .catch(e => {
            console.error("Gagal mengirim pesan:", e);
            alert("Gagal mengirim pesan: " + (e.message || 'Cek koneksi atau Firebase Security Rules Anda!'));
            chatText.value = text;
        });

    // 2. Update Status Pesan Terakhir
    const lastMessage = {
        last_at: firebase.database.ServerValue.TIMESTAMP // Objek update hanya berisi timestamp
    };
    
    if (isPrivate) {
        // 🛑 KODE UNTUK MEMINDAHKAN CHAT PRIVAT KE ATAS (Ganti atau pastikan kode ini ada)
        const uids = currentRoom.split('_');
        const myUid = currentUser.uid;
        const otherUid = uids.find(uid => uid !== myUid); 

        if (!otherUid) {
            console.error("Gagal menentukan UID lawan bicara dalam obrolan privat.");
            return;
        }

        // 1. Update 'last_at' di node /users/ untuk Pengirim
        db.ref('users/' + myUid).update(lastMessage)
            .catch(e => console.error("Gagal update last_at di Pengirim:", e));

        // 2. Update 'last_at' di node /users/ untuk Penerima
        db.ref('users/' + otherUid).update(lastMessage)
            .catch(e => console.error("Gagal update last_at di Penerima:", e));
        
    } else {
        // Logika untuk Chat Grup (Hanya update timestamp)
        db.ref('rooms/' + currentRoom).update(lastMessage)
            .catch(e => console.error("Gagal update room last message:", e));
    }
}

       /* ==============================================================
        LOGIKA TOMBOL TAMBAH RUANGAN (Admin Only) (MODIFIKASI: Hapus 'last' pesan)
        ============================================================== */
addRoomBtn.onclick = () => {
    // Pastikan hanya tombol ini muncul untuk admin (sudah dicek di auth.onAuthStateChanged)
    if (!currentUser) return; 

    // Form sekarang berisi option canSend dan kunci PIN
    const html = `
        <h3>Buat Ruangan Baru</h3>
        <label for="room-name-input">Nama Ruangan</label>
        <input type="text" id="room-name-input" placeholder="Misalnya: Diskusi Umum" />
        <label for="room-desc-input">Deskripsi Ruangan (Tampil di Sidebar)</label>
        <input type="text" id="room-desc-input" placeholder="Maks. 50 karakter" maxlength="50" />
        <label for="room-photo-input">URL Foto/Avatar (Opsional)</label>
        <input type="url" id="room-photo-input" placeholder="Contoh: https://link-foto.com/grup.png" />

        <label style="display:block; margin-top:10px;">Siapa yang dapat mengirim pesan?</label>
        <select id="room-cansend" style="width:100%; padding:8px;">
            <option value="all">Semua User</option>
            <option value="admin">Admin Only</option>
        </select>

        <label style="display:block; margin-top:10px;">
            <input type="checkbox" id="room-locked" /> Kunci Room dengan PIN
        </label>
        <input type="password" id="room-pin" placeholder="Masukkan PIN (angka)" maxlength="10" style="width:100%; padding:8px; margin-top:8px; display:none;" />

        <div style="text-align:right; margin-top:15px;">
            <button data-popup-cancel class="btn ghost">Batal</button>
            <button data-popup-confirm class="btn primary">Buat</button>
        </div>
    `;    
    // Mengubah callback menjadi fungsi asinkron (async)
    openPopup(html, async () => { 
        const name = popupBox.querySelector('#room-name-input').value.trim();
        const photo = popupBox.querySelector('#room-photo-input').value.trim();
        const description = popupBox.querySelector('#room-desc-input').value.trim();
        const canSend = popupBox.querySelector('#room-cansend').value || 'all';
        const locked = popupBox.querySelector('#room-locked').checked;
        const pinVal = popupBox.querySelector('#room-pin').value.trim();

        if (name.length < 3) {
            alert('Nama ruangan minimal 3 karakter.');
            return false;
        }

        if (locked && pinVal.length < 3) {
            alert('PIN minimal 3 karakter jika mengunci ruangan.');
            return false;
        }

        // --- PERBAIKAN KRITIS: REFRESH TOKEN ---
        try {
            // 1. Paksa refresh token pengguna (ARGUMEN 'true' SANGAT PENTING!)
            // Ini menjamin klaim 'auth.token.email' di server Firebase adalah yang terbaru.
            await firebase.auth().currentUser.getIdTokenResult(true);
            
            // 2. Lakukan operasi push data HANYA setelah token di-refresh
            await db.ref('rooms').push({
                name: name,
                photo: photo || '',
                description: description || 'Grup Chat', // Tambah field description baru
                adminUid: currentUser.uid,
                adminEmail: currentUser.email,
                last_at: firebase.database.ServerValue.TIMESTAMP,
                pin: locked ? String(pinVal) : false, // simpan PIN atau false
                canSend: canSend, // 'admin' atau 'all'
                type: 'group'
            });

            // 3. Penanganan Sukses
            alert('Ruangan berhasil dibuat!');
            // Tutup popup secara manual setelah sukses
            popupOverlay.classList.remove('show');
            setTimeout(() => { popupBox.innerHTML = ''; }, 220);

        } catch (e) {
            // 4. Penanganan Error (Menangkap PERMISSION_DENIED jika bukan admin)
            console.error(e);
            let msg = e.message;
            if (e.message.includes('permission_denied')) {
                 msg = 'Anda tidak memiliki izin (PERMISSION_DENIED). Pastikan email Anda adalah shysondiamond@gmail.com.';
            }
            alert('Gagal membuat ruangan: ' + msg);
            // Kembalikan false agar popup tidak tertutup saat gagal
            return false; 
        }
        // --- Akhir Perbaikan ---
        
    }, { focus: '#room-name-input' });

    // Hook: tampilkan/ sembunyikan input PIN sesuai checkbox
    setTimeout(() => {
        const chk = popupBox.querySelector('#room-locked');
        const pin = popupBox.querySelector('#room-pin');
        if (!chk || !pin) return;
        pin.style.display = chk.checked ? 'block' : 'none';
        chk.onchange = () => { pin.style.display = chk.checked ? 'block' : 'none'; if (chk.checked) pin.focus(); };
    }, 80);
};
        
        /* ==========================================================
           END JAVASCRIPT LENGKAP
           ========================================================== */
