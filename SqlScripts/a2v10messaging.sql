/* 20180603-7050 */
/*
------------------------------------------------
Copyright © 2008-2018 Alex Kukhtin

Last updated : 03 jun 2018
module version : 7050
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
if not exists(select * from a2sys.Versions where Module = N'std:messaging')
	insert into a2sys.Versions (Module, [Version]) values (N'std:messaging', 7049);
else
	update a2sys.Versions set [Version] = 7049 where Module = N'std:messaging';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2messaging')
begin
	exec sp_executesql N'create schema a2messaging';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Log')
begin
	create table a2messaging.[Log]
	(
		Id	bigint not null identity(100, 1) constraint PK_Log primary key,
		UserId bigint not null
			constraint FK_Log_UserId_Users foreign key references a2security.Users(Id),
		EventTime	datetime not null
			constraint DF_Log_EventTime default(getdate()),
		Severity nchar(1) not null,
		[Message] nvarchar(max) null,
	);
end
go
------------------------------------------------
create or alter procedure [a2messaging].[WriteLog]
	@UserId bigint = null,
	@Severity int,
	@Message nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2messaging.[Log] (UserId, Severity, [Message]) 
		values (isnull(@UserId, 0 /*system user*/), char(@Severity), @Message);
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2messaging to public;
end
go
------------------------------------------------
set noexec off;
go

