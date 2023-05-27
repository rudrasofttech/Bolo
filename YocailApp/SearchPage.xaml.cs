using YocailApp.ViewModel;

namespace YocailApp;

public partial class SearchPage : ContentPage
{
	public SearchPage()
	{
		InitializeComponent();
		
	}

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await (BindingContext as SearchPageVM).LoadExploreData();
        (BindingContext as SearchPageVM).SearchCompleted += SearchPage_SearchCompleted;
    }

    private void SearchPage_SearchCompleted()
    {
        SearchBar.Unfocus();
        SearchScrollView.Focus();
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