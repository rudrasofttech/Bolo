﻿using Bolo.Data;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        private readonly IConfiguration _config;
        private readonly IHubContext<UniversalHub> _hubContext;

        public Member TargetUser { get; set; }
        public NotificationHelper(BoloContext context, IHubContext<UniversalHub> hub, IConfiguration config)
        {
            _config= config;
            _context = context;
            _hubContext = hub;
        }

        public void SetSeen(Guid id, Member m)
        {
            var n = _context.Notifications.FirstOrDefault(t => t.ID == id && t.Target.ID == m.ID);
            if(n != null)
            {
                n.Seen = true;
                _context.SaveChanges();
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

        public void SaveNotification(Member target, string text, bool seen, MemberNotificationType type, MemberPost post = null, Member source = null, MemberComment comment = null)
        {
            Notification n = new Notification()
            {
                Comment= comment,
                Post= post,
                Seen= seen,
                Source= source, 
                Text= text,
                Target = target,
                Type = type
            };
            _context.Add(n);
            _context.SaveChanges();
            PushWebNotification(n);
        }


        public async void PushWebNotification(Notification n)
        {
            await _hubContext.Clients.User(n.Target.PublicID.ToString()).SendAsync("NewNotification", new NotificationSmallDTO(n));
            MemberDTO mdto = new MemberDTO(n.Target);
            if (mdto.Activity != ActivityStatus.Online)
            {
                bool shouldSave;
                //get end points saved in database for the target user
                var query = _context.PushNotificationWebApps.Where(t => t.User.ID == n.Target.ID).ToList();
                foreach (var pnwa in query)
                {
                    shouldSave = false;
                    PushSubscription subs = new PushSubscription(pnwa.Endpoint, pnwa.P256dh, pnwa.Auth);
                    var subject = _config["VAPIDsubject"];
                    var publicKey = _config["VAPIDpublicKey"];
                    var privateKey = _config["VAPIDprivateKey"];
                    var vapidDetails = new VapidDetails(subject, publicKey, privateKey);

                    var webPushClient = new WebPushClient();
                    try
                    {
                        NotificationSmallDTO ndto = new NotificationSmallDTO(n);
                        BrowserPushNotifyDTO b = new BrowserPushNotifyDTO() { 
                            Photo = ndto.Pic,
                            Text = ndto.Title,
                            URL = ndto.URL
                        };
                        //try to send notification to client browsers.
                        webPushClient.SendNotification(subs, System.Text.Json.JsonSerializer.Serialize(b), vapidDetails);
                    }
                    catch (WebPush.WebPushException wex)
                    {
                        if (wex.StatusCode == System.Net.HttpStatusCode.Gone)
                        {
                            _context.PushNotificationWebApps.Remove(pnwa);
                            shouldSave = true;
                        }
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                    finally
                    {
                        if (shouldSave)
                            _context.SaveChanges();
                    }
                }
            }
        }

        public List<Notification> GetNotifications()
        {
            List<Notification> result = new List<Notification>();
            result.AddRange(_context.Notifications
                .Include(t => t.Source).Include(t => t.Post).Include(t => t.Post.Owner).Include(t => t.Post.Photos).Include(t => t.Comment)
                .Include(t => t.Target).Where(t => t.Target.ID == TargetUser.ID).OrderByDescending(t => t.CreateDate).ToList());
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
