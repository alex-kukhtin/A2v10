/*
Copyright © 2008-2021 Alex Kukhtin

Last updated : 10 aug 2021
module version : 7765
*/
-- database SEGMENT!
------------------------------------------------
exec a2sys.SetVersion N'std:multitenant', 7765;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'TenantUsers')
begin
	create table a2security.TenantUsers
	(
		TenantId int not null constraint DF_TenantUsers_TenantId default(cast(session_context(N'TenantId') as int)),
		Id	bigint not null,
		UserName nvarchar(255) null,
		PersonName nvarchar(255) null,
		DateCreated datetime not null constraint DF_TenantUsers_DateCreated default(a2sys.fn_getCurrentDate()),
		RegisterHost nvarchar(255) null,
		PhoneNumber nvarchar(255) null,
		Memo nvarchar(255) null,
		TariffPlan nvarchar(255) null,
		[Locale] nvarchar(32) not null constraint DF_TenantUsers_Locale default('uk_UA'),
		Company bigint null,
		Void bit not null constraint DF_TenantUsers_Void default(0),
		OldUserName nvarchar(255),
		OldPhoneNumber nvarchar(255),
		rowid rowversion,
		constraint PK_TenantUsers primary key nonclustered (TenantId, Id)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'TenantUsers' and COLUMN_NAME=N'Locale')
	alter table a2security.TenantUsers add [Locale] nvarchar(32) not null constraint DF_TenantUsers_Locale default('uk_UA') with values;
go
------------------------------------------------
create or alter view a2security.[RealTenants]
as
	select TenantId = t.Id from a2security.Tenants t
		inner join a2security.TenantUsers tu on t.Id = tu.TenantId
	where tu.Id = t.[Admin]
go
------------------------------------------------
/*1-99 - reserved */
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_TenantRoles')
	create sequence a2security.SQ_TenantRoles as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'TenantRoles')
begin
	create table a2security.TenantRoles
	(
		TenantId int not null
			constraint DF_TenantRoles_TenantId default(cast(session_context(N'TenantId') as int)),
		Id	bigint not null
			constraint DF_TenantRoles_PK default(next value for a2security.SQ_TenantRoles),
		[Key] nvarchar(32),
		Void bit not null 
			constraint DF_TenantRoles_Void default(0),
		[Name] nvarchar(255) not null,
		Memo nvarchar(255) null,
		Style nvarchar(255) null,
		[Order] int null,
		constraint PK_TenantRoles primary key nonclustered (TenantId, Id)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'TenantUserRoles')
begin
	-- tenant user roles
	create table a2security.TenantUserRoles
	(
		[User]	bigint not null,
		UserTenantId int not null,
		[Company] bigint not null,
		[Role] bigint not null,
		RoleTenantId int not null,
		constraint PK_TenantUserRoles primary key nonclustered ([User], UserTenantId, Company, [Role], RoleTenantId),
		constraint FK_TenantUserRoles_User_Users foreign key (UserTenantId, [User]) references a2security.TenantUsers(TenantId, Id),
		constraint FK_TenantUserRoles_Role_Roles foreign key (RoleTenantId, [Role]) references a2security.TenantRoles(TenantId, Id)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_TenantAcl')
	create sequence a2security.SQ_TenantAcl as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'TenantAcl')
begin
	-- access control list for tenant users
	create table a2security.TenantAcl
	(
		Id bigint not null constraint PK_TenantAcl primary key
			constraint DF_TenantAcl_PK default(next value for a2security.SQ_TenantAcl),
		[Object] sysname not null,
		[ObjectKey] nchar(4) null,
		[ObjectId] bigint null,
		[User] bigint null,
		UserTenantId int null,
		Company bigint null,
		[Role] bigint null,
		[RoleTenantId] int null,
		CanView smallint not null	-- bit 0 / 1
			constraint CK_TenantAcl_CanView check(CanView in (0, 1, -1))
			constraint DF_TenantAcl_CanView default(0),
		CanEdit smallint not null	-- bit 1 / 2
			constraint CK_TenantAcl_CanEdit check(CanEdit in (0, 1, -1))
			constraint DF_TenantAcl_CanEdit default(0),
		CanDelete smallint not null	-- bit 2 / 4
			constraint CK_TenantAcl_CanDelete check(CanDelete in (0, 1, -1))
			constraint DF_TenantAcl_CanDelete default(0),
		CanApply smallint not null	-- bit 3 / 8
			constraint CK_TenantAcl_CanApply check(CanApply in (0, 1, -1))
			constraint DF_TenantAcl_CanApply default(0),
		CanUnapply smallint not null-- bit 4 / 16
			constraint CK_TenantAcl_CanUnapply check(CanUnapply in (0, 1, -1))
			constraint DF_TenantAcl_CanUnapply default(0),
		constraint FK_TenantAcl_User_Users foreign key (UserTenantId, [User]) 
			references a2security.TenantUsers(TenantId, Id),
		constraint FK_TenantAcl_Role_Roles foreign key (RoleTenantId, [Role]) 
			references a2security.TenantRoles(TenantId, Id)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Menu.TenantAcl')
begin
	-- ACL for menu (Tenants)
	create table a2security.[Menu.TenantAcl]
	(
		Menu bigint not null 
			constraint FK_MenuTenantAcl_Menu foreign key references a2ui.Menu(Id),
		TenantId int not null
			constraint FK_MenuTenantAcl_UserId_Tenants foreign key references a2security.Tenants(Id),
		UserId bigint not null,
		Company int null,
		CanView bit null,
		[Permissions] as cast(CanView as int)
		constraint PK_MenuTenantAcl primary key(Menu, UserId, TenantId),
		constraint FK_MenuTenantAcl_User_Users foreign key (TenantId, UserId) references a2security.TenantUsers(TenantId, Id)
	);
end
go
------------------------------------------------
create or alter procedure a2security.SetTenantId
	@TenantId int = 1
as
begin
	set nocount on;
	update a2security.Tenants set TransactionCount = TransactionCount + 1, LastTransactionDate = a2sys.fn_getCurrentDate() where Id = @TenantId;
	exec sp_set_session_context @key=N'TenantId', @value=@TenantId, @read_only=0;   
end
go
------------------------------------------------
create or alter procedure a2security.CreateTenantUser
@Id bigint,
@UserName nvarchar(255),
@Tenant int,
@PersonName nvarchar(255),
@RegisterHost nvarchar(255) = null,
@PhoneNumber nvarchar(255) = null,
@Memo nvarchar(255) = null,
@TariffPlan nvarchar(255) = null,
@TenantRoles nvarchar(max) = null,
@Locale nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	if not exists(select * from a2security.Tenants where Id = @Tenant)
	begin
		declare @sql nvarchar(255);
		declare @prms nvarchar(255);

		if exists(select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA = N'a2security' and ROUTINE_NAME=N'OnCreateTenant')
		begin
			set @sql = N'a2security.OnCreateTenant @TenantId';
			set @prms = N'@TenantId int';
		end

		begin tran;

		insert into a2security.Tenants(Id, [Admin], Locale) values (@Tenant, @Id, @Locale);

		insert into a2security.TenantUsers(TenantId, Id, UserName, PersonName, RegisterHost, PhoneNumber, Memo, TariffPlan, Locale) 
			values(@Tenant, @Id, @UserName, @PersonName, @RegisterHost, @PhoneNumber, @Memo, @TariffPlan, @Locale);
		/* system user */
		insert into a2security.TenantUsers(TenantId, Id, UserName) values (@Tenant, 0, N'System');

		if @sql is not null
			exec sp_executesql @sql, @prms, @Tenant;

		commit tran;
	end
	else
	begin
		-- add new user to current tenant
		begin tran
		-- inherit RegisterHost, TariffPlan, Locale
		declare @TenantLocale nvarchar(32);

		select @RegisterHost = RegisterHost, @TariffPlan=TariffPlan, @TenantLocale=t.Locale 
		from a2security.Tenants t inner join a2security.TenantUsers u on t.[Admin] = u.Id
		where t.Id = @Tenant;

		insert into a2security.TenantUsers(TenantId, Id, UserName, PersonName, RegisterHost, PhoneNumber, Memo, TariffPlan, Locale) 
			values(@Tenant, @Id, @UserName, @PersonName, @RegisterHost, @PhoneNumber, @Memo, @TariffPlan, isnull(@Locale, @TenantLocale));
		commit tran;
	end
end
go
------------------------------------------------
create or alter procedure a2security.UpdateTenantUser
	@Tenant int,
	@Id bigint,
	@UserName nvarchar(255),
	@PersonName nvarchar(255),
	@RegisterHost nvarchar(255) = null,
	@PhoneNumber nvarchar(255) = null,
	@Memo nvarchar(255) = null,
	@Locale nvarchar(32) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	update a2security.TenantUsers set 
		UserName = @UserName, PersonName = @PersonName, PhoneNumber = @PhoneNumber, Memo = @Memo,
		Locale = @Locale
	where Id = @Id and TenantId = @Tenant;
end
go
------------------------------------------------
create or alter procedure a2security.UpdatePersonName
	@Tenant int,
	@Id bigint,
	@PersonName nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;

	update a2security.TenantUsers set PersonName=@PersonName where TenantId = @Tenant and Id=@Id;
end
go
------------------------------------------------
create or alter procedure a2security.[Permission.UpdateTenantAcl.Menu]
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @MenuTable table (Id bigint, [User] bigint, UserTenantId int, [Role] bigint, RoleTenantId int, CanView smallint);

	insert into @MenuTable (Id, [User], UserTenantId, [Role], RoleTenantId, CanView)
		select f.Id, a.[User], a.UserTenantId, a.[Role], a.RoleTenantId, a.CanView
		from a2security.TenantAcl a 
			cross apply a2security.fn_GetMenuFor(a.ObjectId) f
			/*exclude denied parents */
		where a.[Object] = N'std:menu' and not (Parent = 1 and CanView = -1)
		group by f.Id, [User], [Role], a.UserTenantId, a.RoleTenantId, CanView;

	declare @UserTable table (ObjectId bigint, UserId bigint, TenantId int, CompanyId bigint, CanView bit);

	with T(ObjectId, UserId, TenantId, Company, CanView) as (
		select a.Id, UserId=isnull(ur.[User], a.[User]), ur.UserTenantId, ur.Company, a.CanView
		from @MenuTable a
			left join a2security.TenantUserRoles ur on a.[Role] = ur.[Role] and a.RoleTenantId = ur.RoleTenantId
		where isnull(ur.[User], a.[User]) is not null
	)
	insert into @UserTable(ObjectId, UserId, TenantId, CompanyId, CanView)
	select ObjectId, UserId, TenantId, Company,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0)
	from T
	group by ObjectId, UserId, TenantId, Company;

	merge a2security.[Menu.TenantAcl] as t
	using (
		select ObjectId, UserId, TenantId, CompanyId, CanView from @UserTable T where CanView = 1
	) as s
	on t.Menu = s.[ObjectId] and t.UserId=s.UserId
	when matched then update set 
		t.CanView = s.CanView
	when not matched by target then insert 
		(Menu, UserId, TenantId, Company, CanView) values 
		(s.[ObjectId], s.UserId, s.TenantId, s.CompanyId, s.CanView)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if not exists (select 1 from a2security.TenantUsers where TenantId = 0)
	insert into a2security.TenantUsers (TenantId, Id, UserName)
	values (0, 0, N'System');
go
