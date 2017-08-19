/* DEMO */
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
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2v10demo')
begin
	exec sp_executesql N'create schema a2v10demo';
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2v10demo to public;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2v10demo' and TABLE_NAME=N'Catalog.Customers')
begin
	create table a2v10demo.[Catalog.Customers] (
		Id bigint identity(100, 1) not null constraint [PK_Catalog.Customers] primary key,
		Name nvarchar(255) null,
		Amount money null,
		Memo nvarchar(255) null
	) 
end
go
------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Index]
@UserId bigint
as
begin
	set nocount on;
	select [Customers!TCustomer!Array]=null, [Id!!Id] = Id, Name, Amount, Memo
	from a2v10demo.[Catalog.Customers];
end
go

------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Load]
@UserId bigint,
@Id bigint = null /*for create new */
as
begin
	set nocount on;
	select [Customer!TCustomer!Object]=null, [Id!!Id] = Id, Name, Amount, Memo
	from a2v10demo.[Catalog.Customers] where Id=@Id;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2v10demo' and ROUTINE_NAME=N'Catalog.Customer.Metadata')
	drop procedure a2v10demo.[Catalog.Customer.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2v10demo' and ROUTINE_NAME=N'Catalog.Customer.Update')
	drop procedure a2v10demo.[Catalog.Customer.Update]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.DOMAINS where DATA_TYPE = N'table type'and DOMAIN_SCHEMA=N'a2v10demo' and DOMAIN_NAME=N'Catalog.Customer.TableType')
	drop type a2v10demo.[Catalog.Customer.TableType]
go
------------------------------------------------
create type [a2v10demo].[Catalog.Customer.TableType] as
table (
	[Id] bigint null,
	[Name] nvarchar(255),
	[Amount] money,
	[Memo] nvarchar(255)
)
go
------------------------------------------------
create procedure a2v10demo.[Catalog.Customer.Metadata]
as
begin
	set nocount on;
	declare @Customer a2v10demo.[Catalog.Customer.TableType];
	/*!!! Всегда нужен путь в модели !!!*/
	select [Customer!Customer!Metadata]=null, * from @Customer;
end
go
------------------------------------------------
create procedure a2v10demo.[Catalog.Customer.Update]
@UserId bigint,
@Customer a2v10demo.[Catalog.Customer.TableType] readonly
as
begin
	set nocount on;
	/*
	declare @msg nvarchar(max);
	select @msg = (select * from @Customer for xml auto);
	throw 60000,  @msg, 0;
	*/
	declare @output table(op sysname, id bigint);
	declare @RetId bigint;

	merge a2v10demo.[Catalog.Customers] as target
	using @Customer as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Amount] = source.Amount,
			target.[Memo] = source.[Memo]
	when not matched by target then
		insert (Name, Amount, Memo)
		values (Name, Amount, Memo)
	output 
		$action op, inserted.Id id
	into @output(op, id);
	select top(1) @RetId = id from @output;

	exec [a2v10demo].[Catalog.Customer.Load] @UserId, @RetId;
end
go
------------------------------------------------
set noexec off;
go

