using System.Text.Json;
using YocailApp.ViewModel;

namespace YocailApp;

public partial class MediatorPage : ContentPage
{
	
	public MediatorPage()
	{
		InitializeComponent();
        BindingContext = new BaseVM();
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (await Validate())
        {
            Application.Current.MainPage = new AppShell();
        }
        else
        {
            Application.Current.MainPage = new LoginPage();
        }
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        (BindingContext as BaseVM).Loading = false;
    }

    private async Task<bool> Validate()
    {
        string token = AccessSecureStorage.GetAuthToken();
        if (!string.IsNullOrEmpty(token))
        {
            (BindingContext as BaseVM).Loading= true;
            try
            {
                var client = await Utility.SharedClientAsync();
                using HttpResponseMessage response = await client.GetAsync("api/Members/Validate");
                if (response.IsSuccessStatusCode)
                {
                    HttpContent content = response.Content;
                    string result = await content.ReadAsStringAsync();
                    var l = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
                    var member = JsonSerializer.Deserialize<MemberModel>(result, l);
                    AccessSecureStorage.SetCurrentMember(JsonSerializer.Serialize(member));
                    return true;
                }
            }
            catch (Exception)
            {

            }
            finally
            {
                
            }
        }

        return false;
    }
}