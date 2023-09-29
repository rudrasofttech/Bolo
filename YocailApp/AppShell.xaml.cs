namespace YocailApp
{
    public partial class AppShell : Shell
    {
        private Stack<ShellNavigationState> Uri { get; set; } // Navigation stack.  
        private ShellNavigationState temp; // Prevents applications from adding redundant data to the stack when the back button is clicked.  
        
        public AppShell()
        {
            InitializeComponent();
            Uri = new Stack<ShellNavigationState>();
        }
        protected override void OnNavigated(ShellNavigatedEventArgs args)
        {
            base.OnNavigated(args);
            if (Uri != null && args.Previous != null)
            {
                if (temp == null || temp != args.Previous)
                {
                    Uri.Push(args.Previous);
                    temp = args.Current;
                }
            }
        }
        //protected override bool OnBackButtonPressed()
        //{
        //    if (Uri.Count > 0)
        //    {
        //        Shell.Current.GoToAsync(Uri.Pop());
        //        return true;
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}
    }
}