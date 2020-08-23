using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Waarta.Models;

namespace Waarta.Services
{
    public class ChatMessageService
    {
        readonly HttpClient _client;
        string apiurl = "https://waarta.com/api/chatmessages/";
        string _token;

        public string Token
        {
            set
            {
                _token = value;
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }

        public ChatMessageService()
        {
            _client = new HttpClient();
            _token = Waarta.Helpers.Settings.Token;
            if (!string.IsNullOrEmpty(_token))
            {
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }

        public async void RemoveMemberMessages(MemberDTO sender)
        {
            try
            {
                await _client.GetAsync(string.Format("{0}MemberMessages/{1}", apiurl, sender.ID));
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
            }
        }

        public async Task<List<ChatMessageDTO>> GetSendMessages(MemberDTO sender)
        {

            HttpResponseMessage response = await _client.GetAsync(string.Format("{0}SentMessages?sender={1}", apiurl, sender.ID));
            if (response.IsSuccessStatusCode)
            {
                return JsonConvert.DeserializeObject<List<ChatMessageDTO>>(await response.Content.ReadAsStringAsync());
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                throw new UnauthorizedAccessException();
            }
            else
            {
                return new List<ChatMessageDTO>();
            }

        }

        public void SetReceived(Guid messageid)
        {
            _client.GetAsync(string.Format("{0}SetReceived?mid={1}", apiurl, messageid));
        }

        public void SetSeen(Guid messageid)
        {
            _client.GetAsync(string.Format("{0}SetSeen?mid={1}", apiurl, messageid));
        }


        public async Task<bool> PostMessage(string text, MemberDTO receiver, Guid id)
        {
            try
            {
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StringContent(text), "Text");
                    content.Add(new StringContent(receiver.ID.ToString()), "SentTo");
                    content.Add(new StringContent(id.ToString()), "PublicID");
                    HttpResponseMessage response = await _client.PostAsync(apiurl, content);
                    if (response.IsSuccessStatusCode)
                    {
                        return true;
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        throw new NotFoundException();
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    {
                        throw new UnAuthorizedAccessException();
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        throw new BadRequestException();
                    }
                    else
                    {
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }
    }
}
