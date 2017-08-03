/* 20170803-7011 */
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
		ClrType nvarchar(255) not null,
		[State] nvarchar(255) null,
		ModelName nvarchar(255) null,
		ModelId bigint null,
		DateCreated datetime not null constraint DF_Processes_DateCreated default(getutcdate()),
		DateModified datetime not null constraint DF_Processes_DateModified default(getutcdate()),
		AutoStart bit null
	);
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

