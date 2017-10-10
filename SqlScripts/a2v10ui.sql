/* 20171008-7042 */
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
		[Order] int not null constraint DF_Menu_Order default(0),
		[Description] nvarchar(255) null
	);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2ui' and ROUTINE_NAME=N'Menu.Load')
	drop procedure a2ui.[Menu.Load]
go
------------------------------------------------
create procedure a2ui.[Menu.Load]
@UserId bigint
as
begin
	set nocount on;
	-- TODO: 
	-- 1. get default root for user
	-- 2. ACL
	-- 3. AppTitle/Subtitle
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
begin
	set nocount on;
	grant execute on schema ::a2ui to public;
end
go
------------------------------------------------
set noexec off;
go

