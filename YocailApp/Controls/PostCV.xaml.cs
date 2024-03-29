
using Microsoft.Maui.Controls;
using System.Diagnostics;
using YocailApp.Resources.Translations;
using YocailApp.ViewModel;

namespace YocailApp.Controls;

public delegate void HamburgerMenuClick<T>(T sender);
public partial class PostCV : ContentView
{
    public event HamburgerMenuClick<PostVM> HamburgerMenuClicked;
    public PostCV()
    {
        InitializeComponent();
    }

    protected override void OnBindingContextChanged()
    {
        base.OnBindingContextChanged();
        PhotoStackLayout.Children.Clear();
        var pvm = (BindingContext as PostVM);
        if (pvm != null)
        {
            if (pvm.ShowSinglePhoto)
            {
                var img = new Image()
                {
                    Margin = new Thickness(0),
                    VerticalOptions = LayoutOptions.Fill,
                    HorizontalOptions = LayoutOptions.Fill,
                    Source = new UriImageSource { Uri = new Uri(pvm.FirstPhoto),
                    CachingEnabled = true,
                    CacheValidity = new TimeSpan(7,0,0,0)}
                };
                PhotoStackLayout.Add(img);
            }
            if (pvm.ShowCarousel)
            {
                var iv = new IndicatorView() { 
                    IndicatorsShape = IndicatorShape.Circle,
                    MaximumVisible = 7,
                    HideSingle = true,
                    HorizontalOptions= LayoutOptions.Center,
                    Margin = new Thickness(0, 15,0,0)
                };
                var crsl = new CarouselView()
                {
                    IndicatorView = iv,
                    ItemsSource = pvm.Post.Photos,
                    Loop = false,
                    Margin = new Thickness(0),
                    ItemTemplate = new DataTemplate(() => {
                        var img = new Image()
                        {
                            Margin = new Thickness(0),
                            VerticalOptions = LayoutOptions.Fill,
                            HorizontalOptions = LayoutOptions.Fill,
                            MinimumHeightRequest = 450
                        };
                        img.SetBinding(Image.SourceProperty, "PhotoURLTransformed");
                        StackLayout rootStackLayout = new StackLayout();
                        rootStackLayout.Add(img);

                        return rootStackLayout;
                    })

                };
                
                PhotoStackLayout.Add(crsl);
                PhotoStackCtrlGrid.Add(iv,0,0);
            }
        }
    }

    private void HamburgerMenuImgBtn_Clicked(object sender, EventArgs e)
    {
        HamburgerMenuClicked(BindingContext as PostVM);
    }

    private async void ImageButton_Clicked(object sender, EventArgs e)
    {
        
    //    var navigationParameter = new Dictionary<string, object>
    //{
    //    { "Post", (BindingContext as PostVM).Post }
    //};
        //await Shell.Current.GoToAsync($"///comments", navigationParameter);
        await Navigation.PushAsync(new CommentsPage((BindingContext as PostVM).Post));
    }

    private async void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        //await Shell.Current.GoToAsync($"///member?username={(BindingContext as PostVM).Post.Owner.UserName}");
        await Navigation.PushAsync(new MemberPage((BindingContext as PostVM).Post.Owner.UserName));
    }
}