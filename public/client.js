function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

navigator.serviceWorker.register("service-worker.js");

navigator.serviceWorker.ready
  .then(function(registration) {
    return registration.pushManager
      .getSubscription()
      .then(async function(subscription) {
        if (subscription) {
          console.log(subscription);
          return subscription;
        }

        const response = await fetch("./vapidPublicKey");
        const vapidPublicKey = await response.text();

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      });
  })
  .then(function(subscription) {
    fetch("./register", {
      method: "post",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        subscription: subscription
      })
    });

    document.getElementById("notifyMe").onclick = function() {
      const payload = "Hello People"; //document.getElementById("notification-payload").value;
      const delay = 1; //document.getElementById("notification-delay").value;
      const ttl = 0; //document.getElementById("notification-ttl").value;

      fetch("./sendNotification", {
        method: "post",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          subscription: subscription,
          payload: payload,
          delay: delay,
          ttl: ttl
        })
      });
    };
  });
