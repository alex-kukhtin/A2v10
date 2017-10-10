/* 20171010-7043 */

/*
------------------------------------------------
Copyright © 2008-2017 A. Kukhtin

Last updated : 10 oct 2017 14:50
module version : 7043
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
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2sys')
begin
	exec sp_executesql N'create schema a2sys';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2sys' and TABLE_NAME=N'SysParams')
begin
	create table a2sys.SysParams
	(
		-- database schema
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

