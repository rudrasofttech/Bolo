using System.Runtime.CompilerServices;
using System.Text.Json;

namespace YocailApp
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();
            Preferences.Set(Utility.YocailAPIKey, "https://www.yocail.com/");
            MainPage = new MediatorPage();
        }
    }
}