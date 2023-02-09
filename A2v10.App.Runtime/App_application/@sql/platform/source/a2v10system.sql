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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2sys' and ROUTINE_NAME=N'AppTitle.Load')
	drop procedure a2sys.[AppTitle.Load]
go
------------------------------------------------
create procedure a2sys.[AppTitle.Load]
as
begin
	set nocount on;
	select [AppTitle], [AppSubTitle]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle])) as p;
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

