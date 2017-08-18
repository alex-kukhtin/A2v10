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
alter procedure a2v10demo.[Catalog.Customers.Index]
@UserId bigint
as
begin
	set nocount on;
	select [Customers!TCustomer!Array]=null, [Id!!Id] = Id, Name, Amount, Memo
	from a2v10demo.[Catalog.Customers];
end
go
------------------------------------------------
set noexec off;
go

