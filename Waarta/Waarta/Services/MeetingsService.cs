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
    public class MeetingsService : IDisposable
    {
        readonly HttpClient _client;
        readonly string apiurl = "https://waarta.com/api/meetings/";
        string _token;
        public string Token
        {
            set
            {
                _token = value;
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }
        }

        public MeetingsService()
        {
            _client = new HttpClient();
            _token = Waarta.Helpers.Settings.Token;
            if (!string.IsNullOrEmpty(_token))
            {
                _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
            }

        }

        public async Task<MeetingDTO> GetMeeting(string id)
        {
            HttpResponseMessage response = await _client.GetAsync(apiurl + id);
            if (response.IsSuccessStatusCode)
            {
                MeetingDTO result = JsonConvert.DeserializeObject<MeetingDTO>(await response.Content.ReadAsStringAsync());
                return result;
            }
            else
            {
                return null;
            }
        }

        public async Task<List<MeetingDTO>> GetMeetings()
        {
            HttpResponseMessage response = await _client.GetAsync(apiurl);
            if (response.IsSuccessStatusCode)
            {
                List<MeetingDTO> result = JsonConvert.DeserializeObject<List<MeetingDTO>>(await response.Content.ReadAsStringAsync());
                return result;
            }
            else
            {
                return new List<MeetingDTO>();
            }
        }

        public async Task<bool> RemoveMeeting(string id)
        {
            HttpResponseMessage response = await _client.GetAsync(apiurl + "remove/" + id);
            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<MeetingDTO> CreateMeeting(CreateMeetingDTO dto)
        {
            try
            {
                var payload = "{\"name\": \"" + dto.Name + "\", \"purpose\" : \"" + dto.Purpose + "\"}";
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StringContent(dto.Name), "Name");
                    content.Add(new StringContent(dto.Purpose), "Purpose");
                    HttpContent c = new StringContent(payload, Encoding.UTF8, "application/json");
                    HttpResponseMessage response = await _client.PostAsync(apiurl, c);
                    if (response.IsSuccessStatusCode)
                    {
                        return JsonConvert.DeserializeObject<MeetingDTO>(await response.Content.ReadAsStringAsync());
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
                    {
                        throw new BadRequestException();
                    }
                    else
                    {
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine("\tERROR {0}", ex.Message);
                throw new ServerErrorException();
            }
        }

        public async Task<DownloadedChunk> DownloadChunk(string filepath, long position, string id  )
        {
            try
            {
                HttpResponseMessage response = await _client.GetAsync(string.Format("{0}DownloadChunk?position={2}&filename={1}&id={3}", apiurl, filepath, position, id));
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
        /// <param name="id">Meeting ID</param>
        /// <returns></returns>
        public async Task<String> UploadChunk(string data, string filename, bool gfn, string id)
        {
            try
            {
                //var payload = "{\"f\": \"" + data + "\", \"filename\" : \"" + filename + "\" , \"gfn\" : \"" + gfn + "\"}";
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StringContent(data), "f");
                    content.Add(new StringContent(filename), "filename");
                    content.Add(new StringContent(gfn.ToString()), "gfn");
                    content.Add(new StringContent(id), "meetingid");
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
