------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2security' and TABLE_NAME=N'LogDemo')
create table a2security.LogDemo
(
	Id bigint identity(100, 1) not null,
	[User] nvarchar(64),
	[Url] nvarchar(64),
	[EventTime] datetime,
	constraint PK_LogDemo primary key (Id)
);
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'a2security.LogDemo') and name = N'IX_LogDemo_User')
 create index IX_LogDemo_User on a2security.LogDemo ([User]);
go
------------------------------------------------
create or alter procedure a2security.[LogDemoUser]
@Id nvarchar(255),
@Url nvarchar(255)
as
begin
	set nocount on;
	set transaction isolation level read committed;

	insert into a2security.LogDemo([User], [Url], EventTime)
	values (@Id, @Url, getutcdate());
end
go

