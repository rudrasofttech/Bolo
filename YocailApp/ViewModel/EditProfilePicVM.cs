
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Input;
using YocailApp.Resources.Translations;

namespace YocailApp.ViewModel
{
    public class EditProfilePicVM : BaseVM
    {
        private string _chosenPhoto = string.Empty;
        public string ChosenPhoto
        {
            get => _chosenPhoto;
            set
            {
                if (value != _chosenPhoto)
                {
                    _chosenPhoto = value;
                    OnPropertyChanged();
                }
            }
        }

        public EditProfilePicVM()
        {
            
        }

        public async Task<bool> SavePic()
        {
            try
            {
                Loading = true;
                var client = await Utility.SharedClientAsync();
                var formContent = new FormUrlEncodedContent([new KeyValuePair<string, string>("pic", $"data:image/jpg;base64,{ChosenPhoto}")]);

                using HttpResponseMessage response = await client.PostAsync("api/members/savepic", formContent);
                if (response.IsSuccessStatusCode)
                {
                    await Utility.ShowToast(AppRes.SaveProfilePicMsg);
                    return true;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    Application.Current.MainPage = new LoginPage();
                    return false;
                }
                else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    await Utility.ShowToast(AppRes.MemberNotFoundMsg);
                    return false;
                }
                else
                {
                    await Utility.ShowToast(AppRes.SaveBioError);
                    Console.WriteLine("{0} ({1})", (int)response.StatusCode, response.ReasonPhrase);
                    return false;
                }
            }
            catch (System.Net.WebException)
            {
                await Utility.ShowToast(AppRes.NoInternetMsg);
                return false;
            }
            catch (Exception ex)
            {
                await Utility.ShowToast(AppRes.SaveProfilePicErr);
                Console.WriteLine(ex.Message);
                return false;
            }
            finally
            {
                Loading = false;   
            }
        }
    }
}
