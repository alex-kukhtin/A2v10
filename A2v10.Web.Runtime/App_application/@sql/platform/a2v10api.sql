/* 20190219-7255 */
/*
------------------------------------------------
Copyright © 2018-2019 Alex Kukhtin

Last updated : 19 feb 2019
module version : 7255
*/
------------------------------------------------
if not exists(select * from a2sys.Versions where Module = N'std:api')
	insert into a2sys.Versions (Module, [Version]) values (N'std:api', 7255);
else
	update a2sys.Versions set [Version] = 7255 where Module = N'std:api';
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
			constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()),
		Severity nchar(1) not null,
		[Message] nvarchar(max) null,
		Host nvarchar(255) null,
		[Guid] uniqueidentifier
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Log_EventTime' and parent_object_id = object_id(N'a2api.Log'))
begin
	alter table a2api.[Log] drop constraint DF_Log_EventTime;
	alter table a2api.[Log] add constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()) for UtcEventTime with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2api' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Host')
begin
	alter table a2api.[Log] add Host nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2api' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Guid')
begin
	alter table a2api.[Log] add [Guid] uniqueidentifier
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2api' and ROUTINE_NAME=N'WriteLog')
	drop procedure a2api.[WriteLog]
go
------------------------------------------------
create procedure a2api.[WriteLog]
	@UserId bigint = null,
	@Severity int,
	@Message nvarchar(max),
	@Host nvarchar(255) = null,
	@Guid uniqueidentifier = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2api.[Log] (UserId, Severity, [Message], [Host], [Guid]) 
		values (isnull(@UserId, 0 /*system user*/), char(@Severity), @Message, @Host, @Guid);
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2api to public;
end
go

