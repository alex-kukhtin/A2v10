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
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2v10demo' and TABLE_NAME=N'Attachments')
begin
	create table a2v10demo.Attachments
	(
		Id bigint identity(100, 1) not null constraint PK_Attachments primary key,
		Name nvarchar(255) null,
		Mime nvarchar(255) null,
		Data varbinary(max) null,
		DateCreated datetime not null constraint DF_Attachments_DateCreated default(getdate()),
		UserId bigint not null
	);
end

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2v10demo' and TABLE_NAME=N'Catalog.Customers')
begin
	create table a2v10demo.[Catalog.Customers] (
		Id bigint identity(100, 1) not null constraint [PK_Catalog.Customers] primary key,
		Name nvarchar(255) null,
		Amount money null,
		Memo nvarchar(255) null,
		Photo bigint null
	) 
end
go

--alter table a2v10demo.[Catalog.Customers] add Photo bigint null;
------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Index]
@UserId bigint,
@Id bigint = null, -- если вызывается как Browse
@Order nvarchar(255) = null,
@Dir nvarchar(255) = null,
@Filter nvarchar(255) = null,
@Offset int = 0,
@PageSize int = null
as
begin
	set nocount on;

	declare @defaultPageSize int;
	-- TODO get page size form meta
	set @defaultPageSize = 4;
	if @PageSize is null
		set @PageSize = @defaultPageSize;

	declare @Asc nvarchar(10), @Desc nvarchar(10);
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = lower(@Dir);
	set @Offset = isnull(@Offset, 0);

	--raiserror(@Dir , 16, -1) with nowait;

	with T as (
		select Id, Name, Amount, Memo, Photo,
			_RowNumber = row_number() over (
			order by
			case when @Order=N'Id' and @Dir = @Asc then c.Id end asc,
			case when @Order=N'Id' and @Dir = @Desc  then c.Id end desc,
			case when @Order=N'Name' and @Dir = @Asc then c.[Name] end asc,
			case when @Order=N'Name' and @Dir = @Desc  then c.[Name] end desc,
			case when @Order=N'Amount' and @Dir = @Asc then c.[Amount] end asc,
			case when @Order=N'Amount' and @Dir = @Desc  then c.[Amount] end desc,
			case when @Order=N'Memo' and @Dir = @Asc then c.[Memo] end asc,
			case when @Order=N'Memo' and @Dir = @Desc  then c.[Memo] end desc
			)
		from a2v10demo.[Catalog.Customers] c
		where @Filter is null or upper(c.Name) like N'%' + upper(@Filter) + N'%'
	)
	select top(@PageSize) [Customers!TCustomer!Array]=null, [Id!!Id] = Id, Name, Amount, Memo, Photo,
		[!!RowCount] = (select count(1) from T)
	from T 
		where [_RowNumber] > @Offset and [_RowNumber] <= @Offset + @PageSize
	order by [_RowNumber];

	-- служебный набор данных добавляется в Root
	select [!$System!] = null, [!!PageSize] = @defaultPageSize;
end
go
------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Load]
@UserId bigint,
@Id bigint = null /*for create new */
as
begin
	set nocount on;
	select [Customer!TCustomer!Object]=null, [Id!!Id] = Id, Name, Amount, Memo,
		Photo,
		[Images!TImage!Array] = null
	from a2v10demo.[Catalog.Customers] where Id=@Id;

	select [!TImage!Array] = null, [Id!!Id] = 51, [Photo] = 119, [!TCustomer.Images!ParentId] = @Id
	union all
	select [!TImage!Array] = null, [Id!!Id] = 52, [Photo] = 120, [!TCustomer.Images!ParentId] = @Id;
end
go
------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Photo.Load]
@UserId bigint,
@Id bigint = null,
@Key nvarchar(255)
as
begin
	set nocount on;
	select Mime, Stream = Data, Name from a2v10demo.Attachments where Id=@Id;
end
go
------------------------------------------------
alter procedure a2v10demo.[Catalog.Customer.Photo.Update]
@UserId bigint,
@Id bigint,
@Key nvarchar(255),
@Mime nvarchar(255),
@Name nvarchar(255),
@Stream varbinary(max),
@RetId bigint output
as
begin
	set nocount on;
	declare @rtable table (Id bigint);
	
	insert into a2v10demo.Attachments(UserId, Name, Mime, Data)
		output inserted.Id into @rtable
	values(@UserId, @Name, @Mime, @Stream);

	select @RetId = Id from @rtable;
end
go

--select * from a2frontis_wt.a2data.Attachments where Id=108


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
	[Memo] nvarchar(255),
	[Photo] bigint
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
			target.[Memo] = source.[Memo],
			target.[Photo] = source.[Photo]
	when not matched by target then
		insert (Name, Amount, Memo, Photo)
		values (Name, Amount, Memo, Photo)
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

delete from a2v10demo.[Catalog.Customers] where Id>=105

