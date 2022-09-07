using Bolo.Data;
using Bolo.Hubs;
using Bolo.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Helper
{
    public class NotificationHelper
    {
        private readonly BoloContext _context;
        private readonly IHubContext<UniversalHub> _hub;

        public Member TargetUser { get; set; }
        public NotificationHelper(BoloContext context, IHubContext<UniversalHub> hub)
        {
            _context = context;
            _hub = hub;
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
