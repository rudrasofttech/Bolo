using Bolo.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bolo.Data
{
    public class DbInitializer
    {
        public static void Initialize(BoloContext context)
        {
            context.Database.EnsureCreated();

            // Look for any students.
            if (context.Members.Any())
            {
                return;   // DB has been seeded
            }

            var members = new Member[] { new Member { CountryCode = "91",
                CreateDate = DateTime.UtcNow,
                Email = "rajkiran.singh@gmail.com", Name = "Raj Kiran Singh",
                Password = Bolo.Helper.EncryptionHelper.CalculateSHA256("Welcome1!"),
                Phone = "9871500276",
                Status= RecordStatus.Active,
                Visibility = MemberProfileVisibility.Public,
                Activity = ActivityStatus.Online,
                BirthYear = 1983,
                UserName = "rajkiran.singh",
                Bio = "I create this app.",
                City = "Noida",
                Country = "India",
                Pic = "",
                State = "Uttar Pradesh",
                ThoughtStatus = "",
                Gender = Gender.Male,
                LastPulse = DateTime.UtcNow,
            PublicID = Guid.NewGuid(),
            Roles= new List<MemberRole>() { new MemberRole() { Name = "Master" } }
            } };

            foreach (Member m in members)
            {
                context.Members.Add(m);
            }
            context.SaveChanges();
        }
    }
}
