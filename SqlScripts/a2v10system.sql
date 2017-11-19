/* 20171119-7045 */

/*
------------------------------------------------
Copyright © 2008-2017 Alex Kukhtin

Last updated : 19 nov 2017 12:00
module version : 7045
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
		[Version] int null
	);
end
go
------------------------------------------------
if not exists(select * from a2sys.Versions where Module = N'std:system')
	insert into a2sys.Versions (Module, [Version]) values (N'std:system', 7045);
else
	update a2sys.Versions set [Version] = 7045 where Module = N'std:system';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'SysParams')
begin
	create table a2sys.SysParams
	(
		Name sysname not null constraint PK_SysParams primary key,
		StringValue nvarchar(255) null,
		IntValue int null
	);
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
begin
	set nocount on;
	grant execute on schema ::a2sys to public;
end
go
------------------------------------------------
set noexec off;
go

