using Bolo.Data;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPush;

namespace Bolo.Helper
{
    public class NotificationHelper
    {
        private readonly BoloContext _context;
        private readonly IHubContext<UniversalHub> _hubContext;

        public Member TargetUser { get; set; }
        public NotificationHelper(BoloContext context, IHubContext<UniversalHub> hub)
        {
            _context = context;
            _hubContext = hub;
        }

        public async void SetSeen(Guid id, Member m)
        {
            var n = _context.Notifications.FirstOrDefault(t => t.ID == id && t.Target.ID == m.ID);
            if(n != null)
            {
                n.Seen = true;
                await _context.SaveChangesAsync();
            }
        }

        public void SetSeen(Member m)
        {
            var query = _context.Notifications.Where(t => t.Target.ID == m.ID);
            foreach(var n in query)
            {
                n.Seen = true;
            }

            _context.SaveChanges();
        }

        public void SaveNotification(Member target, string pic, string url, string title, string description, MemberNotificationType type, int postId)
        {
            Notification n = new Notification()
            {
                Description = description,
                Pic = pic,
                PostId = postId,
                Target = target,
                Title = title,
                Type = type,
                URL = url
            };
            _context.Add(n);
            _context.SaveChanges();
            PushWebNotification(n);
        }


        public async void PushWebNotification(Notification n)
        {
            await _hubContext.Clients.User(n.Target.PublicID.ToString()).SendAsync("NewNotification", new NotificationSmallDTO(n));
            //if (!accWorker.IsUserOnline(n.NotifyTo))
            {
                bool shouldSave;
                //get end points saved in database for the target user
                //var query = _context.PushNotificationWebApps.Where(t => t.User.ID == n.Target.ID).ToList();
                //foreach (var pnwa in query)
                //{
                //    shouldSave = false;
                //    PushSubscription subs = new PushSubscription(pnwa.Endpoint, pnwa.P256dh, pnwa.Auth);
                //    var subject = _config["VAPIDsubject"];
                //    var publicKey = _config["VAPIDpublicKey"];
                //    var privateKey = _config["VAPIDprivateKey"];
                //    var vapidDetails = new VapidDetails(subject, publicKey, privateKey);

                //    var webPushClient = new WebPushClient();
                //    try
                //    {
                //        n.NotifyTo.Pic = string.Empty;
                //        //try to send notification to client browsers.
                //        webPushClient.SendNotification(subs, System.Text.Json.JsonSerializer.Serialize(n), vapidDetails);
                //    }
                //    catch (WebPush.WebPushException wex)
                //    {
                //        if (wex.StatusCode == System.Net.HttpStatusCode.Gone)
                //        {
                //            _context.PushNotificationWebApps.Remove(pnwa);
                //            shouldSave = true;
                //        }
                //    }
                //    catch (Exception exception)
                //    {
                //        throw exception;
                //    }
                //    finally
                //    {
                //        if (shouldSave)
                //            _context.SaveChanges();
                //    }
                //}
            }
        }

        public List<Notification> GetNotifications()
        {
            List<Notification> result = new List<Notification>();
            result.AddRange(_context.Notifications.Include(t => t.Target).Where(t => t.Target.ID == TargetUser.ID).OrderByDescending(t => t.CreateDate).ToList());
            return result;
        }

        public async Task RemoveNotificationAsync(Guid id)
        {
            Notification n = _context.Notifications.FirstOrDefault(t => t.ID == id && t.Target.ID == TargetUser.ID);
            if (n != null)
            {
                _context.Notifications.Remove(n);
                await _context.SaveChangesAsync();
            }
        }
    }
}
