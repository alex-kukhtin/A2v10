/*
Copyright © 2008-2022 Oleksandr Kukhtin

Last updated : 25 nov 2022
module version : 7908
*/
------------------------------------------------
exec a2sys.SetVersion N'std:bg', 7908;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2bg')
	exec sp_executesql N'create schema a2bg';
go
------------------------------------------------
grant execute on schema ::a2bg to public;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2bg' and SEQUENCE_NAME=N'SQ_Tasks')
	create sequence a2bg.SQ_Tasks as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2bg' and TABLE_NAME=N'Tasks')
create table a2bg.Tasks
(
	Id	bigint not null constraint PK_Tasks primary key
		constraint DF_Tasks_PK default(next value for a2bg.SQ_Tasks),
	Kind nvarchar(16) not null,
	[Data] nvarchar(max) null,
	[Complete] int not null,
	UtcRunAt datetime null,
	Lock uniqueidentifier null,
	LockDate datetime null,
	[UtcDateCreated] datetime not null
		constraint DF_Tasks_UtcDateCreated default(getutcdate()),
	[UtcDateComplete] datetime null,
	Error nvarchar(1024) sparse null 
);
go
------------------------------------------------
create or alter procedure a2bg.[Tasks.Pending]
@Limit int = 10
as
begin
	set nocount on;
	set transaction isolation level read committed;
	
	declare @inst table(Id bigint);

	update top(@Limit) a2bg.Tasks set Lock = newid(), LockDate = getutcdate()
	output inserted.Id into @inst
	where Lock is null and Complete = 0 and 
		(UtcRunAt is null or UtcRunAt < getutcdate());

	select b.Id, b.Kind, b.[Data], b.Lock
	from @inst t inner join a2bg.Tasks b on t.Id = b.Id
	order by b.Id; -- required!
end
go

------------------------------------------------
create or alter procedure a2bg.[Task.Complete]
@Id bigint,
@Lock uniqueidentifier,
@Complete int,
@Error nvarchar(1024) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	update a2bg.Tasks set Complete = @Complete, Error = @Error 
	where Id = @Id and Lock = @Lock;
end
go