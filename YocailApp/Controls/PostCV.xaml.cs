
using Microsoft.Maui.Controls;
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
                    HorizontalOptions = LayoutOptions.Fill
                };
                img.SetBinding(Image.SourceProperty, "FirstPhoto");
                PhotoStackLayout.Add(img);
            }
            if (pvm.ShowCarousel)
            {
                var iv = new IndicatorView() { 
                    IndicatorsShape = IndicatorShape.Circle,
                    MaximumVisible = 7,
                    HideSingle = true,
                    HorizontalOptions= LayoutOptions.Center,
                    Margin = new Thickness(10)
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
                PhotoStackLayout.Add(iv);
            }

            //if (string.IsNullOrEmpty(pvm.Post.Describe))
            //{
            //    PostVerticalLayout.Children.Remove(ExpDescribeLabel);
            //}
        }
    }

    private void HamburgerMenuImgBtn_Clicked(object sender, EventArgs e)
    {
        HamburgerMenuClicked(BindingContext as PostVM);
    }

    private async void ImageButton_Clicked(object sender, EventArgs e)
    {
        
        var navigationParameter = new Dictionary<string, object>
    {
        { "Post", (BindingContext as PostVM).Post }
    };
        await Shell.Current.GoToAsync($"///comments", navigationParameter);
        //await Navigation.PushModalAsync(new CommentsPage() { BindingContext = new CommentPageVM() { Post = (BindingContext as PostVM).Post } });
    }
}