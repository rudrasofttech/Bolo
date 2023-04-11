using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components;
using System.Net;
using Bolo.Admin.Models;
using System.Collections.Specialized;
using System.Web;

namespace Bolo.Admin
{
    public static class ExtensionMethods
    {
        public static NameValueCollection QueryString(this NavigationManager navigationManager)
        {
            return HttpUtility.ParseQueryString(new Uri(navigationManager.Uri).Query);
        }

        public static string? QueryString(this NavigationManager? navigationManager, string key)
        {
            return navigationManager?.QueryString()[key];
        }
    }
}
namespace Bolo.Admin.Helpers
{
    public class AppRouteView : RouteView
    {
        [Inject]
        public NavigationManager NavigationManager { get; set; }

        //[Inject]
        //public IAccountService AccountService { get; set; }
        [Inject]
        public LocalStorageAccessor LocalStorageAccessor { get; set; }

        protected override async void Render(RenderTreeBuilder builder)
        {
            var authorize = Attribute.GetCustomAttribute(RouteData.PageType, typeof(AuthorizeAttribute)) != null;
            var u = await LocalStorageAccessor.GetValueAsync<MemberDTO>("user");
            if (authorize && u == null)
            {
                var returnUrl = WebUtility.UrlEncode(new Uri(NavigationManager.Uri).PathAndQuery);
                NavigationManager.NavigateTo($"/login?returnUrl={returnUrl}");
            }
            else
            {
                base.Render(builder);
            }
        }
    }
}
