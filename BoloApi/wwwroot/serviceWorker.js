self.addEventListener('fetch', function (event) { });

self.addEventListener('push', function (e) {
    var body = {};

    if (e.data) {
        body = e.data.json();
    } else {
        body = "";
    }

    var options = {
        body: body.NotificationText,
        icon: body.PhotoURL,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            url: body.CampaignURL
        },
        actions: [
            {
                action: "explore", title: "Check It",
                icon: "images/checkmark.png"
            },
            {
                action: "close", title: "Ignore",
                icon: "images/red_x.png"
            },
        ]
    };
    e.waitUntil(
        self.registration.showNotification("Waarta Notification", options)
    );
});

self.addEventListener('notificationclick', function (e) {
    var notification = e.notification;
    var action = e.action;

    if (action === 'close') {
        notification.close();
    } else if (action === 'explore') {
        // Some actions
        clients.openWindow(notification.data.url).then((windowClient) => windowClient ? windowClient.focus() : null);
        notification.close();
    }
});