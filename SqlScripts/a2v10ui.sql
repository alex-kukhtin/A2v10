
/* 20181123-7053 */
/*
------------------------------------------------
Copyright © 2008-2018 Alex Kukhtin

Last updated : 23 nov 2018
module version : 7053
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
if not exists(select * from a2sys.Versions where Module = N'std:ui')
	insert into a2sys.Versions (Module, [Version]) values (N'std:ui', 7053);
else
	update a2sys.Versions set [Version] = 7053 where Module = N'std:ui';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2ui')
begin
	exec sp_executesql N'create schema a2ui';
end
go
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2ui' and SEQUENCE_NAME=N'SQ_Menu')
	create sequence a2ui.SQ_Menu as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu')
begin
	create table a2ui.Menu
	(
		Id	bigint not null constraint PK_Menu primary key
			constraint DF_Menu_PK default(next value for a2ui.SQ_Menu),
		Parent bigint null
			constraint FK_Menu_Parent_Menu foreign key references a2ui.Menu(Id),
		Name nvarchar(255) null,
		Url nvarchar(255) null,
		Icon nvarchar(255) null,
		Model nvarchar(255) null,
		Help nvarchar(255) null,
		[Order] int not null constraint DF_Menu_Order default(0),
		[Description] nvarchar(255) null,
		[Params] nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Help')
begin
	alter table a2ui.Menu add Help nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Menu' and COLUMN_NAME=N'Params')
begin
	alter table a2ui.Menu add Params nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Menu.Acl')
begin
	-- ACL for menu
	create table a2security.[Menu.Acl]
	(
		Menu bigint not null 
			constraint FK_MenuAcl_Menu foreign key references a2ui.Menu(Id),
		UserId bigint not null 
			constraint FK_MenuAcl_UserId_Users foreign key references a2security.Users(Id),
		CanView bit null,
		[Permissions] as cast(CanView as int)
		constraint PK_MenuAcl primary key(Menu, UserId)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Feedback')
begin
	create table a2ui.Feedback
	(
		Id	bigint identity(1, 1) not null constraint PK_Feedback primary key,
		[Date] datetime not null
			constraint DF_Feedback_UtcDate default(getutcdate()),
		UserId bigint not null
			constraint FK_Feedback_UserId_Users foreign key references a2security.Users(Id),
		[Text] nvarchar(max) null
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Feedback_Date' and parent_object_id = object_id(N'a2ui.Feedback'))
begin
	alter table a2ui.Feedback drop constraint DF_Feedback_Date;
	alter table a2ui.Feedback add constraint DF_Feedback_UtcDate default(getutcdate()) for [Date];
end
go
------------------------------------------------
if (255 = (select CHARACTER_MAXIMUM_LENGTH from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2ui' and TABLE_NAME=N'Feedback' and COLUMN_NAME=N'Text'))
begin
	alter table a2ui.Feedback alter column [Text] nvarchar(max) null;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.User.Load')
	drop procedure a2ui.[Menu.User.Load]
go
------------------------------------------------
create procedure a2ui.[Menu.User.Load]
@TenantId int = null,
@UserId bigint,
@Groups nvarchar(255) = null -- for use claims
as
begin
	set nocount on;
	-- TODO: 
	-- 1. get default root for user
	-- 4.
	declare @RootId bigint = 1;
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
		inner join a2security.[Menu.Acl] a on a.Menu = RT.Id
		inner join a2ui.Menu m on RT.Id=m.Id
	where a.UserId = @UserId and a.CanView = 1
	order by RT.[Level], m.[Order], RT.[Id];

	-- system parameters
	select [SysParams!TParam!Object]= null, [AppTitle], [AppSubTitle], [SideBarMode]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle], [SideBarMode])) as p;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'AppTitle.Load')
	drop procedure a2ui.[AppTitle.Load]
go
------------------------------------------------
create procedure a2ui.[AppTitle.Load]
as
begin
	set nocount on;
	select [AppTitle], [AppSubTitle]
	from (select Name, Value=StringValue from a2sys.SysParams) as s
		pivot (min(Value) for Name in ([AppTitle], [AppSubTitle])) as p;
end
go
-----------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_GetMenuFor') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_GetMenuFor;
go
------------------------------------------------
create function a2security.fn_GetMenuFor(@MenuId bigint)
returns @rettable table (Id bigint, Parent bit)
as
begin
	declare @tx table (Id bigint, Parent bit);

	-- all children
	with C(Id, ParentId)
	as
	(
		select @MenuId, cast(null as bigint) 
		union all
		select m.Id, m.Parent
			from a2ui.Menu m inner join C on m.Parent=C.Id
	)
	insert into @tx(Id, Parent)
		select Id, 0 from C
		group by Id;

	-- all parent 
	with P(Id, ParentId)
	as
	(
		select cast(null as bigint), @MenuId 
		union all
		select m.Id, m.Parent
			from a2ui.Menu m inner join P on m.Id=P.ParentId
	)
	insert into @tx(Id, Parent)
		select Id, 1 from P
		group by Id;

	insert into @rettable
		select Id, Parent from @tx
			where Id is not null
		group by Id, Parent;
	return;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateAcl.Menu')
	drop procedure [a2security].[Permission.UpdateAcl.Menu]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateAcl.Menu]
as
begin
	set nocount on;
	declare @MenuTable table (Id bigint, UserId bigint, GroupId bigint, CanView smallint);

	insert into @MenuTable (Id, UserId, GroupId, CanView)
		select f.Id, a.UserId, a.GroupId, a.CanView
		from a2security.Acl a 
			cross apply a2security.fn_GetMenuFor(a.ObjectId) f
			/*exclude denied parents */
		where a.[Object] = N'std:menu' and Not (Parent = 1 and CanView = -1)
		group by f.Id, UserId, GroupId, CanView;

	declare @UserTable table (ObjectId bigint, UserId bigint, CanView bit);

	with T(ObjectId, UserId, CanView)
	as
	(
		select a.Id, UserId=isnull(ur.UserId, a.UserId), a.CanView
		from @MenuTable a
		left join a2security.UserGroups ur on a.GroupId = ur.GroupId
		where isnull(ur.UserId, a.UserId) is not null
	)
	insert into @UserTable(ObjectId, UserId, CanView)
	select ObjectId, UserId,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0)
	from T
	group by ObjectId, UserId;

	merge a2security.[Menu.Acl] as target
	using
	(
		select ObjectId, UserId, CanView
		from @UserTable T
		where CanView = 1
	) as source(ObjectId, UserId, CanView)
		on target.Menu = source.[ObjectId] and target.UserId=source.UserId
	when matched then
		update set 
			target.CanView = source.CanView
	when not matched by target then
		insert (Menu, UserId, CanView)
			values (source.[ObjectId], source.UserId, source.CanView)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'SaveFeedback')
	drop procedure a2ui.SaveFeedback
go
------------------------------------------------
create procedure a2ui.SaveFeedback
@UserId bigint,
@Text nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	insert into a2ui.Feedback(UserId, [Text]) values (@UserId, @Text);
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2ui to public;
end
go
------------------------------------------------
set noexec off;
go
