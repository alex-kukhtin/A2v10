/*
------------------------------------------------
Copyright © 2008-2021 Alex Kukhtin

Last updated : 27 apr 2021
module version : 7751
*/
------------------------------------------------
exec a2sys.SetVersion N'std:admin', 7751;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2admin')
	exec sp_executesql N'create schema a2admin';
go
------------------------------------------------
set nocount on;
grant execute on schema ::a2admin to public;
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Ensure.Admin')
	drop procedure a2admin.[Ensure.Admin]
go
------------------------------------------------
create procedure a2admin.[Ensure.Admin]
	@TenantId int = null,
	@UserId bigint
as
begin
	set nocount on;
	if not exists(select 1 from a2security.UserGroups where GroupId = 77 /*predefined*/ and UserId = @UserId)
		throw 60000, N'The current user is not an administrator', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Menu.Admin.Load')
	drop procedure a2admin.[Menu.Admin.Load]
go
------------------------------------------------
create procedure a2admin.[Menu.Admin.Load]
@TenantId int = null,
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin] @TenantId, @UserId;
	declare @RootId bigint;
	select @RootId = Id from a2ui.Menu where Parent is null and [Name] = N'Admin';

	with RT as (
		select Id=m0.Id, ParentId = m0.Parent, [Level]=0
			from a2ui.Menu m0
			where m0.Id = @RootId
		union all
		select m1.Id, m1.Parent, RT.[Level]+1
			from RT inner join a2ui.Menu m1 on m1.Parent = RT.Id
	)
	select [Menu!TMenu!Tree] = null, [Id!!Id]=RT.Id, [!TMenu.Menu!ParentId]=RT.ParentId,
		[Menu!TMenu!Array] = null,
		m.Name, m.Url, m.Icon, m.[Description], m.Help, m.Params
	from RT 
		inner join a2ui.Menu m on RT.Id=m.Id
	order by RT.[Level], m.[Order], RT.[Id];

	-- system parameters
	select [SysParams!TParam!Object]= null, [AppTitle], [AppSubTitle]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle])) as p;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Index')
	drop procedure [a2admin].[User.Index]
go
------------------------------------------------
create procedure a2admin.[User.Index]
@TenantId int = null,
@UserId bigint,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(255) = N'desc',
@Offset int = 0,
@PageSize int = 20,
@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);
	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of users
	with T([Id!!Id], [Name!!Name], [Phone!!Phone], Email, PersonName, Memo, IsAdmin, [LastLoginDate!!UtcDate], LastLoginHost, [!!RowNumber])
	as(
		select u.Id, u.UserName, u.PhoneNumber, u.Email, u.PersonName, Memo, IsAdmin,
			LastLoginDate, LastLoginHost,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then u.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then u.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then u.UserName end asc,
				case when @Order=N'Name' and @Dir = @Desc  then u.UserName end desc,
				case when @Order=N'PersonName' and @Dir = @Asc then u.PersonName end asc,
				case when @Order=N'PersonName' and @Dir = @Desc then u.PersonName end desc,
				case when @Order=N'Email' and @Dir = @Asc then u.Email end asc,
				case when @Order=N'Email' and @Dir = @Desc then u.Email end desc,
				case when @Order=N'Phone' and @Dir = @Asc then u.PhoneNumber end asc,
				case when @Order=N'Phone' and @Dir = @Desc then u.PhoneNumber end desc,
				case when @Order=N'Memo' and @Dir = @Asc then u.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then u.Memo end desc
			)
		from a2security.ViewUsers u
		where @Fragment is null or upper(u.UserName) like @Fragment or upper(u.PersonName) like @Fragment
			or upper(u.Email) like @Fragment or upper(u.PhoneNumber) like @Fragment 
			or cast(u.Id as nvarchar) like @Fragment or upper(u.Memo) like @Fragment
	)
	select [Users!TUser!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, [!Users!PageSize] = @PageSize, 
		[!Users!SortOrder] = @Order, [!Users!SortDir] = @Dir,
		[!Users!Offset] = @Offset, [!Users.Fragment!Filter] = @Fragment;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Load')
	drop procedure [a2admin].[User.Load]
go
------------------------------------------------
create procedure a2admin.[User.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	select [User!TUser!Object]=null, 
		[Id!!Id]=u.Id, [Name!!Name]=u.UserName, [Phone!!Phone]=u.PhoneNumber, [Email]=u.Email,
		[PersonName] = u.PersonName, Memo = u.Memo, IsAdmin,
		[Groups!TGroup!Array] = null,
		[Roles!TRole!Array] = null
	from a2security.ViewUsers u
	where u.Id = @Id;
	
	select [!TGroup!Array] = null, [Id!!Id] = g.Id, [Key] = g.[Key], [Name!!Name] = g.[Name], [Memo] = g.Memo,
		[!TUser.Groups!ParentId] = ug.UserId
	from a2security.UserGroups ug
		inner join a2security.Groups g on ug.GroupId = g.Id
	where ug.UserId = @Id and g.Void = 0;

	select [!TRole!Array] = null, [Id!!Id] = r.Id, [Name!!Name] = r.[Name], r.[Key], [Memo] = r.Memo, 
		[!TUser.Roles!ParentId] = ur.UserId
	from a2security.UserRoles ur
		inner join a2security.Roles r on ur.RoleId = r.Id
	where ur.UserId = @Id and r.Void = 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Metadata')
	drop procedure [a2admin].[User.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Update')
	drop procedure [a2admin].[User.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'User.TableType' and DATA_TYPE=N'table type')
	drop type [a2admin].[User.TableType];
go
------------------------------------------------
create type a2admin.[User.TableType]
as table(
	Id bigint null,
	[Name] nvarchar(255),
	[Email] nvarchar(255),
	[Phone] nvarchar(255),
	[PersonName] nvarchar(255),
	[Memo] nvarchar(255),
	[Locale] nvarchar(255)
)
go
------------------------------------------------
create procedure a2admin.[User.Metadata]
as
begin
	set nocount on;

	declare @User a2admin.[User.TableType];
	declare @Roles a2sys.[Id.TableType];
	declare @Groups a2sys.[Id.TableType];
	select [User!User!Metadata]=null, * from @User;
	select [Roles!User.Roles!Metadata]=null, * from @Roles;
	select [Groups!User.Groups!Metadata]=null, * from @Groups;
end
go
------------------------------------------------
create procedure [a2admin].[User.Update]
	@TenantId int = null,
	@UserId bigint,
	@User a2admin.[User.TableType] readonly,
	@Roles a2sys.[Id.TableType] readonly,
	@Groups a2sys.[Id.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @AllUsersGroupId bigint = 1; -- predefined

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @output table(op sysname, id bigint);
	merge a2security.ViewUsers as target
	using @User as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[UserName] = source.[Name],
			target.[Email] = source.Email,
			target.PhoneNumber = source.Phone,
			target.Memo = source.Memo,
			target.PersonName = source.PersonName,
			target.[Locale] = isnull(source.[Locale], N'')
	when not matched by target then
		insert ([UserName], Email, PhoneNumber, Memo, PersonName, SecurityStamp, [Locale])
		values ([Name], Email, Phone, Memo, PersonName, N'', isnull([Locale], N''))
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	merge a2security.UserRoles as target
	using @Roles as source
	on target.UserId=@RetId and target.RoleId = source.Id and target.GroupId is null
	when not matched by target then
		insert(RoleId, UserId, GroupId) values (source.Id, @RetId, null)
	when not matched by source and target.UserId=@RetId and target.GroupId is null then 
		delete;

	merge a2security.UserGroups as target
	using @Groups as source
	on target.UserId=@RetId and target.GroupId = source.Id
	when not matched by target then
		insert(UserId, GroupId) values (@RetId, source.Id)
	when not matched by source and target.UserId=@RetId then
		delete;

	if exists (select * from @output where op = N'INSERT')
	begin
		if not exists(select * from a2security.UserGroups where UserId=@RetId and GroupId=@AllUsersGroupId)
			insert into a2security.UserGroups(UserId, GroupId) values (@RetId, @AllUsersGroupId);
	end	
	exec a2security.[Permission.UpdateUserInfo];
	exec a2admin.[User.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Login.CheckDuplicate')
	drop procedure [a2admin].[User.Login.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[User.Login.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Login nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @valid bit = 1;
	if exists(select * from a2security.Users where UserName = @Login and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Delete')
	drop procedure [a2admin].[User.Delete]
go
------------------------------------------------
create procedure a2admin.[User.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;
	delete from a2security.UserGroups where UserId = @Id;
	delete from a2security.UserRoles where UserId = @Id;
	update a2security.ViewUsers set Void=1 where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Index')
	drop procedure [a2admin].[Group.Index]
go
------------------------------------------------
create procedure a2admin.[Group.Index]
	@TenantId int = null,
	@UserId bigint,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(255) = N'desc',
	@Offset int = 0,
	@PageSize int = 20,
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	set @Dir = isnull(@Dir, @Asc);
	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of groups
	with T([Id!!Id], [Name!!Name], [Key], [Memo], [UserCount], [!!RowNumber]) 
	as (
		select [Id!!Id]=g.Id, [Name!!Name]=g.[Name], 
			[Key] = g.[Key], [Memo]=g.Memo, 
			[UserCount]=(select count(1) from a2security.UserGroups ug where ug.GroupId = g.Id),
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then g.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then g.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then g.[Name] end asc,
				case when @Order=N'Name' and @Dir = @Desc  then g.[Name] end desc,
				case when @Order=N'Key' and @Dir = @Asc then g.[Key] end asc,
				case when @Order=N'Key' and @Dir = @Desc  then g.[Key] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then g.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then g.Memo end desc
			)
		from a2security.Groups g
		where g.Void = 0 and (@Fragment is null or upper(g.[Name]) like @Fragment or upper(g.[Key]) like @Fragment
			or upper(g.Memo) like @Fragment or cast(g.Id as nvarchar) like @Fragment)
	)

	select [Groups!TGroup!Array]=null, *, [!!RowCount] = (select count(1) from T) 
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];


	select [!$System!] = null, [!Groups!PageSize] = @PageSize, 
		[!Groups!SortOrder] = @Order, [!Groups!SortDir] = @Dir,
		[!Groups!Offset] = @Offset, [!Groups.Fragment!Filter] = @Fragment;

end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Load')
	drop procedure a2admin.[Group.Load]
go
------------------------------------------------
create procedure a2admin.[Group.Load]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	
	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	select [Group!TGroup!Object]=null, [Id!!Id]=g.Id, [Name!!Name]=g.[Name], 
		[Key] = g.[Key], [Memo]=g.Memo, 
		[UserCount]=(select count(1) from a2security.UserGroups ug where ug.GroupId = @Id),
		[Users!TUser!Array] = null
	from a2security.Groups g
	where g.Id = @Id and g.Void = 0;

	/* users in group */
	select [!TUser!Array] = null, [Id!!Id] = u.Id, [Name!!Name] = u.UserName, u.PersonName,
		u.Memo,
		[!TGroup.Users!ParentId] = ug.GroupId
	from a2security.UserGroups ug
		inner join a2security.ViewUsers u on ug.UserId = u.Id
	where ug.GroupId = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Metadata')
	drop procedure a2admin.[Group.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Update')
	drop procedure a2admin.[Group.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'Group.TableType' and DATA_TYPE=N'table type')
	drop type a2admin.[Group.TableType];
go
------------------------------------------------
create type a2admin.[Group.TableType]
as table(
	Id bigint null,
	[Name] nvarchar(255),
	[Key] nvarchar(255),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
create procedure a2admin.[Group.Metadata]
as
begin
	set nocount on;

	declare @Group a2admin.[Group.TableType];
	declare @Users a2sys.[Id.TableType];

	select [Group!Group!Metadata]=null, * from @Group;
	select [Users!Group.Users!Metadata] = null, * from @Users;
end
go
------------------------------------------------
create procedure a2admin.[Group.Update]
	@TenantId  int = null,
	@UserId bigint,
	@Group a2admin.[Group.TableType] readonly,
	@Users a2sys.[Id.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @output table(op sysname, id bigint);

	merge a2security.Groups as target
	using @Group as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Key] = source.[Key],
			target.[Memo] = source.Memo
	when not matched by target then 
		insert ([Name], [Key], Memo)
		values ([Name], [Key], Memo)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);
	select top(1) @RetId = id from @output;

	merge a2security.UserGroups as target
	using @Users as source
	on target.UserId=source.Id and target.GroupId=@RetId
	when not matched by target then
		insert(GroupId, UserId) values (@RetId, source.Id)
	when not matched by source and target.GroupId=@RetId then delete;
		
	exec a2security.[Permission.UpdateUserInfo];
	exec a2admin.[Group.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Delete')
	drop procedure [a2admin].[Group.Delete]
go
------------------------------------------------
create procedure a2admin.[Group.Delete]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;
	if @Id < 100
	begin
		raiserror(N'UI:Can''t delete system group', 16, -1) with nowait;
	end
	else 
	begin
		begin tran
			delete from a2security.UserGroups where GroupId = @Id;
			delete from a2security.UserRoles where GroupId = @Id;
			update a2security.Groups set Void=1, [Key] = null where Id=@Id;
		commit tran;
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Key.CheckDuplicate')
	drop procedure [a2admin].[Group.Key.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[Group.Key.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Key nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @valid bit = 1;
	if exists(select * from a2security.Groups where [Key] = @Key and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Name.CheckDuplicate')
	drop procedure [a2admin].[Group.Name.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[Group.Name.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@Name nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @valid bit = 1;
	if exists(select * from a2security.Groups where [Name] = @Name and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Index')
	drop procedure [a2admin].[Role.Index]
go
------------------------------------------------
create procedure a2admin.[Role.Index]
@TenantId int = null,
@UserId bigint,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(255) = N'desc',
@Offset int = 0,
@PageSize int = 20,
@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	set @Dir = isnull(@Dir, @Asc);
	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of roles
	with T([Id!!Id], [Name!!Name], [Key], [Memo], [ElemCount], [!!RowNumber]) 
	as (
		select [Id!!Id]=r.Id, [Name!!Name]=r.[Name], 
			[Key] = r.[Key], [Memo]=r.Memo, 
			[ElemCount]=(select count(1) from a2security.UserRoles ur where ur.RoleId = r.Id),
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then r.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then r.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then r.[Name] end asc,
				case when @Order=N'Name' and @Dir = @Desc  then r.[Name] end desc,
				case when @Order=N'Key' and @Dir = @Asc then r.[Key] end asc,
				case when @Order=N'Key' and @Dir = @Desc  then r.[Key] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then r.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then r.Memo end desc
			)
		from a2security.Roles r
		where r.Void = 0 and (@Fragment is null or upper(r.[Name]) like @Fragment or upper(r.[Key]) like @Fragment
			or upper(r.Memo) like @Fragment or cast(r.Id as nvarchar) like @Fragment)
	)

	select [Roles!TRole!Array]=null, *, [!!RowCount] = (select count(1) from T) 
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber]; 


	select [!$System!] = null, [!Roles!PageSize] = @PageSize, 
		[!Roles!SortOrder] = @Order, [!Roles!SortDir] = @Dir,
		[!Roles!Offset] = @Offset, [!Roles.Fragment!Filter] = @Fragment;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Load')
	drop procedure a2admin.[Role.Load]
go
------------------------------------------------
create procedure a2admin.[Role.Load]
@TenantId int = null,
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	
	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	select [Role!TRole!Object]=null, [Id!!Id]=r.Id, [Name!!Name]=r.[Name], 
		[Key] = r.[Key], [Memo]=r.Memo, [UsersGroups!TUserOrGroup!Array] = null,
		[ElemCount]=(select count(1) from a2security.UserRoles ur where ur.RoleId = r.Id)
	from a2security.Roles r
	where r.Id = @Id and r.Void = 0;

	/* users in role */
	select [!TUserOrGroup!Array] = null, [Id!!Id] = ur.Id, [!TRole.UsersGroups!ParentId] = ur.RoleId,
		[UserId] = ur.UserId, [UserName] = u.UserName, u.PersonName,
		GroupId = ur.GroupId, GroupName= g.[Name]		
	from a2security.UserRoles ur
		left join a2security.ViewUsers u on ur.UserId = u.Id
		left join a2security.Groups g on ur.GroupId = g.Id
	where ur.RoleId = @Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Delete')
	drop procedure [a2admin].[Role.Delete]
go
------------------------------------------------
create procedure a2admin.[Role.Delete]
@TenantId int = null,
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	if @Id < 100
	begin
		raiserror(N'UI:Can''t delete system role', 16, -1) with nowait;
	end
	else
	begin
		begin tran;
		exec a2admin.[Ensure.Admin]  @TenantId, @UserId;
		delete from a2security.UserRoles where RoleId = @Id;
		update a2security.Roles set Void=1, [Key] = null where Id=@Id;
		commit tran;
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Key.CheckDuplicate')
	drop procedure [a2admin].[Role.Key.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[Role.Key.CheckDuplicate]
@TenantId int = null,
@UserId bigint,
@Id bigint,
@Key nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @valid bit = 1;
	if exists(select * from a2security.Roles where [Key] = @Key and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Name.CheckDuplicate')
	drop procedure [a2admin].[Role.Name.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[Role.Name.CheckDuplicate]
@TenantId int = null,
@UserId bigint,
@Id bigint,
@Name nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @valid bit = 1;
	if exists(select * from a2security.Roles where [Name] = @Name and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Metadata')
	drop procedure a2admin.[Role.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Role.Update')
	drop procedure a2admin.[Role.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'Role.TableType' and DATA_TYPE=N'table type')
	drop type a2admin.[Role.TableType];
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'UserGroup.TableType' and DATA_TYPE=N'table type')
	drop type a2admin.[UserGroup.TableType];
go
------------------------------------------------
create type a2admin.[Role.TableType]
as table(
	Id bigint null,
	[Name] nvarchar(255),
	[Key] nvarchar(255),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
create type a2admin.[UserGroup.TableType]
as table(
	Id bigint null,
	ParentId bigint,
	[UserId] bigint,
	[GroupId] bigint
)
go
------------------------------------------------
create procedure a2admin.[Role.Metadata]
as
begin
	set nocount on;

	declare @Role a2admin.[Role.TableType];
	declare @UserGroup a2admin.[UserGroup.TableType];

	select [Role!Role!Metadata]=null, * from @Role;
	select [UsersGroups!Role.UsersGroups!Metadata] = null, * from @UserGroup;
end
go
------------------------------------------------
create procedure a2admin.[Role.Update]
	@TenantId int = null,
	@UserId bigint,
	@Role a2admin.[Role.TableType] readonly,
	@UsersGroups a2admin.[UserGroup.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @output table(op sysname, id bigint);

	merge a2security.Roles as target
	using @Role as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Key] = source.[Key],
			target.[Memo] = source.Memo
	when not matched by target then 
		insert ([Name], [Key], Memo)
		values ([Name], [Key], Memo)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);
	select top(1) @RetId = id from @output;

	merge a2security.UserRoles as target
	using @UsersGroups as source
	on (target.Id = source.Id)
	when not matched by target then
		insert (RoleId, UserId, GroupId) 
		values (@RetId, UserId, GroupId)
	when not matched by source and target.RoleId=@RetId then
		delete;

	exec a2admin.[Role.Load] @TenantId, @UserId, @RetId;
end
go
------------------------------------------------
create or alter procedure a2admin.[Process.Index]
	@TenantId int = null,
	@UserId bigint,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(255) = N'desc',
	@Offset int = 0,
	@PageSize int = 20,
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	--declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	--set @Asc = N'asc'; set @Desc = N'desc';
	--set @Dir = isnull(@Dir, @Asc);
	--if @Fragment is not null
	--	set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of processes
	with T([Id!!Id], [Kind!!Name], Base, [Owner], DateCreated, DateModified, [!!RowNumber])
	as(
		select p.Id, p.Kind, p.ActionBase, u.UserName, p.DateCreated, p.DateModified
			,[!!RowNumber] = row_number() over (order by p.Id desc)
		from a2workflow.Processes p
			left join a2security.Users u on p.[Owner]=u.Id
	)
	select [Processes!TProcess!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
	where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, [!Processes!PageSize] = @PageSize, 
		[!Processes!SortOrder] = @Order, [!Processes!SortDir] = @Dir,
		[!Processes!Offset] = @Offset, [!Processes.Fragment!Filter] = @Fragment;
end
go
------------------------------------------------
create or alter procedure a2admin.[Inbox.Index]
	@TenantId int = null,
	@UserId bigint,
	@Order nvarchar(255) = N'Id',
	@Dir nvarchar(255) = N'desc',
	@Offset int = 0,
	@PageSize int = 20,
	@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	--declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	--set @Asc = N'asc'; set @Desc = N'desc';
	--set @Dir = isnull(@Dir, @Asc);
	--if @Fragment is not null
	--	set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of inboxes
	with T([Id!!Id], [Bookmark!!Name], ProcessId, [Role], [User], [Text], DateCreated, DateRemoved, [!!RowNumber])
	as(
		select i.Id, i.Bookmark, i.ProcessId, i.[For], u.UserName, i.[Text], i.DateCreated, i.DateRemoved
			,[!!RowNumber] = row_number() over (order by i.Id desc)
		from a2workflow.Inbox i
			left join a2security.Users u on i.ForId=u.Id
		where @Fragment is null or i.ProcessId=try_cast(@Fragment as bigint)
	)
	select [Inboxes!TInbox!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
	where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, [!Inboxes!PageSize] = @PageSize, 
		[!Inboxes!SortOrder] = @Order, [!Inboxes!SortDir] = @Dir,
		[!Inboxes!Offset] = @Offset, [!Inboxes.Fragment!Filter] = @Fragment;
end
go
------------------------------------------------
begin
	-- create admin menu
	declare @menu table(id bigint, p0 bigint, [name] nvarchar(255), [url] nvarchar(255), icon nvarchar(255), [order] int);
	insert into @menu(id, p0, [name], [url], icon, [order])
	values
		(900, null,	N'Admin',       null,			null,		0),
		(901, 900,	N'@[Users]',	N'identity',	null,		10),
		(910, 901,	N'@[Users]',	N'user',		N'user',	10),
		(911, 901,	N'@[Groups]',	N'group',		N'users',	20),
		(912, 901,	N'@[Roles]',	N'role',		N'users',	30),
		(913, 901,	N'@[ApiUsers]',	N'api',			N'external',40);
			
	merge a2ui.Menu as target
	using @menu as source
	on target.Id=source.id and target.Id >= 900 and target.Id < 1000
	when matched then
		update set
			target.Id = source.id,
			target.[Name] = source.[name],
			target.[Url] = source.[url],
			target.[Icon] = source.icon,
			target.[Order] = source.[order]
	when not matched by target then
		insert(Id, Parent, [Name], [Url], Icon, [Order]) values (id, p0, [name], [url], icon, [order])
	when not matched by source and target.Id >= 900 and target.Id < 1000 then 
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'ApiUser.Index')
	drop procedure [a2admin].[ApiUser.Index]
go
------------------------------------------------
create procedure a2admin.[ApiUser.Index]
@TenantId int = null,
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	-- list of Api users
	select [Users!TUser!Array]=null, [Id!!Id]=u.Id, [Name!!Name]=UserName, u.Memo, u.LastLoginDate, u.LastLoginHost
	from a2security.Users u
	where u.ApiUser = 1 and u.Void=0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'ApiUser.Load')
	drop procedure [a2admin].[ApiUser.Load]
go
------------------------------------------------
create procedure a2admin.[ApiUser.Load]
@TenantId int = null,
@UserId bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	-- one API user
	select [User!TUser!Object]=null, [Id!!Id] = Id, [Name] = UserName, [Memo], 
		LastLoginDate, LastLoginHost, [Logins!TLogin!MapObject!ApiKey:Basic] = null
	from a2security.Users where ApiUser = 1 and Void=0 and Id=@Id;

	select [!TLogin!MapObject] = null, [!!Key] = [Mode],
		[!TUser.Logins!ParentId] = [User], ClientId, ClientSecret, ApiKey, AllowIP, RedirectUrl
	from a2security.ApiUserLogins where [User]=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'ApiUser.Metadata')
	drop procedure [a2admin].[ApiUser.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'ApiUser.Update')
	drop procedure [a2admin].[ApiUser.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'ApiUser.TableType' and DATA_TYPE=N'table type')
	drop type [a2admin].[ApiUser.TableType];
go
------------------------------------------------
create type a2admin.[ApiUser.TableType]
as table(
	Id bigint null,
	[Name] nvarchar(255),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2admin' and DOMAIN_NAME=N'ApiLogin.TableType' and DATA_TYPE=N'table type')
	drop type [a2admin].[ApiLogin.TableType];
go
------------------------------------------------
create type a2admin.[ApiLogin.TableType]
as table(
	Id bigint null,
	ParentId bigint,
	[CurrentKey] nvarchar(255),
	[ClientId] nvarchar(255),
	[ClientSecret] nvarchar(255),
	[ApiKey] nvarchar(255),
	[AllowIP] nvarchar(255),
	[Memo] nvarchar(255),
	RedirectUrl nvarchar(255)
)
go
------------------------------------------------
create procedure a2admin.[ApiUser.Metadata]
as
begin
	set nocount on;

	declare @User a2admin.[ApiUser.TableType];
	declare @Logins a2admin.[ApiLogin.TableType];
	select [User!User!Metadata]=null, * from @User;
	select [Logins!User.Logins*!Metadata] = null, * from @Logins;
end
go
------------------------------------------------
create procedure [a2admin].[ApiUser.Update]
	@TenantId int = null,
	@UserId bigint,
	@User a2admin.[ApiUser.TableType] readonly,
	@Logins a2admin.[ApiLogin.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin]  @TenantId, @UserId;

	declare @output table(op sysname, id bigint);
	declare @RetId bigint;

	merge a2security.Users as target
	using @User as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[UserName] = source.[Name],
			target.Memo = source.Memo
	when not matched by target then
		insert ([UserName], Memo, SecurityStamp, ApiUser)
		values ([Name], Memo, N'', 1)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	select top(1) @RetId = id from @output;

	merge a2security.ApiUserLogins as t
	using @Logins as s
	on (t.[User] = @RetId and t.Mode = s.CurrentKey and s.CurrentKey in (N'ApiUser', N'Basic'))
	when matched then update set
		t.[ClientId] = s.ClientId,
		t.[ClientSecret] = s.[ClientSecret],
		t.[ApiKey] = s.ApiKey,
		t.[AllowIP] = s.[AllowIP],
		t.[RedirectUrl] = s.[RedirectUrl]
	when not matched by target then insert
		([User], Mode, ApiKey, ClientId, ClientSecret, AllowIP, [RedirectUrl]) values
		(@RetId, s.CurrentKey, s.ApiKey, s.ClientId, s.ClientSecret, AllowIP, [RedirectUrl])
	when not matched by source and t.[User] = @RetId then delete;
		

	exec a2admin.[ApiUser.Load] @TenantId = @TenantId, @UserId = @UserId, @Id = @RetId;
end
go

------------------------------------------------
if not exists(select * from a2security.Users where Id <> 0)
begin
	set nocount on;
	insert into a2security.Users(Id, UserName, SecurityStamp, PasswordHash, PersonName, EmailConfirmed)
	values (99, N'admin@admin.com', N'c9bb451a-9d2b-4b26-9499-2d7d408ce54e', N'AJcfzvC7DCiRrfPmbVoigR7J8fHoK/xdtcWwahHDYJfKSKSWwX5pu9ChtxmE7Rs4Vg==',
		N'System administrator', 1);
	insert into a2security.UserGroups(UserId, GroupId) values (99, 77), (99, 1); /*predefined values*/
end
go
