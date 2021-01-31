/*
Copyright © 2008-2020 Alex Kukhtin

Last updated : 14 dec 2020
module version : 7054
*/
------------------------------------------------
begin
	set nocount on;
	if not exists(select * from a2sys.Versions where Module = N'std:messaging')
		insert into a2sys.Versions (Module, [Version]) values (N'std:messaging', 7054);
	else
		update a2sys.Versions set [Version] = 7054 where Module = N'std:messaging';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2messaging')
begin
	exec sp_executesql N'create schema a2messaging';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Messages')
	create sequence a2messaging.SQ_Messages as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Messages')
begin
	create table a2messaging.[Messages]
	(
		Id	bigint	not null constraint PK_Messages primary key
			constraint DF_Messages_PK default(next value for a2messaging.SQ_Messages),
		Template nvarchar(255) not null,
		[Key] nvarchar(255) not null,
		TargetId bigint null,
		[Source] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Messages_DateCreated2 default(a2sys.fn_getCurrentDate())
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Processes_UtcDateCreated' and parent_object_id = object_id(N'a2messaging.Messages'))
begin
	alter table a2messaging.[Messages] drop constraint DF_Processes_UtcDateCreated;
	alter table a2messaging.[Messages] add constraint DF_Messages_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Parameters')
	create sequence a2messaging.SQ_Parameters as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Parameters')
begin
	create table a2messaging.[Parameters]
	(
		Id	bigint	not null constraint PK_Parameters primary key
			constraint Parameters_PK default(next value for a2messaging.SQ_Parameters),
		[Message] bigint not null
			constraint FK_Parameters_Messages_Id references a2messaging.[Messages](Id),
		[Name] nvarchar(255) not null,
		[Value] nvarchar(max) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2messaging' and SEQUENCE_NAME=N'SQ_Environment')
	create sequence a2messaging.SQ_Environment as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2messaging' and TABLE_NAME=N'Environment')
begin
	create table a2messaging.[Environment]
	(
		Id	bigint	not null constraint PK_Environment primary key
			constraint Environment_PK default(next value for a2messaging.SQ_Environment),
		[Message] bigint not null
			constraint FK_Environment_Messages_Id references a2messaging.[Messages](Id),
		[Name] nvarchar(255) not null,
		[Value] nvarchar(255) not null
	);
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
			constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()),
		Severity nchar(1) not null,
		[Message] nvarchar(max) null,
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Log_EventTime' and parent_object_id = object_id(N'a2messaging.Log'))
begin
	alter table a2messaging.[Log] drop constraint DF_Log_EventTime;
	alter table a2messaging.[Log] add constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()) for EventTime with values;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'WriteLog')
	drop procedure [a2messaging].[WriteLog]
go
------------------------------------------------
create procedure [a2messaging].[WriteLog]
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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Metadata')
	drop procedure a2messaging.[Message.Queue.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Update')
	drop procedure a2messaging.[Message.Queue.Update]
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'Message.TableType' AND ss.name = N'a2messaging')
	drop type a2messaging.[Message.TableType];
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'NameValue.TableType' AND ss.name = N'a2messaging')
	drop type a2messaging.[NameValue.TableType];
go
------------------------------------------------
create type a2messaging.[Message.TableType] as
table (
	[Id] bigint null,
	[Template] nvarchar(255),
	[Key] nvarchar(255),
	[TargetId] bigint,
	[Source] nvarchar(255)
)
go
------------------------------------------------
create type a2messaging.[NameValue.TableType] as
table (
	[Name] nvarchar(255),
	[Value] nvarchar(max)
)
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Metadata]
as
begin
	set nocount on;
	declare @message a2messaging.[Message.TableType];
	declare @nv a2messaging.[NameValue.TableType];
	select [Message!Message!Metadata] = null, * from @message;
	select [Parameters!Message.Parameters!Metadata] = null, * from @nv;
	select [Environment!Message.Environment!Metadata] = null, * from @nv;
end
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Update]
@Message a2messaging.[Message.TableType] readonly,
@Parameters a2messaging.[NameValue.TableType] readonly,
@Environment a2messaging.[NameValue.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level serializable;
	set xact_abort on;
	declare @rt table(Id bigint);
	declare @msgid bigint;
	insert into a2messaging.[Messages] (Template, [Key], TargetId, [Source])
		output inserted.Id into @rt(Id)
		select Template, [Key], TargetId, [Source] from @Message;
	select top(1) @msgid = Id from @rt;
	insert into a2messaging.[Parameters] ([Message], [Name], [Value]) 
		select @msgid, [Name], [Value] from @Parameters;
	insert into a2messaging.Environment([Message], [Name], [Value]) 
		select @msgid, [Name], [Value] from @Environment;
	select [Result!TResult!Object] = null, Id=@msgid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2messaging' and ROUTINE_NAME=N'Message.Queue.Load')
	drop procedure a2messaging.[Message.Queue.Load]
go
------------------------------------------------
create procedure a2messaging.[Message.Queue.Load]
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	select [Message!TMessage!Object] = null, [Id!!Id] = Id, [Template], [Key], TargetId,
		[Parameters!TNameValue!Array] = null, [Environment!TNameValue!Array] = null
	from a2messaging.[Messages] where Id=@Id;
	select [!TNameValue!Array] = null, [Name], [Value], [!TMessage.Parameters!ParentId] = [Message]
		from a2messaging.[Parameters] where [Message]=@Id;
	select [!TNameValue!Array] = null, [Name], [Value], [!TMessage.Environment!ParentId] = [Message]
		from a2messaging.[Environment] where [Message]=@Id;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2messaging to public;
end
go

