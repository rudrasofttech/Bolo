using Bolo.Models;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace BoloWeb.Helper
{
    public class SearchHelper
    {
        public string query { get; set; }
        private Dictionary<string, SearchResultPost> results = new Dictionary<string, SearchResultPost>();
        public Dictionary<string, SearchResultPost> SearchResult
        {
            get
            {
                Random r = new Random();
                return results.OrderBy(x => r.Next()).ToDictionary(item => item.Key, item => item.Value);
            }
        }
        public async Task SearchAsync()
        {
            
            await SearchGoogleAsync();
            await SearchBingAsync();
        }

        public async Task SearchGoogleAsync()
        {
            using (HttpClient client = new HttpClient())
            {
                // Call asynchronous network methods in a try/catch block to handle exceptions
                try
                {
                    client.DefaultRequestHeaders.Add("user-agent", "Mozilla/4.0");
                    HttpResponseMessage response = await client.GetAsync("https://google.com/search?q=" + query);
                    response.EnsureSuccessStatusCode();
                    string responseBody = await response.Content.ReadAsStringAsync();
                    // Above three lines can be replaced with new helper method below
                    // string responseBody = await client.GetStringAsync(uri);

                    Console.WriteLine(responseBody);
                    HtmlDocument doc = new HtmlDocument();
                    doc.LoadHtml(responseBody);
                    
                    foreach (HtmlNode link in doc.DocumentNode.SelectNodes("//a[starts-with(@href,'/url?q=')]"))
                    {
                        // Get the value of the HREF attribute
                        string hrefValue = link.GetAttributeValue("href", string.Empty);
                        Uri u = new Uri("http://www.test.com" + hrefValue);
                        
                        SearchResultPost srp = new SearchResultPost()
                        {
                            Description = "",
                            Text = HttpUtility.HtmlDecode(link.InnerText),
                            URL = hrefValue.ToString()

                        };
                        if (!string.IsNullOrEmpty(u.Query))
                        {
                            var querycol = HttpUtility.ParseQueryString(u.Query);
                            srp.URL = querycol.Get("q");
                        }
                        if (!results.ContainsKey(srp.URL))
                        {
                            if (results.Count < 5 && !srp.URL.ToLower().Contains("google.com"))
                            {
                                results.Add(srp.URL, srp);
                            }
                        }
                       
                    }
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine("\nException Caught!");
                    Console.WriteLine("Message :{0} ", e.Message);
                }

            }
        }

        public async Task SearchBingAsync()
        {
            using (HttpClient client = new HttpClient())
            {
                // Call asynchronous network methods in a try/catch block to handle exceptions
                try
                {
                    client.DefaultRequestHeaders.Add("user-agent", "Mozilla/4.0");
                    HttpResponseMessage response = await client.GetAsync("https://bing.com/search?q=" + query);
                    response.EnsureSuccessStatusCode();
                    string responseBody = await response.Content.ReadAsStringAsync();
                    // Above three lines can be replaced with new helper method below
                    // string responseBody = await client.GetStringAsync(uri);

                    Console.WriteLine(responseBody);
                    HtmlDocument doc = new HtmlDocument();
                    doc.LoadHtml(responseBody);
                    HtmlNode hn = doc.QuerySelector("#b_results");
                    
                    foreach (HtmlNode li in hn.QuerySelectorAll("#b_results > li.b_algo"))
                    {
                        HtmlNode anchor = li.QuerySelector("h2 > a");
                        HtmlNode p = li.QuerySelector("p");
                        if (anchor != null)
                        {
                            // Get the value of the HREF attribute
                            string hrefValue = anchor.GetAttributeValue("href", string.Empty);

                            SearchResultPost srp = new SearchResultPost()
                            {
                                Description = p != null ? HttpUtility.HtmlDecode(p.InnerText) : "",
                                Text = HttpUtility.HtmlDecode(anchor.InnerText),
                                URL = hrefValue.ToString()

                            };

                            if (!results.ContainsKey(srp.URL) )
                            {
                                if (results.Count < 5 && !srp.URL.ToLower().Contains("bing.com"))
                                {
                                    results.Add(srp.URL, srp);
                                }
                            }
                            
                        }
                    }
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine("\nException Caught!");
                    Console.WriteLine("Message :{0} ", e.Message);
                }

            }
        }
    }
}
