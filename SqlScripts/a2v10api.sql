/* 20180727-7254 */
/*
------------------------------------------------
Copyright © 2018 Alex Kukhtin

Last updated : 26 jul 2018
module version : 7254
*/
------------------------------------------------
if not exists(select * from a2sys.Versions where Module = N'std:api')
	insert into a2sys.Versions (Module, [Version]) values (N'std:api', 7254);
else
	update a2sys.Versions set [Version] = 7049 where Module = N'std:api';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2api')
begin
	exec sp_executesql N'create schema a2api';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2api' and TABLE_NAME=N'Log')
begin
	create table a2api.[Log]
	(
		Id	bigint not null identity(100, 1) constraint PK_Log primary key,
		UserId bigint not null
			constraint FK_Log_UserId_Users foreign key references a2security.Users(Id),
		UtcEventTime	datetime not null
			constraint DF_Log_EventTime default(getutcdate()),
		Severity nchar(1) not null,
		[Message] nvarchar(max) null,
	);
end
go
------------------------------------------------
create or alter procedure [a2api].[WriteLog]
	@UserId bigint = null,
	@Severity int,
	@Message nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2api.[Log] (UserId, Severity, [Message]) 
		values (isnull(@UserId, 0 /*system user*/), char(@Severity), @Message);
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2api to public;
end
go

