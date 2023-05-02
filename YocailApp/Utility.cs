using CommunityToolkit.Maui.Alerts;
using CommunityToolkit.Maui.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YocailApp.Resources.Translations;

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

        public static void SetAuthToken(string authToken)
        {
            System.IO.File.WriteAllText(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "token.txt"), authToken);
        }

        public static string GetAuthToken() {
            if (System.IO.File.Exists(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "token.txt")))
            {
                return System.IO.File.ReadAllText(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "token.txt"));
            }
            return string.Empty;
        }

        public static void SetCurrentMember(string member)
        {
            System.IO.File.WriteAllText(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "currentmember.txt"), member);
        }

        public static string GetCurrentMember()
        {
            if (System.IO.File.Exists(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "currentmember.txt")))
            {
                return System.IO.File.ReadAllText(System.IO.Path.Combine(FileSystem.Current.CacheDirectory, "currentmember.txt"));
            }
            return string.Empty;
        }
    }

    public class Utility
    {
        public const string YocailAPIKey = "YocailAPI";
        public const string CurrentMemberKey = "CurrentMember";
        public const string FeedDataFileName = "feeddata.txt";
        public static string FeedDataFilePath
        {
            get { return System.IO.Path.Combine(FileSystem.Current.CacheDirectory, Utility.FeedDataFileName); }
        }

        public static void ClearCachedData()
        {
            System.IO.File.Delete(FeedDataFilePath);
        }

        public static async Task<HttpClient> SharedClientAsync()
        {
            var hc = new HttpClient()
            {
                BaseAddress = new Uri("https://www.yocail.com/"),

            };
            string? token = AccessSecureStorage.GetAuthToken();
            if (!string.IsNullOrEmpty(token))
            {
                hc.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
            return hc;
        }

        public static async Task ShowToast(string message, ToastDuration duration = ToastDuration.Short, double fontSize = 14)
        {
            CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();
            var toast = Toast.Make(message, duration, fontSize);
            await toast.Show(cancellationTokenSource.Token);
        }
    }
}

