/* 20170724-7010 */
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
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2meta')
begin
	exec sp_executesql N'create schema a2meta';
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2meta to public;
end
go
------------------------------------------------
set noexec off;
go

