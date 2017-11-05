/* 20171011-7045 */
/*
------------------------------------------------
Copyright © 2008-2017 A. Kukhtin

Last updated : 03 nov 2017 09:00
module version : 7045
*/

/*
Depends on Windows Workflow Foundation scripts.

	SqlWorkflowInstanceStoreSchema.sql
	SqlWorkflowInstanceStoreLogic.sql

	in %WinDir%\Microsoft.NET\Framework64\v4.0.30319\SQL\en
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
if not exists(select * from a2sys.Versions where Module = N'std:workflow')
	insert into a2sys.Versions (Module, [Version]) values (N'std:workflow', 7045);
else
	update a2sys.Versions set [Version] = 7045 where Module = N'std:workflow';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2workflow')
begin
	exec sp_executesql N'create schema a2workflow';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2workflow' and SEQUENCE_NAME=N'SQ_Processes')
	create sequence a2workflow.SQ_Processes as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2workflow' and TABLE_NAME=N'Processes')
begin
	create table a2workflow.Processes
	(
		Id	bigint	not null constraint PK_Processes primary key
			constraint DF_Processes_PK default(next value for a2workflow.SQ_Processes),
		[Owner] bigint not null
			constraint FK_Processes_Users references a2security.Users(Id),
		WorkflowId uniqueidentifier null,
		Kind nvarchar(255) not null,
		[Source] nvarchar(255) null, -- clr type name or file name 
		[ActionBase] nvarchar(255) null,
		[Definition] nvarchar(max) null, -- activity source
		[State] nvarchar(255) null,
		[DataSource] nvarchar(255) null,
		[Schema] nvarchar(255) null,
		Model nvarchar(255) null,
		ModelId bigint null,

		DateCreated datetime not null constraint DF_Processes_DateCreated default(getdate()),
		DateModified datetime not null constraint DF_Processes_DateModified default(getdate()),
		AutoStart bit null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2workflow' and SEQUENCE_NAME=N'SQ_Inbox')
	create sequence a2workflow.SQ_Inbox as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2workflow' and TABLE_NAME=N'Inbox')
begin
	create table a2workflow.Inbox
	(
		Id	bigint	not null constraint PK_Inbox primary key
			constraint DF_Inbox_PK default(next value for a2workflow.SQ_Inbox),
		ProcessId bigint not null
			constraint FK_Inbox_Processes references a2workflow.Processes(Id),
		Bookmark nvarchar(255) not null,
		Answer nvarchar(255) null,
		[Action] nvarchar(255) null,
		[For] nvarchar(255) null,
		ForId bigint null,
		ForId2 bigint null,
		[Text] nvarchar(255) null,
		Expired datetime,
		DateCreated datetime not null constraint DF_Inbox_DateCreated default(getdate()),
		DateRemoved datetime null,
		UserRemoved bigint null
			constraint FK_Inbox_UserRemoved references a2security.Users(Id),
		Void bit not null constraint DF_Inbox_Void default(0)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2workflow' and SEQUENCE_NAME=N'SQ_Log')
	create sequence a2workflow.SQ_Log as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2workflow' and TABLE_NAME=N'Log')
begin
	create table a2workflow.[Log]
	(
		Id	bigint	not null constraint PK_Log primary key
			constraint DF_Log_PK default(next value for a2workflow.SQ_Log),
		WorkflowId uniqueidentifier not null,
		RecordNumber bigint not null,
		EventTime datetime not null,
		[Level] int not null,
		[State] nvarchar(255) null,
		Content nvarchar(max) null,
	);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'WriteLog')
	drop procedure [a2workflow].[WriteLog]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.DOMAINS where DATA_TYPE = N'table type'and DOMAIN_SCHEMA=N'a2workflow' and DOMAIN_NAME=N'Log.TableType')
	drop type [a2workflow].[Log.TableType];
go
------------------------------------------------
create type a2workflow.[Log.TableType]
as table(
	[State] nvarchar(255) null,
	RecordNumber bigint null,
	Content nvarchar(max) null,
	EventTime datetime null,
	[Level] int null
)
go
------------------------------------------------
create procedure a2workflow.[WriteLog]
@InstanceId uniqueidentifier,
@List a2workflow.[Log.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @state nvarchar(255);

	insert into a2workflow.[Log](WorkflowId, RecordNumber, EventTime, [Level], [State], Content)
		select @InstanceId, RecordNumber, [EventTime], [Level], [State], Content
			from @List 
			order by RecordNumber;
	
	select top(1) @state =[State] 
		from @List where [State] is not null 
		order by [RecordNumber] desc;

	if @state is not null
	begin
		update a2workflow.Processes set [State] = @state, DateModified = getdate() where WorkflowId = @InstanceId;
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Process.Create')
	drop procedure [a2workflow].[Process.Create]
go
------------------------------------------------
create procedure a2workflow.[Process.Create]
@Owner bigint,
@WorkflowId uniqueidentifier,
@Kind nvarchar(255),
@Source nvarchar(255),
@ActionBase nvarchar(255),
@Definition nvarchar(max),
@DataSource nvarchar(255),
@Schema nvarchar(255),
@ModelName nvarchar(255),
@ModelId bigint,
@RetId bigint output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @outputTable table(Id bigint);

	insert into a2workflow.Processes(WorkflowId, [Owner], [Definition], [ActionBase], [Kind], [Source], [DataSource], [Schema], Model, ModelId)
		output inserted.Id into @outputTable(Id)
		values (@WorkflowId, @Owner, @Definition, @ActionBase, @Kind, @Source, @DataSource, @Schema, @ModelName, @ModelId);

	select top(1) @RetId = Id from @outputTable;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Inbox.Create')
	drop procedure [a2workflow].[Inbox.Create]
go
------------------------------------------------
create procedure a2workflow.[Inbox.Create]
@ProcessId bigint,
@Bookmark nvarchar(255),
@Action nvarchar(255),
@For nvarchar(255),
@ForId bigint,
@ForId2 bigint,
@Text nvarchar(255),
@Expired datetime = null,
@RetId bigint output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @outputTable table(Id bigint);
	
	insert into a2workflow.Inbox(ProcessId, Bookmark, [Action], [For], ForId, ForId2, [Text], Expired)
		output inserted.Id into @outputTable(Id)
	values (@ProcessId, @Bookmark, @Action, @For, @ForId, @ForId2, @Text, @Expired);

	select top(1) @RetId = Id from @outputTable;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'InboxInfo.Load')
	drop procedure a2workflow.[InboxInfo.Load]
go
------------------------------------------------
create procedure a2workflow.[InboxInfo.Load]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	select i.Id, i.Bookmark, p.Kind, p.WorkflowId, p.[Definition]
	from a2workflow.Inbox i inner join a2workflow.Processes p on i.ProcessId = p.Id 
	where i.Id = @Id and i.Void = 0;
	-- TODO: can this user can load this inbox
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Inbox.Debug.Load')
	drop procedure a2workflow.[Inbox.Debug.Load]
go
------------------------------------------------
create procedure a2workflow.[Inbox.Debug.Load]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	select [Inbox!TInbox!Object]=null, i.Id, i.Bookmark, i.Void, i.UserRemoved, i.Answer
	from a2workflow.Inbox i 
	where i.Id = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Inbox.Resume')
	drop procedure [a2workflow].[Inbox.Resume]
go
------------------------------------------------
create procedure a2workflow.[Inbox.Resume]
@UserId bigint,
@Id bigint,
@Answer nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2workflow.Inbox set Void=1, UserRemoved = @UserId, DateRemoved=getdate(),
		Answer = @Answer
	where Id = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Process.Pendings')
	drop procedure [a2workflow].[Process.Pendings]
go
------------------------------------------------
create procedure a2workflow.[Process.Pendings]
@Count int
as
begin
	set nocount on;
	with T(ProcessId, WorkflowId, PendingTimer, AutoStart)
	as
	(
		select p.Id, p.WorkflowId, PendingTimer, 0
			from [System.Activities.DurableInstancing].InstancesTable w with(nolock)
				inner join a2workflow.Processes p with(nolock) on p.WorkflowId = w.Id
			where ExecutionStatus = N'Idle' and PendingTimer <= sysutcdatetime() and p.WorkflowId is not null
				and p.Kind is not null
		union all
		select p.Id, p.WorkflowId, sysutcdatetime(), 1
			from a2workflow.Processes p with(nolock) where p.AutoStart=1 
			and p.WorkflowId is null and p.Kind is not null
	)
	select top(@Count) ProcessId, WorkflowId, AutoStart from T
	order by PendingTimer;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2workflow' and ROUTINE_NAME=N'Process.Load')
	drop procedure a2workflow.[Process.Load]
go
------------------------------------------------
create procedure a2workflow.[Process.Load]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Process!TProcess!Object] = null, [Id!!Id] = Id, ActionBase,
		[DataSource], [Schema], Model, ModelId, [Owner],
		[Inboxes!TInbox!Array] = null, [Workflow!TWorkflow!Object] = null
	from a2workflow.Processes
	where Id = @Id;

	select [!TInbox!Array] = null, [Id!!Id] = Id, [!TProcess.Inboxes!ParentId] = ProcessId,
		[Action], Bookmark, [For], ForId, ForId2, Expired, DateCreated
	from a2workflow.Inbox where ProcessId = @Id and Void=0;

	select [!TWorkflow!Object] = null, [Id!!Id] = InstanceId, [!TProcess.Workflow!ParentId] = p.Id, 
		ActiveBookmarks, ExecutionStatus
	from [System.Activities.DurableInstancing].Instances i
	inner join a2workflow.Processes p on p.WorkflowId = i.InstanceId
	where p.Id = @Id;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2workflow to public;
end
go
------------------------------------------------
set noexec off;
go

