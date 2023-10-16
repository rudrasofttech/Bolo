using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp.Services
{
    public enum DeviceOrientation
    {
        Undefined,
        Landscape,
        Portrait
    }
}

namespace YocailApp.Services.PartialMethods
{
    public partial class MediaAPIService
    {
        public partial DeviceOrientation GetOrientation();
    }
}
