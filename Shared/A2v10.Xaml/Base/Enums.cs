﻿// Copyright © 2015-2025 Oleksandr Kukhtin. All rights reserved.

namespace A2v10.Xaml;

public enum TextAlign
{
	Default = 0,
	Left = Default,
	Right,
	Center
}

public enum Overflow
{
	Visible,
	Hidden,
	Auto,
	True = Visible,
	False = Hidden,
}

public enum AlignItems
{
	Default,
	Baseline,
	Center,
	Start,
	End,
	Stretch
}

public enum JustifyItems
{
	Default,
	Start,
	End,
	Center,
	SpaceAround,
	SpaceEvenly,
	SpaceBetween
}

public enum TextColor
{
	Default = 0,
	Gray,
	LightGray,
	Danger,
	Green,
	Red,
	Label
}

public enum FloatMode
{
	None,
	Left,
	Right
}

public enum VerticalAlign
{
	Default,
	Top,
	Middle,
	Bottom
}

public enum AlignItem
{
	Default,
	Start,
	End,
	Center,
	Stretch,
	Top,
	Middle,
	Bottom,
	Baseline
}


public enum DropDownPlacement
{
	BottomLeft,
	BottomRight,
	TopLeft,
	TopRight
}


public enum GridLinesVisibility
{
	None,
	Horizontal,
	Vertical,
	Both
}

public enum Orientation
{
	Vertical,
	Horizontal
}

public enum PageOrientation
{
	Portrait,
	Landscape
}

public enum DataType
{
	String,
	Date,
	DateTime,
	DateTime2,
	Time,
	Number,
	Currency,
	Boolean,
	Object,
	Period,
	Percent
}

public enum ControlSize
{
	Default = 0,
	Large = 1,
	Medium = Default,
	Small = 2,
	Mini = 3,
	Normal = 4
};

public enum TextSize
{
	Normal,
	Small,
	Big
}

public enum WrapMode
{
	Default,
	Wrap,
	NoWrap,
	PreWrap
}

public enum AutoSelectMode
{
	None,
	FirstItem,
	LastItem,
	ItemId
}

public enum RowMarkerStyle
{
	None,
	Row,
	Marker,
	Both
}

public enum MarkStyle
{
	Default,
	Success,
	Green,
	Warning,
	Orange,
	Info,
	Cyan,
	Danger,
	Red,
	Error,
	Gray
}

public enum DropDownDirection
{
	DownRight,
	DownLeft,
	UpLeft,
	UpRight,
	Default = DownRight
}

public enum BackgroundStyle
{
	Default,
	LightGray,
	WhiteSmoke,
	White,
	LightYellow
}

public enum ColumnBackgroundStyle {
	None,
	Yellow,
	Green,
	Red,
	Blue,
	Gray
}

public enum ShadowStyle
{
	None,
	Shadow1,
	Shadow2,
	Shadow3,
	Shadow4,
	Shadow5
}

public enum RenderMode
{
	Show,
	Hide,
	ReadOnly,
	Debug
}

public enum Icon
{
	NoIcon = 0,
	Empty,
	Access,
	Account,
	AccountFolder,
	Add,
	AddressBook,
	AddressCard,
	Alert,
	Apply,
	Approve,
	ArrowDown,
	ArrowDownRed,
	ArrowLeft,
	ArrowLeftRight,
	ArrowLeftRightFull,
	ArrowRight,
	ArrowUp,
	ArrowUpGreen,
	ArrowExport,
	ArrowOpen,
	ArrowSort,
	Assets,
	Attach,
	Ban,
	BanRed,
	Bank,
	BankAccount,
	BankUah,
	Barcode,
	Bell,
	Board,
	Bookmark,
	BrandExcel,
	Calc,
	Calendar,
	CalendarToday,
	CalendarWeek,
	Call,
	Camera,
	Cart,
	ChartArea,
	ChartBar,
	ChartColumn,
	ChartPie,
	ChartPivot,
	ChartStackedArea,
	ChartStackedBar,
	ChartStackedLine,
	Check,
	CheckBold,
	Checkbox,
	CheckboxChecked,
	ChevronDown,
	ChevronLeft,
	ChevronDoubleLeft,
	ChevronLeftEnd,
	ChevronRight,
	ChevronDoubleRight,
	ChevronRightEnd,
	ChevronUp,
	Circle,
	CircleSmall,
	Clear,
	Clip,
	Close,
	Cloud,
	CloudOutline,
	Code,
	CodeCheck,
    Comment,
	CommentAdd,
	CommentDiscussion,
	CommentLines,
	CommentNext,
	CommentOutline,
	CommentPrevious,
	CommentUrgent,
	Company,
    Confirm,
    Copy,
    CurrencyUah,
	CurrencyUsd,
	CurrencyEuro,
	CurrencyOther,
    Cut,
	Delete,
	DeleteBox,
	DeleteRed,
	Dashboard,
	DashboardOutline,
	Database,
	Devices,
	Disapprove,
	Dot,
	DotBlue,
	DotGreen,
	DotRed,
	Download,
	Edit,
	EditRedo,
	EditUndo,
	Ellipsis,
	EllipsisBottom,
	EllipsisVertical,
	Energy,
	Error,
	ErrorOutline,
	Exit,
	Export,
	ExportExcel,
	External,
	Eye,
	EyeDisabled,
	EyeDisabledRed,
	Factory,
	Failure,
	FailureRed,
	FailureOutline,
	FailureOutlineRed,
	Flag,
	FlagBlue,
	FlagGreen,
	FlagRed,
	FlagYellow,
	Flag2,
	File,
	FileContent,
	FileDownloadPdf,
	FileError,
	FileFailure,
	FileImage,
	FileImport,
	FileLink,
	FilePreview,
	FileSignature,
	FileSuccess,
	FileUser,
	FileWarning,
	Filter,
	FilterOutline,
        Flame,
	Folder,
	FolderBan,
	FolderMoveTo,
	FolderOutline,
	FoldersOutline,
	FolderQuery,
	Gear,
	GearOutline,
	Grid,
	Help,
	HelpBlue,
	HelpOutline,
	History,
	Home,
	Info,
	InfoBlue,
	InfoOutline,
	InfoOutlineBlue,
	Image,
	Import,
	Items,
	Lead,
	Link,
	List,
	ListBullet,
	Lock,
	LockOutline,
	Log,
	Logout,
	Menu,
	Message,
	MessageOutline,
	Minus,
	MinusBox,
	MinusCircle,
	ModeDark,
	ModeLight,
	Package,
	PackageOutline,
	PaneClose,
	PaneLeft,
	PaneLeftBlue,
	PaneOpen,
	PaneRight,
	PaneRightBlue,
	Paste,
	Pencil,
	PencilOutline,
	Personnel,
	Pin,
	PinOutline,
	Pinned,
	PinnedOutline,
	Play,
	PlayOutline,
	Plus,
	PlusBox,
	PlusCircle,
	Policy,
	Power,
	Print,
	Process,
	Qrcode,
	Query,
	Queue,
	Refresh,
	RefreshNoColor,
	Reload,
	ReloadNoColor,
	Rename,
	Report,
	Requery,
	Save,
	SaveAs,
	SaveClose,
	SaveCloseOutline,
	SaveOutline,
	Search,
	Security,
	Send,
	SendOutline,
	Server,
	Share,
	Shopping,
	Smile,
	SmileSad,
	Square,
	Star,
	StarOutline,
	StarYellow,
	Step,
	Steps,
	Storyboard,
	Success,
	SuccessGreen,
	SuccessOutline,
	SuccessOutlineGreen,
	Switch,
	Table,
	Tag,
	TagBlue,
	TagGreen,
	TagOutline,
	TagRed,
	TagYellow,
	TaskComplete,
	Trash,
	TriangleLeft,
	TriangleRight,
	Truck,
	Unapply,
	Unlock,
	UnlockOutline,
	Unpin,
	UnpinOutline,
	Upgrade,
	Upload,
	Upload2,
	User,
	UserImage,
	UserMinus,
	UserPlus,
	UserRole,
	Users,
	Variable,
	Waiting,
	WaitingOutline,
	Warehouse,
	Warning,
	WarningOutline,
	WarningOutlineYellow,
	WarningYellow,
	Workflow1,
	Wrench
}
