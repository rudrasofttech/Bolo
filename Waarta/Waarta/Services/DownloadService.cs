﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Waarta.Models;

namespace Waarta.Services
{
    /// <summary>
    /// 
    /// </summary>
    /// <seealso cref="https://damienaicheh.github.io/xamarin/xamarin.forms/2018/07/10/download-a-file-with-progress-bar-in-xamarin-forms-en.html"/>
    public class DownloadService
    {
        readonly HttpClient _client;
        readonly WaartaDataStore ds;
        readonly MemberDTO _owner;
        readonly MemberDTO _contact;
        //readonly IFileService _fileService;
        int bufferSize = 4095;

        public DownloadService(MemberDTO owner, MemberDTO contact)
        {
            _client = new HttpClient();
            //_fileService = fileService;
            ds = new WaartaDataStore();
            _owner = owner;
            _contact = contact;
        }

        public async Task DownloadFileAsync(string url, IProgress<double> progress, CancellationToken token)
        {
            try
            {
                // Step 1 : Get call
                var response = await _client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, token);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(string.Format("The request returned with HTTP status code {0}", response.StatusCode));
                }

                // Step 2 : Filename
                var fileName = response.Content.Headers?.ContentDisposition?.FileName ?? "tmp.zip";

                // Step 3 : Get total of data
                var totalData = response.Content.Headers.ContentLength.GetValueOrDefault(-1L);
                var canSendProgress = totalData != -1L && progress != null;

                // Step 4 : Get total of data
                var filePath = Path.Combine(ds.GetDataFolderPath(_owner, _contact), fileName);

                // Step 5 : Download data
                using (var fileStream = File.OpenRead(filePath))
                {
                    using (var stream = await response.Content.ReadAsStreamAsync())
                    {
                        var totalRead = 0L;
                        var buffer = new byte[bufferSize];
                        var isMoreDataToRead = true;

                        do
                        {
                            token.ThrowIfCancellationRequested();

                            var read = await stream.ReadAsync(buffer, 0, buffer.Length, token);

                            if (read == 0)
                            {
                                isMoreDataToRead = false;
                            }
                            else
                            {
                                // Write data on disk.
                                await fileStream.WriteAsync(buffer, 0, read);

                                totalRead += read;

                                if (canSendProgress)
                                {
                                    progress.Report((totalRead * 1d) / (totalData * 1d) * 100);
                                }
                            }
                        } while (isMoreDataToRead);
                    }
                }
            }
            catch (Exception e)
            {
                // Manage the exception as you need here.
                System.Diagnostics.Debug.WriteLine(e.ToString());
            }
        }
    }

}
