------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'samples' and SEQUENCE_NAME=N'SQ_Agents')
	create sequence samples.SQ_Agents as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'samples' and TABLE_NAME=N'Agents')
begin
	create table samples.Agents
	(
		Id	bigint not null constraint PK_Agents primary key
			constraint DF_Agents_PK default(next value for samples.SQ_Agents),
		Void bit not null
			constraint DF_Agents_Void default(0),
		Folder bit not null
			constraint DF_Agents_Folder default(0),
		Parent bigint null
			constraint FK_Agents_Parent_Agents foreign key references samples.Agents(Id),
		[Code] nvarchar(32) null,
		[Name] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Agents_DateCreated default(getdate()),
		UserCreated bigint not null
			constraint FK_Agents_UserCreated_Users foreign key references a2security.Users(Id),
		DateModified datetime not null constraint DF_Agents_DateModified default(getdate()),
		UserModified bigint not null
			constraint FK_Agents_UserModified_Users foreign key references a2security.Users(Id)
	);
end
go
------------------------------------------------
if not exists (select * from sys.indexes where object_id = object_id(N'samples.Agents') and name = N'IX_Agents_Parent')
	create index IX_Agents_Parent on samples.Agents ([Parent]) include (Id, Void, Folder);
go

