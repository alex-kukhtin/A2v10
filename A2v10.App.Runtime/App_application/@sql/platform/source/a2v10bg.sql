/*
Copyright © 2008-2022 Oleksandr Kukhtin

Last updated : 02 dec 2022
module version : 7910
*/
------------------------------------------------
exec a2sys.SetVersion N'std:bg', 7910;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2bg')
	exec sp_executesql N'create schema a2bg';
go
------------------------------------------------
grant execute on schema ::a2bg to public;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2bg' and SEQUENCE_NAME=N'SQ_Commands')
	create sequence a2bg.SQ_Commands as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2bg' and TABLE_NAME=N'Commands')
create table a2bg.Commands
(
	Id	bigint not null constraint PK_Commands primary key
		constraint DF_Commands_PK default(next value for a2bg.SQ_Commands),
	Kind nvarchar(16) not null,
	[Data] nvarchar(max) null,
	[Complete] int not null,
	UtcRunAt datetime null,
	Lock uniqueidentifier null,
	LockDate datetime null,
	[UtcDateCreated] datetime not null
		constraint DF_Commands_UtcDateCreated default(getutcdate()),
	[UtcDateComplete] datetime null,
	Error nvarchar(1024) sparse null 
);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2bg' and TABLE_NAME=N'Exceptions')
create table a2bg.Exceptions
(
	Id bigint identity(100, 1) not null constraint PK_Exceptions primary key,
	[JobId] nvarchar(32) null,
	[Message] nvarchar(255) null,
	[UtcDateCreated] datetime not null
		constraint DF_Exceptions_UtcDateCreated default(getutcdate())
);
go
------------------------------------------------
create or alter procedure a2bg.[Command.List]
@Limit int = 10
as
begin
	set nocount on;
	set transaction isolation level read committed;
	
	declare @inst table(Id bigint);

	update top(@Limit) a2bg.Commands set Lock = newid(), LockDate = getutcdate()
	output inserted.Id into @inst
	where Lock is null and Complete = 0 and 
		(UtcRunAt is null or UtcRunAt < getutcdate());

	select b.Id, b.Kind, b.[Data], b.Lock
	from @inst t inner join a2bg.Commands b on t.Id = b.Id
	order by b.Id; -- required!
end
go
------------------------------------------------
create or alter procedure a2bg.[Command.Queue]
@Command nvarchar(16),
@UtcRunAt datetime = null,
@Data nvarchar(1024) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @rtable table(id bigint);
	insert a2bg.Commands (Kind, UtcRunAt, [Data], Complete)
	output inserted.Id into @rtable(id)
	values (@Command, @UtcRunAt, @Data, 0);

	select [Id] = id from @rtable;
end
go
------------------------------------------------
create or alter procedure a2bg.[Command.Complete]
@Id bigint,
@Lock uniqueidentifier,
@Complete int,
@Error nvarchar(1024) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	update a2bg.Commands set Complete = case when @Complete = 1 then 1 else -1 end, 
		Error = @Error, UtcDateComplete = getutcdate()
	where Id = @Id and Lock = @Lock;
end
go
------------------------------------------------
create or alter procedure a2bg.[Exception]
@Message nvarchar(255),
@JobId nvarchar(32)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	insert into a2bg.Exceptions([JobId], [Message]) values (@JobId, @Message);
end
go
