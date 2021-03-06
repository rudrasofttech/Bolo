﻿using Newtonsoft.Json;
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
    public class ContactsService
    {
        readonly HttpClient _client;
        string apiurl = "https://waarta.com/api/contacts/";
        string _token;

        public string Token
        {
            set
            {
                _token = value;
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }

        public ContactsService()
        {
            _client = new HttpClient();
            _token = Waarta.Helpers.Settings.Token;
            if (!string.IsNullOrEmpty(_token))
            {
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }

        public async Task<List<ContactDTO>> GetContacts()
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}Member", apiurl));
                if (response.IsSuccessStatusCode)
                {
                    return JsonConvert.DeserializeObject<List<ContactDTO>>(await response.Content.ReadAsStringAsync());
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException();
                }
                else
                {
                    return new List<ContactDTO>();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }

        public async Task<ContactDTO> SetRelationship(MemberDTO other, BoloRelationType rt)
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}ChangeRelation/{1}?t={2}", apiurl, other.ID, rt));
                if (response.IsSuccessStatusCode)
                {
                    return JsonConvert.DeserializeObject<ContactDTO>(await response.Content.ReadAsStringAsync());
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    throw new UnauthorizedAccessException();
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new NotFoundException();
                }
                else
                {
                    return null;
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
