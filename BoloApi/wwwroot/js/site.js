const newNotificationGCEvent = "newNotificationBolo";
const notifyPresenceGCEvent = "notifyPresenceBolo";
class UniversalHubClient {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/universalhub", { accessTokenFactory: () => localStorage.getItem('token') })
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
            console.log(this.connection.state);
        } catch (err) {
            console.log(err);
            setTimeout(this.start, 5000);
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
        this.nPermissionModal = document.getElementById('askNotificationPermissionModal');
        //this.nNotificationModal = new bootstrap.Modal(document.getElementById('NotificationModal'), {
        //    keyboard: false
        //});
        

        $("#PromptForAccessBtn").click(() => this.requestNotificationAccess());
        this.applicationServerKey = _appServerKey;
        $.ajaxSetup({
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        });

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
            $(this.nPermissionModal).removeClass("d-none");
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

    getNotifications() {
        fetch("//" + location.host + "/api/notification", {
            method: 'get',
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.notifications = data.notifications;
                    this.renderNotifications();
                });
            }
        });
    }

    sendSubscriptionData(sub) {
        var frm = new FormData();
        frm.append("endpoint", sub.endpoint);
        frm.append("p256dh", this.arrayBufferToBase64(sub.getKey("p256dh")));
        frm.append("auth", this.arrayBufferToBase64(sub.getKey("auth")));
        fetch("//" + location.host + "/api/Members/subscribenotification", {
            method: 'post',
            body: frm
        }).then(data => {
            $(this.nPermissionModal).addClass("d-none");
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

    sendPulse() {
        $.get(this.pulseurl);
    }

    setSeenAllNotification() {
        fetch("//" + location.host + "/api/notification/setseenall", {
            method: 'get',
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        }).then((data) => {
            if (data.status === 200) {
                for (var k in this.notifications) {
                    this.notifications[k].seen = true;
                }
                this.renderNotifications();
            }
        });
    }

    onNotificationClick(n) {
        fetch("//" + location.host + "/api/notification/setseen/" + n.id, {
            method: 'get',
            headers: { "Authorization": localStorage.getItem('token') !== null ? 'Bearer ' + localStorage.getItem('token') : '' }
        }).then((data) => {
            if (data.status === 200) {
                for (var k in this.notifications) {
                    if (this.notifications[k].id == n.id)
                        this.notifications[k].seen = true;
                }
                this.renderNotifications();
                location.href = this.getURL(n.url);
            }
        });

    }

    renderNotifications() {
        let count = this.notifications.filter(t => !t.seen).length;
        if (count > 0) {
            $(".notificationcountcnt").append('<span style="top:8px; font-size:13px;" class="position-absolute start-100 translate-middle badge rounded-pill bg-danger">' + count + ' <span class="visually-hidden">unread messages</span></span>');
            $(".notificationcount").html(count);
        }
        else {
            $(".notificationcountcnt").find(".rounded-pill").remove();
            $(".notificationcount").html("");
        }

        if (this.notifications.length > 0) {
            bind(document.querySelector("#notificationscont"))`
<table border="0" cellspacing="0" cellpadding="0" width="100%">
<tbody>
${this.notifications.map(n => this.renderNotificationItem(n))}
</tbody>
</table>
`;
        }
    }

    renderNotificationItem(n) {
        //console.log(n);
        return wire(n)`<tr class="pointer" onclick=${(e) => { this.onNotificationClick(n); }}>
<td width="50px" valign="middle" align="right" class="p-1">
<img src=${this.getURL(n.pic)} class="img-fluid rounded-1" />
</td>
<td valign="middle" class="p-1">
<p class="m-0 p-0">${n.title}</p>
${n.seen ? "" : wire()`<span class="badge bg-primary fs-12">New</span>`}
${n.type === 4 ? wire()`<span class="text-primary fw-bold fs-12">Follow Request</span>` : "" }
<span class="fs-12">${dayjs(n.createDate).format("DD-MMM-YYYY")}</span>
</td>
</tr>`
    }

    getURL(p) {
        if (p.startsWith("https://") || p.startsWith("http://") || p.startsWith("//") || p.startsWith("data:")) {
            return p;
        } else {
            return '//' + location.host + '/' + p;
        }
    }
}