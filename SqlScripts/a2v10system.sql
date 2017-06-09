/* 20170605-7001 */
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
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2sys')
begin
	exec sp_executesql N'create schema a2sys';
end
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
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2security' and SEQUENCE_NAME=N'SQ_Users')
	create sequence a2security.SQ_Users as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'Users')
begin
	create table a2security.Users
	(
		Id	bigint		not null constraint PK_Users primary key
			constraint DF_Users_PK default(next value for a2security.SQ_Users),
		UserName		nvarchar(255)	not null constraint UNQ_Users_UserName unique,
		SecurityStamp	nvarchar(max)	not null,
		PasswordHash	nvarchar(max)	null,
		TwoFactorEnabled bit not null constraint DF_Users_TwoFactorEnabled default(0),
		Email			nvarchar(255)	null,
		EmailConfirmed	bit not null constraint DF_Users_EmailConfirmed default(0),
		PhoneNumber		nvarchar(255)	null,
		PhoneNumberConfirmed bit not null constraint DF_Users_PhoneNumberConfirmed default(0),
		LockoutEnabled	bit	not null constraint DF_Users_LockoutEnabled default(1),
		LockoutEndDateUtc datetime null,
		AccessFailedCount int not null constraint DF_Users_AccessFailedCount default(0),
		[Locale] nvarchar(32) not null constraint DF_Users_Locale default('uk_UA'),
		PersonName nvarchar(255) null,
		Memo nvarchar(255) null
	);
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
	select Id, UserName, PasswordHash, SecurityStamp, Email, PhoneNumber,
		LockoutEnabled, AccessFailedCount, LockoutEndDateUtc, TwoFactorEnabled, [Locale],
		PersonName, Memo, AppKey, SecurityStamp
	from a2security.Users;
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
	select * from a2security.ViewUsers with(nolock)
	where UserName=@UserName;
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
	select * from a2security.ViewUsers with(nolock)
	where Email=@Email;
end
go

------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2sys to public;
	grant execute on schema ::a2security to public;
end
go

------------------------------------------------
set noexec off;
go

