/* 20171026-7049 */
/*
------------------------------------------------
Copyright © 2008-2017 Alex Kukhtin

Last updated : 26 oct 2017 19:00
module version : 7049
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
if not exists(select * from a2sys.Versions where Module = N'std:admin')
	insert into a2sys.Versions (Module, [Version]) values (N'std:admin', 7049);
else
	update a2sys.Versions set [Version] = 7049 where Module = N'std:admin';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2admin')
begin
	exec sp_executesql N'create schema a2admin';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Ensure.Admin')
	drop procedure a2admin.[Ensure.Admin]
go
------------------------------------------------
create procedure a2admin.[Ensure.Admin]
@UserId bigint
as
begin
	set nocount on;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Menu.Admin.Load')
	drop procedure a2admin.[Menu.Admin.Load]
go
------------------------------------------------
create procedure a2admin.[Menu.Admin.Load]
@UserId bigint
as
begin
	set nocount on;

	exec a2admin.[Ensure.Admin] @UserId;
	declare @RootId bigint = 99;
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
		m.Name, m.Url, m.Icon, m.[Description]
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
@UserId bigint,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(255) = N'desc',
@Offset int = 0,
@PageSize int = 20,
@Fragment nvarchar(255) = null
as
begin
	set nocount on;

	exec a2admin.[Ensure.Admin] @UserId;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);
	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- список пользователей
	with T([Id!!Id], [Name!!Name], [Phone!!Phone], Email, PersonName, Memo, [!!RowNumber])
	as(
		select u.Id, u.UserName, u.PhoneNumber, u.Email, u.PersonName, Memo,
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

	select [!$System!] = null, [!!PageSize] = 20;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Load')
	drop procedure [a2admin].[User.Load]
go
------------------------------------------------
create procedure a2admin.[User.Load]
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;

	exec a2admin.[Ensure.Admin] @UserId;

	select [User!TUser!Object]=null, 
		[Id!!Id]=u.Id, [Name!!Name]=u.UserName, [Phone!!Phone]=u.PhoneNumber, [Email]=u.Email,
		[PersonName] = u.PersonName, Memo = u.Memo,
		[Groups!TGroup!Array] = null,
		[Roles!TRole!Array] = null
	from a2security.ViewUsers u
	where u.Id = @Id;
	
	select [!TGroup!Array] = null, [Id!!Id] = g.Id, [Key] = g.[Key], [Name!!Name] = g.Name, [Memo] = g.Memo,
		[!TUser.Groups!ParentId] = ug.UserId
	from a2security.UserGroups ug
		inner join a2security.Groups g on ug.GroupId = g.Id
	where ug.UserId = @Id;

	select [!TRole!Array] = null, [Id!!Id] = r.Id, [Name!!Name] = r.Name, [Memo] = r.Memo,
		[!TUser.Roles!ParentId] = ur.UserId
	from a2security.UserRoles ur
		inner join a2security.Roles r on ur.RoleId = r.Id
	where ur.UserId = @Id;
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
	[Memo] nvarchar(255)
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

	exec a2admin.[Ensure.Admin] @UserId;

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
			target.PersonName = source.PersonName
	when not matched by target then
		insert ([UserName], Email, PhoneNumber, Memo, PersonName, SecurityStamp)
		values ([Name], Email, Phone, Memo, PersonName, N'')
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

	exec a2security.[Permission.UpdateUserInfo];
	exec a2admin.[User.Load] @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'User.Login.CheckDuplicate')
	drop procedure [a2admin].[User.Login.CheckDuplicate]
go
------------------------------------------------
create procedure a2admin.[User.Login.CheckDuplicate]
@UserId bigint,
@Id bigint,
@Login nvarchar(255)
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2security.Users where UserName = @Login and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Index')
	drop procedure [a2admin].[Group.Index]
go
------------------------------------------------
create procedure a2admin.[Group.Index]
@UserId bigint,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(255) = N'desc',
@Offset int = 0,
@PageSize int = 20,
@Fragment nvarchar(255) = null
as
begin
	set nocount on;

	exec a2admin.[Ensure.Admin] @UserId;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	set @Dir = isnull(@Dir, @Asc);
	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- список групп
	with T([Id!!Id], [Name!!Name], [Key], [Memo], [UserCount], [!!RowNumber]) 
	as (
		select [Id!!Id]=g.Id, [Name!!Name]=g.Name, 
			[Key] = g.[Key], [Memo]=g.Memo, 
			[UserCount]=(select count(1) from a2security.UserGroups ug where ug.GroupId = g.Id),
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then g.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then g.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then g.Name end asc,
				case when @Order=N'Name' and @Dir = @Desc  then g.Name end desc,
				case when @Order=N'Key' and @Dir = @Asc then g.[Key] end asc,
				case when @Order=N'Key' and @Dir = @Desc  then g.[Key] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then g.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then g.Memo end desc
			)
		from a2security.Groups g
		where @Fragment is null or upper(g.Name) like @Fragment or upper(g.[Key]) like @Fragment
			or upper(g.Memo) like @Fragment or cast(g.Id as nvarchar) like @Fragment
	)

	select [Groups!TGroup!Array]=null, *, [!!RowCount] = (select count(1) from T) 
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];


	select [!$System!] = null, [!!PageSize] = 20;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2admin' and ROUTINE_NAME=N'Group.Load')
	drop procedure a2admin.[Group.Load]
go
------------------------------------------------
create procedure a2admin.[Group.Load]
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;
	
	exec a2admin.[Ensure.Admin] @UserId;

	select [Group!TGroup!Object]=null, [Id!!Id]=g.Id, [Name!!Name]=g.Name, 
		[Key] = g.[Key], [Memo]=g.Memo, [Users!TUser!Array] = null,
		[UserCount]=(select count(1) from a2security.UserGroups ug where ug.GroupId = g.Id)
	from a2security.Groups g
	where g.Id = @Id;

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
	@UserId bigint,
	@Group a2admin.[Group.TableType] readonly,
	@Users a2sys.[Id.TableType] readonly,
	@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	exec a2admin.[Ensure.Admin] @UserId;

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
	exec a2admin.[Group.Load] @UserId, @RetId;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2admin to public;
end
go
------------------------------------------------
set noexec off;
go
