/*
------------------------------------------------
Copyright © 2012-2021 Alex Kukhtin

Last updated : 31 jan 2021
*/
------------------------------------------------
/* основна процедура - повертає вернхій рівень дерева, та структури даних*/
create or alter procedure samples.[Agent.Index]
@UserId bigint,
@Id bigint = null,
@HideSearch bit = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	with T(Id, [Name], Icon, HasChildren, IsSpec)
	as (
		select Id = cast(-1 as bigint), [Name] = N'[Результат пошуку]', Icon='search',
			HasChildren = cast(0 as bit), IsSpec=1
		where @HideSearch = 0
		union all
		select Id, [Name], Icon = N'folder-outline',
			HasChildren= case when exists(select 1 from samples.Agents c where c.Void = 0 and c.Parent = a.Id and c.Folder = 1) then 1 else 0 end,
			IsSpec = 0
		from samples.Agents a
			where a.Folder = 1 and a.Void = 0 and a.Parent is null
	)
	select [Folders!TFolder!Tree] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon,
		/*вкладені папки - lazy*/
		[SubItems!TFolder!Items] = null, 
		/*ознака того, що є вкладені - щоб показати позначку для розгортування */
		[HasSubItems!!HasChildren] = HasChildren,
		/*вкладені контрагенти (не папки!) */
		[Children!TAgent!LazyArray] = null
	from T
	order by [IsSpec], [Name];

	-- описание набора TAgent - пустой набор, чтобы создать правильную структуру данных
	-- родительская папка - вложенный объект, чтобы не плодить лишние наборы
	select [!TAgent!Array] = null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name], a.Code, a.Memo,
		[ParentFolder.Id!TParentFolder!Id] = a.Parent, [ParentFolder.Name!TParentFolder!Name] = p.[Name]
		from samples.Agents a left join samples.Agents p on a.Parent = p.Id where 0 <> 0;
end
go
------------------------------------------------
/* разворачивание одного узла дерева */
create or alter procedure samples.[Agent.Expand]
	@UserId bigint,
	@Id bigint,
	@HideSearch bit = 0
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select [SubItems!TFolder!Tree] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon = N'folder-outline',
		[SubItems!TFolder!Items] = null,
		[HasSubItems!!HasChildren] = case when exists(select 1 from samples.Agents c where c.Void=0 and c.Parent=a.Id and c.Folder = 1) then 1 else 0 end,
		[Children!TAgent!LazyArray] = null
	from samples.Agents a where Folder=1 and Parent = @Id and Void=0;
end
go
-- вложенные контрагенты, не папки
------------------------------------------------
create or alter procedure samples.[Agent.Children]
	@UserId bigint,
	@Fragment nvarchar(255) = null,
	@Id bigint,
	@Offset int = 0,
	@PageSize int = 10,
	@Order nvarchar(255) = N'name',
	@Dir nvarchar(20) = N'asc'
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	declare @fr nvarchar(255);

	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = lower(isnull(@Dir, @Asc));
	set @Order = lower(@Order);
	set @fr = N'%' + upper(@Fragment) + N'%';

	-- структура recordset повторяет то, что мы описывали в основном (Agent.Index).
	with T(Id, [Name], Parent, Code, Memo, RowNumber)
	as (
		select Id, [Name], Parent, Code, Memo,
			[RowNumber] = row_number() over (
				order by 
					case when @Order=N'id'   and @Dir=@Asc  then a.Id end asc,
					case when @Order=N'id'   and @Dir=@Desc then a.Id end desc,
					case when @Order=N'name' and @Dir=@Asc  then a.[Name] end asc,
					case when @Order=N'name' and @Dir=@Desc then a.[Name] end desc,
					case when @Order=N'code' and @Dir=@Asc  then a.Code end asc,
					case when @Order=N'code' and @Dir=@Desc then a.Code end desc,
					case when @Order=N'memo' and @Dir=@Asc  then a.Memo end asc,
					case when @Order=N'memo' and @Dir=@Desc then a.Memo end desc
			)
			from samples.Agents a
		where Folder=0 and Void=0 and (
			Parent = @Id or
				(@Id = -1 and (upper([Name]) like @fr or upper([Code]) like @fr or upper(Memo) like @fr))
			)
	) select [Children!TAgent!Array] = null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name], a.Code, a.Memo,
		[ParentFolder.Id!TParentFolder!Id] = a.Parent, [ParentFolder.Name!TParentFolder!Name] = p.[Name],
		[!!RowCount]  = (select count(1) from T)
	from T a left join samples.Agents p on a.Parent = p.Id
	order by RowNumber offset (@Offset) rows fetch next (@PageSize) rows only;

	-- system data
	select [!$System!] = null,
		[!Children!PageSize] = @PageSize, 
		[!Children!SortOrder] = @Order, 
		[!Children!SortDir] = @Dir,
		[!Children!Offset] = @Offset,
		[!Children.Fragment!Filter] = @Fragment
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Folder.Load]
	@UserId bigint,
	@Id bigint = null,
	@Parent bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if @Parent is null
		select @Parent = Parent from samples.Agents where Id=@Id;

	select [Folder!TFolder!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon=N'folder-outline',
		ParentFolder = Parent
	from samples.Agents 
	where Id=@Id and Folder = 1;
	
	select [ParentFolder!TParentFolder!Object] = null,  [Id!!Id] = Id, [Name!!Name] = [Name]
	from samples.Agents 
	where Id=@Parent;
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Item.Load]
@UserId bigint,
@Id bigint = null,
@Parent bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	if @Parent is null
		select @Parent = Parent from samples.Agents where Id=@Id;
	-- родительский объект вернем в виде, как в списке, чтобы меньше возиться с присваиванием
	select [Agent!TAgent!Object] = null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name], a.Code, a.Memo,
		[ParentFolder.Id!TParentFolder!Id] = a.Parent, [ParentFolder.Name!TParentFolder!Name] = p.[Name]
	from samples.Agents a left join samples.Agents p on a.Parent = p.Id
	where a.Id=@Id and a.Folder = 0;
	
	select [ParentFolder!TParentFolder!Object] = null,  [Id!!Id] = Id, [Name!!Name] = [Name]
	from samples.Agents 
	where Id=@Parent;
end
go
------------------------------------------------
drop procedure if exists samples.[Agent.Folder.Metadata];
drop procedure if exists samples.[Agent.Folder.Update];
drop procedure if exists samples.[Agent.Item.Metadata];
drop procedure if exists samples.[Agent.Item.Update];
go
------------------------------------------------
if exists(select 1 from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'samples' and DOMAIN_NAME=N'Agent.Folder.TableType' and DATA_TYPE=N'table type')
	drop type samples.[Agent.Folder.TableType];
go
------------------------------------------------
create type samples.[Agent.Folder.TableType]
as table(
	Id bigint null,
	ParentFolder bigint,
	[Name] nvarchar(255)
)
go
------------------------------------------------
if exists(select 1 from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'samples' and DOMAIN_NAME=N'Agent.Item.TableType' and DATA_TYPE=N'table type')
	drop type samples.[Agent.Item.TableType];
go
------------------------------------------------
create type samples.[Agent.Item.TableType]
as table(
	Id bigint null,
	ParentFolder bigint,
	[Name] nvarchar(255),
	Code nvarchar(32),
	Memo nvarchar(255)
)
go
------------------------------------------------
create or alter procedure samples.[Agent.Folder.Metadata]
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Folder samples.[Agent.Folder.TableType];
	select [Folder!Folder!Metadata] = null, * from @Folder;
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Folder.Update]
@UserId bigint,
@Folder samples.[Agent.Folder.TableType] readonly,
@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @output table(op sysname, id bigint);

	merge samples.Agents as t
	using @Folder as s
	on (t.Id = s.Id)
	when matched then
		update set 
			t.[Name] = s.[Name],
			t.[DateModified] = getdate(),
			t.[UserModified] = @UserId
	when not matched by target then 
		insert (Folder, Parent, [Name], UserCreated, UserModified)
		values (1, nullif(s.ParentFolder, 0), s.[Name], @UserId, @UserId)
	output 
		$action op, inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	select [Folder!TFolder!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon=N'folder-outline',
		ParentFolder = Parent
	from samples.Agents 
	where Id=@RetId;
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Item.Metadata]
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Agent samples.[Agent.Item.TableType];
	select [Agent!Agent!Metadata] = null, * from @Agent;
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Item.Update]
@UserId bigint,
@Agent samples.[Agent.Item.TableType] readonly,
@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	/* этот фрагмент позволяет удобно отлаживать входящие рекордсеты
	declare @xml nvarchar(max);
	set @xml = (select * from @Agent for xml auto);
	throw 60000, @xml, 0;
	*/

	declare @output table(op sysname, id bigint);

	merge samples.Agents as t
	using @Agent as s
	on (t.Id = s.Id)
	when matched then
		update set 
			t.[Name] = s.[Name],
			t.[Code] = s.[Code],
			t.[Memo] = s.[Memo],
			t.Parent = s.ParentFolder,
			t.[DateModified] = getdate(),
			t.[UserModified] = @UserId
	when not matched by target then 
		insert (Folder, Parent, [Name], Code, Memo, UserCreated, UserModified)
		values (0, case when s.ParentFolder = 0 then null else s.ParentFolder end, 
			s.[Name], Code, Memo, @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	select [Agent!TAgent!Object] = null, [Id!!Id] = a.Id, [Name!!Name] = a.[Name], a.Code, a.Memo,
		[ParentFolder.Id!TParentFolder!Id] = a.Parent, [ParentFolder.Name!TParentFolder!Name] = p.[Name]
	from samples.Agents a left join samples.Agents p on a.Parent = p.Id
	where a.Id=@RetId and a.Folder = 0;
end
go
------------------------------------------------
create or alter procedure [samples].[Agent.Folder.Delete]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	if exists(select 1 from samples.Agents where Parent=@Id and Void=0)
		throw 60000, N'UI:Неможливо видалити папку', 0;
	update samples.Agents set Void=1 where Id=@Id and Folder = 1;
end
go
------------------------------------------------
create or alter procedure samples.[Agent.Item.Delete]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	-- TODO: check if there are any references
	update samples.Agents set Void=1 where Id=@Id and Folder=0;
end
go
------------------------------------------------
-- возвращает путь в дереве элементов начиная с корня
create or alter procedure samples.[Agent.Folder.GetPath]
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	with T(Id, Parent, [Level]) as (
		select cast(null as bigint), @Id, 0
		union all
		select a.Id, a.Parent, [Level] + 1 
			from samples.Agents a inner join T on a.Id = T.Parent
		)
	select [Result!TResult!Array] = null, [Id] = Id from T where Id is not null order by [Level] desc;
end
go
------------------------------------------------
-- возвращает индекс в списке дочерних в зависимости от сортировки
create or alter procedure samples.[Agent.Item.FindIndex]
@UserId bigint,
@Id bigint,
@Parent bigint,
@Order nvarchar(255) = N'name',
@Dir nvarchar(20) = N'asc'
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;

	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = lower(isnull(@Dir, @Asc));
	set @Order = lower(@Order);

	with T(Id, RowNumber)
	as (
		select Id, [RowNumber] = row_number() over (
				order by 
					case when @Order=N'id'   and @Dir=@Asc  then a.Id end asc,
					case when @Order=N'id'   and @Dir=@Desc then a.Id end desc,
					case when @Order=N'name' and @Dir=@Asc  then a.[Name] end asc,
					case when @Order=N'name' and @Dir=@Desc then a.[Name] end desc,
					case when @Order=N'code' and @Dir=@Asc  then a.Code end asc,
					case when @Order=N'code' and @Dir=@Desc then a.Code end desc,
					case when @Order=N'memo' and @Dir=@Asc  then a.Memo end asc,
					case when @Order=N'memo' and @Dir=@Desc then a.Memo end desc
			)
			from samples.Agents a where Folder=0 and Parent=@Parent
	)
	select [Result!TResult!Object] = null, T.Id, RowNo = T.RowNumber - 1 /*row_number is 1-based*/
	from T
	where T.Id = @Id;
end
go
