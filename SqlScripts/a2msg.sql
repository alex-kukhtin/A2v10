/* 20171026-7049 */
/*
------------------------------------------------
Copyright © 2008-2017 Alex Kukhtin

Last updated : 26 oct 2017 19:00
module version : 7049
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
if not exists(select * from a2sys.Versions where Module = N'std:msg')
	insert into a2sys.Versions (Module, [Version]) values (N'std:msg', 7049);
else
	update a2sys.Versions set [Version] = 7049 where Module = N'std:msg';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2msg')
begin
	exec sp_executesql N'create schema a2msg';
end
go


------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2msg to public;
end
go
------------------------------------------------
set noexec off;
go

