using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp
{
    public class AccessSecureStorage
    {
        public static async Task WriteAsync(string key, string value)
        {
            await SecureStorage.Default.SetAsync(key, value);
        }

        public static async Task<string> ReadAsync(string key)
        {
            string result = await SecureStorage.Default.GetAsync(key);
            if (result == null) { return string.Empty; }
            else return result;
        }

        public static void Remove(string key)
        {
            SecureStorage.Default.Remove(key);
        }

        public static void RemoveAll()
        {
            SecureStorage.Default.RemoveAll();
        }

        public static async void SetAuthToken(string authToken)
        {
            await WriteAsync("authtoken", authToken);
        }

        public static async Task<string> GetAuthToken() { return await ReadAsync("authtoken"); }


    }

    public class Utility
    {
        public const string YocailAPIKey = "YocailAPI";
        public const string CurrentMemberKey = "CurrentMember";

        public static async Task<HttpClient> SharedClientAsync()
        {
            var hc = new HttpClient()
            {
                BaseAddress = new Uri("https://www.yocail.com/"),

            };
            string? token = await AccessSecureStorage.GetAuthToken();
            if (!string.IsNullOrEmpty(token))
            {
                hc.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
            return hc;
        }
    }
}

