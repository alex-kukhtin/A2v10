/*
------------------------------------------------
Copyright © 2012-2021 Alex Kukhtin

Last updated : 31 jan 2021
*/
------------------------------------------------
/* основна процедура - повертає вернхій рівень дерева, та структури даних*/
create or alter procedure samples.[Agent.Index]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	with T(Id, [Name], Icon, HasChildren, IsSpec)
	as (
		select Id = cast(-1 as bigint), [Name] = N'[Результат пошуку]', Icon='search',
			HasChildren = cast(0 as bit), IsSpec=1
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

	-- опис набору TAgent - пустий набор, щоб створити структуру даних
	select [!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Memo
		from samples.Agents where 0 <> 0;
end
go
------------------------------------------------
/* розгортання однієї папки */
create or alter procedure samples.[Agent.Expand]
	@UserId bigint,
	@Id bigint
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

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	declare @fr nvarchar(255);

	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);
	set @Order = lower(@Order);
	set @fr = N'%' + upper(@Fragment) + N'%';

	with T(Id, [Name], Code, Memo, RowNumber)
	as (
		select Id, [Name], Code, Memo = @Fragment,
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
	) select [Children!TAgent!Array] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Memo,
		[!!RowCount]  = (select count(1) from T)
	from T
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
	@Id bigint,
	@Parent bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if @Parent is null
		select @Parent = Parent from samples.Agents where Id=@Id;

	select [Folder!TFolder!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon=N'folder-outline',
		ParentFolder
	from samples.Agents 
	where Id=@Id and Folder = 1;
	
	select [ParentFolder!TParentFolder!Object] = null, [Name!!Name] = [Name] 
	from samples.Agents 
	where Id=@Parent;
end
go
------------------------------------------------
drop procedure if exists samples.[Agent.Folder.Metadata];
drop procedure if exists samples.[Agent.Folder.Update];
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'samples' and DOMAIN_NAME=N'Agent.Folder.TableType' and DATA_TYPE=N'table type')
	drop type samples.[Agent.Folder.TableType];
go
------------------------------------------------
create type samples.[Agent.Folder.TableType]
as table(
	Id bigint null,
	Parent bigint,
	[Name] nvarchar(255)
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
		values (1, s.Parent, s.[Name], @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	select [Folder!TFolder!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Icon=N'folder-outline',
		Parent
	from samples.Agents 
	where Id=@RetId;
end
go
