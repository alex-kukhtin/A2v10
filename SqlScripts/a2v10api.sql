/*
------------------------------------------------
Copyright © 2018-2020 Alex Kukhtin

Last updated : 22 mar 2020
module version : 7257
*/
------------------------------------------------
begin
	set nocount on;
	if not exists(select * from a2sys.Versions where Module = N'std:api')
		insert into a2sys.Versions (Module, [Version]) values (N'std:api', 7257);
	else
		update a2sys.Versions set [Version] = 7257 where Module = N'std:api';
end
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
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2api' and TABLE_NAME=N'OAuth2Sessions')
begin
	create table a2api.[OAuth2Sessions]
	(
		Id	uniqueidentifier  not null 
		 constraint PK_OAuth2Sessions primary key
		 constraint DF_OAuth2Sessions_Id default(newid()),
		UserId bigint not null
			constraint FK_OAuth2Sessions_UserId_Users foreign key references a2security.Users(Id),
		TenantId int not null,
		ClientId nvarchar(255) null,
		UtcCreateTime	datetime not null
			constraint DF_OAuth2Sessions_EventTime default(a2sys.fn_getCurrentDate()),
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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2api' and ROUTINE_NAME=N'OAuth2.GetSession')
	drop procedure a2api.[OAuth2.GetSession]
go
------------------------------------------------
create procedure a2api.[OAuth2.GetSession]
	@UserId bigint = null,
	@TenantId int = 0,
	@ClientId nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level serializable;
	set xact_abort on;
	declare @rt table(Id uniqueidentifier);
	delete from a2api.[OAuth2Sessions] where UtcCreateTime < dateadd(d, -7, a2sys.fn_getCurrentDate());
	insert into a2api.[OAuth2Sessions] (UserId, TenantId, ClientId) 
		output inserted.Id into @rt(Id)
		values (@UserId, @TenantId, @ClientId);
	select SessionId=cast(Id as nvarchar(255)) from @rt;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2api to public;
end
go

