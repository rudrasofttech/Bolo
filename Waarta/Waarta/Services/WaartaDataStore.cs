using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Waarta.Models;

namespace Waarta.Services
{
    public class WaartaDataStore
    {
        public string GetContactFilePath(MemberDTO m)
        {
            return Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, string.Format("Contacts{0}.txt", m.ID.ToString().ToLower()));
        }
        public string GetDataFolderPath(MemberDTO owner, MemberDTO contact)
        {
            return Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, "data", owner.ID.ToString().ToLower(), contact.ID.ToString().ToLower());
        }

        public string GetMessageFilePath(MemberDTO m, MemberDTO m2)
        {
            return Path.Combine(Waarta.Helpers.Settings.LocalAppDataPath, string.Format("{0}{1}.txt", m.ID.ToString().ToLower(), m2.ID.ToString().ToLower()));
        }

        public void ClearMessagesFromFile(MemberDTO m, MemberDTO m2)
        {
            string filePath = GetMessageFilePath(m, m2);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        public Dictionary<Guid, ChatMessage> LoadMessagesFromFile(MemberDTO m, MemberDTO m2)
        {
            Dictionary<Guid, ChatMessage> result = new Dictionary<Guid, ChatMessage>();
            string filePath = GetMessageFilePath(m, m2);
            if (File.Exists(filePath))
            {
                result = (Dictionary<Guid, ChatMessage>)JsonConvert.DeserializeObject(File.ReadAllText(filePath), typeof(Dictionary<Guid, ChatMessage>));
            }

            return result;
        }

        public void SaveMessagestoFile(MemberDTO m, MemberDTO m2, Dictionary<Guid, ChatMessage> msgs)
        {
            string filePath = GetMessageFilePath(m, m2);
            File.WriteAllText(filePath, JsonConvert.SerializeObject(msgs));
        }

        public Dictionary<Guid, ContactDTO> LoadContactsfromFile(MemberDTO m)
        {
            Dictionary<Guid, ContactDTO> result = new Dictionary<Guid, ContactDTO>();
            string filePath = GetContactFilePath(m);
            if (File.Exists(filePath))
            {
                result = (Dictionary<Guid, ContactDTO>)JsonConvert.DeserializeObject(File.ReadAllText(filePath), typeof(Dictionary<Guid, ContactDTO>));
            }

            return result;
        }

        public void SaveContactstoFile(MemberDTO m, Dictionary<Guid, ContactDTO> contacts)
        {
            string filePath = GetContactFilePath(m);
            File.WriteAllText(filePath, JsonConvert.SerializeObject(contacts));
        }
    }
}
