/* 20170605-1001 */

/*
------------------------------------------------
Copyright © 2008-2017 A. Kukhtin

Last updated : 17 aug 2017 14:56
module version : 1001
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
begin
	set nocount on;
	grant execute on schema ::a2sys to public;
end
go

------------------------------------------------
set noexec off;
go

