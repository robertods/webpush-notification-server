/* eslint-disable no-restricted-syntax */
const registerUrl = 'https://robds-webpush.herokuapp.com/register';
const serviceWorkerUrl = 'https://robds-webpush.herokuapp.com/serviceWorker.js';
const publicVapidKey = 'BDnGH008RF5sPD0qQcnWngcqhx1lOlCQLLLmPZALFykvwsW0BplUQT_cJxHrHPrFFuqGpzQQNZclenl_kbitXaY';

const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const saveSubscription = async subscription => {
  const res = await fetch(registerUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });
  return res.status === 200 ? res.json() : false;
};

const generateSubscription = async swRegistration => {
  await window.Notification.requestPermission();
  const pushSubscription = await swRegistration.pushManager.getSubscription();
  if (!pushSubscription) {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    const saved = await saveSubscription(subscription);
    if (saved) return saved;
    throw Error('Subscription not saved!');
  } else return pushSubscription;
};

const registerServiceWorker = async () => {
  return await navigator.serviceWorker.register(serviceWorkerUrl);
};

const register = async () => {
  if ('serviceWorker' in navigator) {
    const swRegistration = await registerServiceWorker();
    await generateSubscription(swRegistration);
  } else throw new Error('ServiceWorkers are not supported by your browser!');
};

register();
