// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMqHfNi_pYHsdirS03_xkCKCur7p-iKP0",
  authDomain: "forumjeda.firebaseapp.com",
  projectId: "forumjeda",
  messagingSenderId: "656726246971",
  appId: "1:656726246971:web:187ffe8a3d181496643e1e"
});

const messaging = firebase.messaging();

// Tangani notifikasi saat background
messaging.onBackgroundMessage(payload => {
  console.log('Pesan background:', payload);
  const { title, body } = payload.notification;
  const sound = 'https://shysondiamond.github.io/CDN-RIVALDYALFI/new-notification-010-352755.mp3'; // URL ke file suara cuitan burung kamu
  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',
    sound,
  });
});
