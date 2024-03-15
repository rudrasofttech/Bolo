using CommunityToolkit.Maui.Views;
using System.ComponentModel;
using System.Windows.Input;
using YocailApp.Resources.Translations;

namespace YocailApp.Controls;

public partial class ExpandableLabel : ContentView
{
    public static readonly BindableProperty TextProperty =
  BindableProperty.Create("Text", typeof(string), typeof(ExpandableLabel), string.Empty);
    public ExpandableLabel()
    {
        InitializeComponent();
        ShowFullCommand = new Command(() =>
        {
            
        });
    }

    public string Text
    {
        get => GetValue(TextProperty).ToString();
        set => SetValue(TextProperty, value);
    }

    public string ExpandButtonText
    {
        get
        {
            if (ShowingFull)
                return AppRes.LessTxt;
            else
                return AppRes.MoreTxt;
        }
        set { }
    }

    public ICommand ShowFullCommand { get; set; }

    public int DefaultMaxLength { get; set; } = 50;
    public bool ShouldBeTrimmed
    {
        get
        {
            return Text.Length > DefaultMaxLength;
        }
    }
    private bool _showingFull = true;
    public bool ShowingFull
    {
        get { return _showingFull; }
        set
        {
            if (_showingFull != value)
            {
                _showingFull = value;
                LoadLabel();
            }
        }
    }

    protected override void OnBindingContextChanged()
    {
        base.OnBindingContextChanged();

        LoadLabel();
    }
    public void LoadLabel()
    {
        if (ShowingFull)
        {
            string describe = Text;
            var lines = describe.Split('\n');
            var fs = new FormattedString();
            foreach (var line in lines)
            {
                var arr = line.Split(' ');
                foreach (var s in arr)
                {
                    if (s.StartsWith("#"))
                    {
                        var lspan = new Span()
                        {
                            TextDecorations = TextDecorations.Underline,
                            Text = s
                        };
                        lspan.GestureRecognizers.Add(new TapGestureRecognizer { Command = new Command(() => { }) });
                        fs.Spans.Add(lspan);
                        fs.Spans.Add(new Span() { Text = " " });
                    }
                    else
                        fs.Spans.Add(new Span() { Text = s + " " });
                }
                fs.Spans.Add(new Span() { Text = "\n" });
            }
            DescribeLabel.FormattedText = fs;
        }
        else
        {
            DescribeLabel.Text = Text.Length > 50 ? $"{Text[..50]} ..." : Text;
            
        }

    }

    private void TapGestureRecognizer_Tapped(object sender, TappedEventArgs e)
    {
        ShowingFull = !ShowingFull;
    }
}