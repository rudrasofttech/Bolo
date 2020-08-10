using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;
using Waarta.Services;
using Waarta.Views;
using Waarta.Models;

namespace Waarta
{
    public partial class App : Application
    {
        public static double ScreenWidth;
        public static double ScreenHeight;
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
                try
                {
                    _ = ms.SavePulse(Waarta.Helpers.Settings.Activity);
                }
                catch (ServerErrorException)
                {
                    Console.WriteLine("Unable to contact server.");
                }
                return keepSendingPulse;
            });
        }
    }
}
