/*
------------------------------------------------
Copyright © 2008-2018 Alex Kukhtin

Last updated : 25 apr 2018 
module version : 7017
*/
------------------------------------------------
set noexec off;
go
------------------------------------------------
if DB_NAME() = N'master'
begin
	declare @err nvarchar(255);
	set @err = N'Error! Can not use the master database!';
	print @err;
	raiserror (@err, 16, -1) with nowait;
	set noexec on;
end
go
------------------------------------------------
set nocount on;

if not exists(select * from a2sys.Versions where Module = N'demo')
	insert into a2sys.Versions (Module, [Version]) values (N'demo', 7018);
else
	update a2sys.Versions set [Version] = 7018 where Module = N'demo';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2demo')
begin
	exec sp_executesql N'create schema a2demo';
end
go
------------------------------------------------
-- Tables
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Attachments')
begin
	create table a2demo.Attachments
	(
		Id bigint identity(100, 1) not null constraint PK_Attachments primary key,
		Name nvarchar(255) null,
		Mime nvarchar(255) null,
		BlobName nvarchar(255) null,
		[Data] varbinary(max) null,
		DateCreated datetime not null constraint DF_Attachments_DateCreated default(getdate()),
		[SignedData] varbinary(max) null,
		UserId bigint not null
	);
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Attachments' and COLUMN_NAME=N'SignedData'))
begin
	alter table a2demo.Attachments add [SignedData] varbinary(max) null;
end
go
--alter table a2demo.Attachments add [BlobName] nvarchar(255) null;
--go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Agents')
	create sequence a2demo.SQ_Agents as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Agents')
begin
	create table a2demo.Agents
	(
		Id	bigint not null constraint PK_Agents primary key
			constraint DF_Agents_PK default(next value for a2demo.SQ_Agents),
		Kind nvarchar(255) null,
		Void bit not null
			constraint DF_Agents_Void default(0),
		Folder bit not null
			constraint DF_Agents_Folder default(0),
		Parent bigint null,
			--constraint FK_Agents_Parent_Agents foreign key references a2demo.Agents(Id),
		[Type] nchar(1),
		[Code] nvarchar(32) null,
		[Name] nvarchar(255) null,
		[Tag] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		[Phone] nvarchar(32) null,
		DateCreated datetime not null constraint DF_Agents_DateCreated default(getdate()),
		UserCreated bigint not null
			constraint FK_Agents_UserCreated_Users foreign key references a2security.Users(Id),
		DateModified datetime not null constraint DF_Agents_DateModified default(getdate()),
		UserModified bigint not null
			constraint FK_Agents_UserModified_Users foreign key references a2security.Users(Id)
	);
end
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS where CONSTRAINT_NAME=N'FK_Agents_Parent_Agents' and CONSTRAINT_SCHEMA=N'a2demo')
begin
	alter table a2demo.Agents drop constraint FK_Agents_Parent_Agents;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Adresses')
	create sequence a2demo.SQ_Adresses as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Addresses')
begin
	create table a2demo.[Addresses]
	(
		Id	bigint not null constraint PK_Address primary key
			constraint DF_Address_PK default(next value for a2demo.SQ_Adresses),
		Agent bigint not null
			constraint FK_Addresses_Agent_Agents foreign key references a2demo.Agents(Id),
		[Country] nchar(2),
		[City] nvarchar(255),
		[Street] nvarchar(255),
		[Build] nvarchar(255),
		[Appt] nvarchar(255)
	)
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Agents' and COLUMN_NAME=N'Folder'))
begin
	alter table a2demo.Agents add Folder bit not null constraint DF_Agents_Folder default(0) with values;
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Agents' and COLUMN_NAME=N'Type'))
begin
	alter table a2demo.Agents add [Type] nchar(1);
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Agents' and COLUMN_NAME=N'Phone'))
begin
	alter table a2demo.Agents add [Phone] nvarchar(32) null;
end
go

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Units')
	create sequence a2demo.SQ_Units as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Units')
begin
	create table a2demo.Units
	(
		Id	bigint not null constraint PK_Units primary key
			constraint DF_Units_PK default(next value for a2demo.SQ_Units),
		Void bit not null
			constraint DF_Units_Void default(0),
		[Short] nvarchar(32) null,
		[Name] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Units_DateCreated default(getdate()),
		UserCreated bigint not null
			constraint FK_Units_UserCreated_Users foreign key references a2security.Users(Id),
		DateModified datetime not null constraint DF_Units_DateModified default(getdate()),
		UserModified bigint not null
			constraint FK_Units_UserModified_Users foreign key references a2security.Users(Id)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Entities')
	create sequence a2demo.SQ_Entities as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Entities')
begin
	create table a2demo.Entities
	(
		Id	bigint not null constraint PK_Entities primary key
			constraint DF_Entities_PK default(next value for a2demo.SQ_Entities),
		Kind nvarchar(255) null,
		Void bit not null
			constraint DF_Entities_Void default(0),
		Parent bigint null
			constraint FK_Entities_Parent_Entities foreign key references a2demo.Entities(Id),
		[Article] nvarchar(64) null,
		[Name] nvarchar(255) null,
		[Tag] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		[Image] bigint null
			constraint FK_Entities_Image_Attachments foreign key references a2demo.Attachments(Id),
		Unit bigint null
			constraint FK_Entities_Unit_Units foreign key references a2demo.Units(Id),
		DateCreated datetime not null constraint DF_Entities_DateCreated default(getdate()),
		UserCreated bigint not null 
			constraint FK_Entities_UserCreated_Users foreign key references a2security.Users(Id),
		DateModified datetime not null constraint DF_Entities_DateModified default(getdate()),
		UserModified bigint not null
			constraint FK_Entities_UserModified_Users foreign key references a2security.Users(Id)
	);
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Entities' and COLUMN_NAME=N'Image'))
begin
	alter table a2demo.Entities add [Image] bigint null;
	alter table a2demo.Entities add constraint FK_Entities_Image_Attachments foreign key ([Image]) references a2demo.Attachments(Id);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Documents')
	create sequence a2demo.SQ_Documents as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Documents')
begin
	create table a2demo.Documents
	(
		Id	   bigint not null constraint PK_Documents primary key
			constraint DF_Documents_PK default(next value for a2demo.SQ_Documents),
		Kind nvarchar(255) null,
		Parent bigint null
			constraint FK_Document_Parent_Documents foreign key references a2demo.Documents(Id),
		Done bit not null constraint DF_Documents_Done default(0),
		[Date] datetime null,
		[No]   int      null,
		Agent  bigint   null
			constraint FK_Document_Agent_Agents foreign key references a2demo.Agents(Id),
		DepFrom bigint   null
			constraint FK_Document_DepFrom_Agents foreign key references a2demo.Agents(Id),
		DepTo bigint   null
			constraint FK_Document_DepTo_Agents foreign key references a2demo.Agents(Id),
		[Sum] money not null 
			constraint DF_Documents_Sum default(0),
		[Tag]  nvarchar(255) null,
		[Memo] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Documents_DateCreated default(getutcdate()),
		UserCreated bigint not null
			constraint FK_Documents_UserCreated_Users foreign key references a2security.Users(Id),
		DateModified datetime not null constraint DF_Documents_DateModified default(getutcdate()),
		UserModified bigint not null
			constraint FK_Documents_UserModified_Users foreign key references a2security.Users(Id)
	);
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Documents' and COLUMN_NAME=N'Done'))
begin
	alter table a2demo.Documents add Done bit not null constraint DF_Documents_Done default(0) with values;
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Documents' and COLUMN_NAME=N'DepFrom'))
begin
	alter table a2demo.Documents add DepFrom bigint null
				constraint FK_Document_DepFrom_Agents foreign key references a2demo.Agents(Id);
	alter table a2demo.Documents add DepTo bigint   null
				constraint FK_Document_DepTo_Agents foreign key references a2demo.Agents(Id);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_DocDetails')
	create sequence a2demo.SQ_DocDetails as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'DocDetails')
begin
	create table a2demo.DocDetails
	(
		Id	   bigint not null constraint PK_DocDetails primary key
			constraint DF_DocDetails_PK default(next value for a2demo.SQ_DocDetails),
		Document bigint null
			constraint FK_DocDetails_Document_Documents foreign key references a2demo.Documents(Id),
		[RowNo] int      null,
		Entity  bigint   null
			constraint FK_DocDetails_Entity_Entities foreign key references a2demo.Entities(Id),
		[Qty] float not null
			constraint DF_DocDetails_Qty default(0),
		[Price] float not null
			constraint DF_DocDetails_Price default(0),
		[Sum] money not null 
			constraint DF_DocDetails_Sum default(0)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Catalogs')
begin
	create table a2demo.Catalogs
	(
		Id	bigint not null constraint PK_Catalogs primary key,
		[Name] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		[Url] nvarchar(255) null,
		[Icon] nvarchar(255) null
	);
end

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Countries')
begin
	create table a2demo.Countries
	(
		Code nchar(2)  constraint PK_Countries primary key,
		[Name] nvarchar(255)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Cities')
begin
	create table a2demo.Cities
	(
		Id bigint identity(1, 1) constraint PK_Cities primary key,
		Country nchar(2) 
			constraint FK_Cities_Country_Countries foreign key references a2demo.Countries(Code),
		[Name] nvarchar(255)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Streets')
begin
	create table a2demo.Streets
	(
		Id bigint identity(1, 1) constraint PK_Streets primary key,
		City bigint 
			constraint FK_Streets_City_Cities foreign key references a2demo.Cities(Id),
		[Name] nvarchar(255)
	)
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Metadata')
	drop procedure a2demo.[Agent.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Update')
	drop procedure a2demo.[Agent.Update]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Metadata')
	drop procedure a2demo.[Entity.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Update')
	drop procedure a2demo.[Entity.Update]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Metadata')
	drop procedure a2demo.[Document.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Update')
	drop procedure a2demo.[Document.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Document.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Document.TableType];
go
------------------------------------------------
create type a2demo.[Document.TableType]
as table(
	Id bigint null,
	Kind nvarchar(255),
	[Date] datetime,
	[No] int,
	[Sum] money,
	Agent bigint,
	DepFrom bigint,
	DepTo bigint,
	[Memo] nvarchar(255)
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'DocDetails.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[DocDetails.TableType];
go
------------------------------------------------
create type a2demo.[DocDetails.TableType]
as table(
	Id bigint null,
	ParentId bigint null,
	RowNumber int,
	[Qty] float,
	[Price] float,
	[Sum] money,
	Entity bigint
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Agent.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Agent.TableType];
go
------------------------------------------------
create type a2demo.[Agent.TableType]
as table(
	Id bigint null,
	Kind nvarchar(255),
	Folder bit,
	[Type] nchar(1),
	ParentFolder bigint,
	[Name] nvarchar(255),
	Code nvarchar(32),
	Phone nvarchar(32),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Address.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Address.TableType]
go
------------------------------------------------
create type a2demo.[Address.TableType]
as table(
	Id	bigint,
	[Country] nchar(2),
	[City] nvarchar(255),
	[Street] nvarchar(255),
	[Build] nvarchar(255),
	[Appt] nvarchar(255)
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Entity.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Entity.TableType];
go
------------------------------------------------
create type a2demo.[Entity.TableType]
as table(
	Id bigint null,
	Kind nvarchar(255),
	Folder bit,
	[Name] nvarchar(255),
	Article nvarchar(64),
	[Memo] nvarchar(255),
	Unit bigint,
	[Image] bigint
)
go
------------------------------------------------
-- Document procedures
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Index')
	drop procedure a2demo.[Document.Index]
go
------------------------------------------------
create procedure a2demo.[Document.Index]
	@TenantId int = null,
	@UserId bigint,
	@Kind nvarchar(255),
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Group nvarchar(255) = null,
	@Agent bigint = null,
	@From datetime = null,
	@To datetime = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	-- list of users
	with T([Id!!Id], [Date], [No], [Sum], Memo, 
		[Agent.Id!TAgent!Id], [Agent.Name!TAgent!Name], 
		[DepFrom.Id!TAgent!Id],  [DepFrom.Name!TAgent!Name],
		[DepTo.Id!TAgent!Id],  [DepTo.Name!TAgent!Name], Done,
		[DateCreated!!UtcDate], [DateModified!!UtcDate], [ParentDoc!TDocParent!RefId],
		[!!RowNumber])
	as(
		select d.Id, d.[Date], d.[No], d.[Sum], d.Memo, 
			d.Agent, a.[Name], d.DepFrom, f.[Name], d.DepTo, t.[Name], d.Done,
			d.DateCreated, d.DateModified, d.Parent,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then d.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then d.Id end desc,
				case when @Order=N'Date' and @Dir = @Asc then d.[Date] end asc,
				case when @Order=N'Date' and @Dir = @Desc  then d.[Date] end desc,
				case when @Order=N'No' and @Dir = @Asc then d.[No] end asc,
				case when @Order=N'No' and @Dir = @Desc then d.[No] end desc,
				case when @Order=N'Sum' and @Dir = @Asc then d.[Sum] end asc,
				case when @Order=N'Sum' and @Dir = @Desc then d.[Sum] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then d.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then d.Memo end desc,
				case when @Order=N'Agent.Name' and @Dir = @Asc then a.[Name] end asc,
				case when @Order=N'Agent.Name' and @Dir = @Desc then a.[Name] end desc
			)
		from a2demo.Documents d
			left join a2demo.Agents a on d.Agent = a.Id
			left join a2demo.Agents f on d.DepFrom = f.Id
			left join a2demo.Agents t on d.DepTo = t.Id
		where d.Kind=@Kind and (@Agent is null or d.Agent = @Agent)
	)
	select [Documents!TDocument!Array]=null, *, [Links!TDocLink!Array] = null,  [Attachments!TAttachment!Array] = null,
		[!!RowCount] = (select count(1) from T)
	into #tmp
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize

	select * from #tmp
	order by [!!RowNumber];

	select [!TDocLink!Array] = null, [Id!!Id] = Id, [!TDocument.Links!ParentId] = Parent, Kind, [Date], [No], [Sum]
	from a2demo.Documents where Parent in (select [Id!!Id] from #tmp)

	select [!TAttachment!Array] = null, [Id!!Id] = Id, [!TDocument.Attachments!ParentId] = Document 
	from a2demo.DocAttachments where Document in (select [Id!!Id] from #tmp);

	select [!TDocParent!Map] = null, [Id!!Id] = Id, Kind, [Date], [No], [Sum]
	from a2demo.Documents where Id in (select [ParentDoc!TDocParent!RefId] from #tmp);

	select [!$System!] = null, 
		[!Documents!PageSize] = @PageSize, 
		[!Documents!SortOrder] = @Order, 
		[!Documents!SortDir] = @Dir,
		[!Documents!Offset] = @Offset,
		[!Documents!GroupBy] = @Group,
		[!Documents.Agent.Id!Filter] = @Agent,
		[!Documents.Agent.Name!Filter] = (select [Name] from a2demo.Agents where Id=@Agent),
		--[!Documents.From!Filter] = @From,
		--[!Documents.To!Filter] = @To,
		[!Documents.Period.From!Filter] = @From,
		[!Documents.Period.To!Filter] = @To
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Load')
	drop procedure a2demo.[Document.Load]
go
------------------------------------------------
create procedure a2demo.[Document.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Kind nvarchar(255) = null
as
begin
	set nocount on;

	select [Document!TDocument!MainObject] = null, [Id!!Id] = d.Id, Kind, [Date], [No], [Sum], Tag, d.Memo,
		[Agent!TAgent!RefId] = Agent, [DepFrom!TAgent!RefId] = DepFrom, [DepTo!TAgent!RefId] = DepTo,
		Done,
		[DateCreated!!UtcDate] = DateCreated, [DateModified!!UtcDate] = DateModified, [UserCreated!TUser!RefId] = UserCreated, [UserModified!TUser!RefId] = UserModified,
		[Rows!TRow!Array] = null,
		[Shipment!TDocLink!Array] = null,
		[ParentDoc!TDocParent!RefId] = Parent
	from a2demo.Documents d 
	where d.Id=@Id;

	select [!TRow!Array] = null, [Id!!Id] = Id, [!TDocument.Rows!ParentId] = Document, [RowNo!!RowNumber] = RowNo,
		[Entity!TEntity!RefId] = Entity, Qty, Price, [Sum] 
	from a2demo.DocDetails where Document = @Id
	order by RowNo;

	select [!TAgent!Map] = null, [Id!!Id] = a.Id,  [Name!!Name] = a.[Name], a.Code 
	from a2demo.Agents a 
		inner join a2demo.Documents d on a.Id in (d.Agent, d.DepFrom, d.DepTo)
	where d.Id=@Id;

	select [!TUser!Map] = null, [Id!!Id] = u.Id,  [Name!!Name] = isnull(u.PersonName, u.UserName)
	from a2security.ViewUsers u
		inner join a2demo.Documents d on u.Id in (d.UserCreated, d.UserModified)
	where d.Id=@Id;

	select [!TEntity!Map] = null, [Id!!Id] = e.Id, [Name!!Name] = e.[Name], e.Article, e.[Image],
		[Unit.Id!TUnit!Id] = e.Unit, [Unit.Short!TUnit!Name] = u.[Short]
	from a2demo.Entities e
		inner join a2demo.DocDetails dd on e.Id = dd.Entity
		left join a2demo.Units u on e.Unit = u.Id
	where dd.Document = @Id;

	select [!TDocLink!Array] = null, [Id!!Id] = Id, [!TDocument.Shipment!ParentId] = Parent,
		[No], [Date], [Sum], [Done]
	from a2demo.Documents where Parent = @Id
	order by Id;

	-- parent document
	select [!TDocParent!Map] = null, [Id!!Id] = p.Id, p.[No], p.[Date], p.[Sum]
	from a2demo.Documents d inner join a2demo.Documents p on d.Parent = p.Id
	where d.Id = @Id;

	select [Warehouses!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
	from a2demo.Agents where Kind=N'Warehouse';

	select [!$System!] = null, [!!ReadOnly] = Done 
	from a2demo.Documents where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Merge.Load')
	drop procedure a2demo.[Document.Merge.Load]
go
------------------------------------------------
create procedure a2demo.[Document.Merge.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Kind nvarchar(255) = null
as
begin
	set nocount on;

	select [Meged!TMerge!Object] = null, [Id!!Id] = d.Id, Kind, [Date], [No], [Sum], Tag, d.Memo,
		Done,
		[DateCreated!!UtcDate] = DateCreated, [DateModified!!UtcDate] = DateModified
	from a2demo.Documents d 
	where d.Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Copy')
	drop procedure a2demo.[Document.Copy]
go
------------------------------------------------
create procedure a2demo.[Document.Copy]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Kind nvarchar(255) = null
as
begin
	set nocount on;

	select [Document!TDocument!Object] = null, [Id!!Id] = cast(0 as bigint), Kind, [Date], [No], [Sum], Tag, d.Memo,
		[Agent!TAgent!RefId] = Agent, [DepFrom!TAgent!RefId] = DepFrom, [DepTo!TAgent!RefId] = DepTo,
		Done,
		DateCreated, DateModified, [UserCreated!TUser!RefId] = UserCreated, [UserModified!TUser!RefId] = UserModified,
		[Rows!TRow!Array] = null,
		[Shipment!TDocLink!Array] = null,
		[ParentDoc!TDocParent!RefId] = Parent
	from a2demo.Documents d 
	where d.Id=@Id;

	select [!TRow!Array] = null, [Id!!Id] = cast(0 as bigint), [!TDocument.Rows!ParentId] = cast(0 as bigint), [RowNo!!RowNumber] = RowNo,
		[Entity!TEntity!RefId] = Entity, Qty, Price, [Sum] 
	from a2demo.DocDetails where Document = @Id
	order by RowNo;

	select [!TAgent!Map] = null, [Id!!Id] = a.Id,  [Name!!Name] = a.[Name], a.Code 
	from a2demo.Agents a 
		inner join a2demo.Documents d on a.Id in (d.Agent, d.DepFrom, d.DepTo)
	where d.Id=@Id;

	select [!TUser!Map] = null, [Id!!Id] = u.Id,  [Name!!Name] = isnull(u.PersonName, u.UserName)
	from a2security.ViewUsers u
		inner join a2demo.Documents d on u.Id in (d.UserCreated, d.UserModified)
	where 0 <> 0;

	select [!TEntity!Map] = null, [Id!!Id] = e.Id, [Name!!Name] = e.[Name], e.Article, e.[Image],
		[Unit.Id!TUnit!Id] = e.Unit, [Unit.Short!TUnit!Name] = u.[Short]
	from a2demo.Entities e
		inner join a2demo.DocDetails dd on e.Id = dd.Entity
		left join a2demo.Units u on e.Unit = u.Id
	where dd.Document = @Id;

	select [Warehouses!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
	from a2demo.Agents where Kind=N'Warehouse';

	select [!$System!] = null, [!!Copy] = 1
	from a2demo.Documents where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Report')
	drop procedure a2demo.[Document.Report]
go
------------------------------------------------
create procedure a2demo.[Document.Report]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	--throw 60000, N'error', 0;
	select [Document!TDocument!Object] = null, [Id!!Id] = d.Id, Kind, [Date], [No], [Sum], Tag, d.Memo,
		[Agent!TAgent!RefId] = Agent, [DepFrom!TAgent!RefId] = DepFrom, [DepTo!TAgent!RefId] = DepTo,
		DateCreated, DateModified, [UserCreated!TUser!RefId] = UserCreated, [UserModified!TUser!RefId] = UserModified,
		[Rows!TRow!Array] = null,
		Logo = (select [Data] from a2demo.Attachments where Id=101)
	from a2demo.Documents d 
	where d.Id=@Id;

	select [!TRow!Array] = null, [Id!!Id] = Id, [!TDocument.Rows!ParentId] = Document, [RowNo!!RowNumber] = RowNo,
		[Entity!TEntity!RefId] = Entity, Qty, Price, [Sum] 
	from a2demo.DocDetails where Document = @Id
	order by RowNo;

	select [!TAgent!Map] = null, [Id!!Id] = a.Id,  [Name!!Name] = a.[Name], a.Code 
	from a2demo.Agents a 
		inner join a2demo.Documents d on a.Id in (d.Agent, d.DepFrom, d.DepTo)
	where d.Id=@Id;

	select [!TUser!Map] = null, [Id!!Id] = u.Id,  [Name!!Name] = isnull(u.PersonName, u.UserName)
	from a2security.ViewUsers u
		inner join a2demo.Documents d on u.Id in (d.UserCreated, d.UserModified)
	where d.Id=@Id;

	select [!TEntity!Map] = null, [Id!!Id] = e.Id, [Name!!Name] = e.[Name], e.Article, e.[Image],
		[Unit.Id!TUnit!Id] = e.Unit, [Unit.Short!TUnit!Name] = u.[Short]
	from a2demo.Entities e
		inner join a2demo.DocDetails dd on e.Id = dd.Entity
		left join a2demo.Units u on e.Unit = u.Id
	where dd.Document = @Id;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'DocAttachments')
begin
	create table a2demo.DocAttachments
	(
		Id bigint not null identity(100, 1) constraint PK_DocAttachments primary key,
		Attachment	bigint not null
			constraint FK_DocAttachments_Attachment_Attachments foreign key references a2demo.Attachments(Id)
			on delete cascade,				
		Document bigint not null
			constraint FK_DocAttachments_Document_Documents foreign key references a2demo.Documents(Id) 
			on delete cascade,
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Signatures')
begin
	create table a2demo.Signatures
	(
		Id bigint not null identity(100, 1) constraint PK_Signatures primary key,
		Attachment	bigint not null
			constraint FK_Signatures_Attachment_Attachments foreign key references a2demo.Attachments(Id)
			on delete cascade,				
		[User] bigint not null
			constraint FK_Signatures_User_Users foreign key references a2security.Users(Id),
		Kind nvarchar(255),
		[Signature] varbinary(max),
		[UtcTime] datetime,
		Issuer nvarchar(255),
		[Subject] nvarchar(255),
		Serial nvarchar(255),
		Title nvarchar(255)
	);
end
go
------------------------------------------------
if (not exists (select 1 from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Signatures' and COLUMN_NAME=N'Title'))
begin
	alter table a2demo.Signatures add Title nvarchar(255);
end
go
------------------------------------------------
create or alter procedure a2demo.[Document.SaveAttachment]
@UserId bigint,
@TenantId int = null,
@Id bigint,
@Name nvarchar(255) = null,
@Mime nvarchar(255) = null,
@Stream varbinary(max),
@RetId bigint output
as
begin
	set nocount on;

	declare @output table (Id bigint);

	insert into a2demo.Attachments ([Name], Mime, [Data], UserId)
		output inserted.Id into @output(Id)
		values (@Name, @Mime, @Stream, @UserId);

	select top(1) @RetId = Id from @output;

	delete from @output;

	insert into a2demo.DocAttachments (Document, Attachment)
		output inserted.Id into @output(Id)
		values (@Id, @RetId);

	select top(1) @RetId = Id from @output;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'NextDocNo')
	drop procedure a2demo.NextDocNo
go
------------------------------------------------
create procedure a2demo.[NextDocNo]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Kind nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @DocNo int;
	select @DocNo=max([No]) from a2demo.Documents
	where Id <> @Id and Kind = @Kind

	select [Result!Result!Object]=null, [DocNo]=isnull(@DocNo, 0) + 1;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Delete')
	drop procedure a2demo.[Document.Delete]
go
------------------------------------------------
create procedure a2demo.[Document.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @done bit;
	select @done = Done from a2demo.Documents where Id=@Id;
	if @done = 1
		throw 60000, N'UI:Невозможно удалить проведенный документ.', 0;
	else if exists(select * from a2demo.Documents where Parent=@Id)
		throw 60000, N'UI:Невозможно удалить документ. Есть дочерние документы.', 0;
	else
	begin
		delete from a2demo.DocDetails where Document=@Id;
		delete from a2demo.Documents where Id=@Id;
		-- todo: log
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Apply')
	drop procedure a2demo.[Document.Apply]
go
------------------------------------------------
create procedure a2demo.[Document.Apply]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	declare @done bit;
	select @done = Done from a2demo.Documents where Id=@Id;
	if @done = 0
	begin
		update a2demo.Documents set Done = 1, DateModified = getdate(), UserModified = @UserId where Id=@Id;
		-- todo: log
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.UnApply')
	drop procedure a2demo.[Document.UnApply]
go
------------------------------------------------
create procedure a2demo.[Document.UnApply]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	declare @done bit;
	select @done = Done from a2demo.Documents where Id=@Id;
	if @done = 1
	begin
		if exists(select * from a2demo.Documents where Parent=@Id)
			throw 60000, N'UI:Проведение отменить невозможно.\nСуществуют дочерние документы.', 0;
		else 
		begin
			update a2demo.Documents set Done = 0, DateModified = getdate(), UserModified = @UserId  where Id=@Id;
			-- todo: log
		end
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Delete')
	drop procedure a2demo.[Invoice.Delete]
go
------------------------------------------------
create procedure a2demo.[Invoice.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Document.Delete] @TenantId, @UserId, @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Delete')
	drop procedure a2demo.[Waybill.Delete]
go
------------------------------------------------
create procedure a2demo.[Waybill.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Document.Delete] @TenantId, @UserId, @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'WaybillIn.Delete')
	drop procedure a2demo.[WaybillIn.Delete]
go
------------------------------------------------
create procedure a2demo.[WaybillIn.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Document.Delete] @TenantId, @UserId, @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.CreateShipment')
	drop procedure a2demo.[Invoice.CreateShipment]
go
------------------------------------------------
create procedure a2demo.[Invoice.CreateShipment]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	declare @done bit;
	declare @Kind nvarchar(255) = N'Waybill';
	select @done = Done from a2demo.Documents where Id=@Id;
	if @done = 0 return;
	if exists(select * from a2demo.Documents where Kind=@Kind and Parent=@Id) return;
	-- create shipment document
	declare @output table(id bigint);
	declare @NewId bigint;
	declare @DocNo int;
	select @DocNo=max([No]) from a2demo.Documents
		where Kind = @Kind;

	set @DocNo = isnull(@DocNo, 0) + 1;

	insert into a2demo.Documents(Parent, Kind, [Date], [No], [Agent], [Sum], UserCreated, UserModified)
		output inserted.Id into @output(id)
	select Id, @Kind, a2sys.fn_trimtime(getdate()), @DocNo, Agent, [Sum], @UserId, @UserId
		from a2demo.Documents where Id=@Id;

	select top(1) @NewId = id from @output;

	-- details
	insert into a2demo.DocDetails (Document, Entity, Qty, Price, [Sum], RowNo)
		select @NewId, Entity, Qty, Price, [Sum], RowNo
		from a2demo.DocDetails where Document=@Id;

	select [Document!TShipment!Object] = null, [Id!!Id] = Id, [Date], [Sum], [No]
	from a2demo.Documents where Id=@NewId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Metadata')
	drop procedure a2demo.[Document.Metadata]
go
------------------------------------------------
create procedure a2demo.[Document.Metadata]
as
begin
	set nocount on;
	declare @Document a2demo.[Document.TableType];
	declare @Rows a2demo.[DocDetails.TableType];
	select [Document!Document!Metadata]=null, * from @Document;
	select [Rows!Document.Rows!Metadata]=null, * from @Rows;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Update')
	drop procedure a2demo.[Document.Update]
go
------------------------------------------------
create procedure a2demo.[Document.Update]
	@TenantId int = null,
	@UserId bigint,
	@Kind nvarchar(255) = null,
	@Document a2demo.[Document.TableType] readonly,
	@Rows a2demo.[DocDetails.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @output table(op sysname, id bigint);

	merge a2demo.Documents as target
	using @Document as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Date] = source.[Date],
			target.[No] = source.[No],
			target.[Sum] = source.[Sum],
			target.[Memo] = source.Memo,
			target.[Agent] = source.Agent,
			target.DepFrom = source.DepFrom,
			target.DepTo = source.DepTo,
			target.[DateModified] = getutcdate(),
			target.[UserModified] = @UserId
	when not matched by target then 
		insert (Kind, [Date], [No], [Sum], Memo, Agent, DepFrom, DepTo, UserCreated, UserModified)
		values (Kind, [Date], [No], [Sum], Memo, Agent, DepFrom, DepTo, @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	merge a2demo.DocDetails as target
	using @Rows as source
	on (target.Id = source.Id and target.Document = @RetId)
	when matched then 
		update set
			target.RowNo = source.RowNumber,
			target.Entity = source.Entity,
			target.Qty = source.Qty,
			target.Price = source.Price,
			target.[Sum] = source.[Sum]
	when not matched by target then
		insert (Document, RowNo, Entity, Qty, Price, [Sum])
		values (@RetId, RowNumber, Entity, Qty, Price, [Sum])
	when not matched by source and target.Document = @RetId then delete;

	-- todo: log
	exec a2demo.[Document.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Index')
	drop procedure a2demo.[Agent.Index]
go
------------------------------------------------
create procedure a2demo.[Agent.Index]
	@TenantId int = null,
	@UserId bigint,
	@Kind nvarchar(255),
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);
	declare @RawFilter nvarchar(255) = @Fragment;

	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of users
	with T([Id!!Id], [Name], Code, Memo, Phone, [!!RowNumber])
	as(
		select a.Id, a.[Name], Code, a.Memo, a.Phone,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then a.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then a.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then a.[Name] end asc,
				case when @Order=N'Name' and @Dir = @Desc then a.[Name] end desc,
				case when @Order=N'Code' and @Dir = @Asc then a.[Code] end asc,
				case when @Order=N'Code' and @Dir = @Desc then a.[Code] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then a.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then a.Memo end desc
			)
		from a2demo.Agents a
		where a.Kind=@Kind and a.Void = 0 and Folder = 0
		and (@Fragment is null or upper(a.[Name]) like @Fragment or upper(a.[Code]) like @Fragment
			or upper(a.Memo) like @Fragment or cast(a.Id as nvarchar) like @Fragment)
	)
	select [Agents!TAgent!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	-- system data
	select [!$System!] = null, 
		[!Agents!PageSize] = @PageSize, 
		[!Agents!SortOrder] = @Order, 
		[!Agents!SortDir] = @Dir,
		[!Agents!Offset] = @Offset,
		[!Agents.Fragment!Filter] = @RawFilter;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Load')
	drop procedure a2demo.[Agent.Load]
go
------------------------------------------------
create procedure a2demo.[Agent.Load]
	@TenantId int = null,
	@UserId bigint = null,
	@Id bigint = null,
	@Name nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Agent!TAgent!MainObject] = null, [Id!!Id] = Id, [Name!!Name] = [Name], [Type], 
		Code, Tag, Memo, Folder, ParentFolder=Parent, Phone,
		[Address!TAddress!Object] = null,
		DateCreated, DateModified
	from a2demo.Agents where Id=@Id and Void=0;

	select [!TAddress!Object] = null, [Id!!Id] = Id, [!TAgent.Address!ParentId] = Agent,
		Country, City, Street, Build, Appt 
	from a2demo.Addresses where Agent = @Id;

	select [Countries!TCountry!Array] = null, [Code!!Id] = Code, [Name!!Name] = [Name], [Cities!TCity!LazyArray] = null
	from a2demo.Countries;

	-- we need type declaration for City
	select [!TCity!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], [Streets!TStreet!LazyArray] = null
	from a2demo.Cities where 0 <> 0; 

	-- we need type declaration for Street
	select [!TStreet!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
	from a2demo.Streets where 0 <> 0; 

	select [Params!TParam!Object] = null, [Name] = @Name;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Copy')
	drop procedure a2demo.[Agent.Copy]
go
------------------------------------------------
create procedure a2demo.[Agent.Copy]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Name nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Agent!TAgent!Object] = null, [Id!!Id] = cast(0 as bigint), [Name!!Name] = [Name], [Type], 
		Code, Tag, Memo, Folder, ParentFolder=Parent, Phone,
		[Address!TAddress!Object] = null,
		DateCreated, DateModified
	from a2demo.Agents where Id=@Id and Void=0;

	select [!TAddress!Object] = null, [Id!!Id] = Id, [!TAgent.Address!ParentId] = cast(0 as bigint),
		Country, City, Street, Build, Appt 
	from a2demo.Addresses where Agent = @Id;

	select [Countries!TCountry!Array] = null, [Code!!Id] = Code, [Name!!Name] = [Name], [Cities!TCity!LazyArray] = null
	from a2demo.Countries;

	-- we need type declaration for City
	select [!TCity!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], [Streets!TStreet!LazyArray] = null
	from a2demo.Cities where 0 <> 0; 

	-- we need type declaration for Street
	select [!TStreet!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
	from a2demo.Streets where 0 <> 0; 

	select [Params!TParam!Object] = null, [Name] = @Name;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Delete')
	drop procedure a2demo.[Agent.Delete]
go
------------------------------------------------
create procedure a2demo.[Agent.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Message nvarchar(255) = N'корреспондента'
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	if exists(select 1 from a2demo.Documents d where @Id in (d.Agent, d.DepFrom, d.DepTo))
	begin
		declare @msg nvarchar(max);
		set @msg = N'UI:Невозможно удалить ' + @Message + N'. Есть документы, в которых он используется.';
		throw 60000, @msg, 0;
	end
	else
	begin
		update a2demo.Agents set Void=1, UserModified = @UserId, DateModified=getdate() where Id=@Id;
		-- todo: log
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Fetch')
	drop procedure a2demo.[Agent.Fetch]
go
------------------------------------------------
create procedure a2demo.[Agent.Fetch]
	@TenantId int = null,
	@UserId bigint,
	@Kind nvarchar(255),
	@Text nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if @Text is not null
		set @Text = N'%' + upper(@Text) + N'%';

	select [Agents!TAgent!Array]=null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name], Code, a.Memo
	from a2demo.Agents a
		where a.Kind=@Kind and a.Void = 0 and Folder = 0
			and (upper(a.[Name]) like @Text or upper(a.[Code]) like @Text
			or upper(a.Memo) like @Text or cast(a.Id as nvarchar) like @Text)
	order by a.[Name]
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Code.CheckDuplicate')
	drop procedure a2demo.[Agent.Code.CheckDuplicate]
go
------------------------------------------------
create procedure a2demo.[Agent.Code.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Code nvarchar(255)
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2demo.Agents where [Code] = @Code and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Metadata')
	drop procedure a2demo.[Agent.Metadata]
go
------------------------------------------------
create procedure a2demo.[Agent.Metadata]
as
begin
	set nocount on;
	declare @Agent a2demo.[Agent.TableType];
	declare @Address a2demo.[Address.TableType];
	select [Agent!Agent!Metadata]=null, * from @Agent;
	select [Address!Agent.Address!Metadata]=null, * from @Address;
end
go
------------------------------------------------
create procedure a2demo.[Agent.Update]
	@TenantId int = null,
	@UserId bigint,
	@Agent a2demo.[Agent.TableType] readonly,
	@Address a2demo.[Address.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	/*
	declare @xml nvarchar(max);
	select @xml = (select * from @Address for xml auto);
	throw 60000, @xml, 0;
	*/

	declare @output table(op sysname, id bigint);

	declare @Parent bigint;
	select @Parent= ParentFolder from @Agent;
	if isnull(@Parent, 0) = 0
		select @Parent = 242; -- TODO!!!!


	merge a2demo.Agents as target
	using @Agent as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Code] = source.[Code],
			target.[Memo] = source.Memo,
			target.[Type] = source.[Type],
			target.[Phone] = source.[Phone],
			target.[DateModified] = getdate(),
			target.[UserModified] = @UserId
	when not matched by target then 
		insert (Kind, Folder, Parent, [Name], [Code], [Type], Phone, Memo, UserCreated, UserModified)
		values (Kind, Folder, @Parent, [Name], [Code], [Type], Phone, Memo, @UserId, @UserId)

	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	merge a2demo.Addresses as target
	using @Address as source
	on (target.Id = source.Id)
	when matched then update set
		target.Country = source.Country, target.City = source.City, target.Street = source.Street,
		target.Build = source.Build, target.Appt = source.Appt
	when not matched by target then
		insert (Agent, Country, City, Street, Build, Appt) values (@RetId, Country, City, Street, Build, Appt);

	-- todo: log

	exec a2demo.[Agent.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Cities')
	drop procedure a2demo.[Agent.Cities]
go
------------------------------------------------
create procedure a2demo.[Agent.Cities]
	@TenantId int = null,
	@UserId bigint,
	@Id nchar(2)
as
begin
	set nocount on;
	--throw 60000, @Id, 0;
	select [Cities!TCity!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
		from a2demo.Cities where Country=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Streets')
	drop procedure a2demo.[Agent.Streets]
go
------------------------------------------------
create procedure a2demo.[Agent.Streets]
	@TenantId int = null,
	@UserId bigint,
	@Id nchar(2)
as
begin
	set nocount on;
	--throw 60000, @Id, 0;
	select [Streets!TStreet!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name]
		from a2demo.Streets where City=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Index')
	drop procedure a2demo.[Entity.Index]
go
------------------------------------------------
create procedure a2demo.[Entity.Index]
	@TenantId int = null,
	@UserId bigint,
	@Kind nvarchar(255),
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	declare @InitFragment nvarchar(255) = @Fragment;

	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of users
	with T([Id!!Id], [Name], Article, [Image], Memo, [Unit.Id!TUnit!Id], [Unit.Short!TUnit!], [!!RowNumber])
	as(
		select e.Id, e.[Name], Article, [Image], e.Memo,
			Unit, u.Short,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then e.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then e.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then e.[Name] end asc,
				case when @Order=N'Name' and @Dir = @Desc then e.[Name] end desc,
				case when @Order=N'Article' and @Dir = @Asc then e.[Article] end asc,
				case when @Order=N'Article' and @Dir = @Desc then e.[Article] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then e.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then e.Memo end desc
			)
		from a2demo.Entities e
		left join a2demo.Units u on e.Unit = u.Id
		where e.Kind=@Kind and e.Void = 0
		and (@Fragment is null or upper(e.[Name]) like @Fragment or upper(e.[Article]) like @Fragment
			or upper(e.Memo) like @Fragment or cast(e.Id as nvarchar) like @Fragment)
	)
	select [Entities!TEntity!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, 
		[!Entities!PageSize] = @PageSize, 
		[!Entities!SortOrder] = @Order, 
		[!Entities!SortDir] = @Dir,
		[!Entities!Offset] = @Offset,
		[!Entities!HasRows] = case when exists(select * from a2demo.Entities where Kind=@Kind) then 1 else 0 end,
		[!Entities.Fragment!Filter] = @InitFragment
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.State.Load')
	drop procedure a2demo.[Agent.State.Load]
go
------------------------------------------------
create procedure a2demo.[Agent.State.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Agent!TAgent!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], [Type]
	from a2demo.Agents where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Load')
	drop procedure a2demo.[Entity.Load]
go
------------------------------------------------
create procedure a2demo.[Entity.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Entity!TEntity!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Article, [Image], Tag, Memo,
		[Unit!TUnit!RefId] = Unit,
		DateCreated, DateModified, [UserCreated!TUser!RefId] = UserCreated, [UserModified!TUser!RefId] = UserModified
	from a2demo.Entities where Id=@Id and Void=0;

	select [Units!TUnit!Array] = null, [Id!!Id] = Id, [Short!!Name] = Short, [Name]
	from a2demo.Units;

	select [!TUser!Map] = null, [Id!!Id] = u.Id,  [Name!!Name] = isnull(u.PersonName, u.UserName)
	from a2security.ViewUsers u
		inner join a2demo.Entities e on u.Id in (e.UserCreated, e.UserModified)
	where e.Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.FindArticle')
	drop procedure a2demo.[Entity.FindArticle]
go
------------------------------------------------
create procedure a2demo.[Entity.FindArticle]
	@TenantId int = null,
	@UserId bigint,
	@Article nvarchar(64) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select top(1) [Entity!TEntity!Object] = null, [Id!!Id] = e.Id, [Name!!Name] = e.[Name], Article, [Image], Tag, e.Memo,
		[Unit.Id!TUnit!Id] = e.Unit, [Unit.Short!TUnit!Name] = u.Short,
		e.DateCreated, e.DateModified
	from a2demo.Entities e 
		left join a2demo.Units u  on e.Unit = u.Id
	where Article=@Article and e.Void=0;

end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Delete')
	drop procedure a2demo.[Entity.Delete]
go
------------------------------------------------
create procedure a2demo.[Entity.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Message nvarchar(255) = N'объект учета'
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	if exists(select 1 from a2demo.DocDetails dd where @Id in (dd.Entity))
	begin
		declare @msg nvarchar(max);
		set @msg = N'UI:Невозможно удалить ' + @Message + N'. Есть документы, в которых он используется.';
		throw 60000, @msg, 0;
	end
	else
	begin
		update a2demo.Entities set Void=1 where Id=@Id;
		-- todo: log
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Article.CheckDuplicate')
	drop procedure a2demo.[Entity.Article.CheckDuplicate]
go
------------------------------------------------
create procedure a2demo.[Entity.Article.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Article nvarchar(255)
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2demo.Entities where [Article] = @Article and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Metadata')
	drop procedure a2demo.[Entity.Metadata]
go
------------------------------------------------
create procedure a2demo.[Entity.Metadata]
as
begin
	set nocount on;
	declare @Entity a2demo.[Entity.TableType];
	select [Entity!Entity!Metadata]=null, * from @Entity;
end
go
------------------------------------------------
create procedure a2demo.[Entity.Update]
	@TenantId int = null,
	@UserId bigint,
	@Entity a2demo.[Entity.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	--throw 60000, @UserId, 0;

	declare @output table(op sysname, id bigint);

	merge a2demo.Entities as target
	using @Entity as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Article] = source.[Article],
			target.[Image] = nullif(source.[Image], 0),
			target.[Memo] = source.Memo,
			target.Unit = source.Unit,
			target.[DateModified] = getdate(),
			target.[UserModified] = @UserId
	when not matched by target then 
		insert (Kind, [Name], [Article], [Image], Memo, Unit, UserCreated, UserModified)
		values (Kind, [Name], [Article], nullif([Image], 0), Memo, Unit, @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	-- todo: log
	select top(1) @RetId = id from @output;

	exec a2demo.[Entity.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Image.Load')
	drop procedure a2demo.[Entity.Image.Load]
go
------------------------------------------------
create procedure [a2demo].[Entity.Image.Load]
@TenantId int = null,
@UserId bigint,
@Id bigint = null,
@Key nvarchar(255) = null
as
begin
	set nocount on;
	select Mime, Stream = [Data], [Name], BlobName, Token=AccessKey from a2demo.Attachments where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Entity.Image.Update')
	drop procedure a2demo.[Entity.Image.Update]
go
------------------------------------------------
create procedure [a2demo].[Entity.Image.Update]
@TenantId int = null,
@UserId bigint,
@Id bigint,
@Key nvarchar(255),
@Mime nvarchar(255),
@Name nvarchar(255),
@Stream varbinary(max),
@BlobName nvarchar(255) = null,
@RetId bigint output
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @rtable table (Id bigint);
	
	insert into a2demo.Attachments(UserId, [Name], Mime, [Data], BlobName)
		output inserted.Id into @rtable
	values(@UserId, @Name, @Mime, @Stream, @BlobName);

	select @RetId = Id from @rtable;
	select [Id], Token=AccessKey from a2demo.Attachments where Id=@RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Index')
	drop procedure a2demo.[Invoice.Index]
go
------------------------------------------------
create procedure a2demo.[Invoice.Index]
	@TenantId int = null,
	@UserId bigint,
	@Offset int = 0,
	@PageSize int = 16,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@From datetime = N'20180509',
	@To datetime = N'20180501'
	--@Period nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Invoice', @Offset=@Offset, @PageSize=@PageSize, @Order=@Order, 
		@Dir=@Dir, @From = @From, @To=@To;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Index.Export')
	drop procedure a2demo.[Invoice.Index.Export]
go
------------------------------------------------
create procedure a2demo.[Invoice.Index.Export]
	@TenantId int = null,
	@UserId bigint,
	@Offset int = 0,
	@PageSize int = 16,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc'
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Invoice', @Offset=0, @PageSize=1000000, @Order=@Order, @Dir=@Dir;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Index')
	drop procedure a2demo.[Waybill.Index]
go
------------------------------------------------
create procedure a2demo.[Waybill.Index]
	@TenantId int = null,
	@UserId bigint,
	@Offset int = 0,
	@PageSize int = 1024,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Group nvarchar(20) = null,
	@Agent bigint = null
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Waybill', @Offset=@Offset, @PageSize=@PageSize, 
		@Order=@Order, @Dir=@Dir, @Agent = @Agent, @Group = @Group;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Load')
	drop procedure a2demo.[Waybill.Load]
go
------------------------------------------------
create procedure a2demo.[Waybill.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Kind nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Document.Load] @TenantId, @UserId, @Id, @Kind;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'WaybillIn.Index')
	drop procedure a2demo.[WaybillIn.Index]
go
------------------------------------------------
create procedure a2demo.[WaybillIn.Index]
	@TenantId int = null,
	@UserId bigint,
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@GroupBy nvarchar(255) = N'Agent.Name'
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @TenantId=@TenantId, @UserId=@UserId, @Kind=N'WaybillIn', @Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir, @GroupBy=@GroupBy;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Index.Dynamic')
	drop procedure a2demo.[Customer.Index.Dynamic]
go
------------------------------------------------
create procedure a2demo.[Customer.Index.Dynamic]
	@TenantId int = null,
	@UserId bigint,
	@Fragment nvarchar(255) = null,
	@Id bigint = null
as
begin
	set nocount on;

	select top(1) [Agents!TFolder!Tree] = null, [Id!!Id] = cast(-1 as bigint), [Name!!Name] = N'[Результат поиска]',
		[Icon] = 'search',
		[SubItems!TFolder!Items] = null,
		[Children!TAgent!LazyArray] = null,
		[HasSubItems!!HasChildren] = 0
	from a2demo.Agents a where isnull(@Fragment, N'') <> N''
	union all
	select [Agents!TFolder!Tree] = null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name],
		[Icon] = 'folder',
		[SubItems!TFolder!Items] = null,
		[Children!TAgent!LazyArray] = null,
		[HasSubItems!!HasChildren] = 
			case when exists(select 1 from a2demo.Agents c where c.Void = 0 and c.Parent = a.Id and c.Folder = 1) then 1 else 0 end
	from a2demo.Agents a where a.Folder=1 and a.Parent is null and a.Void = 0
	order by [Id!!Id];

	-- TAgent declaration (empty recordset)
	select [!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Memo
		from a2demo.Agents where 0 <> 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Index')
	drop procedure a2demo.[Customer.Index]
go
------------------------------------------------
create procedure a2demo.[Customer.Index]
	@TenantId int = null,
	@UserId bigint,
	@Fragment nvarchar(255) = null,
	@Id bigint = null
as
begin
	set nocount on;

	-- static tree mode - load all tree items
	with X(Id, Parent, [Level])
	as (
		select Id, Parent, 0 from a2demo.Agents a where a.Kind=N'Customer' and a.Void=0 and a.Parent is null and a.Folder=1
		union all 
		select a.Id, a.Parent, X.[Level] + 1 from a2demo.Agents a
			inner join X on X.Id = a.Parent
		where a.Void=0 and a.Folder=1
	)
	select top(1) [Agents!TFolder!Tree] = null, [Id!!Id] = cast(-1 as bigint), [!TFolder.SubItems!ParentId]=null, [Name!!Name] = N'[Результат поиска]',
		[Icon] = 'search',
		[SubItems!TFolder!Items] = null,
		[Children!TAgent!LazyArray] = null,
		[Level] = -1
	from a2demo.Agents a where isnull(@Fragment, N'') <> N''
	union all
	select [Agents!TFolder!Tree] = null, [Id!!Id] = a.Id, [!TFolder.SubItems!ParentId]=X.Parent,  [Name!!Name] = a.[Name],
		[Icon] = 'folder',
		[SubItems!TFolder!Items] = null,
		[Children!TAgent!LazyArray] = null,
		[Level] = X.[Level]
	from a2demo.Agents a inner join X on  a.Id = X.Id
	order by [Level], [Id!!Id];

	-- TAgent declaration (empty recordset)
	select [!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Memo
		from a2demo.Agents where 0 <> 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Expand')
	drop procedure a2demo.[Customer.Expand]
go
------------------------------------------------
create procedure a2demo.[Customer.Expand]
	@TenantId int = null,
	@UserId bigint,
	@Fragment nvarchar(255) = null,
	@Id bigint
as
begin
	set nocount on;
	select [SubItems!TFolder!Tree] = null, [Id!!Id] = Id, [Name!!Name] = [Name],
		[Icon] = 'folder',
		[SubItems!TFolder!Items] = null,
		[Children!TAgent!LazyArray] = null,
		[HasSubItems!!HasChildren] = case when exists(select 1 from a2demo.Agents c where c.Void=0 and c.Parent=a.Id and c.Folder = 1) then 1 else 0 end
	from a2demo.Agents a where Kind=N'Customer' and Folder=1 and Parent = @Id and Void=0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Children')
	drop procedure a2demo.[Customer.Children]
go
------------------------------------------------
create procedure a2demo.[Customer.Children]
	@TenantId int = null,
	@UserId bigint,
	@Fragment nvarchar(255) = null,
	@Id bigint,
	@Offset int = 0,
	@PageSize int = 10,
	@Order nvarchar(255) = N'Name',
	@Dir nvarchar(20) = N'asc'
as
begin
	set nocount on;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	with T(Id, [Name], Code, Memo, RowNumber)
	as (
		select Id, [Name], Code, Memo,
			[RowNumber] = row_number() over (
				order by 
					case when @Order=N'Id' and @Dir=@Asc then a.Id end asc,
					case when @Order=N'Id' and @Dir=@Desc then a.Id end desc,
					case when @Order=N'Name' and @Dir=@Asc then a.[Name] end asc,
					case when @Order=N'Name' and @Dir=@Desc then a.[Name] end desc,
					case when @Order=N'Code' and @Dir=@Asc then a.Code end asc,
					case when @Order=N'Code' and @Dir=@Desc then a.Code end desc,
					case when @Order=N'Memo' and @Dir=@Asc then a.Memo end asc,
					case when @Order=N'Memo' and @Dir=@Desc then a.Memo end desc
			)
			from a2demo.Agents a
		where Kind=N'Customer' and Folder=0 and Void=0 and (
			Parent = @Id or
				(@Id = -1 and upper([Name]) like N'%' + upper(@Fragment) + N'%')
			)
	) select [Children!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Memo,
		[!!RowCount]  = (select count(1) from T), [!!Direction] = @Dir, [!!SortOrder] = @Order
	from T
		order by RowNumber offset (@Offset) rows fetch next (@PageSize) rows only;

	-- system data
	select [!$System!] = null, 
		[!Children!PageSize] = @PageSize, 
		[!Children!SortOrder] = @Order, 
		[!Children!SortDir] = @Dir,
		[!Children!Offset] = @Offset
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Delete')
	drop procedure a2demo.[Customer.Delete]
go
------------------------------------------------
create procedure a2demo.[Customer.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Agent.Delete] @TenantId, @UserId=@UserId, @Id=@Id, @Message=N'покупателя';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Browse.Index')
	drop procedure a2demo.[Customer.Browse.Index]
go
------------------------------------------------
create procedure a2demo.[Customer.Browse.Index]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Agent.Index]  @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Customer', 
	@Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir,
	@Fragment = @Fragment
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Supplier.Index')
	drop procedure a2demo.[Supplier.Index]
go
------------------------------------------------
create procedure a2demo.[Supplier.Index]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Agent.Index]  @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Supplier', 
	@Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir,
	@Fragment = @Fragment
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Supplier.Delete')
	drop procedure a2demo.[Supplier.Delete]
go
------------------------------------------------
create procedure a2demo.[Supplier.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Agent.Delete]  @TenantId, @UserId=@UserId, @Id=@Id, @Message=N'поставщика';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Goods.Index')
	drop procedure a2demo.[Goods.Index]
go
------------------------------------------------
create procedure a2demo.[Goods.Index]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Offset int = 0,
	@PageSize int = 10,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Entity.Index]  @TenantId=@TenantId, @UserId=@UserId, @Kind=N'Goods2', 
		@Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir,
		@Fragment = @Fragment;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Goods.Delete')
	drop procedure a2demo.[Goods.Delete]
go
------------------------------------------------
create procedure a2demo.[Goods.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	exec a2demo.[Entity.Delete]  @TenantId=@TenantId, @UserId=@UserId, @Id=@Id, @Message=N'товар';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Registry.Load')
	drop procedure a2demo.[Invoice.Registry.Load]
go
------------------------------------------------
create procedure a2demo.[Invoice.Registry.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null,
	@Agent bigint = null,
	@From datetime = null,
	@To datetime = null
as
begin
	set nocount on;
	select [ReportData!TData!Array] = null, [Id!!Id] = Id, [Date], [No], [Sum], [Memo], DateCreated, DateModified
	from a2demo.Documents where Agent in (@Agent)
	order by [Date] desc;

	select [Query!TQuery!Object] = null,
		[Period.From!TPeriod] = @From,
		[Period.To!TPeriod] = @To,
		[Agent.Id!TAgent!Id] = @Agent,
		[Agent.Name!TAgent!Name] = (select top(1) [Name] from a2demo.Agents where Id in (@Agent));
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Catalogs.Index')
	drop procedure a2demo.[Catalogs.Index]
go
------------------------------------------------
create procedure a2demo.[Catalogs.Index]
	@TenantId int = null,
	@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Catalogs!TCatalog!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Memo, [Url], Icon
	from a2demo.Catalogs 
	order by Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Dummy.Index')
	drop procedure a2demo.[Dummy.Index]
go
------------------------------------------------
create procedure a2demo.[Dummy.Index]
	@TenantId int = null,
	@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Dummy!TDummy!Object] = null;
end
go
------------------------------------------------
begin
	-- App Title/SubTitle
	if not exists (select * from a2sys.SysParams where [Name] = N'AppTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppTitle', N'A2:Demo'); 
	if not exists (select * from a2sys.SysParams where [Name] = N'AppSubTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppSubTitle', N'демонстрационное приложение'); 
end
go
------------------------------------------------
begin
	-- create user menu
	declare @menu table(id bigint, p0 bigint, [name] nvarchar(255), [url] nvarchar(255), icon nvarchar(255), [order] int, help nvarchar(255));
	insert into @menu(id, p0, [name], [url], icon, [order], [help])
	values
		(1, null, N'Default',     null,          null,     0, null),
		(5, 1,    N'Панель',      N'dashboard',  null,     5, '/help/dashboard'),
		(10, 1,   N'Продажи',     N'sales',      null,    10, '/help/sales'),
		(20, 1,   N'Закупки',     N'purchase',   null,    20, '/help/purchase'),
		(30, 1,   N'Закупки 2',   N'purchase2',  null,    30, null),
		(40, 1,   N'BPMN',    N'bpmn',       null,    40, null),
		(31, 10,  N'Документы',   null,		     null,    10, null),
		(32, 10,  N'Справочники', null,		     null,    20, null),
		(33, 20,  N'Документы',   null,		     null,    10, null),
		(34, 20,  N'Справочники', null,		     null,    20, null),
		(41, 31,  N'Счета',		  N'invoice',    N'file', 10, null),
		(42, 31,  N'Накладные',	  N'waybill',    N'file', 20, null),
		(43, 32,  N'Покупатели',  N'customer',   N'user', 10, null),
		(44, 33,  N'Накладные',	  N'waybillin',  N'file', 10, null),
		(45, 34,  N'Поставщики',  N'supplier',   N'user', 10, null),
		(46, 34,  N'Товары',      N'goods',      N'steps',20, null),
		(47, 34,  N'Test GUID',   N'testguids',  N'items',30, null),
		(61, 30,  N'Счета',		  N'invoice',    N'file', 10, null),
		(62, 30,  N'Накладные',	  N'waybill',    N'file', 20, null),
		(63, 30,  N'Покупатели',  N'customer',   N'user', 30, null),
		(64, 30,  N'Справочники', N'catalog',    N'list', 40, null),
		(70, 10,  N'Inbox (2)',        N'inbox',      N'workflow1', 50, null),
		(71, 10,  N'Assets', N'assets', N'dashboard', 60, null),
		(2, null, N'Mobile',     null,           null,     0, null),
		(100, 2,  N'Панель управління',  N'dashboard',  N'dashboard-outline',     5, '/help/dashboard'),
		(105, 2,  N'Продажи',     N'sales',      N'pack-outline',    10, null),
		(1050, 105,  N'Прибуткові накладні',     N'waybill', N'file',    10,   '/help/sales'),
		(1051, 105,  N'Рахунки',     N'invoice', N'file',    20,   '/help/sales'),
		(1052, 105,  N'Контрагенти',   N'customers',   N'users',    30, '/help/sales'),
		(110, 2,  N'Закупівлі',     N'purchase',   N'users',    20, '/help/purchase'),
		(120, 2,  N'Грошові кошти',   N'money',	N'currency-uah',    30, null),
		(1200, 120,  N'Платежі',   N'payments',	N'file',    30, null),
		(1205, 120,  N'Каса',		N'cash',	N'currency-uah',    30, null),
		(125, 2,  N'Довідники', N'catalog',	 N'menu',    40, null),
		(400, 40,  N'Catalog', N'catalog',	 N'items',    10, null),
		(401, 40,  N'Workflow', N'workflow',	 N'workflow1',    20, null),
		(402, 40,  N'Instance', N'instance',	 N'queue',    30, null);
	merge a2ui.Menu as target
	using @menu as source
	on target.Id=source.id and target.Id >= 1 and target.Id < 2000
	when matched then
		update set
			target.Id = source.id,
			target.[Name] = source.[name],
			target.[Url] = source.[url],
			target.[Icon] = source.icon,
			target.[Order] = source.[order],
			target.Parent = source.p0,
			target.Help = source.help
	when not matched by target then
		insert(Id, Parent, [Name], [Url], Icon, [Order], Help) values (id, p0, [name], [url], icon, [order], help)
	when not matched by source and target.Id >= 1 and target.Id < 200 then 
		delete;

	if not exists (select * from a2security.Acl where [Object] = 'std:menu' and [ObjectId] = 1 and GroupId = 1)
	begin
		insert into a2security.Acl ([Object], ObjectId, GroupId, CanView)
			values (N'std:menu', 1, 1, 1);
	end
	if not exists (select * from a2security.Acl where [Object] = 'std:menu' and [ObjectId] = 2 and GroupId = 1)
	begin
		insert into a2security.Acl ([Object], ObjectId, GroupId, CanView)
			values (N'std:menu', 2, 1, 1);
	end
	exec a2security.[Permission.UpdateAcl.Menu];
end
go
------------------------------------------------
begin
	-- catalogs
	declare @catalogs table(id bigint, [name] nvarchar(255), [url] nvarchar(255), icon nvarchar(255), memo nvarchar(255));
	insert into @catalogs(id, [name], [url], icon, memo)
	values
		(10, N'Единицы измерения', N'/Catalog/Units/index',  N'list', N'Справочник единиц измерения'),
		(20, N'Группы товаров',	   N'/Catalog/Groups/index', N'list', N'Справочник групп товаров')
	merge a2demo.Catalogs as target
	using @catalogs as source
	on target.Id=source.id
	when matched then
		update set
			target.Id = source.id,
			target.[Name] = source.[name],
			target.[Url] = source.[url],
			target.[Icon] = source.icon,
			target.[Memo] = source.[memo]
	when not matched by target then
		insert(Id, [Name], [Url], Icon, [Memo]) values (id,  [name], [url], icon, memo)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if not exists(select * from a2demo.Units) 
begin
	insert into a2demo.Units(Short, [Name], UserCreated, UserModified)
		values 
		(N'шт.',  N'Штука', 0, 0),
		(N'кг.',  N'Килограмм', 0, 0),
		(N'л.',   N'Литр', 0, 0),
		(N'пач.', N'Пачка', 0, 0),
		(N'м.',   N'Метр', 0, 0);
end
go
------------------------------------------------
if not exists(select * from a2demo.Agents where Kind=N'Warehouse') 
begin
	insert into a2demo.Agents(Kind, [Name], UserCreated, UserModified)
		values 
		(N'Warehouse', N'Основной склад', 0, 0),
		(N'Warehouse', N'Склад материалов', 0, 0);
end
go
------------------------------------------------
if not exists(select * from a2demo.Countries where Code=N'UA') 
begin
	insert into a2demo.Countries(Code, [Name])
		values 
		(N'UA', N'Украина'),
		(N'US', N'Соединенные штаты');
end
go
------------------------------------------------
if not exists(select * from a2demo.Cities) 
begin
	insert into a2demo.Cities(Country, [Name])
		values 
		(N'UA', N'Киев'),
		(N'UA', N'Черновцы'),
		(N'US', N'Редмонд'),
		(N'US', N'Нью-Йорк');
end
go
------------------------------------------------
if not exists(select * from a2demo.Streets) 
begin
	declare @id bigint;

	select @id = Id from a2demo.Cities where Name=N'Киев';
	insert into a2demo.Streets(City, [Name])
		values 
		(@id, N'ул. Крещатик'),
		(@id, N'ул. Б. Васильковская')
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'TestXml.Report')
	drop procedure a2demo.[TestXml.Report]
go
------------------------------------------------
create procedure a2demo.[TestXml.Report]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select top (1) [Report!TReport!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Memo, [Url], Icon
	from a2demo.Catalogs 
	order by Id;

	select [DECLAR!!Json] = 
N'{
	"DECLARHEAD": {
		"TIN":"112233",
		"C_DOC": "F01",
		"C_DOC_SUB": "033",
		"C_DOC_VER" : 6,
		"C_DOC_TYPE": 7,
		"C_DOC_CNT": 0,
		"C_REG": "223344",
		"C_RAJ": "223344"
	}
}';

	select [Params!TParam!Object] = null, [Name] = N'newreport';
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'ConfirmPhone.Load')
	drop procedure a2demo.[ConfirmPhone.Load]
go
------------------------------------------------
create procedure a2demo.[ConfirmPhone.Load]
	@TenantId int = null,
	@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [User!TUser!Object] = null, [Id!!Id] = Id, PhoneNumber = PhoneNumber, VerifyCode = cast(null as nvarchar(255))
	from a2security.Users
	where Id=@UserId
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Inbox.Index')
	drop procedure a2demo.[Inbox.Index]
go
------------------------------------------------
create procedure a2demo.[Inbox.Index]
	@TenantId int = null,
	@UserId bigint,
	@Offset int = 0,
	@PageSize int = 20,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(20) = N'desc',
	@Group nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	-- list of inbox

	with T([Id!!Id], [ProcessId], [Bookmark], [Action], [For], [ForId], [Text], DateCreated,
		[!!RowNumber])
	as(
		select i.Id, ProcessId, Bookmark, [Action], [For], [ForId], [Text], 
			i.DateCreated,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then i.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then i.Id end desc,
				case when @Order=N'Bookmark' and @Dir = @Asc then i.Bookmark end asc,
				case when @Order=N'Bookmark' and @Dir = @Desc  then i.Bookmark end desc
			)
		from a2workflow.Inbox i
		where i.Void = 0
	)
	select [Inbox!TInbox!Array]=null, *,
		[!!RowCount] = (select count(1) from T)
	into #tmp
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize

	select * from #tmp
	order by [!!RowNumber];

	select [!$System!] = null, 
		[!Inbox!PageSize] = @PageSize, 
		[!Inbox!SortOrder] = @Order, 
		[!Inbox!SortDir] = @Dir,
		[!Inbox!Offset] = @Offset,
		[!Inbox!GroupBy] = @Group
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Inbox.Load')
	drop procedure a2demo.[Inbox.Load]
go
------------------------------------------------
create procedure a2demo.[Inbox.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select [Inbox!TInbox!Object]=null, [Id!!Id] = i.Id, [Text], [Bookmark], [Action] = N'sales/waybill/edit', i.DateCreated,
		Model = N'Document', p.ModelId, p.[Schema], [Command] = 'edit'
	from a2workflow.Inbox i
		inner join a2workflow.Processes p on i.ProcessId = p.Id
	where i.Id = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Attachment.Load')
	drop procedure a2demo.[Waybill.Attachment.Load]
go
------------------------------------------------
create procedure a2demo.[Waybill.Attachment.Load]
	@TenantId int = null,
	@UserId bigint,
	@Key nvarchar(255) = null,
	@Id bigint = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select Mime, [Name], Stream = [Data] from 
		a2demo.Attachments a inner join a2demo.DocAttachments da on da.Attachment = a.Id
	where da.Id = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Attachment.LoadPrev')
	drop procedure a2demo.[Waybill.Attachment.LoadPrev]
go
------------------------------------------------
create procedure a2demo.[Waybill.Attachment.LoadPrev]
	@TenantId int = null,
	@UserId bigint,
	@Key nvarchar(255) = null,
	@Id bigint = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select Mime = N'application/octet-stream', [Name] = N'binary', Stream = [SignedData] from 
		a2demo.Attachments a inner join a2demo.DocAttachments da on da.Attachment = a.Id
	where da.Id = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Attachment.SaveSignature')
	drop procedure a2demo.[Waybill.Attachment.SaveSignature]
go
------------------------------------------------
create procedure a2demo.[Waybill.Attachment.SaveSignature]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Key nvarchar(255) = null,
	@Time datetime = null,
	@Stream varbinary(max) = null,
	@Kind nvarchar(255),
	@Issuer nvarchar(255),
	@Subject nvarchar(255),
	@Serial nvarchar(255),
	@Title nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @attId bigint;
	declare @signid bigint;
	select @attId = Attachment from a2demo.DocAttachments where Id = @Id;

	begin tran;
	update a2demo.Attachments set [SignedData] = @Stream where  Id=@attId;

	declare @rtable table (Id bigint);
	select @signId = Id from a2demo.Signatures where Attachment = @attId and [Kind] = @Kind;
	if @signId is null
	begin
		insert into a2demo.Signatures ([User], Attachment, [Kind], UtcTime, Issuer, [Subject], [Serial], Title)
		output inserted.Id into @rtable(Id)
		values (@UserId, @attId, @Kind, @Time, @Issuer, @Subject, @Serial, @Title);
		select top(1) @signId = Id from @rtable;
	end
	else
	begin
		update a2demo.Signatures set UtcTime=@Time, [Subject]=@Subject, [Serial]=@Serial, Title=@Title,
			Issuer = @Issuer, [User] = @UserId
		where Attachment = @attId and Kind = @Kind;
	end
	commit tran;
	select Id = @signId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Attachment.LoadSignature')
	drop procedure a2demo.[Waybill.Attachment.LoadSignature]
go
------------------------------------------------
create procedure a2demo.[Waybill.Attachment.LoadSignature]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Key nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Stream] = [Signature] from a2demo.Signatures where Id = @Id;
end
go
------------------------------------------------
create or alter procedure a2demo.[Empty.Load]
@UserId bigint,
@Id bigint = 0
as
begin
	set nocount on;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'EUSign.Load')
	drop procedure a2demo.[EUSign.Load]
go
------------------------------------------------
create procedure a2demo.[EUSign.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @attId bigint;
	select @attId = Attachment from a2demo.DocAttachments where Id=@Id;
	select [Attachment!TAttachment!Object] = null, [Id] = @Id, [AttId!!Id] = a.Id,
		[Signatures!TSignature!Array] = null, [Keys!TKey!Array] = null
	from a2demo.Attachments a 
	where Id=@attId;

	select [!TSignature!Array] = null, [Id!!Id] = Id, [!TAttachment.Signatures!ParentId]=Attachment,
		[Kind], Issuer, [Subject], [Serial], Title
	from a2demo.Signatures 
	where Attachment = @attId;

	select [!TKey!Array] = null, [!TAttachment.Keys!ParentId] = @attId, [Alias] = cast(null as nvarchar(255))
	where 0 <> 0;
end
go
------------------------------------------------
create or alter procedure a2demo.[Workflow.SetState]
@UserId bigint = null,
@Id bigint = 0,
@Process bigint = 0,
@State nvarchar(255) = null,
@Invox bigint = null
as
begin
	set nocount on;
end
go
------------------------------------------------
create or alter procedure [a2demo].[MessageForSend.Load]
@TargetId bigint = 0,
@ProcessId bigint = 0,
@InboxId bigint = 0
as
begin
	set nocount on;
	select [Message!TMessage!Object] = null, Id=@TargetId, [Text]=N'I am the message text', ProcessId = @ProcessId, InboxId = @InboxId;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'GuidIdItem')
begin
	create table a2demo.GuidIdItem
	(
		Id uniqueidentifier not null 
			constraint PK_GuidIdItem primary key
			constraint DF_GuidIdItem default (newid()),
		[Name] nvarchar(255) null,
		Memo nvarchar(255) null,
		DateCreated datetime not null constraint DF_GuidIdItem_DateCreated default(getutcdate()),
	);
end
go
------------------------------------------------
create or alter procedure a2demo.[TestGuid.Index]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select[Items!TItem!Array] = null, [Id!!Id] = Id, [Name], [Memo],
		[DateCreated!!Utc] = DateCreated
	from a2demo.GuidIdItem;
end
go
------------------------------------------------
create or alter procedure a2demo.[TestGuid.Load]
@UserId bigint,
@Id uniqueidentifier = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select[Item!TItem!Object] = null, [Id!!Id] = Id, [Name], [Memo],
		[DateCreated!!Utc] = DateCreated
	from a2demo.GuidIdItem where Id=@Id;
end
go
------------------------------------------------
drop procedure if exists a2demo.[TestGuid.Update];
drop type if exists a2demo.[GuidIdItem.TableType];
go
------------------------------------------------
create type a2demo.[GuidIdItem.TableType]
as table(
	Id uniqueidentifier null,
	[Name] nvarchar(255),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
create or alter procedure a2demo.[TestGuid.Metadata]
as
begin
	declare @Item a2demo.[GuidIdItem.TableType];
	select [Item!Item!Metadata] = null, * from @Item;
end
go
------------------------------------------------
create or alter procedure a2demo.[TestGuid.Update]
@UserId bigint,
@Item a2demo.[GuidIdItem.TableType] readonly,
@RetId uniqueidentifier = null output 
as
begin
	set nocount on;
	
	declare @output table(op sysname, id uniqueidentifier);

	merge a2demo.GuidIdItem as target
	using @Item as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Memo] = source.Memo
	when not matched by target then 
		insert ([Name], [Memo])
		values ([Name], [Memo])
	output
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	exec a2demo.[TestGuid.Load] @UserId, @RetId;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2demo to public;
end
go
------------------------------------------------
set noexec off;
go
