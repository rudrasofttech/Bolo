using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YocailApp.Services
{
    interface IMediaService
    {
        public List<DevicePhoto> GetPhotoList();
    }
}
