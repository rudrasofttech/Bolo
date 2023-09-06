namespace YocailApp.Controls;

public partial class MemberCard : ContentView
{
    private MemberModel _member = new MemberModel();
    public MemberModel Member
    {
        get
        {
            return _member;
        }
        set
        {
            _member = value;
            OnPropertyChanged();
            OnPropertyChanged("ProfilePicVisible");
            OnPropertyChanged("NameVisible");
            OnPropertyChanged("ThoughtStatusVisible");
            OnPropertyChanged("BioVisible");
            OnPropertyChanged("ManageProfileButtonVisible");
        }
    }

    private bool _manageProfileButtonVisible;
    public bool ManageProfileButtonVisible
    {
        get { return _manageProfileButtonVisible; }
        set {
            if (_manageProfileButtonVisible != value)
            {
                _manageProfileButtonVisible = value;
                OnPropertyChanged();
            }
        }
    }

    public bool ProfilePicVisible
    {
        get { return !string.IsNullOrEmpty(Member.Pic); }
    }

    public bool NameVisible
    {
        get
        {
            return !string.IsNullOrEmpty(Member.Name);
        }
    }

    public bool ThoughtStatusVisible
    {
        get
        {
            return !string.IsNullOrEmpty(Member.ThoughtStatus);
        }
    }

    public bool BioVisible { get { return !string.IsNullOrEmpty(Member.Bio); } }

    public MemberCard()
	{
		InitializeComponent();
	}
}