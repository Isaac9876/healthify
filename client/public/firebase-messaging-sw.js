importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
   apiKey: "AIzaSyAvWA7yWFUFCU8R4XqYs-hdo25qHhzVPJ4", 
   authDomain: "healthify-bf2e2.firebaseapp.com", 
   projectId: "healthify-bf2e2", 
   storageBucket: "healthify-bf2e2.firebasestorage.app", 
   messagingSenderId: "651235168540", 
   appId: "1:651235168540:web:9a9bdcfffa9c3984aa6ad9", 
   measurementId: "G-LM9M3CXE1Y" 
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
