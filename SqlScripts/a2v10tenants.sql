/*
------------------------------------------------
Copyright © 2016-2019 Alex Kukhtin

Last updated : 23 dec 2019
module version : 7001
*/
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
