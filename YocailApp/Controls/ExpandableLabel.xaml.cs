using System.Windows.Input;

namespace YocailApp.Controls;

public partial class ExpandableLabel : ContentView
{
    public ExpandableLabel()
    {
        InitializeComponent();
        ShowFullCommand = new Command(() =>
        {
            ShowFull = true;
        });
    }

    public ICommand ShowFullCommand { get; set; }

    public int DefaultMaxLength { get; set; } = 50;
    public bool ShouldBeTrimmed
    {
        get
        {
            return (BindingContext as string).Length > DefaultMaxLength;
        }
    }

    public bool ShowFull { get; set; }

    protected override void OnBindingContextChanged()
    {
        base.OnBindingContextChanged();

        LoadLabel();
    }
    public void LoadLabel()
    {
        string describe = BindingContext as string;
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
}