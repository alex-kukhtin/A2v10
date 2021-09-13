/*
version: 10.0.7779
generated: 13.09.2021 08:47:50
*/

set nocount on;
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2sys')
	exec sp_executesql N'create schema a2sys';
go
-----------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'Versions')
	create table a2sys.Versions
	(
		Module sysname not null constraint PK_Versions primary key,
		[Version] int null,
		[Title] nvarchar(255),
		[File] nvarchar(255)
	);
go
----------------------------------------------
if exists(select * from a2sys.Versions where [Module]=N'script:platform')
	update a2sys.Versions set [Version]=7779, [File]=N'a2v10platform.sql', Title=null where [Module]=N'script:platform';
else
	insert into a2sys.Versions([Module], [Version], [File], Title) values (N'script:platform', 7779, N'a2v10platform.sql', null);
go



/* a2v10platform.sql */

/*
Copyright © 2008-2021 Alex Kukhtin

Last updated : 27 jun 2021
module version : 7061
*/
------------------------------------------------
set nocount on;
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2sys')
begin
	exec sp_executesql N'create schema a2sys';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'Versions')
begin
	create table a2sys.Versions
	(
		Module sysname not null constraint PK_Versions primary key,
		[Version] int null,
		[Title] nvarchar(255),
		[File] nvarchar(255)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'Versions' and COLUMN_NAME=N'Title')
begin
	alter table a2sys.Versions add [Title] nvarchar(255) null;
	alter table a2sys.Versions add [File] nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from a2sys.Versions where Module = N'std:system')
	insert into a2sys.Versions (Module, [Version]) values (N'std:system', 7061);
else
	update a2sys.Versions set [Version] = 7061 where Module = N'std:system';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'SysParams')
begin
	create table a2sys.SysParams
	(
		Name sysname not null constraint PK_SysParams primary key,
		StringValue nvarchar(255) null,
		IntValue int null,
		DateValue datetime null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'SysParams' and COLUMN_NAME=N'DateValue')
begin
	alter table a2sys.SysParams add DateValue datetime null;
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_toUtcDateTime') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2sys.fn_toUtcDateTime;
go
------------------------------------------------
create function a2sys.fn_toUtcDateTime(@date datetime)
returns datetime
as
begin
	declare @mins int;
	set @mins = datediff(minute,getdate(),getutcdate());
	return dateadd(minute, @mins, @date);
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_trimtime') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2sys.fn_trimtime;
go
------------------------------------------------
create function a2sys.fn_trimtime(@dt datetime)
returns datetime
as
begin
	declare @ret datetime;
	declare @f float;
	set @f = cast(@dt as float)
	declare @i int;
	set @i = cast(@f as int);
	set @ret = cast(@i as datetime);
	return @ret;
end
go
------------------------------------------------
if not exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_getCurrentDate') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
exec sp_executesql N'
create function a2sys.fn_getCurrentDate() 
returns datetime 
as begin return getdate(); end';
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_trim') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2sys.fn_trim;
go
------------------------------------------------
create function a2sys.fn_trim(@value nvarchar(max))
returns nvarchar(max)
as
begin
	return ltrim(rtrim(@value));
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_string2table') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2sys.fn_string2table;
go
------------------------------------------------
create function a2sys.fn_string2table(@var nvarchar(max), @delim nchar(1))
	returns @ret table(VAL nvarchar(max))
as
begin
	select @var = @var + @delim; -- sure delim

	declare @pos int, @start int;
	declare @sub nvarchar(255);

	set @start = 1;
	set @pos   = charindex(@delim, @var, @start);

	while @pos <> 0
		begin
			set @sub = ltrim(rtrim(substring(@var, @start, @pos-@start)));

			if @sub <> N''
				insert into @ret(VAL) values (@sub);

			set @start = @pos + 1;
			set @pos   = charindex(@delim, @var, @start);
		end
	return;
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2sys.fn_string2table_count') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2sys.fn_string2table_count;
go
------------------------------------------------
create function a2sys.fn_string2table_count(@var nvarchar(max), @count int)
	returns @ret table(RowNo int, VAL nvarchar(max))
as
begin

	declare @start int;
	declare @RowNo int;
	declare @sub nvarchar(255);

	set @start = 1;
	set @RowNo = 1;

	while @start <= len(@var)
		begin
			set @sub = substring(@var, @start, @count);

			if @sub <> N''
				insert into @ret(RowNo, VAL) values (@RowNo, @sub);

			set @start = @start + @count;
			set @RowNo = @RowNo + 1;
		end
	return;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'AppFiles')
begin
create table a2sys.AppFiles (
	[Path] nvarchar(255) not null constraint PK_AppFiles primary key,
	Stream nvarchar(max) null,
	DateModified datetime constraint DF_AppFiles_DateModified default(a2sys.fn_getCurrentDate())
)	
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'Id.TableType' and DATA_TYPE=N'table type')
begin
	create type a2sys.[Id.TableType]
	as table(
		Id bigint null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'GUID.TableType' and DATA_TYPE=N'table type')
begin
	create type a2sys.[GUID.TableType]
	as table(
		Id uniqueidentifier null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'NameValue.TableType' and DATA_TYPE=N'table type')
begin
	create type a2sys.[NameValue.TableType]
	as table(
		[Name] nvarchar(255),
		[Value] nvarchar(max)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'Kind.TableType' and DATA_TYPE=N'table type')
begin
	create type a2sys.[Kind.TableType]
	as table(
		Kind nchar(4) null
	);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'GetVersions')
	drop procedure a2sys.[GetVersions]
go
------------------------------------------------
create procedure a2sys.[GetVersions]
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Module], [Version], [File], [Title] from a2sys.Versions;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'SetVersion')
	drop procedure a2sys.[SetVersion]
go
------------------------------------------------
create procedure a2sys.[SetVersion]
@Module nvarchar(255),
@Version int
as
begin
	set nocount on;
	set transaction isolation level read committed;
	if not exists(select * from a2sys.Versions where Module = @Module)
		insert into a2sys.Versions (Module, [Version]) values (@Module, @Version);
	else
		update a2sys.Versions set [Version] = @Version where Module = @Module;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'LoadApplicationFile')
	drop procedure [a2sys].[LoadApplicationFile]
go
------------------------------------------------
create procedure [a2sys].[LoadApplicationFile]
	@Path nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Path], Stream from a2sys.AppFiles where [Path] = @Path;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'UploadApplicationFile')
	drop procedure [a2sys].[UploadApplicationFile]
go
------------------------------------------------
create procedure [a2sys].[UploadApplicationFile]
@Path nvarchar(255),
@Stream nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	update a2sys.AppFiles set Stream = @Stream, DateModified = a2sys.fn_getCurrentDate() where [Path] = @Path;

	if @@rowcount = 0
		insert into a2sys.AppFiles([Path], Stream)
		values (@Path, @Stream);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'DbEvents')
begin
create table a2sys.DbEvents 
(
	[Id] uniqueidentifier not null constraint PK_DbEvents primary key
	constraint DF_DbEvents_Id default newid(),
	ItemId bigint,
	[Path] nvarchar(255),
	[Command] nvarchar(255),
	[Source] nvarchar(255),
	[State] nvarchar(32) constraint DF_DbEvents_State default N'Init',
	DateCreated datetime constraint DF_DbEvents_DateCreated default(a2sys.fn_getCurrentDate()),
	DateHold datetime,
	DateComplete datetime,
	[JsonParams] nvarchar(1024) sparse,
	ErrorMessage nvarchar(1024) sparse
)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'DbEvents' and COLUMN_NAME=N'Source')
begin
	alter table a2sys.DbEvents add [Source] nvarchar(255);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'DbEvent.Add')
	drop procedure a2sys.[DbEvent.Add]
go
------------------------------------------------
create procedure a2sys.[DbEvent.Add]
@ItemId bigint,
@Path nvarchar(255),
@Command nvarchar(255),
@Source nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	insert into a2sys.DbEvents(ItemId, [Path], Command, [Source]) values
		(@ItemId, @Path, @Command, @Source);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'DbEvent.Fetch')
	drop procedure a2sys.[DbEvent.Fetch]
go
------------------------------------------------
create procedure a2sys.[DbEvent.Fetch]
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @rtable table(Id uniqueidentifier, ItemId bigint, [Path] nvarchar(255),
		[JsonParams] nvarchar(1024), Command nvarchar(255), [Source] nvarchar(255));

	update a2sys.DbEvents set [State] = N'Hold', DateHold = a2sys.fn_getCurrentDate()
	output inserted.Id, inserted.ItemId, inserted.[Path], inserted.Command, inserted.JsonParams, inserted.[Source]
	into @rtable(Id, ItemId, [Path], Command, JsonParams, [Source])
	where [State] = N'Init';

	select [Id], ItemId, [Path], Command, [Source], JsonParams from @rtable;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'DbEvent.Error')
	drop procedure a2sys.[DbEvent.Error]
go
------------------------------------------------
create procedure a2sys.[DbEvent.Error]
@Id uniqueidentifier,
@ErrorMessage nvarchar(1024) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2sys.[DbEvents] set [State]=N'Fail', 
		ErrorMessage = @ErrorMessage, DateComplete = a2sys.fn_getCurrentDate()
	where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'DbEvent.Complete')
	drop procedure a2sys.[DbEvent.Complete]
go
------------------------------------------------
create procedure a2sys.[DbEvent.Complete]
@Id uniqueidentifier
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2sys.[DbEvents] set [State]=N'Complete', DateComplete = a2sys.fn_getCurrentDate()
	where Id=@Id;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2sys to public;
end
go
------------------------------------------------
go


/*
------------------------------------------------
Copyright © 2008-2021 Alex Kukhtin

Last updated : 12 sep 2021
module version : 7768
*/
------------------------------------------------
exec a2sys.SetVersion N'std:security', 7768;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2security')
begin
	exec sp_executesql N'create schema a2security';
end
go
------------------------------------------------
-- a2security schema
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Tenants')
	create sequence a2security.SQ_Tenants as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants')
begin
	create table a2security.Tenants
	(
		Id	int not null constraint PK_Tenants primary key
			constraint DF_Tenants_PK default(next value for a2security.SQ_Tenants),
		[Admin] bigint null, -- admin user ID
		[Source] nvarchar(255) null,
		[TransactionCount] bigint not null constraint DF_Tenants_TransactionCount default(0),
		LastTransactionDate datetime null,
		DateCreated datetime not null constraint DF_Tenants_UtcDateCreated2 default(a2sys.fn_getCurrentDate()),
		TrialPeriodExpired datetime null,
		DataSize float null,
		[State] nvarchar(128) null,
		UserSince datetime null,
		LastPaymentDate datetime null,
		Balance money null,
		[Locale] nvarchar(32) not null constraint DF_Tenants_Locale default('uk-UA')
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'Locale')
	alter table a2security.Tenants add [Locale] nvarchar(32) not null constraint DF_Tenants_Locale default('uk-UA');
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Config')
begin
	create table a2security.Config
	(
		[Key] sysname not null constraint PK_Config primary key,
		[Value] nvarchar(255) not null,
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Tenants') and name = N'IX_Tenants_Admin')
	create index IX_Tenants_Admin on a2security.Tenants ([Admin]) include (Id);
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Tenants_UtcDateCreated' and parent_object_id = object_id(N'a2security.Tenants'))
begin
	alter table a2security.Tenants drop constraint DF_Tenants_UtcDateCreated;
	alter table a2security.Tenants add constraint DF_Tenants_UtcDateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'TransactionCount')
begin
	alter table a2security.Tenants add [TransactionCount] bigint not null constraint DF_Tenants_TransactionCount default(0);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'TrialPeriodExpired')
begin
	alter table a2security.Tenants add TrialPeriodExpired datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'LastTransactionDate')
begin
	alter table a2security.Tenants add [LastTransactionDate] datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'LastPaymentDate')
begin
	alter table a2security.Tenants add LastPaymentDate datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'Balance')
begin
	alter table a2security.Tenants add Balance money null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'DataSize')
	alter table a2security.Tenants add DataSize float null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'State')
	alter table a2security.Tenants add [State] nvarchar(128) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'UserSince')
	alter table a2security.Tenants add UserSince datetime null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Users')
	create sequence a2security.SQ_Users as bigint start with 100 increment by 1;
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_GetCurrentSegment') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_GetCurrentSegment;
go
------------------------------------------------
create function a2security.fn_GetCurrentSegment()
returns nvarchar(32)
as
begin
	declare @ret nvarchar(32);
	select @ret = [Value] from a2security.Config where [Key] = N'CurrentSegment';
	return @ret;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Modules')
begin
	create table a2security.Modules
	(
		[Id] nvarchar(16) not null constraint PK_Modules primary key,
		[Name] nvarchar(255) not null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users')
begin
	create table a2security.Users
	(
		Id	bigint not null constraint PK_Users primary key
			constraint DF_Users_PK default(next value for a2security.SQ_Users),
		Tenant int null 
			constraint FK_Users_Tenant_Tenants foreign key references a2security.Tenants(Id),
		UserName nvarchar(255) not null constraint UNQ_Users_UserName unique,
		DomainUser nvarchar(255) null,
		Void bit not null constraint DF_Users_Void default(0),
		SecurityStamp nvarchar(max) not null,
		PasswordHash nvarchar(max) null,
		/*for .net core compatibility*/
		SecurityStamp2 nvarchar(max) null,
		PasswordHash2 nvarchar(max) null,
		ApiUser bit not null constraint DF_Users_ApiUser default(0),
		TwoFactorEnabled bit not null constraint DF_Users_TwoFactorEnabled default(0),
		Email nvarchar(255) null,
		EmailConfirmed bit not null constraint DF_Users_EmailConfirmed default(0),
		PhoneNumber nvarchar(255) null,
		PhoneNumberConfirmed bit not null constraint DF_Users_PhoneNumberConfirmed default(0),
		LockoutEnabled	bit	not null constraint DF_Users_LockoutEnabled default(1),
		LockoutEndDateUtc datetimeoffset null,
		AccessFailedCount int not null constraint DF_Users_AccessFailedCount default(0),
		[Locale] nvarchar(32) not null constraint DF_Users_Locale2 default('uk-UA'),
		PersonName nvarchar(255) null,
		LastLoginDate datetime null, /*UTC*/
		LastLoginHost nvarchar(255) null,
		Memo nvarchar(255) null,
		ChangePasswordEnabled bit not null constraint DF_Users_ChangePasswordEnabled default(1),
		RegisterHost nvarchar(255) null,
		TariffPlan nvarchar(255) null,
		[Guid] uniqueidentifier null,
		Referral bigint null,
		Segment nvarchar(32) null,
		Company bigint null,
			-- constraint FK_Users_Company_Companies foreign key references a2security.Companies(Id)
		DateCreated datetime null
			constraint DF_Users_DateCreated default(a2sys.fn_getCurrentDate()),
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'SecurityStamp2')
begin
	alter table a2security.Users add SecurityStamp2 nvarchar(max) null;
	alter table a2security.Users add PasswordHash2 nvarchar(max) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'DateCreated')
	alter table a2security.Users add DateCreated datetime null
			constraint DF_Users_DateCreated default(a2sys.fn_getCurrentDate());
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'ApiUser')
	alter table a2security.Users add ApiUser bit not null 
		constraint DF_Users_ApiUser default(0) with values;
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Users_Locale' and parent_object_id = object_id(N'a2security.Users'))
begin
	alter table a2security.Users drop constraint DF_Users_Locale;
	alter table a2security.Users add constraint DF_Users_Locale2 default('uk-UA') for [Locale] with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Company')
begin
	alter table a2security.Users add Company bigint null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserLogins')
begin
	create table a2security.UserLogins
	(
		[User] bigint not null 
			constraint FK_UserLogins_User_Users foreign key references a2security.Users(Id),
		[LoginProvider] nvarchar(255) not null,
		[ProviderKey] nvarchar(max) not null,
		constraint PK_UserLogins primary key([User], LoginProvider) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Users add Void bit not null constraint DF_Users_Void default(0) with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'DomainUser')
begin
	alter table a2security.Users add DomainUser nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'ChangePasswordEnabled')
begin
	alter table a2security.Users add ChangePasswordEnabled bit not null constraint DF_Users_ChangePasswordEnabled default(1) with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'LastLoginDate')
begin
	alter table a2security.Users add LastLoginDate datetime null;
	alter table a2security.Users add LastLoginHost nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'RegisterHost')
begin
	alter table a2security.Users add RegisterHost nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'TariffPlan')
begin
	alter table a2security.Users add TariffPlan nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Guid')
begin
	alter table a2security.Users add [Guid] uniqueidentifier null
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Referral')
begin
	alter table a2security.Users add Referral bigint null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Segment')
begin
	alter table a2security.Users add Segment nvarchar(32) null;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Users') and name = N'UNQ_Users_DomainUser')
	create unique index UNQ_Users_DomainUser on a2security.Users(DomainUser) where DomainUser is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Tenant')
begin
	alter table a2security.Users add Tenant int null 
			constraint FK_Users_Tenant_Tenants foreign key references a2security.Tenants(Id);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Groups')
	create sequence a2security.SQ_Groups as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Groups')
begin
	create table a2security.Groups
	(
		Id	bigint not null constraint PK_Groups primary key
			constraint DF_Groups_PK default(next value for a2security.SQ_Groups),
		Void bit not null constraint DF_Groups_Void default(0),				
		[Name] nvarchar(255) not null constraint UNQ_Groups_Name unique,
		[Key] nvarchar(255) null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Groups' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Groups add Void bit not null constraint DF_Groups_Void default(0) with values;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Groups') and name = N'UNQ_Group_Key')
	create unique index UNQ_Group_Key on a2security.Groups([Key]) where [Key] is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserGroups')
begin
	-- user groups
	create table a2security.UserGroups
	(
		UserId	bigint	not null
			constraint FK_UserGroups_UsersId_Users foreign key references a2security.Users(Id),
		GroupId bigint	not null
			constraint FK_UserGroups_GroupId_Groups foreign key references a2security.Groups(Id),
		constraint PK_UserGroups primary key clustered (UserId, GroupId) with (fillfactor = 70)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Roles')
	create sequence a2security.SQ_Roles as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Roles')
begin
	create table a2security.Roles
	(
		Id	bigint not null constraint PK_Roles primary key
			constraint DF_Roles_PK default(next value for a2security.SQ_Roles),
		Void bit not null constraint DF_Roles_Void default(0),				
		[Name] nvarchar(255) not null constraint UNQ_Roles_Name unique,
		[Key] nvarchar(255) null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Roles' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Roles add Void bit not null constraint DF_Roles_Void default(0) with values;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Roles') and name = N'UNQ_Role_Key')
	create unique index UNQ_Role_Key on a2security.Roles([Key]) where [Key] is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_UserRoles')
	create sequence a2security.SQ_UserRoles as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserRoles')
begin
	create table a2security.UserRoles
	(
		Id	bigint	not null constraint PK_UserRoles primary key
			constraint DF_UserRoles_PK default(next value for a2security.SQ_UserRoles),
		RoleId bigint null
			constraint FK_UserRoles_RoleId_Roles foreign key references a2security.Roles(Id),
		UserId	bigint	null
			constraint FK_UserRoles_UserId_Users foreign key references a2security.Users(Id),
		GroupId bigint null 
			constraint FK_UserRoles_GroupId_Groups foreign key references a2security.Groups(Id)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ApiUserLogins')
begin
	create table a2security.ApiUserLogins
	(
		[User] bigint not null 
			constraint FK_ApiUserLogins_User_Users foreign key references a2security.Users(Id),
		[Mode] nvarchar(16) not null, -- ApiKey, OAuth2, JWT
		[ClientId] nvarchar(255),
		[ClientSecret] nvarchar(255),
		[ApiKey] nvarchar(255),
		[AllowIP] nvarchar(1024),
		Memo nvarchar(255),
		RedirectUrl nvarchar(255),
		[DateModified] datetime not null constraint DF_ApiUserLogins_DateModified default(a2sys.fn_getCurrentDate()),
		constraint PK_ApiUserLogins primary key clustered ([User], Mode) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ApiUserLogins' and COLUMN_NAME=N'RedirectUrl')
	alter table a2security.ApiUserLogins add RedirectUrl nvarchar(255);
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.ApiUserLogins') and name = N'UNQ_ApiUserLogins_ApiKey')
	create unique index UNQ_ApiUserLogins_ApiKey on a2security.ApiUserLogins(ApiKey) where ApiKey is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Acl')
	create sequence a2security.SQ_Acl as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Acl')
begin
	-- access control list
	create table a2security.[Acl]
	(
		Id	bigint not null constraint PK_Acl primary key
			constraint DF_Acl_PK default(next value for a2security.SQ_Acl),
		[Object] sysname not null,
		[ObjectId] bigint null,
		[ObjectKey] nvarchar(16) null,
		UserId bigint null 
			constraint FK_Acl_UserId_Users foreign key references a2security.Users(Id),
		GroupId bigint null 
			constraint FK_Acl_GroupId_Groups foreign key references a2security.Groups(Id),
		CanView smallint not null	-- 0
			constraint CK_Acl_CanView check(CanView in (0, 1, -1))
			constraint DF_Acl_CanView default(0),
		CanEdit smallint not null	-- 1
			constraint CK_Acl_CanEdit check(CanEdit in (0, 1, -1))
			constraint DF_Acl_CanEdit default(0),
		CanDelete smallint not null	-- 2
			constraint CK_Acl_CanDelete check(CanDelete in (0, 1, -1))
			constraint DF_Acl_CanDelete default(0),
		CanApply smallint not null	-- 3
			constraint CK_Acl_CanApply check(CanApply in (0, 1, -1))
			constraint DF_Acl_CanApply default(0)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Module.Acl')
begin
	-- ACL for Module
	create table a2security.[Module.Acl]
	(
		Module nvarchar(16) not null 
			constraint FK_ModuleAcl_Modules foreign key references a2security.Modules(Id),
		UserId bigint not null 
			constraint FK_ModuleAcl_UserId_Users foreign key references a2security.Users(Id),
		CanView bit null,
		CanEdit bit null,
		CanDelete bit null,
		CanApply bit null,
		[Permissions] as cast(CanView as int) + cast(CanEdit as int) * 2 + cast(CanDelete as int) * 4 + cast(CanApply as int) * 8
		constraint PK_ModuleAcl primary key clustered (Module, UserId) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Acl' and COLUMN_NAME = N'ObjectId' and IS_NULLABLE=N'NO')
	alter table a2security.[Acl] alter column [ObjectId] bigint null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = N'a2security' and TABLE_NAME = N'Acl' and COLUMN_NAME = N'ObjectKey')
	alter table a2security.[Acl] add [ObjectKey] nvarchar(16) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'LogCodes')
create table a2security.[LogCodes]
(
	Code int not null constraint PK_LogCodes primary key,
	[Name] nvarchar(32) not null
);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log')
begin
	create table a2security.[Log]
	(
		Id	bigint not null identity(100, 1) constraint PK_Log primary key,
		UserId bigint not null
			constraint FK_Log_UserId_Users foreign key references a2security.Users(Id),
		Code int not null
			constraint FK_Log_Code_Codes foreign key references a2security.LogCodes(Code),
		EventTime	datetime not null
			constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()),
		Severity nchar(1) not null,
		Host nvarchar(255) null,
		[Message] nvarchar(max) sparse null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Code')
begin
	alter table a2security.[Log] add Code int not null
		constraint FK_Log_Code_Codes foreign key references a2security.LogCodes(Code);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Host')
	alter table a2security.[Log] add Host nvarchar(255) null;
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Log_UtcEventTime' and parent_object_id = object_id(N'a2security.Log'))
begin
	alter table a2security.[Log] drop constraint DF_Log_UtcEventTime;
	alter table a2security.[Log] add constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()) for EventTime with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Referrals')
	create sequence a2security.SQ_Referrals as bigint start with 1000 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Referrals')
begin
	create table a2security.Referrals
	(
		Id	bigint not null constraint PK_Referrals primary key
			constraint DF_Referrals_PK default(next value for a2security.SQ_Referrals),
		Void bit not null constraint DF_Referrals_Void default(0),				
		[Type] nchar(1) not null, /* (S)ystem, (C)ustomer */
		[Link] nvarchar(255) not null constraint UNQ_Referrals_Link unique,
		UserCreated bigint not null
			constraint FK_Referrals_UserCreated_Users foreign key references a2security.Users(Id),
		DateCreated	datetime not null
			constraint DF_Referrals_DateCreated2 default(a2sys.fn_getCurrentDate()),
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Analytics')
begin
	create table a2security.Analytics
	(
		UserId bigint not null constraint PK_Analytics primary key
			constraint FK_Analytics_UserId_Users foreign key references a2security.Users(Id),
		[Value] nvarchar(max) null,
		DateCreated	datetime not null
			constraint DF_Analytics_DateCreated2 default(a2sys.fn_getCurrentDate()),
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'AnalyticTags')
begin
	create table a2security.AnalyticTags
	(
		UserId bigint not null
			constraint FK_AnalyticTags_UserId_Users foreign key references a2security.Users(Id),
		[Name] nvarchar(255),
		[Value] nvarchar(max) null,
			constraint PK_AnalyticTags primary key clustered (UserId, [Name]) with (fillfactor = 70)
	)
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateCreated' and parent_object_id = object_id(N'a2security.Referrals'))
begin
	alter table a2security.Referrals drop constraint DF_Referrals_DateCreated;
	alter table a2security.Referrals add constraint DF_Referrals_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS where CONSTRAINT_SCHEMA = N'a2security' and CONSTRAINT_NAME = N'FK_Users_Referral_Referrals')
begin
	alter table a2security.Users add constraint FK_Users_Referral_Referrals foreign key (Referral) references a2security.Referrals(Id);
end
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.VIEWS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ViewUsers')
begin
	drop view a2security.ViewUsers;
end
go
------------------------------------------------
create view a2security.ViewUsers
as
	select Id, UserName, DomainUser, PasswordHash, SecurityStamp, Email, PhoneNumber,
		LockoutEnabled, AccessFailedCount, LockoutEndDateUtc, TwoFactorEnabled, [Locale],
		PersonName, Memo, Void, LastLoginDate, LastLoginHost, Tenant, EmailConfirmed,
		PhoneNumberConfirmed, RegisterHost, ChangePasswordEnabled, TariffPlan, Segment,
		IsAdmin = cast(case when ug.GroupId = 77 /*predefined: admins*/ then 1 else 0 end as bit),
		IsTenantAdmin = cast(case when exists(select * from a2security.Tenants where [Admin] = u.Id) then 1 else 0 end as bit),
		SecurityStamp2, PasswordHash2, Company
	from a2security.Users u
		left join a2security.UserGroups ug on u.Id = ug.UserId and ug.GroupId=77 /*predefined: admins*/
	where Void=0 and Id <> 0 and ApiUser = 0;
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_isUserTenantAdmin') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_isUserTenantAdmin;
go
------------------------------------------------
create function a2security.fn_isUserTenantAdmin(@TenantId int, @UserId bigint)
returns bit
as
begin
	return case when 
		exists(select * from a2security.Tenants where Id = @TenantId and [Admin] = @UserId) then 1 
	else 0 end;
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_isUserAdmin') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_isUserAdmin;
go
------------------------------------------------
create function a2security.fn_isUserAdmin(@UserId bigint)
returns bit
as
begin
	return case when 
		exists(select * from a2security.UserGroups where GroupId=77 /*predefined: admins */ and UserId = @UserId) then 1 
	else 0 end;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'WriteLog')
	drop procedure a2security.[WriteLog]
go
------------------------------------------------
create procedure [a2security].[WriteLog]
	@UserId bigint = null,
	@SeverityChar nchar(1),
	@Code int = null,
	@Message nvarchar(max) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	insert into a2security.[Log] (UserId, Severity, [Code] , [Message]) 
		values (isnull(@UserId, 0 /*system user*/), @SeverityChar, @Code, @Message);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserById')
	drop procedure a2security.FindUserById
go
------------------------------------------------
create procedure a2security.FindUserById
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByName')
	drop procedure a2security.FindUserByName
go
------------------------------------------------
create procedure a2security.FindUserByName
@UserName nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where UserName=@UserName;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByEmail')
	drop procedure a2security.FindUserByEmail
go
------------------------------------------------
create procedure a2security.FindUserByEmail
@Email nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where Email=@Email;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByPhoneNumber')
	drop procedure a2security.FindUserByPhoneNumber
go
------------------------------------------------
create procedure a2security.FindUserByPhoneNumber
@PhoneNumber nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where PhoneNumber=@PhoneNumber;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByLogin')
	drop procedure a2security.FindUserByLogin
go
------------------------------------------------
create procedure a2security.[FindUserByLogin]
@LoginProvider nvarchar(255),
@ProviderKey nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @UserId bigint;

	select @UserId = [User] from a2security.UserLogins where LoginProvider = @LoginProvider and ProviderKey = @ProviderKey;

	select * from a2security.ViewUsers where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'AddUserLogin')
	drop procedure a2security.[AddUserLogin]
go
------------------------------------------------
create procedure a2security.AddUserLogin
@UserId bigint,
@LoginProvider nvarchar(255),
@ProviderKey nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if not exists(select * from a2security.UserLogins where [User]=@UserId and LoginProvider=@LoginProvider)
	begin
		insert into a2security.UserLogins([User], [LoginProvider], [ProviderKey]) 
			values (@UserId, @LoginProvider, @ProviderKey);
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindApiUserByApiKey')
	drop procedure a2security.FindApiUserByApiKey
go
------------------------------------------------
create procedure a2security.FindApiUserByApiKey
@Host nvarchar(255) = null,
@ApiKey nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @status nvarchar(255);
	declare @code int;

	set @status = N'ApiKey=' + @ApiKey;
	set @code = 65; /*fail*/

	declare @user table(Id bigint, Tenant int, Segment nvarchar(255), [Name] nvarchar(255), ClientId nvarchar(255), AllowIP nvarchar(255));
	insert into @user(Id, Tenant, Segment, [Name], ClientId, AllowIP)
	select top(1) u.Id, u.Tenant, Segment, [Name]=u.UserName, s.ClientId, s.AllowIP 
	from a2security.Users u inner join a2security.ApiUserLogins s on u.Id = s.[User]
	where u.Void=0 and s.Mode = N'ApiKey' and s.ApiKey=@ApiKey;
	
	if @@rowcount > 0 
	begin
		set @code = 64 /*sucess*/;
		update a2security.Users set LastLoginDate=getutcdate(), LastLoginHost=@Host
		from @user t inner join a2security.Users u on t.Id = u.Id;
	end

	insert into a2security.[Log] (UserId, Severity, Code, Host, [Message])
		values (0, N'I', @code, @Host, @status);

	select * from @user;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindApiUserByBasic')
	drop procedure a2security.FindApiUserByBasic
go
------------------------------------------------
create procedure a2security.FindApiUserByBasic
@Host nvarchar(255) = null,
@ClientId nvarchar(255) = null,
@ClientSecret nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @status nvarchar(255);
	declare @code int;

	set @status = N'Basic=' + @ClientId;
	set @code = 65; /*fail*/

	declare @usertable table(Id bigint, Tenant int, Segment nvarchar(255), [Name] nvarchar(255), ClientId nvarchar(255), AllowIP nvarchar(255));

	insert into @usertable(Id, Tenant, Segment, [Name], ClientId, AllowIP)
	select top(1) u.Id, u.Tenant, Segment, [Name]=u.UserName, s.ClientId, s.AllowIP 
	from a2security.Users u inner join a2security.ApiUserLogins s on u.Id = s.[User]
	where u.Void=0 and s.Mode = N'Basic' and s.ClientId = @ClientId and s.ClientSecret = @ClientSecret;
	
	if @@rowcount > 0 
	begin
		set @code = 64 /*sucess*/;
		update a2security.Users set LastLoginDate=getutcdate(), LastLoginHost=@Host
			from @usertable t inner join a2security.Users u on t.Id = u.Id;
	end

	insert into a2security.[Log] (UserId, Severity, Code, Host, [Message])
		values (0, N'I', @code, @Host, @status);

	select * from @usertable;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserPassword')
	drop procedure a2security.UpdateUserPassword
go
------------------------------------------------
create procedure a2security.UpdateUserPassword
@Id bigint,
@PasswordHash nvarchar(max),
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set PasswordHash = @PasswordHash, SecurityStamp = @SecurityStamp where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 15; /*PasswordUpdated*/
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserLockout')
	drop procedure a2security.UpdateUserLockout
go
------------------------------------------------
create procedure a2security.UpdateUserLockout
@Id bigint,
@AccessFailedCount int,
@LockoutEndDateUtc datetimeoffset
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set 
		AccessFailedCount = @AccessFailedCount, LockoutEndDateUtc = @LockoutEndDateUtc
	where Id=@Id;
	declare @msg nvarchar(255);
	set @msg = N'AccessFailedCount: ' + cast(@AccessFailedCount as nvarchar(255));
	exec a2security.[WriteLog] @Id, N'E', 18, /*AccessFailedCount*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserLogin')
	drop procedure a2security.UpdateUserLogin
go
------------------------------------------------
create procedure a2security.UpdateUserLogin
@Id bigint,
@LastLoginDate datetime,
@LastLoginHost nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set LastLoginDate = @LastLoginDate, LastLoginHost = @LastLoginHost where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 1; /*Login*/
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'ConfirmEmail')
	drop procedure a2security.ConfirmEmail
go
------------------------------------------------
create procedure a2security.ConfirmEmail
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set EmailConfirmed = 1 where Id=@Id;

	declare @msg nvarchar(255);
	select @msg = N'Email: ' + Email from a2security.ViewUsers where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 26, /*EmailConfirmed*/ @msg;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'ConfirmPhoneNumber')
	drop procedure a2security.ConfirmPhoneNumber
go
------------------------------------------------
create procedure a2security.ConfirmPhoneNumber
@Id bigint,
@PhoneNumber nvarchar(255),
@PhoneNumberConfirmed bit,
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set PhoneNumber = @PhoneNumber,
		PhoneNumberConfirmed = @PhoneNumberConfirmed, SecurityStamp=@SecurityStamp
	where Id=@Id;

	declare @msg nvarchar(255);
	set @msg = N'PhoneNumber: ' + @PhoneNumber;
	exec a2security.[WriteLog] @Id, N'I', 27, /*PhoneNumberConfirmed*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'GetUserGroups')
	drop procedure a2security.GetUserGroups
go
------------------------------------------------
create procedure a2security.GetUserGroups
@UserId bigint
as
begin
	set nocount on;
	select g.Id, g.[Name], g.[Key]
	from a2security.UserGroups ug
		inner join a2security.Groups g on ug.GroupId = g.Id
	where ug.UserId = @UserId and g.Void=0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateUserInfo')
	drop procedure [a2security].[Permission.UpdateUserInfo]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateUserInfo]
as
begin
	set nocount on;
	declare @procName sysname;
	declare @sqlProc sysname;
	declare #tmpcrs cursor local fast_forward read_only for
		select ROUTINE_NAME from INFORMATION_SCHEMA.ROUTINES 
			where ROUTINE_SCHEMA = N'a2security' and ROUTINE_NAME like N'Permission.UpdateAcl.%';
	open #tmpcrs;
	fetch next from #tmpcrs into @procName;
	while @@fetch_status = 0
	begin
		set @sqlProc = N'a2security.[' + @procName + N']';
		exec sp_executesql @sqlProc;
		fetch next from #tmpcrs into @procName;
	end
	close #tmpcrs;
	deallocate #tmpcrs;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'CreateUser')
	drop procedure a2security.CreateUser
go
------------------------------------------------
create procedure a2security.CreateUser
@UserName nvarchar(255),
@PasswordHash nvarchar(max) = null,
@SecurityStamp nvarchar(max),
@Email nvarchar(255) = null,
@PhoneNumber nvarchar(255) = null,
@Tenant int = null,
@PersonName nvarchar(255) = null,
@RegisterHost nvarchar(255) = null,
@Memo nvarchar(255) = null,
@TariffPlan nvarchar(255) = null,
@Locale nvarchar(255) = null,
@RetId bigint output
as
begin
	-- from account/register only
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	
	set @Locale = isnull(@Locale, N'uk-UA')

	declare @userId bigint; 

	if @Tenant = -1
	begin
		declare @tenants table(id int);
		declare @users table(id bigint);
		declare @tenantId int;

		begin tran;
		insert into a2security.Tenants([Admin], Locale)
			output inserted.Id into @tenants(id)
		values (null, @Locale);

		select top(1) @tenantId = id from @tenants;

		insert into a2security.ViewUsers(UserName, PasswordHash, SecurityStamp, Email, PhoneNumber, Tenant, PersonName, 
			RegisterHost, Memo, TariffPlan, Segment, Locale)
			output inserted.Id into @users(id)
			values (@UserName, @PasswordHash, @SecurityStamp, @Email, @PhoneNumber, @tenantId, @PersonName, 
				@RegisterHost, @Memo, @TariffPlan, a2security.fn_GetCurrentSegment(), @Locale);
		select top(1) @userId = id from @users;

		update a2security.Tenants set [Admin] = @userId where Id=@tenantId;

		insert into a2security.UserGroups(UserId, GroupId) values (@userId, 1 /*all users*/);

		if exists(select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA = N'a2security' and ROUTINE_NAME=N'OnCreateNewUser')
		begin
			declare @sql nvarchar(255);
			declare @prms nvarchar(255);
			set @sql = N'a2security.OnCreateNewUser @TenantId, @CompanyId, @UserId';
			set @prms = N'@TenantId int, @CompanyId bigint, @UserId bigint';
			exec sp_executesql @sql, @prms, @tenantId, 1, @userId;
		end
		commit tran;
	end
	else
	begin
		begin tran;

		insert into a2security.ViewUsers(UserName, PasswordHash, SecurityStamp, Email, PhoneNumber, PersonName, RegisterHost, Memo, TariffPlan, Locale)
			output inserted.Id into @users(id)
			values (@UserName, @PasswordHash, @SecurityStamp, @Email, @PhoneNumber, @PersonName, @RegisterHost, @Memo, @TariffPlan, @Locale);
		select top(1) @userId = id from @users;

		insert into a2security.UserGroups(UserId, GroupId) values (@userId, 1 /*all users*/);
		commit tran;

		exec a2security.[Permission.UpdateUserInfo];

	end
	set @RetId = @userId;

	declare @msg nvarchar(255);
	set @msg = N'User: ' + @UserName;
	exec a2security.[WriteLog] @RetId, N'I', 2, /*UserCreated*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check')
	drop procedure a2security.[Permission.Check]
go
------------------------------------------------
create procedure a2security.[Permission.Check]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255),
	@CanEdit bit = null output,
	@CanDelete bit = null output,
	@CanApply bit = null output,
	@Permissions int = null output
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @_canView bit = 0;
	declare @_canEdit bit = 0;
	declare @_canDelete bit = 0;
	declare @_canApply bit = 0;
	declare @_permissions int = 0;


	if @UserId = 0 or 1 = a2security.fn_isUserAdmin(@UserId)
	begin
		set @CanEdit = 1;
		set @CanDelete = 1;
		set @CanApply = 1;
		set @Permissions = 15;
	end
	else
	begin
		select @_canView = CanView, @_canEdit = CanEdit, @_canDelete = CanDelete, @_canApply = CanApply,
			@_permissions = [Permissions]
		from a2security.[Module.Acl]
		where [Module] = @Module and [UserId] = @UserId

		if isnull(@_canView, 0) = 0
			throw 60000, N'@[UIError.AccessDenied]', 0;
		else
		begin
			set @CanEdit = @_canEdit;
			set @CanDelete = @_canDelete;
			set @CanApply = @_canApply;
			set @Permissions = @_permissions;
		end
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Apply')
	drop procedure a2security.[Permission.Check.Apply]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Apply]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @_canApply bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @CanApply = @_canApply output;
	if @_canApply = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Edit')
	drop procedure a2security.[Permission.Check.Edit]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Edit]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255),
	@Permissions int = null output
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_canEdit bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, 
		@CanEdit = @_canEdit output, @Permissions = @Permissions output;
	if @_canEdit = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Delete')
	drop procedure a2security.[Permission.Check.Delete]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Delete]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_canDelete bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @CanDelete = @_canDelete output;
	if @_canDelete = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Get')
	drop procedure a2security.[Permission.Get]
go
------------------------------------------------
create procedure a2security.[Permission.Get]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_permissions int = 0;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @Permissions = @_permissions output;
	return @_permissions;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.ChangePassword.Load')
	drop procedure a2security.[User.ChangePassword.Load]
go
------------------------------------------------
create procedure a2security.[User.ChangePassword.Load]
	@TenantId int = 0,
	@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if 1 <> (select ChangePasswordEnabled from a2security.Users where Id=@UserId)
	begin
		raiserror (N'UI:@[ChangePasswordDisabled]', 16, -1) with nowait;
	end
	select [User!TUser!Object] = null, [Id!!Id] = Id, [Name!!Name] = UserName, 
		[OldPassword] = cast(null as nvarchar(255)),
		[NewPassword] = cast(null as nvarchar(255)),
		[ConfirmPassword] = cast(null as nvarchar(255)) 
	from a2security.Users where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Login.CheckDuplicate')
	drop procedure a2security.[Login.CheckDuplicate]
go
------------------------------------------------
create procedure a2security.[Login.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@CompanyId bigint = 1,
	@Login nvarchar(255) = null
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2security.Users where UserName = @Login and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'PhoneNumber.CheckDuplicate')
	drop procedure a2security.[PhoneNumber.CheckDuplicate]
go
------------------------------------------------
create procedure a2security.[PhoneNumber.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@CompanyId bigint = 1,
	@PhoneNumber nvarchar(255) = null
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2security.Users where PhoneNumber = @PhoneNumber and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UserStateInfo.Load')
	drop procedure a2security.[UserStateInfo.Load]
go
------------------------------------------------
create procedure a2security.[UserStateInfo.Load]
@TenantId int = null,
@UserId bigint
as
begin
	select [UserState!TUserState!Object] = null;
end
go
------------------------------------------------
begin
	set nocount on;
	declare @codes table (Code int, [Name] nvarchar(32))

	insert into @codes(Code, [Name])
	values
		(1,  N'Login'		        ), 
		(2,  N'UserCreated'         ), 
		(3,  N'TeantUserCreated'    ), 
		(15, N'PasswordUpdated'     ), 
		(18, N'AccessFailedCount'   ), 
		(26, N'EmailConfirmed'      ), 
		(27, N'PhoneNumberConfirmed'),
		(64, N'ApiKey: Success'     ), 
		(65, N'ApiKey: Fail'        ),
		(66, N'ApiKey: IP forbidden'); 

	merge into a2security.[LogCodes] t
	using @codes s on s.Code = t.Code
	when matched then update set
		[Name]=s.[Name]
	when not matched by target then insert 
		(Code, [Name]) values (s.Code, s.[Name])
	when not matched by source then delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'SaveReferral')
	drop procedure a2security.SaveReferral
go
------------------------------------------------
create procedure a2security.SaveReferral
@UserId bigint,
@Referral nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @refid bigint;
	select @refid = Id from a2security.Referrals where lower(Link) = lower(@Referral);
	if @refid is not null
		update a2security.Users set Referral = @refid where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'DeleteUser')
	drop procedure a2security.DeleteUser
go
------------------------------------------------
create procedure a2security.DeleteUser
@CurrentUser bigint,
@Tenant bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @TenantAdmin bigint;
	select @TenantAdmin = [Admin] from a2security.Tenants where Id = @Tenant;
	if @TenantAdmin <> @CurrentUser
	begin
		raiserror(N'Invalid teanant administrator', 16, 1);
		return;
	end
	if @TenantAdmin = @Id
	begin
		raiserror(N'Unable to delete tenant administrator', 16, 1);
		return;
	end
	begin try
		begin tran
		delete from a2security.UserRoles where UserId = @Id;
		delete from a2security.UserGroups where UserId = @Id;
		delete from a2security.[Menu.Acl] where UserId = @Id;
		delete from a2security.[Log] where UserId = @Id;
		delete from a2security.Users where Tenant = @Tenant and Id = @Id;
		commit tran
	end try
	begin catch
		if @@trancount > 0
		begin
			rollback tran;
		end
		declare @msg nvarchar(255);
		set @msg = error_message();
		raiserror(@msg, 16, 1);
	end catch
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.CheckRegister')
	drop procedure a2security.[User.CheckRegister]
go
------------------------------------------------
create procedure a2security.[User.CheckRegister]
@UserName nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @Id bigint;

	select @Id = Id from a2security.Users where UserName=@UserName and EmailConfirmed = 0 and PhoneNumberConfirmed = 0;

	if @Id is not null
	begin
		declare @uid nvarchar(255);
		set @uid = N'_' + convert(nvarchar(255), newid());
		update a2security.Users set Void=1, UserName = UserName + @uid, 
			Email = Email + @uid, PhoneNumber = PhoneNumber + @uid, PasswordHash = null, SecurityStamp = N''
		where Id=@Id and EmailConfirmed = 0  and PhoneNumberConfirmed = 0 and UserName=@UserName;
	end
end
go
------------------------------------------------
set nocount on;
begin
	-- predefined users and groups
	if not exists(select * from a2security.Users where Id = 0)
		insert into a2security.Users (Id, UserName, SecurityStamp) values (0, N'System', N'System');
	if not exists(select * from a2security.Groups where Id = 1)
		insert into a2security.Groups(Id, [Key], [Name]) values (1, N'Users', N'@[AllUsers]');
	if not exists(select * from a2security.Groups where Id = 77)
		insert into a2security.Groups(Id, [Key], [Name]) values (77, N'Admins', N'@[AdminUsers]');
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'License')
begin
	create table a2security.License
	(
		[Text] nvarchar(max) not null,
		DateCreated datetime not null constraint DF_License_DateCreated2 default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_License_DateModified2 default (a2sys.fn_getCurrentDate())
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateCreated' and parent_object_id = object_id(N'a2security.License'))
begin
	alter table a2security.License drop constraint DF_License_UtcDateCreated;
	alter table a2security.License add constraint DF_License_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateModified' and parent_object_id = object_id(N'a2security.License'))
begin
	alter table a2security.License drop constraint DF_License_UtcDateModified;
	alter table a2security.License add constraint DF_License_DateModified2 default(a2sys.fn_getCurrentDate()) for DateModified with values;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'License.Load')
	drop procedure a2security.[License.Load]
go
------------------------------------------------
create procedure a2security.[License.Load]
as
begin
	set nocount on;
	select [Text] from a2security.License;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'License.Update')
	drop procedure a2security.[License.Update]
go
------------------------------------------------
create procedure a2security.[License.Update]
@License nvarchar(max)
as
begin
	set nocount on;
	if exists(select * from a2security.License)
		update a2security.License set [Text]=@License, DateModified = a2sys.fn_getCurrentDate();
	else
		insert into a2security.License ([Text]) values (@License);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Companies')
	create sequence a2security.SQ_Companies as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Companies')
begin
	create table a2security.Companies
	(
		Id	bigint not null constraint PK_Companies primary key
			constraint DF_Companies_PK default(next value for a2security.SQ_Companies),
		[Name] nvarchar(255) null,
		Memo nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserCompanies')
begin
	create table a2security.[UserCompanies]
	(
		[User] bigint not null
			constraint FK_UserCompanies_User_Users foreign key references a2security.Users(Id),
		[Company] bigint not null
			constraint FK_UserCompanies_Company_Companies foreign key references a2security.Companies(Id),
		[Enabled] bit,
		constraint PK_UserCompanies primary key clustered ([User], [Company]) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS where CONSTRAINT_SCHEMA = N'a2security' and CONSTRAINT_NAME = N'FK_Users_Company_Companies')
	alter table a2security.Users add
		constraint FK_Users_Company_Companies foreign key (Company) references a2security.Companies(Id);
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Companies.Check')
	drop procedure a2security.[User.Companies.Check]
go
------------------------------------------------
create procedure a2security.[User.Companies.Check]
@UserId bigint,
@Error bit,
@CompanyId bigint output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @isadmin bit;
	declare @id bigint;

	select @id = Id, @isadmin = IsAdmin, @CompanyId = Company from a2security.ViewUsers where Id=@UserId;
	if @id is null
	begin
		raiserror (N'UI:No such user', 16, -1) with nowait;
		return;
	end
	if @isadmin = 1
	begin
		if @CompanyId is null or @CompanyId = 0 or not exists(select * from a2security.Companies where Id=@CompanyId)
		begin
			select top(1) @CompanyId = Id from a2security.Companies where Id <> 0;
			update a2security.ViewUsers set Company = @CompanyId where Id = @UserId;
		end
	end
	else
	begin
		-- not admin
		if @CompanyId is null or @CompanyId = 0 or not exists(select * from a2security.UserCompanies where [User] = @UserId and Company = @CompanyId)
		begin
			select top(1) @CompanyId = Company from a2security.UserCompanies where Company <> 0 and [Enabled]=1 and [User] = @UserId;
			update a2security.ViewUsers set Company = @CompanyId where Id = @UserId;
		end
	end
	if @Error = 1 and @CompanyId is null
	begin
		raiserror (N'UI:No current company', 16, -1) with nowait;
		return;
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Companies')
	drop procedure a2security.[User.Companies]
go
------------------------------------------------
create procedure a2security.[User.Companies]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @isadmin bit;
	declare @company bigint;

	select @isadmin = IsAdmin, @company = Company from a2security.ViewUsers where Id=@UserId;

	-- all companies for the current user
	select [Companies!TCompany!Array] = null, 
		Id, [Name], 
		[Current] = cast(case when Id = @company then 1 else 0 end as bit)
	from a2security.Companies c
		left join a2security.UserCompanies uc on uc.Company = c.Id and uc.[User] = @UserId
	where c.Id <> 0 and (@isadmin = 1 or 
		c.Id in (select uc.Company from a2security.UserCompanies uc where uc.[User] = @UserId and uc.[Enabled] = 1))
	order by c.Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SwitchToCompany')
	drop procedure a2security.[User.SwitchToCompany]
go
------------------------------------------------
create procedure a2security.[User.SwitchToCompany]
@UserId bigint,
@CompanyId bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @isadmin bit;
	set @isadmin = a2security.fn_isUserAdmin(@UserId);
	if not exists(select * from a2security.Companies where Id=@CompanyId)
		throw 60000, N'There is no such company', 0;
	if @isadmin = 0 and not exists(
			select * from a2security.UserCompanies where [User] = @UserId and Company=@CompanyId and [Enabled] = 1)
		throw 60000, N'There is no such company or it is not allowed', 0;
	update a2security.Users set Company = @CompanyId where Id = @UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Company.Load')
	drop procedure a2security.[User.Company.Load]
go
------------------------------------------------
create procedure a2security.[User.Company.Load]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @company bigint;
	select @company = Company from a2security.ViewUsers where Id=@UserId;

	select [UserCompany!TCompany!Object] = null, Company=@company;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateAcl.Module')
	drop procedure [a2security].[Permission.UpdateAcl.Module]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateAcl.Module]
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @ModuleTable table (Id varchar(16), UserId bigint, GroupId bigint, 
		CanView smallint, CanEdit smallint, CanDelete smallint, CanApply smallint);

	insert into @ModuleTable (Id, UserId, GroupId, CanView, CanEdit, CanDelete, CanApply)
	select m.Id, a.UserId, a.GroupId, a.CanView, a.CanEdit, a.CanDelete, CanApply
	from a2security.Acl a inner join a2security.Modules m on a.ObjectKey = m.Id
	where a.[Object] = N'std:module';

	declare @UserTable table (ObjectKey varchar(16), UserId bigint, CanView bit, CanEdit bit, CanDelete bit, CanApply bit);

	with T(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
	as
	(
		select a.Id, UserId=isnull(ur.UserId, a.UserId), a.CanView, a.CanEdit, a.CanDelete, a.CanApply
		from @ModuleTable a
		left join a2security.UserGroups ur on a.GroupId = ur.GroupId
		where isnull(ur.UserId, a.UserId) is not null
	)
	insert into @UserTable(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
	select ObjectKey, UserId,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0),
		_CanEdit = isnull(case
				when min(T.CanEdit) = -1 then 0
				when max(T.CanEdit) = 1 then 1
				end, 0),
		_CanDelete = isnull(case
				when min(T.CanDelete) = -1 then 0
				when max(T.CanDelete) = 1 then 1
				end, 0),
		_CanApply = isnull(case
				when min(T.CanApply) = -1 then 0
				when max(T.CanApply) = 1 then 1
				end, 0)
	from T
	group by ObjectKey, UserId;

	merge a2security.[Module.Acl] as t
	using
	(
		select ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply
		from @UserTable T
		where CanView = 1
	) as s(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
		on t.Module = s.[ObjectKey] and t.UserId=s.UserId
	when matched then
		update set 
			t.CanView = s.CanView,
			t.CanEdit = s.CanEdit,
			t.CanDelete = s.CanDelete,
			t.CanApply = s.CanApply
	when not matched by target then
		insert (Module, UserId, CanView, CanEdit, CanDelete, CanApply)
			values (s.[ObjectKey], s.UserId, s.CanView, s.CanEdit, s.CanDelete, s.CanApply)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'SaveAnalytics')
	drop procedure a2security.SaveAnalytics
go
------------------------------------------------
create procedure a2security.SaveAnalytics
@UserId bigint,
@Value nvarchar(max),
@Tags a2sys.[NameValue.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	begin tran;
	insert into a2security.Analytics(UserId, [Value]) values (@UserId, @Value);

	with T([Name], [Value]) as (
		select [Name], [Value] = max([Value]) 
		from @Tags 
		where [Name] is not null and [Value] is not null 
		group by [Name]
	)
	insert into a2security.AnalyticTags (UserId, [Name], [Value])
	select @UserId, [Name], [Value] from T;
	commit tran;
end
go
-- .JWT SUPPORT
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'RefreshTokens')
	create table a2security.RefreshTokens
	(
		UserId bigint not null
			constraint FK_RefreshTokens_UserId_Users foreign key references a2security.Users(Id),
		[Provider] nvarchar(64) not null,
		[Token] nvarchar(255) not null,
		Expires datetime not null,
		constraint PK_RefreshTokens primary key (UserId, [Provider], Token) with (fillfactor = 70)
	)
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'AddToken')
	drop procedure a2security.[AddToken]
go
------------------------------------------------
create procedure a2security.[AddToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255),
@Expires datetime,
@Remove nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	begin tran;
	insert into a2security.RefreshTokens(UserId, [Provider], Token, Expires)
		values (@UserId, @Provider, @Token, @Expires);
	if @Remove is not null
		delete from a2security.RefreshTokens 
		where UserId=@UserId and [Provider] = @Provider and Token = @Remove;
	commit tran;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'GetToken')
	drop procedure a2security.[GetToken]
go
------------------------------------------------
create procedure a2security.[GetToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;

	select [Token], UserId, Expires from a2security.RefreshTokens
	where UserId=@UserId and [Provider] = @Provider and Token = @Token;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'RemoveToken')
	drop procedure a2security.[RemoveToken]
go
------------------------------------------------
create procedure a2security.[RemoveToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	delete from a2security.RefreshTokens 
	where UserId=@UserId and [Provider] = @Provider and Token = @Token;
end
go
-- .NET CORE SUPPORT
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SetPasswordHash')
	drop procedure a2security.[User.SetPasswordHash]
go
------------------------------------------------
create procedure a2security.[User.SetPasswordHash]
@UserId bigint,
@PasswordHash nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set PasswordHash2 = @PasswordHash where Id=@UserId;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SetSecurityStamp')
	drop procedure a2security.[User.SetSecurityStamp]
go
------------------------------------------------
create procedure a2security.[User.SetSecurityStamp]
@UserId bigint,
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set SecurityStamp2 = @SecurityStamp where Id=@UserId;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2security to public;
end
go


/*
Copyright © 2008-2021 Alex Kukhtin

Last updated : 09 apr 2020
module version : 7055
*/
------------------------------------------------
exec a2sys.SetVersion N'std:messaging', 7055;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2messaging')
begin
	exec sp_executesql N'create schema a2messaging';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Messages')
	create sequence a2messaging.SQ_Messages as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Messages')
begin
	create table a2messaging.[Messages]
	(
		Id	bigint	not null constraint PK_Messages primary key
			constraint DF_Messages_PK default(next value for a2messaging.SQ_Messages),
		Template nvarchar(255) not null,
		[Key] nvarchar(255) not null,
		TargetId bigint null,
		[Source] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Messages_DateCreated2 default(a2sys.fn_getCurrentDate())
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Processes_UtcDateCreated' and parent_object_id = object_id(N'a2messaging.Messages'))
begin
	alter table a2messaging.[Messages] drop constraint DF_Processes_UtcDateCreated;
	alter table a2messaging.[Messages] add constraint DF_Messages_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Parameters')
	create sequence a2messaging.SQ_Parameters as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Parameters')
begin
	create table a2messaging.[Parameters]
	(
		Id	bigint	not null constraint PK_Parameters primary key
			constraint Parameters_PK default(next value for a2messaging.SQ_Parameters),
		[Message] bigint not null
			constraint FK_Parameters_Messages_Id references a2messaging.[Messages](Id),
		[Name] nvarchar(255) not null,
		[Value] nvarchar(max) null
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2messaging.Parameters') and name = N'IX_MessagingParameters_Message')
	create nonclustered index IX_MessagingParameters_Message on a2messaging.[Parameters] ([Message]);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Environment')
	create sequence a2messaging.SQ_Environment as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Environment')
begin
	create table a2messaging.[Environment]
	(
		Id	bigint	not null constraint PK_Environment primary key
			constraint Environment_PK default(next value for a2messaging.SQ_Environment),
		[Message] bigint not null
			constraint FK_Environment_Messages_Id references a2messaging.[Messages](Id),
		[Name] nvarchar(255) not null,
		[Value] nvarchar(255) not null
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2messaging.Environment') and name = N'IX_MessagingEnvironment_Message')
	create nonclustered index IX_MessagingEnvironment_Message on a2messaging.[Environment] ([Message]);
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2messaging.Environment') and name = N'IX_MessagingEnvironment_Name')
	create nonclustered index IX_MessagingEnvironment_Name on a2messaging.[Environment] ([Name])
	include ([Message],[Value]);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Log')
begin
	create table a2messaging.[Log]
	(
		Id	bigint not null identity(100, 1) constraint PK_Log primary key,
		UserId bigint not null
			constraint FK_Log_UserId_Users foreign key references a2security.Users(Id),
		EventTime	datetime not null
			constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()),
		Severity nchar(1) not null,
		[Message] nvarchar(max) null,
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Log_EventTime' and parent_object_id = object_id(N'a2messaging.Log'))
begin
	alter table a2messaging.[Log] drop constraint DF_Log_EventTime;
	alter table a2messaging.[Log] add constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()) for EventTime with values;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'WriteLog')
	drop procedure [a2messaging].[WriteLog]
go
------------------------------------------------
create procedure [a2messaging].[WriteLog]
	@UserId bigint = null,
	@Severity int,
	@Message nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2messaging.[Log] (UserId, Severity, [Message]) 
		values (isnull(@UserId, 0 /*system user*/), char(@Severity), @Message);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Metadata')
	drop procedure a2messaging.[Message.Queue.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Update')
	drop procedure a2messaging.[Message.Queue.Update]
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'Message.TableType' AND ss.name = N'a2messaging')
	drop type a2messaging.[Message.TableType];
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'NameValue.TableType' AND ss.name = N'a2messaging')
	drop type a2messaging.[NameValue.TableType];
go
------------------------------------------------
create type a2messaging.[Message.TableType] as
table (
	[Id] bigint null,
	[Template] nvarchar(255),
	[Key] nvarchar(255),
	[TargetId] bigint,
	[Source] nvarchar(255)
)
go
------------------------------------------------
create type a2messaging.[NameValue.TableType] as
table (
	[Name] nvarchar(255),
	[Value] nvarchar(max)
)
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Metadata]
as
begin
	set nocount on;
	declare @message a2messaging.[Message.TableType];
	declare @nv a2messaging.[NameValue.TableType];
	select [Message!Message!Metadata] = null, * from @message;
	select [Parameters!Message.Parameters!Metadata] = null, * from @nv;
	select [Environment!Message.Environment!Metadata] = null, * from @nv;
end
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Update]
@Message a2messaging.[Message.TableType] readonly,
@Parameters a2messaging.[NameValue.TableType] readonly,
@Environment a2messaging.[NameValue.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level serializable;
	set xact_abort on;
	declare @rt table(Id bigint);
	declare @msgid bigint;
	insert into a2messaging.[Messages] (Template, [Key], TargetId, [Source])
		output inserted.Id into @rt(Id)
		select Template, [Key], TargetId, [Source] from @Message;
	select top(1) @msgid = Id from @rt;
	insert into a2messaging.[Parameters] ([Message], [Name], [Value]) 
		select @msgid, [Name], [Value] from @Parameters;
	insert into a2messaging.Environment([Message], [Name], [Value]) 
		select @msgid, [Name], [Value] from @Environment;
	select [Result!TResult!Object] = null, Id=@msgid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Load')
	drop procedure a2messaging.[Message.Queue.Load]
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Load]
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	select [Message!TMessage!Object] = null, [Id!!Id] = Id, [Template], [Key], TargetId,
		[Parameters!TNameValue!Array] = null, [Environment!TNameValue!Array] = null
	from a2messaging.[Messages] where Id=@Id;
	select [!TNameValue!Array] = null, [Name], [Value], [!TMessage.Parameters!ParentId] = [Message]
		from a2messaging.[Parameters] where [Message]=@Id;
	select [!TNameValue!Array] = null, [Name], [Value], [!TMessage.Environment!ParentId] = [Message]
		from a2messaging.[Environment] where [Message]=@Id;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2messaging to public;
end
go


/*
Copyright © 2008-2021 Alex Kukhtin

Last updated : 20 jun 2021
module version : 7680
*/
------------------------------------------------
exec a2sys.SetVersion N'std:ui', 7680;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2ui')
begin
	exec sp_executesql N'create schema a2ui';
end
go
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2ui' and SEQUENCE_NAME=N'SQ_Menu')
	create sequence a2ui.SQ_Menu as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu')
begin
	create table a2ui.Menu
	(
		Id	bigint not null constraint PK_Menu primary key
			constraint DF_Menu_PK default(next value for a2ui.SQ_Menu),
		Parent bigint null
			constraint FK_Menu_Parent_Menu foreign key references a2ui.Menu(Id),
		[Key] nchar(4) null,
		[Name] nvarchar(255) null,
		[Url] nvarchar(255) null,
		Icon nvarchar(255) null,
		Model nvarchar(255) null,
		Help nvarchar(255) null,
		[Order] int not null constraint DF_Menu_Order default(0),
		[Description] nvarchar(255) null,
		[Params] nvarchar(255) null,
		[Feature] nchar(4) null,
		[Feature2] nvarchar(255) null,
		[ClassName] nvarchar(255) null,
		[Module] nvarchar(16) null
			constraint FK_Menu_Module_Modules foreign key references a2security.Modules(Id)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Help')
	alter table a2ui.Menu add Help nvarchar(255) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Key')
	alter table a2ui.Menu add [Key] nchar(4) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Params')
	alter table a2ui.Menu add Params nvarchar(255) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Feature')
	alter table a2ui.Menu add [Feature] nchar(4) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Feature2')
	alter table a2ui.Menu add Feature2 nvarchar(255) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'ClassName')
	alter table a2ui.Menu add [ClassName] nvarchar(255) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Module')
	alter table a2ui.Menu add [Module] nvarchar(16) null
			constraint FK_Menu_Module_Modules foreign key references a2security.Modules(Id);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Menu.Acl')
begin
	-- ACL for menu
	create table a2security.[Menu.Acl]
	(
		Menu bigint not null 
			constraint FK_MenuAcl_Menu foreign key references a2ui.Menu(Id),
		UserId bigint not null 
			constraint FK_MenuAcl_UserId_Users foreign key references a2security.Users(Id),
		CanView bit null,
		[Permissions] as cast(CanView as int)
		constraint PK_MenuAcl primary key(Menu, UserId)
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where [name] = N'IX_MenuAcl_UserId')
	create nonclustered index IX_MenuAcl_UserId on a2security.[Menu.Acl] (UserId);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Feedback')
begin
	create table a2ui.Feedback
	(
		Id	bigint identity(1, 1) not null constraint PK_Feedback primary key,
		[Date] datetime not null
			constraint DF_Feedback_CurrentDate default(a2sys.fn_getCurrentDate()),
		UserId bigint not null
			constraint FK_Feedback_UserId_Users foreign key references a2security.Users(Id),
		[Text] nvarchar(max) null
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Feedback_UtcDate' and parent_object_id = object_id(N'a2ui.Feedback'))
begin
	alter table a2ui.Feedback drop constraint DF_Feedback_UtcDate;
	alter table a2ui.Feedback add constraint DF_Feedback_CurrentDate default(a2sys.fn_getCurrentDate()) for [Date];
end
go
------------------------------------------------
if (255 = (select CHARACTER_MAXIMUM_LENGTH from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Feedback' and COLUMN_NAME=N'Text'))
begin
	alter table a2ui.Feedback alter column [Text] nvarchar(max) null;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.User.Load')
	drop procedure a2ui.[Menu.User.Load]
go
------------------------------------------------
create procedure a2ui.[Menu.User.Load]
@TenantId int = null,
@UserId bigint,
@Mobile bit = 0,
@Groups nvarchar(255) = null -- for use claims
as
begin
	set nocount on;
	declare @RootId bigint;
	set @RootId = 1;
	if @Mobile = 1
		set @RootId = 2;
	with RT as (
		select Id=m0.Id, ParentId = m0.Parent, [Level]=0
			from a2ui.Menu m0
			where m0.Id = @RootId
		union all
		select m1.Id, m1.Parent, RT.[Level]+1
			from RT inner join a2ui.Menu m1 on m1.Parent = RT.Id
	)
	select [Menu!TMenu!Tree] = null, [Id!!Id]=RT.Id, [!TMenu.Menu!ParentId]=RT.ParentId,
		[Menu!TMenu!Array] = null,
		m.Name, m.Url, m.Icon, m.[Description], m.Help, m.Params, m.ClassName
	from RT 
		inner join a2security.[Menu.Acl] a on a.Menu = RT.Id
		inner join a2ui.Menu m on RT.Id=m.Id
	where a.UserId = @UserId and a.CanView = 1
	order by RT.[Level], m.[Order], RT.[Id];

	-- companies
	exec a2security.[User.Companies] @UserId = @UserId;

	-- system parameters
	select [SysParams!TParam!Object]= null, [AppTitle], [AppSubTitle], [SideBarMode], [NavBarMode], [Pages]
	from (select [Name], [Value]=StringValue from a2sys.SysParams) as s
		pivot (min([Value]) for [Name] in ([AppTitle], [AppSubTitle], [SideBarMode], [NavBarMode], [Pages])) as p;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.Module.User.Load')
	drop procedure a2ui.[Menu.Module.User.Load]
go
------------------------------------------------
create procedure a2ui.[Menu.Module.User.Load]
@TenantId int = null,
@UserId bigint,
@CompanyId bigint = null,
@Mobile bit = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @isadmin bit;
	set @isadmin = a2security.fn_isUserAdmin(@UserId);

	declare @menutable table(Id bigint, [Level] int); 

	if @isadmin = 0
	begin
		-- all parents
		with P(Id, ParentId, [Level])
		as
		(
			select m.Id, m.Parent, 0
			from a2security.[Module.Acl] a inner join a2ui.Menu m on a.Module = m.Module
			where a.UserId = @UserId and a.CanView = 1
			union all
			select m.Id, m.Parent, [Level] - 1
				from a2ui.Menu m inner join P on m.Id=P.ParentId
		)
		insert into @menutable(Id)
		select Id from P group by Id;
	end

	declare @RootId bigint = 1;
	if @Mobile = 1
		set @RootId = 2;

	with RT as (
		select Id=m0.Id, ParentId = m0.Parent, Module, [Level]=0
			from a2ui.Menu m0
			where m0.Id = 1
		union all
		select m1.Id, m1.Parent, m1.Module, RT.[Level]+1
			from RT inner join a2ui.Menu m1 on m1.Parent = RT.Id
	)
	select [Menu!TMenu!Tree] = null, [Id!!Id]=RT.Id, [!TMenu.Menu!ParentId]=RT.ParentId,
		[Menu!TMenu!Array] = null,
		m.[Name], m.[Url], m.Icon, m.[Description], m.Help, m.ClassName
	from RT
		inner join a2ui.Menu m on RT.Id=m.Id
		left join @menutable mt on m.Id = mt.Id
	where @isadmin = 1 or mt.Id is not null
	order by RT.[Level], m.[Order], RT.[Id];

	-- companies
	exec a2security.[User.Companies] @UserId = @UserId;

	-- permissions
	select [Permissions!TPerm!Array] = null, [Module], [Permissions]
	from a2security.[Module.Acl] where UserId = @UserId;

	-- system parameters
	select [SysParams!TParam!Object]= null, [AppTitle], [AppSubTitle], [SideBarMode], [NavBarMode], [Pages]
	from (select [Name], [Value] = StringValue from a2sys.SysParams) as s
		pivot (min([Value]) for [Name] in ([AppTitle], [AppSubTitle], [SideBarMode], [NavBarMode], [Pages])) as p;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'AppTitle.Load')
	drop procedure a2ui.[AppTitle.Load]
go
------------------------------------------------
create procedure a2ui.[AppTitle.Load]
as
begin
	set nocount on;
	select [AppTitle], [AppSubTitle]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle])) as p;
end
go
-----------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_GetMenuFor') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_GetMenuFor;
go
------------------------------------------------
create function a2security.fn_GetMenuFor(@MenuId bigint)
returns @rettable table (Id bigint, Parent bit)
as
begin
	declare @tx table (Id bigint, Parent bit);

	-- all children
	with C(Id, ParentId)
	as
	(
		select @MenuId, cast(null as bigint) 
		union all
		select m.Id, m.Parent
			from a2ui.Menu m inner join C on m.Parent=C.Id
	)
	insert into @tx(Id, Parent)
		select Id, 0 from C
		group by Id;

	-- all parent 
	with P(Id, ParentId)
	as
	(
		select cast(null as bigint), @MenuId 
		union all
		select m.Id, m.Parent
			from a2ui.Menu m inner join P on m.Id=P.ParentId
	)
	insert into @tx(Id, Parent)
		select Id, 1 from P
		group by Id;

	insert into @rettable
		select Id, Parent from @tx
			where Id is not null
		group by Id, Parent;
	return;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateAcl.Menu')
	drop procedure [a2security].[Permission.UpdateAcl.Menu]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateAcl.Menu]
as
begin
	set nocount on;
	declare @MenuTable table (Id bigint, UserId bigint, GroupId bigint, CanView smallint);

	insert into @MenuTable (Id, UserId, GroupId, CanView)
		select f.Id, a.UserId, a.GroupId, a.CanView
		from a2security.Acl a 
			cross apply a2security.fn_GetMenuFor(a.ObjectId) f
			/*exclude denied parents */
		where a.[Object] = N'std:menu' and Not (Parent = 1 and CanView = -1)
		group by f.Id, UserId, GroupId, CanView;

	declare @UserTable table (ObjectId bigint, UserId bigint, CanView bit);

	with T(ObjectId, UserId, CanView)
	as
	(
		select a.Id, UserId=isnull(ur.UserId, a.UserId), a.CanView
		from @MenuTable a
		left join a2security.UserGroups ur on a.GroupId = ur.GroupId
		where isnull(ur.UserId, a.UserId) is not null
	)
	insert into @UserTable(ObjectId, UserId, CanView)
	select ObjectId, UserId,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0)
	from T
	group by ObjectId, UserId;

	merge a2security.[Menu.Acl] as target
	using
	(
		select ObjectId, UserId, CanView
		from @UserTable T
		where CanView = 1
	) as source(ObjectId, UserId, CanView)
		on target.Menu = source.[ObjectId] and target.UserId=source.UserId
	when matched then
		update set 
			target.CanView = source.CanView
	when not matched by target then
		insert (Menu, UserId, CanView)
			values (source.[ObjectId], source.UserId, source.CanView)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateUserAcl.Menu')
	drop procedure [a2security].[Permission.UpdateUserAcl.Menu]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateUserAcl.Menu]
@UserId bigint
as
begin
	set nocount on;
	declare @MenuTable table (Id bigint, UserId bigint, GroupId bigint, CanView smallint);

	insert into @MenuTable (Id, UserId, GroupId, CanView)
		select f.Id, a.UserId, a.GroupId, a.CanView
		from a2security.Acl a 
			cross apply a2security.fn_GetMenuFor(a.ObjectId) f
			/*exclude denied parents */
		where a.[Object] = N'std:menu' and Not (Parent = 1 and CanView = -1)
		group by f.Id, UserId, GroupId, CanView;

	declare @UserTable table (ObjectId bigint, UserId bigint, CanView bit);

	with T(ObjectId, UserId, CanView)
	as
	(
		select a.Id, UserId=isnull(ur.UserId, a.UserId), a.CanView
		from @MenuTable a
		left join a2security.UserGroups ur on a.GroupId = ur.GroupId
		where isnull(ur.UserId, a.UserId) = @UserId
	)
	insert into @UserTable(ObjectId, UserId, CanView)
	select ObjectId, UserId,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0)
	from T
	group by ObjectId, UserId;

	merge a2security.[Menu.Acl] as target
	using
	(
		select ObjectId, UserId, CanView
		from @UserTable T
		where CanView = 1
	) as source(ObjectId, UserId, CanView)
		on target.Menu = source.[ObjectId] and target.UserId=source.UserId
	when matched then
		update set 
			target.CanView = source.CanView
	when not matched by target then
		insert (Menu, UserId, CanView)
			values (source.[ObjectId], source.UserId, source.CanView)
	when not matched by source and target.UserId = @UserId then
		delete;
end
go
-----------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_IsMenuVisible') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_IsMenuVisible;
go
------------------------------------------------
create function a2security.fn_IsMenuVisible(@MenuId bigint, @UserId bigint)
returns bit
as
begin
	declare @result bit;
	select @result = case when CanView = 1 then 1 else 0 end from a2security.Acl where [Object] = N'std:menu' and ObjectId = @MenuId and UserId = @UserId;
	return isnull(@result, 1); -- not found - visible
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.SetVisible')
	drop procedure a2ui.[Menu.SetVisible]
go
------------------------------------------------
create procedure a2ui.[Menu.SetVisible]
@UserId bigint,
@MenuId bigint,
@Visible bit
as
begin
	set nocount on;
	set transaction isolation level read committed;
	if @Visible = 0 and not exists(select * from a2security.Acl where [Object] = N'std:menu' and ObjectId = @MenuId and UserId = @UserId)
		 insert into a2security.Acl ([Object], ObjectId, UserId, CanView) values (N'std:menu', @MenuId, @UserId, -1);
	else if @Visible = 1
		delete from a2security.Acl where [Object] = N'std:menu' and ObjectId = @MenuId and UserId = @UserId;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA = N'a2ui' and DOMAIN_NAME = N'Menu2.TableType')
exec sp_executesql N'
create type a2ui.[Menu2.TableType] as table
(
	Id bigint,
	Parent bigint,
	[Key] nchar(4),
	[Feature] nchar(4),
	[Name] nvarchar(255),
	[Url] nvarchar(255),
	Icon nvarchar(255),
	[Model] nvarchar(255),
	[Order] int,
	[Description] nvarchar(255),
	[Help] nvarchar(255),
	Params nvarchar(255),
	Feature2 nvarchar(255)
)';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA = N'a2ui' and DOMAIN_NAME = N'MenuModule.TableType')
exec sp_executesql N'
create type a2ui.[MenuModule.TableType] as table
(
	Id bigint,
	Parent bigint,
	[Name] nvarchar(255),
	[Url] nvarchar(255),
	Icon nvarchar(255),
	[Model] nvarchar(255),
	[Order] int,
	[Description] nvarchar(255),
	[Help] nvarchar(255),
	Module nvarchar(16),
	ClassName nvarchar(255)
)';
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.Merge')
	drop procedure a2ui.[Menu.Merge]
go
------------------------------------------------
create procedure a2ui.[Menu.Merge]
@Menu a2ui.[Menu2.TableType] readonly,
@Start bigint,
@End bigint
as
begin
	with T as (
		select * from a2ui.Menu where Id >=@Start and Id <= @End
	)
	merge T as t
	using @Menu as s
	on t.Id = s.Id 
	when matched then
		update set
			t.Id = s.Id,
			t.Parent = s.Parent,
			t.[Key] = s.[Key],
			t.[Name] = s.[Name],
			t.[Url] = s.[Url],
			t.[Icon] = s.Icon,
			t.[Order] = s.[Order],
			t.Feature = s.Feature,
			t.Model = s.Model,
			t.[Description] = s.[Description],
			t.Help = s.Help,
			t.Params = s.Params
	when not matched by target then
		insert(Id, Parent, [Key], [Name], [Url], Icon, [Order], Feature, Model, [Description], Help, Params) values 
		(Id, Parent, [Key], [Name], [Url], Icon, [Order], Feature, Model, [Description], Help, Params)
	when not matched by source and t.Id >= @Start and t.Id < @End then 
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'MenuModule.Merge')
	drop procedure a2ui.[MenuModule.Merge]
go
------------------------------------------------
create procedure a2ui.[MenuModule.Merge]
@Menu a2ui.[MenuModule.TableType] readonly,
@Start bigint,
@End bigint
as
begin
	with T as (
		select * from a2ui.Menu where Id >=@Start and Id <= @End
	)
	merge T as t
	using @Menu as s
	on t.Id = s.Id 
	when matched then
		update set
			t.Id = s.Id,
			t.Parent = s.Parent,
			t.[Name] = s.[Name],
			t.[Url] = s.[Url],
			t.[Icon] = s.Icon,
			t.[Order] = s.[Order],
			t.Model = s.Model,
			t.[Description] = s.[Description],
			t.Help = s.Help,
			t.Module = s.Module,
			t.ClassName = s.ClassName
	when not matched by target then
		insert(Id, Parent, [Name], [Url], Icon, [Order], Model, [Description], Help, Module, ClassName) values 
		(Id, Parent, [Name], [Url], Icon, [Order], Model, [Description], Help, Module, ClassName)
	when not matched by source and t.Id >= @Start and t.Id < @End then 
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'SaveFeedback')
	drop procedure a2ui.SaveFeedback
go
------------------------------------------------
create procedure a2ui.SaveFeedback
@UserId bigint,
@Text nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2ui.Feedback(UserId, [Text]) values (@UserId, @Text);
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2ui to public;
end
go

