using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using Waarta.Services;
using Waarta.Views;

namespace Waarta
{
    public partial class App : Application
    {
        readonly MemberService ms;
        bool keepSendingPulse;
        public App()
        {
            InitializeComponent();

            ms = new MemberService();
            MainPage = new AppShell();
        }

        protected override void OnStart()
        {
            keepSendingPulse = true;
            Device.StartTimer(TimeSpan.FromSeconds(3), () =>
            {
                _ = ms.SavePulse(Waarta.Helpers.Settings.Activity);
                return keepSendingPulse;
            });
            
        }

        protected override void OnSleep()
        {
            keepSendingPulse = false;
        }

        protected override void OnResume()
        {
            keepSendingPulse = true;
            Device.StartTimer(TimeSpan.FromSeconds(3), () =>
            {
                _ = ms.SavePulse(Waarta.Helpers.Settings.Activity);
                return keepSendingPulse;
            });
        }
    }
}
