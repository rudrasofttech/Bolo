const newNotificationGCEvent = "newNotificationGC";
class UniversalHubClient {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/universalhub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.onclose(async () => {
            await this.start();
        });

        this.connection.onreconnecting(error => {
            console.assert(this.connection.state === signalR.HubConnectionState.Reconnecting);
        });

        this.connection.onreconnected(connectionId => {
            //console.assert(this.connection.state === signalR.HubConnectionState.Connected);
            this.joinUniversalGroup();
        });

        this.connection.on("NewNotification", (notification) => {
            const newNotificaionGC = new CustomEvent(newNotificationGCEvent, {
                detail: notification, bubbles: true, cancelable: true, composed: false
            });
            document.querySelector("body").dispatchEvent(newNotificaionGC);
        });

        this.connection.on("NotifyPresence", (userid) => {
            //console.log("Userid " + userid + " is online;");
            const notifyPresenceGC = new CustomEvent(notifyPresenceGCEvent, {
                detail: { userid }, bubbles: true, cancelable: true, composed: false
            });
            document.querySelector("body").dispatchEvent(notifyPresenceGC);
        });

        //this.connection.on("ReceiveMessage", (msg) => {
            
        //    const receiveMessageGC = new CustomEvent(receiveMessageGCEvent, {
        //        detail: { msg }, bubbles: true, cancelable: true, composed: false
        //    });
        //    if (location.href.indexOf("/messages") == -1) {
        //        $("#messageToast .toast-body").html((msg.sender.pic !== "" ? "<img src='" + msg.sender.pic + "' class='profilepicthumb rounded-1 me-2' />" : "") + msg.sender.name + " sent you a <a class='text-danger' href='//" + location.host + "/messages/" + msg.sender.id + "'>message</a>.");
        //        var toast = new bootstrap.Toast(document.getElementById('messageToast'))
        //        toast.show();
        //    }
        //    document.querySelector("body").dispatchEvent(receiveMessageGC);
        //});


        //this.connection.on("HasSeenMessage", (contact) => {
        //    const hasSeenMessageGC = new CustomEvent(hasSeenMessageGCEvent, {
        //        detail: { contact }, bubbles: true, cancelable: true, composed: false
        //    });
        //    document.querySelector("body").dispatchEvent(hasSeenMessageGC);
        //});

        //this.connection.on("HasUnsendMessage", (msg) => {
        //    const hasUnsendMessageGC = new CustomEvent(hasUnsendMessageGCEvent, {
        //        detail: { msg }, bubbles: true, cancelable: true, composed: false
        //    });
        //    document.querySelector("body").dispatchEvent(hasUnsendMessageGC);
        //});
    }

    async start() {
        try {
            await this.connection.start();
            //console.log(this.connection.state);
        } catch (err) {
            console.log(err);
            setTimeout(start, 5000);
        }
    }

    joinUniversalGroup() {
        if (this.connection.state === signalR.HubConnectionState.Connected) {
            this.connection.invoke("JoinUniversalGroup");
        }
    }
}

class SiteGeneralWorker {

    constructor(purl, _appServerKey) {
        this.pulseurl = purl;
        this.sendPulseInterval = 5000;
        this.offlineStatusCheckInterval = 15000;
        this.reg = null;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini|Mobile/i.test(navigator.userAgent);
        this.notifications = [];
        this.nPermissionModal = new bootstrap.Modal(document.getElementById('askNotificationPermissionModal'), {});
        $("#PromptForAccessBtn").click(() => this.requestNotificationAccess());
        this.applicationServerKey = _appServerKey;

        document.querySelector("body").addEventListener(newNotificationGCEvent, (e) => {
            this.notifications.push(e.detail);
            this.renderNotifications();
        })

        document.querySelector("body").addEventListener(notifyPresenceGCEvent, (e) => {
            this.updatePulseDate(e.detail.userid);
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("//" + location.host + "/ServiceWorker.js")
                    .then((reg) => {
                        this.reg = reg;
                        if (Notification.permission === "granted") {
                            this.getSubscription();
                        } else if (Notification.permission === "blocked" || Notification.permission === "denied") {
                        } else {
                        }
                    });
            });
        } else {
            $("#NoSupport").removeClass("d-none");
        }
    }

    showNotificationPermissionModal() {
        if (Notification.permission !== "granted" &&
            Notification.permission !== "blocked" &&
            Notification.permission !== "denied") {
            this.nPermissionModal.toggle();
        }
    }

    requestNotificationAccess() {
        Notification.requestPermission().then((status) => {
            $("#GiveAccess").addClass("d-none");
            if (status == "granted") {
                $("#notificationaccessform").removeClass("d-none");
                this.getSubscription();
            } else {
                $("#NoSupport").removeClass("d-none");
            }
        });
    }

    getSubscription() {
        this.reg.pushManager.getSubscription().then((sub) => {
            if (sub === null) {
                this.reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.applicationServerKey
                }).then((sub) => {
                    this.sendSubscriptionData(sub);
                    //$("#notificationaccessform").submit();
                }).catch(function (e) {
                    console.error("Unable to subscribe to push", e);
                });
            } else {
                this.sendSubscriptionData(sub);
                //$("#notificationaccessform").submit();
            }
        });
    }

    sendSubscriptionData(sub) {
        var frm = new FormData();
        frm.append("endpoint", sub.endpoint);
        frm.append("p256dh", this.arrayBufferToBase64(sub.getKey("p256dh")));
        frm.append("auth", this.arrayBufferToBase64(sub.getKey("auth")));
        fetch("//" + location.host + "/account/subscribenotification", {
            method: 'post',
            body: frm
        }).then(data => {
            this.nPermissionModal.hide();
        });
    }

    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /*
     * Update data-lastpulse attribute of all .userpropic element
     */
    updatePulseDate(userid) {
        $(".userpropic[data-id='" + userid + "']").each(function (idx, obj) {
            $(obj).addClass("online").attr("data-lastpulse", dayjs());
        });
    }

    /*
     * Call this function repeatedly to update online-offline status of user
     */
    updateOfflineStatus(selector) {
        if (selector === undefined || selector === null) {
            selector = ".userpropic";
        }
        $(selector).each(function (idx, obj) {
            var el = $(obj);
            try {
                if (el.data("lastpulse") == "") {
                    el.removeClass("online");
                }
                else if (dayjs().diff(dayjs(el.data("lastpulse"))) < 10000) {
                    el.addClass("online");
                } else {
                    el.removeClass("online");
                }
            } catch (err) {
                el.removeClass("online");
                console.log(err);
            }
        });
    }

    sendPulse() { $.get(this.pulseurl); }

    onNotificationClick(n) {
        fetch("//" + location.host + "/notification/setread/" + n.id, {
            method: 'get'
        }).then((data) => {
            if (data.status === 200) {
                this.notifications = this.notifications.filter(t => t.id !== n.id);
                this.renderNotifications();
                location.href = this.getURL(n.campaignURL);
            }
        });

    }

    renderNotifications() {
        let count = this.notifications.filter(t => !t.isRead).length;
        if (count > 0)
            bind(document.querySelector(".notificationcountcnt"))`<i class="bi bi-bell"></i><span class=" position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">${count} <span class="visually-hidden">unread messages</span></span>`;
        else
            bind(document.querySelector(".notificationcountcnt"))`<i class="bi bi-bell"></i>`;
        if (this.notifications.filter(t => t.notificationType === 10).length > 0) {
            bind(document.querySelector("#msgnotificationscont"))`
<h5>Messages</h5>
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<tbody>
${this.notifications.filter(t => t.notificationType === 10).map(n => this.renderNotificationItem(n))}
</tbody>
</table>
`;
        }
        if (this.notifications.filter(t => t.notificationType !== 10).length > 0) {
            bind(document.querySelector("#cmpnotificationscont"))`
<h5>Other</h5>
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<tbody>
${this.notifications.filter(t => t.notificationType !== 10).map(n => this.renderNotificationItem(n))}
</tbody>
</table>
`;
        }
    }

    renderNotificationItem(n) {
        return wire(n)`<tr class="pointer" onclick=${(e) => { this.onNotificationClick(n); }}><td width="50px" valign="middle" align="right" class="p-1">
<img src=${this.getURL(n.photoURL)} class="img-fluid rounded-1" />
</td><td valign="middle" class="p-1">
<p class="m-0 p-0">${n.notificationText}</p>
${n.isRead ? "" : wire()`<span class="badge bg-primary fs-12">New</span>`}
<span class="fs-12">${dayjs(n.createDate).format("YY-MMM-d")}</span>
</td></tr>`
    }

    getURL(p) {
        if (p.startsWith("https://") || p.startsWith("http://") || p.startsWith("//") || p.startsWith("data:")) {
            return p;
        } else {
            return '//' + location.host + '/' + p;
        }
    }
}