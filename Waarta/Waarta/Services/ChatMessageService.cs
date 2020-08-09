using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Waarta.Models;

namespace Waarta.Services
{
    public class ChatMessageService
    {
        HttpClient _client;
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
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}MemberMessages/{1}", apiurl, sender.ID));
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }
    }
}
