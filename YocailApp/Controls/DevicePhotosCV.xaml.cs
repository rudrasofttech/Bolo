
using System.Collections.ObjectModel;
using YocailApp.Services;
using YocailApp.ViewModel;

namespace YocailApp.Controls;

public partial class DevicePhotosCV : ContentView
{
    IMediaService service;
    public ObservableCollection<DevicePhoto> _photos = new();
    public ObservableCollection<DevicePhoto> Photos
    {
        get => _photos;
        set
        {
            if (_photos != value)
            {
                _photos = value;
                OnPropertyChanged();
            }
        }
    }
    public DevicePhotosCV()
    {
        InitializeComponent();
        service = new MediaService();
        Loaded += DevicePhotosCV_Loaded;
    }

    private void DevicePhotosCV_Loaded(object sender, EventArgs e)
    {
        
        var list = service.GetPhotoList();
        foreach(var photo in list)
        {
            Photos.Add(photo);
        }
        //int maxCols = 3;
        //Grid g = new();
        //for (int j = 0; j < maxCols; j++)
        //    g.ColumnDefinitions.Add(new ColumnDefinition() { Width = GridLength.Star });
        //for (int j = 0; j < (list.Count / maxCols) + 1; j++)
        //    g.RowDefinitions.Add(new RowDefinition());

        //for (int i = 1, row = 0; i <= list.Count; i += maxCols, row++)
        //{
        //    for (int k = i, col = 0; k < i + maxCols; k++, col++)
        //    {
        //        if (list.Count > k)
        //        {
        //            var p = list[k - 1];
        //            Image img = new Image() { Source = new Uri(p.URI) };
        //            g.Add(img, col, row);
        //        }
        //        else
        //            break;
        //    }
        //}
        //stackLayout.Content = g;
        OnPropertyChanged("Photos");
    }
}