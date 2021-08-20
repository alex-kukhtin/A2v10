// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

namespace A2v10.Xaml
{
	public enum TextAlign
	{
		Default = 0,
		Left = Default,
		Right,
		Center
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
		Time,
		Number,
		Currency,
		Boolean,
		Object,
		Period
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
		Approve,
		ArrowDown,
		ArrowDownRed,
		ArrowLeft,
		ArrowLeftRight,
		ArrowRight,
		ArrowUp,
		ArrowUpGreen,
		ArrowExport,
		ArrowOpen,
		ArrowSort,
		Attach,
		Ban,
		BanRed,
		Bank,
		BankAccount,
		BankUah,
		Bell,
		BrandExcel,
		Calc,
		Calendar,
		Call,
		Camera,
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
		Close,
		Cloud,
		CloudOutline,
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
		CurrencyUah,
		CurrencyUsd,
		CurrencyEuro,
		CurrencyOther,
		Copy,
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
		Ellipsis,
		EllipsisBottom,
		EllipsisVertical,
		Error,
		ErrorOutline,
		Exit,
		Export,
		ExportExcel,
		External,
		Eye,
		EyeDisabled,
		EyeDisabledRed,
		Failure,
		FailureRed,
		FailureOutline,
		Flag,
		FlagBlue,
		FlagGreen,
		FlagRed,
		FlagYellow,
		Flag2,
		File,
		FileContent,
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
		Folder,
		FolderOutline,
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
		Image,
		Import,
		Items,
		Link,
		List,
		ListBullet,
		Lock,
		LockOutline,
		Log,
		Menu,
		Message,
		MessageOutline,
		Minus,
		MinusBox,
		MinusCircle,
		Package,
		PackageOutline,
		PaneLeft,
		PaneLeftBlue,
		PaneRight,
		PaneRightBlue,
		Paste,
		Pencil,
		PencilOutline,
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
		Unlock,
		UnlockOutline,
		Unpin,
		UnpinOutline,
		Upload,
		Upload2,
		User,
		UserImage,
		UserMinus,
		UserPlus,
		Users,
		Waiting,
		WaitingOutline,
		Warehouse,
		Warning,
		WarningOutline,
		WarningYellow,
		Workflow1,
		Wrench
	}
}
