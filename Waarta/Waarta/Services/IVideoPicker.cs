using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Waarta.Services
{
    public interface IVideoPicker
    {
        Task<string> GetVideoFileAsync();

        bool GenerateThumbnail(string source, string target);
        int GetVideoLengthInMinutes(string path);
        Task<bool> CompressVideo(string source, string target);
    }

    public interface IPDFWorker
    {
        bool GenerateThumbnail(string source, string target);
    }
}
