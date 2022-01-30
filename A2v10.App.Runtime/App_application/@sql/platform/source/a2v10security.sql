/*
------------------------------------------------
Copyright © 2008-2021 Alex Kukhtin

Last updated : 12 sep 2021
module version : 7768
*/
------------------------------------------------
exec a2sys.SetVersion N'std:security', 7768;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2security')
begin
	exec sp_executesql N'create schema a2security';
end
go
------------------------------------------------
-- a2security schema
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Tenants')
	create sequence a2security.SQ_Tenants as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants')
begin
	create table a2security.Tenants
	(
		Id	int not null constraint PK_Tenants primary key
			constraint DF_Tenants_PK default(next value for a2security.SQ_Tenants),
		[Admin] bigint null, -- admin user ID
		[Source] nvarchar(255) null,
		[TransactionCount] bigint not null constraint DF_Tenants_TransactionCount default(0),
		LastTransactionDate datetime null,
		DateCreated datetime not null constraint DF_Tenants_UtcDateCreated2 default(a2sys.fn_getCurrentDate()),
		TrialPeriodExpired datetime null,
		DataSize float null,
		[State] nvarchar(128) null,
		UserSince datetime null,
		LastPaymentDate datetime null,
		Balance money null,
		[Locale] nvarchar(32) not null constraint DF_Tenants_Locale default('uk-UA')
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'Locale')
	alter table a2security.Tenants add [Locale] nvarchar(32) not null constraint DF_Tenants_Locale default('uk-UA');
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Config')
begin
	create table a2security.Config
	(
		[Key] sysname not null constraint PK_Config primary key,
		[Value] nvarchar(255) not null,
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Tenants') and name = N'IX_Tenants_Admin')
	create index IX_Tenants_Admin on a2security.Tenants ([Admin]) include (Id);
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Tenants_UtcDateCreated' and parent_object_id = object_id(N'a2security.Tenants'))
begin
	alter table a2security.Tenants drop constraint DF_Tenants_UtcDateCreated;
	alter table a2security.Tenants add constraint DF_Tenants_UtcDateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'TransactionCount')
begin
	alter table a2security.Tenants add [TransactionCount] bigint not null constraint DF_Tenants_TransactionCount default(0);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'TrialPeriodExpired')
begin
	alter table a2security.Tenants add TrialPeriodExpired datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'LastTransactionDate')
begin
	alter table a2security.Tenants add [LastTransactionDate] datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'LastPaymentDate')
begin
	alter table a2security.Tenants add LastPaymentDate datetime null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'Balance')
begin
	alter table a2security.Tenants add Balance money null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'DataSize')
	alter table a2security.Tenants add DataSize float null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'State')
	alter table a2security.Tenants add [State] nvarchar(128) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Tenants' and COLUMN_NAME=N'UserSince')
	alter table a2security.Tenants add UserSince datetime null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Users')
	create sequence a2security.SQ_Users as bigint start with 100 increment by 1;
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_GetCurrentSegment') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_GetCurrentSegment;
go
------------------------------------------------
create function a2security.fn_GetCurrentSegment()
returns nvarchar(32)
as
begin
	declare @ret nvarchar(32);
	select @ret = [Value] from a2security.Config where [Key] = N'CurrentSegment';
	return @ret;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Modules')
begin
	create table a2security.Modules
	(
		[Id] nvarchar(16) not null constraint PK_Modules primary key,
		[Name] nvarchar(255) not null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users')
begin
	create table a2security.Users
	(
		Id	bigint not null constraint PK_Users primary key
			constraint DF_Users_PK default(next value for a2security.SQ_Users),
		Tenant int null 
			constraint FK_Users_Tenant_Tenants foreign key references a2security.Tenants(Id),
		UserName nvarchar(255) not null constraint UNQ_Users_UserName unique,
		DomainUser nvarchar(255) null,
		Void bit not null constraint DF_Users_Void default(0),
		SecurityStamp nvarchar(max) not null,
		PasswordHash nvarchar(max) null,
		/*for .net core compatibility*/
		SecurityStamp2 nvarchar(max) null,
		PasswordHash2 nvarchar(max) null,
		ApiUser bit not null constraint DF_Users_ApiUser default(0),
		TwoFactorEnabled bit not null constraint DF_Users_TwoFactorEnabled default(0),
		Email nvarchar(255) null,
		EmailConfirmed bit not null constraint DF_Users_EmailConfirmed default(0),
		PhoneNumber nvarchar(255) null,
		PhoneNumberConfirmed bit not null constraint DF_Users_PhoneNumberConfirmed default(0),
		LockoutEnabled	bit	not null constraint DF_Users_LockoutEnabled default(1),
		LockoutEndDateUtc datetimeoffset null,
		AccessFailedCount int not null constraint DF_Users_AccessFailedCount default(0),
		[Locale] nvarchar(32) not null constraint DF_Users_Locale2 default('uk-UA'),
		PersonName nvarchar(255) null,
		LastLoginDate datetime null, /*UTC*/
		LastLoginHost nvarchar(255) null,
		Memo nvarchar(255) null,
		ChangePasswordEnabled bit not null constraint DF_Users_ChangePasswordEnabled default(1),
		RegisterHost nvarchar(255) null,
		TariffPlan nvarchar(255) null,
		[Guid] uniqueidentifier null,
		Referral bigint null,
		Segment nvarchar(32) null,
		Company bigint null,
			-- constraint FK_Users_Company_Companies foreign key references a2security.Companies(Id)
		DateCreated datetime null
			constraint DF_Users_DateCreated default(a2sys.fn_getCurrentDate()),
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'SecurityStamp2')
begin
	alter table a2security.Users add SecurityStamp2 nvarchar(max) null;
	alter table a2security.Users add PasswordHash2 nvarchar(max) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'DateCreated')
	alter table a2security.Users add DateCreated datetime null
			constraint DF_Users_DateCreated default(a2sys.fn_getCurrentDate());
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'ApiUser')
	alter table a2security.Users add ApiUser bit not null 
		constraint DF_Users_ApiUser default(0) with values;
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Users_Locale' and parent_object_id = object_id(N'a2security.Users'))
begin
	alter table a2security.Users drop constraint DF_Users_Locale;
	alter table a2security.Users add constraint DF_Users_Locale2 default('uk-UA') for [Locale] with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Company')
begin
	alter table a2security.Users add Company bigint null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserLogins')
begin
	create table a2security.UserLogins
	(
		[User] bigint not null 
			constraint FK_UserLogins_User_Users foreign key references a2security.Users(Id),
		[LoginProvider] nvarchar(255) not null,
		[ProviderKey] nvarchar(max) not null,
		constraint PK_UserLogins primary key([User], LoginProvider) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Users add Void bit not null constraint DF_Users_Void default(0) with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'DomainUser')
begin
	alter table a2security.Users add DomainUser nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'ChangePasswordEnabled')
begin
	alter table a2security.Users add ChangePasswordEnabled bit not null constraint DF_Users_ChangePasswordEnabled default(1) with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'LastLoginDate')
begin
	alter table a2security.Users add LastLoginDate datetime null;
	alter table a2security.Users add LastLoginHost nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'RegisterHost')
begin
	alter table a2security.Users add RegisterHost nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'TariffPlan')
begin
	alter table a2security.Users add TariffPlan nvarchar(255) null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Guid')
begin
	alter table a2security.Users add [Guid] uniqueidentifier null
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Referral')
begin
	alter table a2security.Users add Referral bigint null;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Segment')
begin
	alter table a2security.Users add Segment nvarchar(32) null;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Users') and name = N'UNQ_Users_DomainUser')
	create unique index UNQ_Users_DomainUser on a2security.Users(DomainUser) where DomainUser is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users' and COLUMN_NAME=N'Tenant')
begin
	alter table a2security.Users add Tenant int null 
			constraint FK_Users_Tenant_Tenants foreign key references a2security.Tenants(Id);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Groups')
	create sequence a2security.SQ_Groups as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Groups')
begin
	create table a2security.Groups
	(
		Id	bigint not null constraint PK_Groups primary key
			constraint DF_Groups_PK default(next value for a2security.SQ_Groups),
		Void bit not null constraint DF_Groups_Void default(0),				
		[Name] nvarchar(255) not null constraint UNQ_Groups_Name unique,
		[Key] nvarchar(255) null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Groups' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Groups add Void bit not null constraint DF_Groups_Void default(0) with values;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Groups') and name = N'UNQ_Group_Key')
	create unique index UNQ_Group_Key on a2security.Groups([Key]) where [Key] is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserGroups')
begin
	-- user groups
	create table a2security.UserGroups
	(
		UserId	bigint	not null
			constraint FK_UserGroups_UsersId_Users foreign key references a2security.Users(Id),
		GroupId bigint	not null
			constraint FK_UserGroups_GroupId_Groups foreign key references a2security.Groups(Id),
		constraint PK_UserGroups primary key clustered (UserId, GroupId) with (fillfactor = 70)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Roles')
	create sequence a2security.SQ_Roles as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Roles')
begin
	create table a2security.Roles
	(
		Id	bigint not null constraint PK_Roles primary key
			constraint DF_Roles_PK default(next value for a2security.SQ_Roles),
		Void bit not null constraint DF_Roles_Void default(0),				
		[Name] nvarchar(255) not null constraint UNQ_Roles_Name unique,
		[Key] nvarchar(255) null,
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Roles' and COLUMN_NAME=N'Void')
begin
	alter table a2security.Roles add Void bit not null constraint DF_Roles_Void default(0) with values;
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.Roles') and name = N'UNQ_Role_Key')
	create unique index UNQ_Role_Key on a2security.Roles([Key]) where [Key] is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_UserRoles')
	create sequence a2security.SQ_UserRoles as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserRoles')
begin
	create table a2security.UserRoles
	(
		Id	bigint	not null constraint PK_UserRoles primary key
			constraint DF_UserRoles_PK default(next value for a2security.SQ_UserRoles),
		RoleId bigint null
			constraint FK_UserRoles_RoleId_Roles foreign key references a2security.Roles(Id),
		UserId	bigint	null
			constraint FK_UserRoles_UserId_Users foreign key references a2security.Users(Id),
		GroupId bigint null 
			constraint FK_UserRoles_GroupId_Groups foreign key references a2security.Groups(Id)
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ApiUserLogins')
begin
	create table a2security.ApiUserLogins
	(
		[User] bigint not null 
			constraint FK_ApiUserLogins_User_Users foreign key references a2security.Users(Id),
		[Mode] nvarchar(16) not null, -- ApiKey, OAuth2, JWT
		[ClientId] nvarchar(255),
		[ClientSecret] nvarchar(255),
		[ApiKey] nvarchar(255),
		[AllowIP] nvarchar(1024),
		Memo nvarchar(255),
		RedirectUrl nvarchar(255),
		[DateModified] datetime not null constraint DF_ApiUserLogins_DateModified default(a2sys.fn_getCurrentDate()),
		constraint PK_ApiUserLogins primary key clustered ([User], Mode) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ApiUserLogins' and COLUMN_NAME=N'RedirectUrl')
	alter table a2security.ApiUserLogins add RedirectUrl nvarchar(255);
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.ApiUserLogins') and name = N'UNQ_ApiUserLogins_ApiKey')
	create unique index UNQ_ApiUserLogins_ApiKey on a2security.ApiUserLogins(ApiKey) where ApiKey is not null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Acl')
	create sequence a2security.SQ_Acl as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Acl')
begin
	-- access control list
	create table a2security.[Acl]
	(
		Id	bigint not null constraint PK_Acl primary key
			constraint DF_Acl_PK default(next value for a2security.SQ_Acl),
		[Object] sysname not null,
		[ObjectId] bigint null,
		[ObjectKey] nvarchar(16) null,
		UserId bigint null 
			constraint FK_Acl_UserId_Users foreign key references a2security.Users(Id),
		GroupId bigint null 
			constraint FK_Acl_GroupId_Groups foreign key references a2security.Groups(Id),
		CanView smallint not null	-- 0
			constraint CK_Acl_CanView check(CanView in (0, 1, -1))
			constraint DF_Acl_CanView default(0),
		CanEdit smallint not null	-- 1
			constraint CK_Acl_CanEdit check(CanEdit in (0, 1, -1))
			constraint DF_Acl_CanEdit default(0),
		CanDelete smallint not null	-- 2
			constraint CK_Acl_CanDelete check(CanDelete in (0, 1, -1))
			constraint DF_Acl_CanDelete default(0),
		CanApply smallint not null	-- 3
			constraint CK_Acl_CanApply check(CanApply in (0, 1, -1))
			constraint DF_Acl_CanApply default(0)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Module.Acl')
begin
	-- ACL for Module
	create table a2security.[Module.Acl]
	(
		Module nvarchar(16) not null 
			constraint FK_ModuleAcl_Modules foreign key references a2security.Modules(Id),
		UserId bigint not null 
			constraint FK_ModuleAcl_UserId_Users foreign key references a2security.Users(Id),
		CanView bit null,
		CanEdit bit null,
		CanDelete bit null,
		CanApply bit null,
		[Permissions] as cast(CanView as int) + cast(CanEdit as int) * 2 + cast(CanDelete as int) * 4 + cast(CanApply as int) * 8
		constraint PK_ModuleAcl primary key clustered (Module, UserId) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Acl' and COLUMN_NAME = N'ObjectId' and IS_NULLABLE=N'NO')
	alter table a2security.[Acl] alter column [ObjectId] bigint null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = N'a2security' and TABLE_NAME = N'Acl' and COLUMN_NAME = N'ObjectKey')
	alter table a2security.[Acl] add [ObjectKey] nvarchar(16) null;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'LogCodes')
create table a2security.[LogCodes]
(
	Code int not null constraint PK_LogCodes primary key,
	[Name] nvarchar(32) not null
);
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log')
begin
	create table a2security.[Log]
	(
		Id	bigint not null identity(100, 1) constraint PK_Log primary key,
		UserId bigint not null
			constraint FK_Log_UserId_Users foreign key references a2security.Users(Id),
		Code int not null
			constraint FK_Log_Code_Codes foreign key references a2security.LogCodes(Code),
		EventTime	datetime not null
			constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()),
		Severity nchar(1) not null,
		Host nvarchar(255) null,
		[Message] nvarchar(max) sparse null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Code')
begin
	alter table a2security.[Log] add Code int not null
		constraint FK_Log_Code_Codes foreign key references a2security.LogCodes(Code);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Log' and COLUMN_NAME=N'Host')
	alter table a2security.[Log] add Host nvarchar(255) null;
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_Log_UtcEventTime' and parent_object_id = object_id(N'a2security.Log'))
begin
	alter table a2security.[Log] drop constraint DF_Log_UtcEventTime;
	alter table a2security.[Log] add constraint DF_Log_EventTime2 default(a2sys.fn_getCurrentDate()) for EventTime with values;
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Referrals')
	create sequence a2security.SQ_Referrals as bigint start with 1000 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Referrals')
begin
	create table a2security.Referrals
	(
		Id	bigint not null constraint PK_Referrals primary key
			constraint DF_Referrals_PK default(next value for a2security.SQ_Referrals),
		Void bit not null constraint DF_Referrals_Void default(0),				
		[Type] nchar(1) not null, /* (S)ystem, (C)ustomer */
		[Link] nvarchar(255) not null constraint UNQ_Referrals_Link unique,
		UserCreated bigint not null
			constraint FK_Referrals_UserCreated_Users foreign key references a2security.Users(Id),
		DateCreated	datetime not null
			constraint DF_Referrals_DateCreated2 default(a2sys.fn_getCurrentDate()),
		Memo nvarchar(255) null
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Analytics')
begin
	create table a2security.Analytics
	(
		UserId bigint not null constraint PK_Analytics primary key
			constraint FK_Analytics_UserId_Users foreign key references a2security.Users(Id),
		[Value] nvarchar(max) null,
		DateCreated	datetime not null
			constraint DF_Analytics_DateCreated2 default(a2sys.fn_getCurrentDate()),
	)
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'AnalyticTags')
begin
	create table a2security.AnalyticTags
	(
		UserId bigint not null
			constraint FK_AnalyticTags_UserId_Users foreign key references a2security.Users(Id),
		[Name] nvarchar(255),
		[Value] nvarchar(max) null,
			constraint PK_AnalyticTags primary key clustered (UserId, [Name]) with (fillfactor = 70)
	)
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateCreated' and parent_object_id = object_id(N'a2security.Referrals'))
begin
	alter table a2security.Referrals drop constraint DF_Referrals_DateCreated;
	alter table a2security.Referrals add constraint DF_Referrals_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS where CONSTRAINT_SCHEMA = N'a2security' and CONSTRAINT_NAME = N'FK_Users_Referral_Referrals')
begin
	alter table a2security.Users add constraint FK_Users_Referral_Referrals foreign key (Referral) references a2security.Referrals(Id);
end
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.VIEWS where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'ViewUsers')
begin
	drop view a2security.ViewUsers;
end
go
------------------------------------------------
create view a2security.ViewUsers
as
	select Id, UserName, DomainUser, PasswordHash, SecurityStamp, Email, PhoneNumber,
		LockoutEnabled, AccessFailedCount, LockoutEndDateUtc, TwoFactorEnabled, [Locale],
		PersonName, Memo, Void, LastLoginDate, LastLoginHost, Tenant, EmailConfirmed,
		PhoneNumberConfirmed, RegisterHost, ChangePasswordEnabled, TariffPlan, Segment,
		IsAdmin = cast(case when ug.GroupId = 77 /*predefined: admins*/ then 1 else 0 end as bit),
		IsTenantAdmin = cast(case when exists(select * from a2security.Tenants where [Admin] = u.Id) then 1 else 0 end as bit),
		SecurityStamp2, PasswordHash2, Company
	from a2security.Users u
		left join a2security.UserGroups ug on u.Id = ug.UserId and ug.GroupId=77 /*predefined: admins*/
	where Void=0 and Id <> 0 and ApiUser = 0;
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_isUserTenantAdmin') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_isUserTenantAdmin;
go
------------------------------------------------
create function a2security.fn_isUserTenantAdmin(@TenantId int, @UserId bigint)
returns bit
as
begin
	return case when 
		exists(select * from a2security.Tenants where Id = @TenantId and [Admin] = @UserId) then 1 
	else 0 end;
end
go
------------------------------------------------
if exists (select * from sys.objects where object_id = object_id(N'a2security.fn_isUserAdmin') and type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
	drop function a2security.fn_isUserAdmin;
go
------------------------------------------------
create function a2security.fn_isUserAdmin(@UserId bigint)
returns bit
as
begin
	return case when 
		exists(select * from a2security.UserGroups where GroupId=77 /*predefined: admins */ and UserId = @UserId) then 1 
	else 0 end;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'WriteLog')
	drop procedure a2security.[WriteLog]
go
------------------------------------------------
create procedure [a2security].[WriteLog]
	@UserId bigint = null,
	@SeverityChar nchar(1),
	@Code int = null,
	@Message nvarchar(max) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	insert into a2security.[Log] (UserId, Severity, [Code] , [Message]) 
		values (isnull(@UserId, 0 /*system user*/), @SeverityChar, @Code, @Message);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserById')
	drop procedure a2security.FindUserById
go
------------------------------------------------
create procedure a2security.FindUserById
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where Id=@Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByName')
	drop procedure a2security.FindUserByName
go
------------------------------------------------
create procedure a2security.FindUserByName
@UserName nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where UserName=@UserName;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByEmail')
	drop procedure a2security.FindUserByEmail
go
------------------------------------------------
create procedure a2security.FindUserByEmail
@Email nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where Email=@Email;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByPhoneNumber')
	drop procedure a2security.FindUserByPhoneNumber
go
------------------------------------------------
create procedure a2security.FindUserByPhoneNumber
@PhoneNumber nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select * from a2security.ViewUsers where PhoneNumber=@PhoneNumber;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindUserByLogin')
	drop procedure a2security.FindUserByLogin
go
------------------------------------------------
create procedure a2security.[FindUserByLogin]
@LoginProvider nvarchar(255),
@ProviderKey nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @UserId bigint;

	select @UserId = [User] from a2security.UserLogins where LoginProvider = @LoginProvider and ProviderKey = @ProviderKey;

	select * from a2security.ViewUsers where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'AddUserLogin')
	drop procedure a2security.[AddUserLogin]
go
------------------------------------------------
create procedure a2security.AddUserLogin
@UserId bigint,
@LoginProvider nvarchar(255),
@ProviderKey nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if not exists(select * from a2security.UserLogins where [User]=@UserId and LoginProvider=@LoginProvider)
	begin
		insert into a2security.UserLogins([User], [LoginProvider], [ProviderKey]) 
			values (@UserId, @LoginProvider, @ProviderKey);
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindApiUserByApiKey')
	drop procedure a2security.FindApiUserByApiKey
go
------------------------------------------------
create procedure a2security.FindApiUserByApiKey
@Host nvarchar(255) = null,
@ApiKey nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @status nvarchar(255);
	declare @code int;

	set @status = N'ApiKey=' + @ApiKey;
	set @code = 65; /*fail*/

	declare @user table(Id bigint, Tenant int, Segment nvarchar(255), [Name] nvarchar(255), ClientId nvarchar(255), AllowIP nvarchar(255));
	insert into @user(Id, Tenant, Segment, [Name], ClientId, AllowIP)
	select top(1) u.Id, u.Tenant, Segment, [Name]=u.UserName, s.ClientId, s.AllowIP 
	from a2security.Users u inner join a2security.ApiUserLogins s on u.Id = s.[User]
	where u.Void=0 and s.Mode = N'ApiKey' and s.ApiKey=@ApiKey;
	
	if @@rowcount > 0 
	begin
		set @code = 64 /*sucess*/;
		update a2security.Users set LastLoginDate=getutcdate(), LastLoginHost=@Host
		from @user t inner join a2security.Users u on t.Id = u.Id;
	end

	insert into a2security.[Log] (UserId, Severity, Code, Host, [Message])
		values (0, N'I', @code, @Host, @status);

	select * from @user;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'FindApiUserByBasic')
	drop procedure a2security.FindApiUserByBasic
go
------------------------------------------------
create procedure a2security.FindApiUserByBasic
@Host nvarchar(255) = null,
@ClientId nvarchar(255) = null,
@ClientSecret nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;

	declare @status nvarchar(255);
	declare @code int;

	set @status = N'Basic=' + @ClientId;
	set @code = 65; /*fail*/

	declare @usertable table(Id bigint, Tenant int, Segment nvarchar(255), [Name] nvarchar(255), ClientId nvarchar(255), AllowIP nvarchar(255));

	insert into @usertable(Id, Tenant, Segment, [Name], ClientId, AllowIP)
	select top(1) u.Id, u.Tenant, Segment, [Name]=u.UserName, s.ClientId, s.AllowIP 
	from a2security.Users u inner join a2security.ApiUserLogins s on u.Id = s.[User]
	where u.Void=0 and s.Mode = N'Basic' and s.ClientId = @ClientId and s.ClientSecret = @ClientSecret;
	
	if @@rowcount > 0 
	begin
		set @code = 64 /*sucess*/;
		update a2security.Users set LastLoginDate=getutcdate(), LastLoginHost=@Host
			from @usertable t inner join a2security.Users u on t.Id = u.Id;
	end

	insert into a2security.[Log] (UserId, Severity, Code, Host, [Message])
		values (0, N'I', @code, @Host, @status);

	select * from @usertable;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserPassword')
	drop procedure a2security.UpdateUserPassword
go
------------------------------------------------
create procedure a2security.UpdateUserPassword
@Id bigint,
@PasswordHash nvarchar(max),
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set PasswordHash = @PasswordHash, SecurityStamp = @SecurityStamp where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 15; /*PasswordUpdated*/
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserLockout')
	drop procedure a2security.UpdateUserLockout
go
------------------------------------------------
create procedure a2security.UpdateUserLockout
@Id bigint,
@AccessFailedCount int,
@LockoutEndDateUtc datetimeoffset
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set 
		AccessFailedCount = @AccessFailedCount, LockoutEndDateUtc = @LockoutEndDateUtc
	where Id=@Id;
	declare @msg nvarchar(255);
	set @msg = N'AccessFailedCount: ' + cast(@AccessFailedCount as nvarchar(255));
	exec a2security.[WriteLog] @Id, N'E', 18, /*AccessFailedCount*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UpdateUserLogin')
	drop procedure a2security.UpdateUserLogin
go
------------------------------------------------
create procedure a2security.UpdateUserLogin
@Id bigint,
@LastLoginDate datetime,
@LastLoginHost nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set LastLoginDate = @LastLoginDate, LastLoginHost = @LastLoginHost where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 1; /*Login*/
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'ConfirmEmail')
	drop procedure a2security.ConfirmEmail
go
------------------------------------------------
create procedure a2security.ConfirmEmail
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set EmailConfirmed = 1 where Id=@Id;

	declare @msg nvarchar(255);
	select @msg = N'Email: ' + Email from a2security.ViewUsers where Id=@Id;
	exec a2security.[WriteLog] @Id, N'I', 26, /*EmailConfirmed*/ @msg;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'ConfirmPhoneNumber')
	drop procedure a2security.ConfirmPhoneNumber
go
------------------------------------------------
create procedure a2security.ConfirmPhoneNumber
@Id bigint,
@PhoneNumber nvarchar(255),
@PhoneNumberConfirmed bit,
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	update a2security.ViewUsers set PhoneNumber = @PhoneNumber,
		PhoneNumberConfirmed = @PhoneNumberConfirmed, SecurityStamp=@SecurityStamp
	where Id=@Id;

	declare @msg nvarchar(255);
	set @msg = N'PhoneNumber: ' + @PhoneNumber;
	exec a2security.[WriteLog] @Id, N'I', 27, /*PhoneNumberConfirmed*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'GetUserGroups')
	drop procedure a2security.GetUserGroups
go
------------------------------------------------
create procedure a2security.GetUserGroups
@UserId bigint
as
begin
	set nocount on;
	select g.Id, g.[Name], g.[Key]
	from a2security.UserGroups ug
		inner join a2security.Groups g on ug.GroupId = g.Id
	where ug.UserId = @UserId and g.Void=0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateUserInfo')
	drop procedure [a2security].[Permission.UpdateUserInfo]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateUserInfo]
as
begin
	set nocount on;
	declare @procName sysname;
	declare @sqlProc sysname;
	declare #tmpcrs cursor local fast_forward read_only for
		select ROUTINE_NAME from INFORMATION_SCHEMA.ROUTINES 
			where ROUTINE_SCHEMA = N'a2security' and ROUTINE_NAME like N'Permission.UpdateAcl.%';
	open #tmpcrs;
	fetch next from #tmpcrs into @procName;
	while @@fetch_status = 0
	begin
		set @sqlProc = N'a2security.[' + @procName + N']';
		exec sp_executesql @sqlProc;
		fetch next from #tmpcrs into @procName;
	end
	close #tmpcrs;
	deallocate #tmpcrs;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'CreateUser')
	drop procedure a2security.CreateUser
go
------------------------------------------------
create procedure a2security.CreateUser
@UserName nvarchar(255),
@PasswordHash nvarchar(max) = null,
@SecurityStamp nvarchar(max),
@Email nvarchar(255) = null,
@PhoneNumber nvarchar(255) = null,
@Tenant int = null,
@PersonName nvarchar(255) = null,
@RegisterHost nvarchar(255) = null,
@Memo nvarchar(255) = null,
@TariffPlan nvarchar(255) = null,
@Locale nvarchar(255) = null,
@RetId bigint output
as
begin
	-- from account/register only
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	
	set @Locale = isnull(@Locale, N'uk-UA')

	declare @userId bigint; 

	if @Tenant = -1
	begin
		declare @tenants table(id int);
		declare @users table(id bigint);
		declare @tenantId int;

		begin tran;
		insert into a2security.Tenants([Admin], Locale)
			output inserted.Id into @tenants(id)
		values (null, @Locale);

		select top(1) @tenantId = id from @tenants;

		insert into a2security.ViewUsers(UserName, PasswordHash, SecurityStamp, Email, PhoneNumber, Tenant, PersonName, 
			RegisterHost, Memo, TariffPlan, Segment, Locale)
			output inserted.Id into @users(id)
			values (@UserName, @PasswordHash, @SecurityStamp, @Email, @PhoneNumber, @tenantId, @PersonName, 
				@RegisterHost, @Memo, @TariffPlan, a2security.fn_GetCurrentSegment(), @Locale);
		select top(1) @userId = id from @users;

		update a2security.Tenants set [Admin] = @userId where Id=@tenantId;

		insert into a2security.UserGroups(UserId, GroupId) values (@userId, 1 /*all users*/);

		if exists(select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA = N'a2security' and ROUTINE_NAME=N'OnCreateNewUser')
		begin
			declare @sql nvarchar(255);
			declare @prms nvarchar(255);
			set @sql = N'a2security.OnCreateNewUser @TenantId, @CompanyId, @UserId';
			set @prms = N'@TenantId int, @CompanyId bigint, @UserId bigint';
			exec sp_executesql @sql, @prms, @tenantId, 1, @userId;
		end
		commit tran;
	end
	else
	begin
		begin tran;

		insert into a2security.ViewUsers(UserName, PasswordHash, SecurityStamp, Email, PhoneNumber, PersonName, RegisterHost, Memo, TariffPlan, Locale)
			output inserted.Id into @users(id)
			values (@UserName, @PasswordHash, @SecurityStamp, @Email, @PhoneNumber, @PersonName, @RegisterHost, @Memo, @TariffPlan, @Locale);
		select top(1) @userId = id from @users;

		insert into a2security.UserGroups(UserId, GroupId) values (@userId, 1 /*all users*/);
		commit tran;

		exec a2security.[Permission.UpdateUserInfo];

	end
	set @RetId = @userId;

	declare @msg nvarchar(255);
	set @msg = N'User: ' + @UserName;
	exec a2security.[WriteLog] @RetId, N'I', 2, /*UserCreated*/ @msg;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check')
	drop procedure a2security.[Permission.Check]
go
------------------------------------------------
create procedure a2security.[Permission.Check]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255),
	@CanEdit bit = null output,
	@CanDelete bit = null output,
	@CanApply bit = null output,
	@Permissions int = null output
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @_canView bit = 0;
	declare @_canEdit bit = 0;
	declare @_canDelete bit = 0;
	declare @_canApply bit = 0;
	declare @_permissions int = 0;


	if @UserId = 0 or 1 = a2security.fn_isUserAdmin(@UserId)
	begin
		set @CanEdit = 1;
		set @CanDelete = 1;
		set @CanApply = 1;
		set @Permissions = 15;
	end
	else
	begin
		select @_canView = CanView, @_canEdit = CanEdit, @_canDelete = CanDelete, @_canApply = CanApply,
			@_permissions = [Permissions]
		from a2security.[Module.Acl]
		where [Module] = @Module and [UserId] = @UserId

		if isnull(@_canView, 0) = 0
			throw 60000, N'@[UIError.AccessDenied]', 0;
		else
		begin
			set @CanEdit = @_canEdit;
			set @CanDelete = @_canDelete;
			set @CanApply = @_canApply;
			set @Permissions = @_permissions;
		end
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Apply')
	drop procedure a2security.[Permission.Check.Apply]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Apply]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @_canApply bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @CanApply = @_canApply output;
	if @_canApply = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Edit')
	drop procedure a2security.[Permission.Check.Edit]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Edit]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255),
	@Permissions int = null output
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_canEdit bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, 
		@CanEdit = @_canEdit output, @Permissions = @Permissions output;
	if @_canEdit = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Check.Delete')
	drop procedure a2security.[Permission.Check.Delete]
go
------------------------------------------------
create procedure a2security.[Permission.Check.Delete]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_canDelete bit;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @CanDelete = @_canDelete output;
	if @_canDelete = 0
		throw 60000, N'@[UIError.AccessDenied]', 0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.Get')
	drop procedure a2security.[Permission.Get]
go
------------------------------------------------
create procedure a2security.[Permission.Get]
	@UserId bigint,
	@CompanyId bigint = 0,
	@Module nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	declare @_permissions int = 0;
	exec a2security.[Permission.Check] 
		@UserId = @UserId, @CompanyId = @CompanyId, @Module = @Module, @Permissions = @_permissions output;
	return @_permissions;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.ChangePassword.Load')
	drop procedure a2security.[User.ChangePassword.Load]
go
------------------------------------------------
create procedure a2security.[User.ChangePassword.Load]
	@TenantId int = 0,
	@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	if 1 <> (select ChangePasswordEnabled from a2security.Users where Id=@UserId)
	begin
		raiserror (N'UI:@[ChangePasswordDisabled]', 16, -1) with nowait;
	end
	select [User!TUser!Object] = null, [Id!!Id] = Id, [Name!!Name] = UserName, 
		[OldPassword] = cast(null as nvarchar(255)),
		[NewPassword] = cast(null as nvarchar(255)),
		[ConfirmPassword] = cast(null as nvarchar(255)) 
	from a2security.Users where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Login.CheckDuplicate')
	drop procedure a2security.[Login.CheckDuplicate]
go
------------------------------------------------
create procedure a2security.[Login.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@CompanyId bigint = 1,
	@Login nvarchar(255) = null
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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'PhoneNumber.CheckDuplicate')
	drop procedure a2security.[PhoneNumber.CheckDuplicate]
go
------------------------------------------------
create procedure a2security.[PhoneNumber.CheckDuplicate]
	@TenantId int = null,
	@UserId bigint,
	@Id bigint,
	@CompanyId bigint = 1,
	@PhoneNumber nvarchar(255) = null
as
begin
	set nocount on;
	declare @valid bit = 1;
	if exists(select * from a2security.Users where PhoneNumber = @PhoneNumber and Id <> @Id)
		set @valid = 0;
	select [Result!TResult!Object] = null, [Value] = @valid;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'UserStateInfo.Load')
	drop procedure a2security.[UserStateInfo.Load]
go
------------------------------------------------
create procedure a2security.[UserStateInfo.Load]
@TenantId int = null,
@UserId bigint
as
begin
	select [UserState!TUserState!Object] = null;
end
go
------------------------------------------------
begin
	set nocount on;
	declare @codes table (Code int, [Name] nvarchar(32))

	insert into @codes(Code, [Name])
	values
		(1,  N'Login'		        ), 
		(2,  N'UserCreated'         ), 
		(3,  N'TeantUserCreated'    ), 
		(15, N'PasswordUpdated'     ), 
		(18, N'AccessFailedCount'   ), 
		(26, N'EmailConfirmed'      ), 
		(27, N'PhoneNumberConfirmed'),
		(64, N'ApiKey: Success'     ), 
		(65, N'ApiKey: Fail'        ),
		(66, N'ApiKey: IP forbidden'); 

	merge into a2security.[LogCodes] t
	using @codes s on s.Code = t.Code
	when matched then update set
		[Name]=s.[Name]
	when not matched by target then insert 
		(Code, [Name]) values (s.Code, s.[Name])
	when not matched by source then delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'SaveReferral')
	drop procedure a2security.SaveReferral
go
------------------------------------------------
create procedure a2security.SaveReferral
@UserId bigint,
@Referral nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @refid bigint;
	select @refid = Id from a2security.Referrals where lower(Link) = lower(@Referral);
	if @refid is not null
		update a2security.Users set Referral = @refid where Id=@UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'DeleteUser')
	drop procedure a2security.DeleteUser
go
------------------------------------------------
create procedure a2security.DeleteUser
@CurrentUser bigint,
@Tenant bigint,
@Id bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @TenantAdmin bigint;
	select @TenantAdmin = [Admin] from a2security.Tenants where Id = @Tenant;
	if @TenantAdmin <> @CurrentUser
	begin
		raiserror(N'Invalid teanant administrator', 16, 1);
		return;
	end
	if @TenantAdmin = @Id
	begin
		raiserror(N'Unable to delete tenant administrator', 16, 1);
		return;
	end
	begin try
		begin tran
		delete from a2security.UserRoles where UserId = @Id;
		delete from a2security.UserGroups where UserId = @Id;
		delete from a2security.[Menu.Acl] where UserId = @Id;
		delete from a2security.[Log] where UserId = @Id;
		delete from a2security.Users where Tenant = @Tenant and Id = @Id;
		commit tran
	end try
	begin catch
		if @@trancount > 0
		begin
			rollback tran;
		end
		declare @msg nvarchar(255);
		set @msg = error_message();
		raiserror(@msg, 16, 1);
	end catch
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.CheckRegister')
	drop procedure a2security.[User.CheckRegister]
go
------------------------------------------------
create procedure a2security.[User.CheckRegister]
@UserName nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @Id bigint;

	select @Id = Id from a2security.Users where UserName=@UserName and EmailConfirmed = 0 and PhoneNumberConfirmed = 0;

	if @Id is not null
	begin
		declare @uid nvarchar(255);
		set @uid = N'_' + convert(nvarchar(255), newid());
		update a2security.Users set Void=1, UserName = UserName + @uid, 
			Email = Email + @uid, PhoneNumber = PhoneNumber + @uid, PasswordHash = null, SecurityStamp = N''
		where Id=@Id and EmailConfirmed = 0  and PhoneNumberConfirmed = 0 and UserName=@UserName;
	end
end
go
------------------------------------------------
set nocount on;
begin
	-- predefined users and groups
	if not exists(select * from a2security.Users where Id = 0)
		insert into a2security.Users (Id, UserName, SecurityStamp) values (0, N'System', N'System');
	if not exists(select * from a2security.Groups where Id = 1)
		insert into a2security.Groups(Id, [Key], [Name]) values (1, N'Users', N'@[AllUsers]');
	if not exists(select * from a2security.Groups where Id = 77)
		insert into a2security.Groups(Id, [Key], [Name]) values (77, N'Admins', N'@[AdminUsers]');
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'License')
begin
	create table a2security.License
	(
		[Text] nvarchar(max) not null,
		DateCreated datetime not null constraint DF_License_DateCreated2 default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_License_DateModified2 default (a2sys.fn_getCurrentDate())
	);
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateCreated' and parent_object_id = object_id(N'a2security.License'))
begin
	alter table a2security.License drop constraint DF_License_UtcDateCreated;
	alter table a2security.License add constraint DF_License_DateCreated2 default(a2sys.fn_getCurrentDate()) for DateCreated with values;
end
go
------------------------------------------------
if exists(select * from sys.default_constraints where name=N'DF_License_UtcDateModified' and parent_object_id = object_id(N'a2security.License'))
begin
	alter table a2security.License drop constraint DF_License_UtcDateModified;
	alter table a2security.License add constraint DF_License_DateModified2 default(a2sys.fn_getCurrentDate()) for DateModified with values;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'License.Load')
	drop procedure a2security.[License.Load]
go
------------------------------------------------
create procedure a2security.[License.Load]
as
begin
	set nocount on;
	select [Text] from a2security.License;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'License.Update')
	drop procedure a2security.[License.Update]
go
------------------------------------------------
create procedure a2security.[License.Update]
@License nvarchar(max)
as
begin
	set nocount on;
	if exists(select * from a2security.License)
		update a2security.License set [Text]=@License, DateModified = a2sys.fn_getCurrentDate();
	else
		insert into a2security.License ([Text]) values (@License);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Companies')
	create sequence a2security.SQ_Companies as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Companies')
begin
	create table a2security.Companies
	(
		Id	bigint not null constraint PK_Companies primary key
			constraint DF_Companies_PK default(next value for a2security.SQ_Companies),
		[Name] nvarchar(255) null,
		Memo nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'UserCompanies')
begin
	create table a2security.[UserCompanies]
	(
		[User] bigint not null
			constraint FK_UserCompanies_User_Users foreign key references a2security.Users(Id),
		[Company] bigint not null
			constraint FK_UserCompanies_Company_Companies foreign key references a2security.Companies(Id),
		[Enabled] bit,
		constraint PK_UserCompanies primary key clustered ([User], [Company]) with (fillfactor = 70)
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS where CONSTRAINT_SCHEMA = N'a2security' and CONSTRAINT_NAME = N'FK_Users_Company_Companies')
	alter table a2security.Users add
		constraint FK_Users_Company_Companies foreign key (Company) references a2security.Companies(Id);
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Companies.Check')
	drop procedure a2security.[User.Companies.Check]
go
------------------------------------------------
create procedure a2security.[User.Companies.Check]
@UserId bigint,
@Error bit,
@CompanyId bigint output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @isadmin bit;
	declare @id bigint;

	select @id = Id, @isadmin = IsAdmin, @CompanyId = Company from a2security.ViewUsers where Id=@UserId;
	if @id is null
	begin
		raiserror (N'UI:No such user', 16, -1) with nowait;
		return;
	end
	if @isadmin = 1
	begin
		if @CompanyId is null or @CompanyId = 0 or not exists(select * from a2security.Companies where Id=@CompanyId)
		begin
			select top(1) @CompanyId = Id from a2security.Companies where Id <> 0;
			update a2security.ViewUsers set Company = @CompanyId where Id = @UserId;
		end
	end
	else
	begin
		-- not admin
		if @CompanyId is null or @CompanyId = 0 or not exists(select * from a2security.UserCompanies where [User] = @UserId and Company = @CompanyId)
		begin
			select top(1) @CompanyId = Company from a2security.UserCompanies where Company <> 0 and [Enabled]=1 and [User] = @UserId;
			update a2security.ViewUsers set Company = @CompanyId where Id = @UserId;
		end
	end
	if @Error = 1 and @CompanyId is null
	begin
		raiserror (N'UI:No current company', 16, -1) with nowait;
		return;
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Companies')
	drop procedure a2security.[User.Companies]
go
------------------------------------------------
create procedure a2security.[User.Companies]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @isadmin bit;
	declare @company bigint;

	select @isadmin = IsAdmin, @company = Company from a2security.ViewUsers where Id=@UserId;

	-- all companies for the current user
	select [Companies!TCompany!Array] = null, 
		Id, [Name], 
		[Current] = cast(case when Id = @company then 1 else 0 end as bit)
	from a2security.Companies c
		left join a2security.UserCompanies uc on uc.Company = c.Id and uc.[User] = @UserId
	where c.Id <> 0 and (@isadmin = 1 or 
		c.Id in (select uc.Company from a2security.UserCompanies uc where uc.[User] = @UserId and uc.[Enabled] = 1))
	order by c.Id;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SwitchToCompany')
	drop procedure a2security.[User.SwitchToCompany]
go
------------------------------------------------
create procedure a2security.[User.SwitchToCompany]
@UserId bigint,
@CompanyId bigint
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	declare @isadmin bit;
	set @isadmin = a2security.fn_isUserAdmin(@UserId);
	if not exists(select * from a2security.Companies where Id=@CompanyId)
		throw 60000, N'There is no such company', 0;
	if @isadmin = 0 and not exists(
			select * from a2security.UserCompanies where [User] = @UserId and Company=@CompanyId and [Enabled] = 1)
		throw 60000, N'There is no such company or it is not allowed', 0;
	update a2security.Users set Company = @CompanyId where Id = @UserId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.Company.Load')
	drop procedure a2security.[User.Company.Load]
go
------------------------------------------------
create procedure a2security.[User.Company.Load]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @company bigint;
	select @company = Company from a2security.ViewUsers where Id=@UserId;

	select [UserCompany!TCompany!Object] = null, Company=@company;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'Permission.UpdateAcl.Module')
	drop procedure [a2security].[Permission.UpdateAcl.Module]
go
------------------------------------------------
create procedure [a2security].[Permission.UpdateAcl.Module]
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	declare @ModuleTable table (Id varchar(16), UserId bigint, GroupId bigint, 
		CanView smallint, CanEdit smallint, CanDelete smallint, CanApply smallint);

	insert into @ModuleTable (Id, UserId, GroupId, CanView, CanEdit, CanDelete, CanApply)
	select m.Id, a.UserId, a.GroupId, a.CanView, a.CanEdit, a.CanDelete, CanApply
	from a2security.Acl a inner join a2security.Modules m on a.ObjectKey = m.Id
	where a.[Object] = N'std:module';

	declare @UserTable table (ObjectKey varchar(16), UserId bigint, CanView bit, CanEdit bit, CanDelete bit, CanApply bit);

	with T(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
	as
	(
		select a.Id, UserId=isnull(ur.UserId, a.UserId), a.CanView, a.CanEdit, a.CanDelete, a.CanApply
		from @ModuleTable a
		left join a2security.UserGroups ur on a.GroupId = ur.GroupId
		where isnull(ur.UserId, a.UserId) is not null
	)
	insert into @UserTable(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
	select ObjectKey, UserId,
		_CanView = isnull(case 
				when min(T.CanView) = -1 then 0
				when max(T.CanView) = 1 then 1
				end, 0),
		_CanEdit = isnull(case
				when min(T.CanEdit) = -1 then 0
				when max(T.CanEdit) = 1 then 1
				end, 0),
		_CanDelete = isnull(case
				when min(T.CanDelete) = -1 then 0
				when max(T.CanDelete) = 1 then 1
				end, 0),
		_CanApply = isnull(case
				when min(T.CanApply) = -1 then 0
				when max(T.CanApply) = 1 then 1
				end, 0)
	from T
	group by ObjectKey, UserId;

	merge a2security.[Module.Acl] as t
	using
	(
		select ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply
		from @UserTable T
		where CanView = 1
	) as s(ObjectKey, UserId, CanView, CanEdit, CanDelete, CanApply)
		on t.Module = s.[ObjectKey] and t.UserId=s.UserId
	when matched then
		update set 
			t.CanView = s.CanView,
			t.CanEdit = s.CanEdit,
			t.CanDelete = s.CanDelete,
			t.CanApply = s.CanApply
	when not matched by target then
		insert (Module, UserId, CanView, CanEdit, CanDelete, CanApply)
			values (s.[ObjectKey], s.UserId, s.CanView, s.CanEdit, s.CanDelete, s.CanApply)
	when not matched by source then
		delete;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'SaveAnalytics')
	drop procedure a2security.SaveAnalytics
go
------------------------------------------------
create procedure a2security.SaveAnalytics
@UserId bigint,
@Value nvarchar(max),
@Tags a2sys.[NameValue.TableType] readonly
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	begin tran;
	insert into a2security.Analytics(UserId, [Value]) values (@UserId, @Value);

	with T([Name], [Value]) as (
		select [Name], [Value] = max([Value]) 
		from @Tags 
		where [Name] is not null and [Value] is not null 
		group by [Name]
	)
	insert into a2security.AnalyticTags (UserId, [Name], [Value])
	select @UserId, [Name], [Value] from T;
	commit tran;
end
go
-- .JWT SUPPORT
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'RefreshTokens')
	create table a2security.RefreshTokens
	(
		UserId bigint not null
			constraint FK_RefreshTokens_UserId_Users foreign key references a2security.Users(Id),
		[Provider] nvarchar(64) not null,
		[Token] nvarchar(255) not null,
		Expires datetime not null,
		constraint PK_RefreshTokens primary key (UserId, [Provider], Token) with (fillfactor = 70)
	)
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'AddToken')
	drop procedure a2security.[AddToken]
go
------------------------------------------------
create procedure a2security.[AddToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255),
@Expires datetime,
@Remove nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;
	begin tran;
	insert into a2security.RefreshTokens(UserId, [Provider], Token, Expires)
		values (@UserId, @Provider, @Token, @Expires);
	if @Remove is not null
		delete from a2security.RefreshTokens 
		where UserId=@UserId and [Provider] = @Provider and Token = @Remove;
	commit tran;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'GetToken')
	drop procedure a2security.[GetToken]
go
------------------------------------------------
create procedure a2security.[GetToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;

	select [Token], UserId, Expires from a2security.RefreshTokens
	where UserId=@UserId and [Provider] = @Provider and Token = @Token;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'RemoveToken')
	drop procedure a2security.[RemoveToken]
go
------------------------------------------------
create procedure a2security.[RemoveToken]
@UserId bigint,
@Provider nvarchar(64),
@Token nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	delete from a2security.RefreshTokens 
	where UserId=@UserId and [Provider] = @Provider and Token = @Token;
end
go
-- .NET CORE SUPPORT
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SetPasswordHash')
	drop procedure a2security.[User.SetPasswordHash]
go
------------------------------------------------
create procedure a2security.[User.SetPasswordHash]
@UserId bigint,
@PasswordHash nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set PasswordHash2 = @PasswordHash where Id=@UserId;
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2security' and ROUTINE_NAME=N'User.SetSecurityStamp')
	drop procedure a2security.[User.SetSecurityStamp]
go
------------------------------------------------
create procedure a2security.[User.SetSecurityStamp]
@UserId bigint,
@SecurityStamp nvarchar(max)
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;

	update a2security.ViewUsers set SecurityStamp2 = @SecurityStamp where Id=@UserId;
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2security to public;
end
go

