using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace YocailApp.Controls
{
    public class YocailSearchHandler : SearchHandler
    {
        
        public IList<SearchResultItemVM> Results { get; set; } = new List<SearchResultItemVM>();
        public Type SelectedItemNavigationTarget { get; set; }

        protected override async void OnQueryChanged(string oldValue, string newValue)
        {
            base.OnQueryChanged(oldValue, newValue);

            if (string.IsNullOrEmpty(newValue))
            {
                ItemsSource = null;
            }
            else
            {
                if (oldValue != newValue)
                {
                    await LoadData(newValue);
                }
                ItemsSource = Results;
            }

        }

        protected override void OnItemSelected(object item)
        {
            base.OnItemSelected(item);

            // Let the animation complete
            //await Task.Delay(1000);

            ShellNavigationState state = (App.Current.MainPage as Shell).CurrentState;
            // The following route works because route names are unique in this app.
            //await Shell.Current.GoToAsync($"{GetNavigationTarget()}?name={((Animal)item).Name}");
        }

        public async Task LoadData(string k)
        {

            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync($"api/search/?q={System.Web.HttpUtility.UrlEncode(k)}");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    JsonSerializerOptions l = new() { PropertyNameCaseInsensitive = true };
                    var data = JsonSerializer.Deserialize<List<SearchResultItem>>(result, l);
                    Results.Clear();
                    foreach (var i in data)
                    {
                        Results.Add(new SearchResultItemVM { Item = i });
                    }
                }
                else
                {
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error loading search result");
                Console.WriteLine(ex.Message);
            }

        }

        //string GetNavigationTarget()
        //{
        //    return (Shell.Current as AppShell).Routes.FirstOrDefault(route => route.Value.Equals(SelectedItemNavigationTarget)).Key;
        //}
    }
}
