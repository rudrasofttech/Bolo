using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using Bolo.Models;

namespace BoloWeb.Helper
{
    public class IPLocationWorker
    {
        private readonly Microsoft.Extensions.Configuration.IConfiguration _config;
        public IPLocationWorker(Microsoft.Extensions.Configuration.IConfiguration config)
        {
            _config = config;
        }

        public async Task<IP2LocationResult> GetLocationAsync(string ipaddress)
        {
            var hc = new HttpClient()
            {
                BaseAddress = new Uri(string.Format("https://api.ip2location.com/v2/?ip={0}&key={1}&package=WS3", ipaddress, _config["IP2LocationKey"]))
            };

            var str = await hc.GetStringAsync("");
            IP2LocationResult result = JsonConvert.DeserializeObject<IP2LocationResult>(str);
            return result;
        }
    }
}
