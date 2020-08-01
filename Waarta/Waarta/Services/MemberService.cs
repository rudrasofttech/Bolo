using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Waarta.Models;

namespace Waarta.Services
{
    public class MemberService : IDisposable
    {
        readonly HttpClient _client;
        readonly string apiurl = "https://waarta.com/api/members/";
        string _token;
        public string Token
        {
            set
            {
                _token = value;
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }
        public MemberService()
        {
            _client = new HttpClient();
            _token = Waarta.Helpers.Settings.Token;
            if (!string.IsNullOrEmpty(_token))
            {
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
            
        }
        public async Task<bool> GetOTP(string phone, string code)
        {
            HttpResponseMessage response = await _client.GetAsync(apiurl + "OTPMobile?phone=" + phone + "&code=" + code);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public async Task<LoginReturnDTO> Login(LoginDTO model)
        {
            var payload = JsonConvert.SerializeObject(model);
            HttpContent c = new StringContent(payload, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _client.PostAsync(apiurl + "Login", c);
            if (response.IsSuccessStatusCode)
            {
                LoginReturnDTO result = JsonConvert.DeserializeObject<LoginReturnDTO>(await response.Content.ReadAsStringAsync());
                return result;
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new NotFoundException();
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                throw new BadRequestException();
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
            {
                throw new ServerErrorException();
            }
            else
            {
                LoginReturnDTO result = new LoginReturnDTO() { Member = null, Token = string.Empty };
                return result;
            }
        }
        public async Task<MemberDTO> Validate()
        {
            HttpResponseMessage response = await _client.GetAsync(apiurl + "Validate");
            if (response.IsSuccessStatusCode)
            {
                MemberDTO result = JsonConvert.DeserializeObject<MemberDTO>(await response.Content.ReadAsStringAsync());
                return result;
            }
            else
            {
                return null;
            }
        }
        public async Task<MemberDTO> GetMember(Guid id)
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(apiurl + id.ToString());
                if (response.IsSuccessStatusCode)
                {
                    MemberDTO result = JsonConvert.DeserializeObject<MemberDTO>(await response.Content.ReadAsStringAsync());
                    return result;
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
        private async Task<bool> SaveData<T>(string apiname, string fieldname, T data)
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}{1}?{2}={3}", apiurl, apiname, fieldname, HttpUtility.UrlEncode(data.ToString())));
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new NotFoundException();
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }
        private async Task<bool> SaveDataThroughPost(string apiname, string fieldname, string data)
        {
            try
            {
                var payload = "{\"" + fieldname + "\": \"" + data + "\"}";
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StringContent(data), fieldname);
                    //HttpContent c = new StringContent(payload, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await _client.PostAsync(string.Format("{0}{1}", apiurl, apiname), content);
                    if (response.IsSuccessStatusCode)
                    {
                        return true;
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        throw new NotFoundException();
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
        public async Task<bool> SaveChannelName(string name)
        {
            return await SaveData("savechannel", "channel", name);
        }
        public async Task<bool> SaveBio(string data)
        {
            return await SaveDataThroughPost("savebio", "d", data);
        }
        public async Task<bool> SaveName(string d)
        {
            return await SaveData("savename", "d", d);
        }
        public async Task<bool> SaveBirthYear(int d)
        {
            return await SaveData("savebirthyear", "d", d);
        }
        public async Task<bool> SaveVisibility(MemberProfileVisibility d)
        {
            return await SaveData("savevisibility", "d", d);
        }
        public async Task<bool> SaveGender(Gender d)
        {
            return await SaveData("savegender", "d", d);
        }
        public async Task<bool> SaveCountry(String d)
        {
            return await SaveData("savecountry", "d", d);
        }
        public async Task<bool> SaveCity(String d)
        {
            return await SaveData("savecity", "d", d);
        }
        public async Task<bool> SaveState(String d)
        {
            return await SaveData("savestate", "d", d);
        }
        public async Task<bool> SavePic(string data)
        {
            return await SaveDataThroughPost("savepic", "pic", data);
        }
        public async Task<bool> SaveOneLineIntro(String d)
        {
            return await SaveData("savethoughtstatus", "d", d);
        }
        public async Task<bool> SavePulse(ActivityStatus d)
        {
            return await SaveData("savepulse", "s", d);
        }
        public async Task<List<MemberDTO>> Search(string s)
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}search?s={1}", apiurl, HttpUtility.UrlEncode(s)));
                if (response.IsSuccessStatusCode)
                {
                    return JsonConvert.DeserializeObject<List<MemberDTO>>(await response.Content.ReadAsStringAsync());
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new NotFoundException();
                }
                else
                {
                    return new List<MemberDTO>();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }
        public async Task<bool> SaveMember(RegisterDTO d)
        {
            return await SaveDataThroughPost("", "model", JsonConvert.SerializeObject(d));
        }

        public async Task<DownloadedChunk> DownloadChunk(string filepath, long position)
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}DownloadChunk?position={2}&filename={1}", apiurl, filepath, position));
                if (response.IsSuccessStatusCode)
                {
                    return JsonConvert.DeserializeObject<DownloadedChunk>(await response.Content.ReadAsStringAsync());
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    throw new NotFoundException();
                }
                else
                {
                    return new DownloadedChunk();
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                return new DownloadedChunk();
            }
        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="filename"></param>
        /// <param name="gfn">Generate File Name</param>
        /// <returns></returns>
        public async Task<String> UploadChunk(string data, string filename,  bool gfn) {
            try
            {
                //var payload = "{\"f\": \"" + data + "\", \"filename\" : \"" + filename + "\" , \"gfn\" : \"" + gfn + "\"}";
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StringContent(data), "f");
                    content.Add(new StringContent(filename), "filename");
                    content.Add(new StringContent(gfn.ToString()), "gfn");
                    //HttpContent c = new StringContent(payload, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await _client.PostAsync(string.Format("{0}UploadFile", apiurl), content);
                    if (response.IsSuccessStatusCode)
                    {
                        
                        return await response.Content.ReadAsStringAsync();
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        throw new NotFoundException();
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        throw new BadRequestException();
                    }
                    else
                    {
                        return string.Empty;
                    }
                }

            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                return string.Empty;
            }
        }

        public void Dispose()
        {
            _client.Dispose();
        }
    }
}
