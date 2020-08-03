using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using Plugin.Settings;
using Plugin.Settings.Abstractions;
using Waarta.Models;
using Xamarin.Forms;

namespace Waarta.Helpers
{
    /// <summary>
    /// This is the Settings static class that can be used in your Core solution or in any
    /// of your client applications. All settings are laid out the same exact way with getters
    /// and setters. 
    /// </summary>
    public static class Settings
    {
        private static ISettings AppSettings
        {
            get
            {
                return CrossSettings.Current;
            }
        }

        #region Setting Constants

        private const string SettingsKey = "settings_key";
        private static readonly string SettingsDefault = string.Empty;

        #endregion


        public static string GeneralSettings
        {
            get
            {
                return AppSettings.GetValueOrDefault(SettingsKey, SettingsDefault);
            }
            set
            {
                AppSettings.AddOrUpdateValue(SettingsKey, value);
            }
        }

        public static string Token
        {
            get
            {
                return AppSettings.GetValueOrDefault("token", SettingsDefault);
            }
            set
            {
                AppSettings.AddOrUpdateValue("token", value);
            }
        }

        public static ActivityStatus Activity
        {
            get
            {
                string a = AppSettings.GetValueOrDefault("activity", SettingsDefault);
                if(string.IsNullOrEmpty(a))
                {
                    return ActivityStatus.Offline;
                }
                else
                {
                    return (ActivityStatus)Enum.Parse(typeof(ActivityStatus), a);
                }
            }
            set
            {
                AppSettings.AddOrUpdateValue("activity", value.ToString());
            }
        }

        public static string Myself
        {
            get
            {
                return AppSettings.GetValueOrDefault("myself", SettingsDefault);
            }
            set
            {
                AppSettings.AddOrUpdateValue("myself", value);
            }
        }

       public static string LocalAppDataPath
        {
            get
            {
                return Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            }
        }
    }
}
