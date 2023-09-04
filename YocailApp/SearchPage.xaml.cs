using YocailApp.ViewModel;

namespace YocailApp;

public partial class SearchPage : ContentPage
{
	public SearchPage()
	{
		InitializeComponent();
		
	}

    protected override void OnAppearing()
    {
        base.OnAppearing();
        
        (BindingContext as SearchPageVM).SearchCompleted += SearchPage_SearchCompleted;
    }

    private void SearchPage_SearchCompleted()
    {
    }

    //private void SearchBar_TextChanged(object sender, TextChangedEventArgs e)
    //{
    //    _= (BindingContext as SearchPageVM).LoadData();
    //}

    private void SearchBar_Focused(object sender, FocusEventArgs e)
    {
        //ExploreScrollView.IsVisible = false;
        //SearchScrollView.IsVisible = true;
    }
}

