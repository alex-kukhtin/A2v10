/*
Copyright © 2008-2019 Alex Kukhtin

Last updated : 21 dec 2019
module version : 7052
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
	insert into a2sys.Versions (Module, [Version]) values (N'std:system', 7052);
else
	update a2sys.Versions set [Version] = 7052 where Module = N'std:system';
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
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'Id.TableType' and DATA_TYPE=N'table type')
begin
	create type a2sys.[Id.TableType]
	as table(
		Id bigint null
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
begin
	set nocount on;
	grant execute on schema ::a2sys to public;
end
go
------------------------------------------------
go

