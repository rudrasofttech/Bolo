﻿namespace Bolo.Models
{
    public class UserInfo
    {
        public string MemberID
        {
            get;set;
        }
        public string ConnectionID
        {
            get;set;
        }
        public string Name
        {
            get;set;
        }

        public string Pic
        {
            get; set;
        }
        public bool VideoCapable { get; set; }
        public bool PeerCapable { get; set; }
    }

}
