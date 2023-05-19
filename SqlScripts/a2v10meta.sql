/*
------------------------------------------------
Copyright © 2008-2017 A. Kukhtin

Last updated : 23 dec 2019
module version : 7047
*/
------------------------------------------------
begin
	set nocount on;
	if not exists(select * from a2sys.Versions where Module = N'std:meta')
		insert into a2sys.Versions (Module, [Version]) values (N'std:meta', 7047);
	else
		update a2sys.Versions set [Version] = 7047 where Module = N'std:meta';
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2meta')
begin
	exec sp_executesql N'create schema a2meta';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'fn_DatabaseLevel' and ROUTINE_TYPE=N'FUNCTION')
	drop function a2meta.fn_DatabaseLevel;
go
------------------------------------------------
create function a2meta.fn_DatabaseLevel()
returns int
as
begin
	/*2008 - 100, 2012 - 110, 2014 - 120*/
	declare @ret bigint
	select @ret = [compatibility_level]
		from sys.databases where name = db_name();
	return @ret;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'fn_Type2String' and ROUTINE_TYPE=N'FUNCTION')
	drop function a2meta.fn_Type2String;
go
------------------------------------------------
create function a2meta.fn_Type2String(@type tinyint, @length int)
returns sysname
as
begin
	declare @retval sysname;
	-- 52 - smallint, 56-int, money-60, datetime-61, float-62, 127-bigint, 231-nvarchar : type_id(''), type_name(0)
	set @retval = type_name(@type);
	if 231 = @type
	begin
		declare @len nvarchar(32);
		if @length = -1
			set @len = N'max';
		else
			set @len = cast(@length as nvarchar(32));
		set @retval = @retval + N'(' + @len + N')'
	end
	return @retval;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'fn_TableVersion' and ROUTINE_TYPE=N'FUNCTION')
	drop function a2meta.fn_TableVersion;
go
------------------------------------------------
create function a2meta.fn_TableVersion(@module sysname, @name sysname)
returns int
as
begin
	declare @ver int
	select @ver=convert(int, value)
		from fn_listextendedproperty (N'version', N'SCHEMA', @module, N'TABLE', @name, default, default);
	return isnull(@ver, 0);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2meta' and TABLE_NAME=N'Modules')
begin
	create table a2meta.[Modules]
	(
		Name sysname not null constraint PK_Modules primary key,
		UiName nvarchar(255) null,
		[Version] int not null constraint DF_Modules_Version default(0),
		DateCreated datetime not null constraint DF_Modules_DateCreated default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_Modules_DateModified default(a2sys.fn_getCurrentDate()),
		[Description] nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2meta' and TABLE_NAME=N'Models')
begin
	create table a2meta.[Models]
	(
		Name sysname not null constraint PK_Models primary key,
		[Description] nvarchar(255) null,
		Paged bit not null constraint DF_Models_Paged default(0),
		PageSize int null,
		DateCreated datetime not null constraint DF_Models_DateCreated default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_Models_DateModified default(a2sys.fn_getCurrentDate()),
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2meta' and TABLE_NAME=N'Tables')
begin
	create table a2meta.[Tables]
	(
		[Name] sysname not null,
		Module sysname not null 
			constraint FK_Tables_Module_Modules foreign key references a2meta.Modules(Name),
		[Key] as cast(Module + N'.' + Name as sysname) persisted not null constraint PK_Tables primary key,
		UiName nvarchar(255) null,
		Parent sysname null constraint FK_Tables_Parent_Tables foreign key references a2meta.[Tables]([Key]),
		[Version] int not null constraint DF_Tables_Version default(1),
		DateCreated datetime not null constraint DF_Tables_DateCreated default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_Tables_DateModified default(a2sys.fn_getCurrentDate()),
		[Description] nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2meta' and TABLE_NAME=N'Views')
begin
	create table a2meta.[Views]
	(
		[Name] sysname not null,
		Module sysname not null 
			constraint FK_Views_Module_Modules foreign key references a2meta.Modules(Name),
		[Key] as cast(Module + N'.' + Name as sysname) persisted not null constraint PK_Views primary key,
		UiName nvarchar(255) null,
		[Version] int not null constraint DF_Views_Version default(1),
		DateCreated datetime not null constraint DF_Views_DateCreated default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_Views_DateModified default(a2sys.fn_getCurrentDate()),
		[Description] nvarchar(255) null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2meta' and TABLE_NAME=N'Columns')
begin
	create table a2meta.[Columns]
	(
		Name sysname not null,
		DbName sysname null,
		UiName sysname null,
		[Table] sysname not null 
			constraint FK_Columns_TABLE_KEY_TABLES foreign key references a2meta.[Tables]([Key]),
		[Key] as cast(Name + N'.' + [Table] as sysname) persisted not null constraint PK_Columns primary key,
		-- 52 - smallint, 56-int, money-60, datetime-61, float-62, 127-bigint, 231-nvarchar : type_id('')
		[Type] tinyint not null,
		[Length] int not null constraint DF_Columns_Length default(0), --  0 for fixed length, -1 for nvarchar(max)
		[Order] int not null constraint DF_Columns_Order default(0),
		Nullable bit not null constraint DF_Columns_Nullable default(1),
		Indexed bit not null constraint DF_Columns_Indexed default(0),
		[Unique] bit not null constraint DF_Columns_Unique default(0),
		[References] sysname null
			constraint DF_Columns_References_Columns foreign key references a2meta.[Columns]([Key]),
		DateCreated datetime not null constraint DF_Columns_DateCreated default(a2sys.fn_getCurrentDate()),
		DateModified datetime not null constraint DF_Columns_DateModified default(a2sys.fn_getCurrentDate()),
		[Description] nvarchar(255) null
	);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Schemas.Sync')
	drop procedure a2meta.[Schemas.Sync]
go
------------------------------------------------
create procedure a2meta.[Schemas.Sync]
as
begin
	set nocount on;
	-- create new schemas
	declare @name sysname;
	declare @sql nvarchar(max);
	declare #tmpcrs cursor local fast_forward read_only for
	select [Name] from a2meta.[Modules];
	open #tmpcrs
	fetch next from #tmpcrs into @name
	while @@fetch_status = 0
	begin
		if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=@name)
		begin
			set @sql = N'create schema [' + @name + ']';
			exec sp_executesql @sql;
			print N'Schema [' + @name + N'] created' ;
		end
		fetch next from #tmpcrs into @name;
	end
	close #tmpcrs
	deallocate #tmpcrs
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Column.Update')
	drop procedure a2meta.[Column.Update]
go
------------------------------------------------
create procedure a2meta.[Column.Update]
@module sysname,
@name sysname,
@column sysname, 
@type tinyint, 
@len int,
@null bit
as
begin
	set nocount on;
	print N'TODO: update column here';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Columns.Sync')
	drop procedure a2meta.[Columns.Sync]
go
------------------------------------------------
create procedure a2meta.[Columns.Sync]
@module sysname,
@name sysname
as
begin
	set nocount on;
	declare @column sysname;
	declare @type tinyint;
	declare @len int;
	declare @null bit;

	declare #tmpcrs cursor local fast_forward read_only for
	select Name, [Type], [Length], Nullable
		from a2meta.[Columns] where [Key]=@module + N'.' + @name order by [Order];
	open #tmpcrs
	fetch next from #tmpcrs into @column, @type, @len, @null
	while @@fetch_status = 0
	begin
		exec a2meta.[Column.Update] @module, @name, @column, @type, @len, @null;
		fetch next from #tmpcrs into @column, @type, @len, @null
	end
	close #tmpcrs
	deallocate #tmpcrs
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'fn_ColumnSql' and ROUTINE_TYPE=N'FUNCTION')
	drop function a2meta.fn_ColumnSql;
go
------------------------------------------------
create function a2meta.fn_ColumnSql(@column sysname, @dbname sysname, @type tinyint, @length int, @nullable bit) 
returns nvarchar(1024)
as
begin
	declare @sql nvarchar(1024)
	set @sql = N'[' + isnull(@dbname, @column) + N'] ' + a2meta.fn_Type2String(@type, @length) + 
	case when 1 = @nullable
		then N' null'else N' not null'
	end
	--TODO: default constraint
	--TODO reference constraints
	return @sql;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Columns.GetSql')
	drop procedure a2meta.[Columns.GetSql]
go
------------------------------------------------
create procedure a2meta.[Columns.GetSql]
@module sysname,
@name sysname, 
@columns nvarchar(max) output
as
begin
	set nocount on;
	-- with tail comma, if not empty
	set @columns = (select a2meta.fn_ColumnSql(c.Name, c.DbName, c.[Type], c.[Length], c.[Nullable]) + N','
	from a2meta.[Columns] c
	where c.[Table] = @module + N'.' + @name
	order by c.[Order]
	for xml path (N''));
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Table.Update')
	drop procedure a2meta.[Table.Update]
go
------------------------------------------------
create procedure a2meta.[Table.Update]
@module sysname,
@name sysname
as
begin
	set nocount on;
	declare @sql nvarchar(max);
	declare @columns nvarchar(max);
	declare @newver int;
	declare @dblevel int;

	select @newver=[Version] from a2meta.[Tables] where Name=@name and [Module]=@module;
	select @dblevel = a2meta.fn_DatabaseLevel();

	if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_NAME=@name and TABLE_SCHEMA=@module)
	begin
		-- create table
		if @dblevel > 100 /*2012+ => sequence*/
		begin
			set @sql = N'
			if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N''$Schema$'' and SEQUENCE_NAME=N''SQ_$Name$'')
			begin
				create sequence [$Schema$].[SQ_$Name$] as bigint start with 100 increment by 1;
			end
			';
			set @sql = replace(@sql, N'$Name$', @name);
			set @sql = replace(@sql, N'$Schema$', @module);
			exec sp_executesql @sql;

			set @sql = N'
			create table [$Schema$].[$Name$] (
				Id bigint not null 
					constraint PK_$Name$ primary key
					constraint DF_$Name$_PK default (next value for $Schema$.SQ_$Name$),
				$Columns$
				Void bit not null constraint DF_$Name$_Void default(0),
				Active bit not null constraint DF_$Name$_Active default(1),
				DateCreated datetime not null constraint DF_$Name$_DateCreated default(a2sys.fn_getCurrentDate()),
				UserCreated bigint not null,
				DateModified datetime not null constraint DF_$Name$_DateModified default(a2sys.fn_getCurrentDate()),
				UserModified bigint not null,
				RowVersion rowversion
			)';
			exec a2meta.[Columns.GetSql] @module, @name, @columns output;
			set @sql = replace(@sql, N'$Name$', @name);
			set @sql = replace(@sql, N'$Schema$', @module);
			set @sql = replace(@sql, N'$Columns$', @columns);
			exec sp_executesql @sql;
		end
		else
		begin
			-- 2008 => identity
			raiserror(N'Yet not implemented', 16, -1) with nowait;
		end
		exec sys.sp_addextendedproperty @name=N'version', @value=0 , 
			@level0type=N'SCHEMA', @level0name=@module, 
			@level1type=N'TABLE', @level1name=@name;
		print N'Table [' + @module + N'].[' + @name + '] created' ;
	end
	-- check version
	declare @oldver int;
	select @oldver= a2meta.fn_TableVersion(@module, @name);
	if @newver > @oldver
	begin
		-- update columns
		exec a2meta.[Columns.Sync] @module, @name;
		set @sql = N''
		-- set new version
		exec sys.sp_updateextendedproperty @name=N'version', @value=@newver, 
			@level0type=N'SCHEMA', @level0name=@module, @level1type=N'TABLE', @level1name=@name;
		print N'Table [' + @module + N'].[' + @name + '] updated. (version: ' + cast(@newver as nvarchar) + N')';
	end
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Tables.Sync')
	drop procedure a2meta.[Tables.Sync]
go
------------------------------------------------
create procedure a2meta.[Tables.Sync]
as
begin
	set nocount on;
	declare @table sysname;
	declare @schema sysname;
	-- update tables
	declare #tmpcrs cursor local fast_forward read_only for
	select [Module], [Name] from a2meta.[Tables];
	open #tmpcrs
	fetch next from #tmpcrs into @schema, @table
	while @@fetch_status = 0
	begin
		exec a2meta.[Table.Update] @schema, @table;
		fetch next from #tmpcrs into @schema, @table
	end
	close #tmpcrs
	deallocate #tmpcrs
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'View.Update')
	drop procedure a2meta.[View.Update]
go
------------------------------------------------
create procedure a2meta.[View.Update]
@module sysname,
@name sysname
as
begin
	set nocount on;
	declare @sql nvarchar(max);
	set @sql = N'
	if exists(select * from INFORMATION_SCHEMA.VIEWS where TABLE_SCHEMA=N''$Schema$'' and TABLE_NAME=N''$Name$'')
	begin
		drop view [$Schema$].[$Name$];
	end
	';
	set @sql = replace(@sql, N'$Name$', @name);
	set @sql = replace(@sql, N'$Schema$', @module);
	exec sp_executesql @sql;

	set @sql = N'
	create view [$Schema$].[$Name$] as
		select [$Columns$] from [$Tables]
	';

	set @sql = replace(@sql, N'$Name$', @name);
	set @sql = replace(@sql, N'$Schema$', @module);
	exec sp_executesql @sql;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Views.Sync')
	drop procedure a2meta.[Views.Sync]
go
------------------------------------------------
create procedure a2meta.[Views.Sync]
as
begin
	set nocount on;
	declare @view sysname;
	declare @schema sysname;
	-- update views
	declare #tmpcrs cursor local fast_forward read_only for
	select [Module], [Name] from a2meta.[Views];
	open #tmpcrs
	fetch next from #tmpcrs into @schema, @view
	while @@fetch_status = 0
	begin
		exec a2meta.[View.Update] @schema, @view;
		fetch next from #tmpcrs into @schema, @view
	end
	close #tmpcrs
	deallocate #tmpcrs
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2meta' and ROUTINE_NAME=N'Models.Sync')
	drop procedure a2meta.[Models.Sync]
go
------------------------------------------------
create procedure a2meta.[Models.Sync]
as
begin
	set nocount on;
end
go
------------------------------------------------
begin
	set nocount on;
	--???grant execute on schema ::a2meta to ddladmin;
end
go

/*under construction */
/*
drop table a2meta.[Columns]
drop table a2meta.[Tables]
drop table a2meta.[Views]
drop table a2meta.[Modules]
drop table a2meta.[Models]
*/
