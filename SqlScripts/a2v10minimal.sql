/*
Copyright © 2008-2023 Oleksandr Kukhtin

Last updated : 05 feb 2023
module version : 7918
*/
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2sys')
	exec sp_executesql N'create schema a2sys';
go
------------------------------------------------
grant execute on schema::a2sys to public;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'Versions')
create table a2sys.Versions
(
	Module sysname not null constraint PK_Versions primary key,
	[Version] int null,
	[Title] nvarchar(255),
	[File] nvarchar(255)
);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'SysParams')
create table a2sys.SysParams
(
	Name sysname not null constraint PK_SysParams primary key,
	StringValue nvarchar(255) null,
	IntValue int null,
	DateValue datetime null
);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'Id.TableType' and DATA_TYPE=N'table type')
	create type a2sys.[Id.TableType]
	as table(
		Id bigint null
	);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'GUID.TableType' and DATA_TYPE=N'table type')
	create type a2sys.[GUID.TableType]
	as table(
		Id uniqueidentifier null
	);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2sys' and DOMAIN_NAME=N'NameValue.TableType' and DATA_TYPE=N'table type')
create type a2sys.[NameValue.TableType]
as table(
	[Name] nvarchar(255),
	[Value] nvarchar(max)
);
go
------------------------------------------------
create or alter procedure a2sys.[GetVersions]
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Module], [Version], [File], [Title] from a2sys.Versions;
end
go
------------------------------------------------
create or alter procedure a2sys.[SetVersion]
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
create or alter procedure a2sys.[AppTitle.Load]
as
begin
	set nocount on;
	select [AppTitle], [AppSubTitle]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle])) as p;
end
go
