/*
------------------------------------------------
Copyright © 2016-2018 Alex Kukhtin

Last updated : 29 jan 2018
module version : 7000
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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'SetTenantId')
	drop procedure a2security.SetTenantId
go
------------------------------------------------
create procedure a2security.SetTenantId
	@TenantId int
as
begin
	set nocount on;
	throw 60000, @TenantId, 0;
end
go
------------------------------------------------
set noexec off;
go
