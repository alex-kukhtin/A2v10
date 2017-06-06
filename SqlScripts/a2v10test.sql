/* 20170605-7001 */

use a2v10test;
go

------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2test')
begin
	exec sp_executesql N'create schema a2test';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'SimpleModel')
	drop procedure a2test.SimpleModel
go
------------------------------------------------
create procedure a2test.SimpleModel
@UserId bigint = null
as
begin
	set nocount on;
	select [Model!TModel!Object] = null, [Id!!Id] = 123, [Name!!Name]='ObjectName';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'ComplexModel')
	drop procedure a2test.ComplexModel
go
------------------------------------------------
create procedure a2test.ComplexModel
@UserId bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id] = 123, [No]='DocNo', [Date]=getutcdate(),
		[Agent!TAgent!RefId] = 512, [Company!TAgent!RefId] = 512,
		[Rows1!TRow!Array] = null, [Rows2!TRow!Array] = null;

	select [!TRow!Array] = null, [Id!!Id] = 78, [!TDocument.Rows1!ParentId] = 123, 
		[Product!TProduct!RefId] = 782,
		Qty=cast(4.0 as float), Price=cast(8 as money), [Sum] = cast(32.0 as money),
		[Series1!TSeries!Array] = null

	select [!TRow!Array] = null, [Id!!Id] = 79, [!TDocument.Rows2!ParentId] = 123, 
		[Product!TProduct!RefId] = 785,
		Qty=cast(7.0 as float), Price=cast(2 as money), [Sum] = cast(14.0 as money),
		[Series1!TSeries!Array] = null

	-- series for rows
	select [!TSeries!Array]=null, [Id!!Id] = 500, [!TRow.Series1!ParentId] = 78, Price=cast(5 as float)
	union all
	select [!TSeries!Array]=null, [Id!!Id] = 501, [!TRow.Series1!ParentId] = 79, Price=cast(10 as float)

	-- maps for product
	select [!TProduct!Map] = null, [Id!!Id] = 782, [Name!!Name] = N'Product 782',
		[Unit.Id!TUnit!Id] = 7, [Unit.Name!TUnit!Name] = N'Unit7'
	union all
	select [!TProduct!Map] = null, [Id!!Id] = 785, [Name!!Name] = N'Product 785',
		[Unit.Id!TUnit!Id] = 8, [Unit.Name!TUnit!Name] = N'Unit8'

	-- maps for agent
	select [!TAgent!Map] = null, [Id!!Id]=512, [Name!!Name] = 'Agent 512', Code=N'Code 512';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'TreeModel')
	drop procedure a2test.TreeModel
go
------------------------------------------------
create procedure a2test.TreeModel
@UserId bigint = null
as
begin
	set nocount on;

	select [Menu!TMenu!Tree]=null, [!!Id] = 10, [!TMenu.Menu!ParentId]=null, [Name!!Name]=N'Item 1',
		[Menu!TMenu!Array] = null
	union all
	select [Menu!TMenu!Tree]=null, [!!Id] = 20, [!TMenu.Menu!ParentId]=null, [Name!!Name]=N'Item 2',
		[Menu!TMenu!Array] = null
	union all
	select [Menu!TMenu!Tree]=null, [!!Id] = 110, [!TMenu.Menu!ParentId]=10, [Name!!Name]=N'Item 1.1',
		[Menu!TMenu!Array] = null
	union all
	select [Menu!TMenu!Tree]=null, [!!Id] = 120, [!TMenu.Menu!ParentId]=10, [Name!!Name]=N'Item 1.2',
		[Menu!TMenu!Array] = null
	union all
	select [Menu!TMenu!Tree]=null, [!!Id] = 1100, [!TMenu.Menu!ParentId]=110, [Name!!Name]=N'Item 1.1.1',
		[Menu!TMenu!Array] = null
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'MapRoot')
	drop procedure a2test.MapRoot
go
------------------------------------------------
create procedure a2test.MapRoot
@UserId bigint = 0
as
begin
	set nocount on;
	select [Model!TModel!Map] = null, [Key!!Key] = N'Key1', [Id!!Id] = 11, [Name!!Name]='Object 1'
	union all
	select [Model!TModel!Map] = null, [Key!!Key] = N'Key2', [Id!!Id] = 12, [Name!!Name]='Object 2';
end
go

/*
------------------------------------------------
-- test subobjects (update)
{
	Id: 45,
	Name: 'MainObjectName',
	NumValue : 531.55,
	BitValue : true,
	SubObject : {
		Id: 55,
		Name: 'SubObjectName',
		SubArray: [
			{X: 5, Y:6},
			{X: 8, Y:9}
		]
	}
}
------------------------------------------------
*/
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'NestedObject.Metadata')
	drop procedure a2test.[NestedObject.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'NestedObject.Update')
	drop procedure a2test.[NestedObject.Update]
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'NestedMain.TableType' AND ss.name = N'a2test')
	drop type [a2test].[NestedMain.TableType];
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'NestedSub.TableType' AND ss.name = N'a2test')
	drop type [a2test].[NestedSub.TableType];
go
------------------------------------------------
if exists (select * from sys.types st join sys.schemas ss ON st.schema_id = ss.schema_id where st.name = N'NestedSubArray.TableType' AND ss.name = N'a2test')
	drop type [a2test].[NestedSubArray.TableType];
go
------------------------------------------------
create type [a2test].[NestedMain.TableType] as
table (
	[Id] bigint null,
	[Name] nvarchar(255),
	[NumValue] float,
	[BitValue] bit,
	[SubObject] bigint
)
go
------------------------------------------------
create type [a2test].[NestedSub.TableType] as
table (
	[Id] bigint null,
	[ParentId] bigint null,
	[Name] nvarchar(255)
)
go
------------------------------------------------
create type [a2test].[NestedSubArray.TableType] as
table (
	[Id] bigint null,
	[ParentId] bigint null,
	[X] int,
	[Y] int 
)
go
------------------------------------------------
create procedure a2test.[NestedObject.Metadata]
as
begin
	set nocount on;
	declare @NestedMain [a2test].[NestedMain.TableType];
	declare @SubObject [a2test].[NestedSub.TableType];
	declare @SubObjectArray [a2test].[NestedSubArray.TableType];
	select [MainObject!!Metadata]=null, * from @NestedMain;
	select [SubObject!SubObject!Metadata]=null, * from @SubObject;
	select [SubObjectArray!SubObject.SubArray!Metadata]=null, * from @SubObjectArray;
end
go
------------------------------------------------
create procedure a2test.[NestedObject.Update]
@UserId bigint = null,
@MainObject [a2test].[NestedMain.TableType] readonly,
@SubObject [a2test].[NestedSub.TableType] readonly,
@SubObjectArray [a2test].[NestedSubArray.TableType] readonly
as
begin
	set nocount on;
	
	--declare @msg nvarchar(max);
	--set @msg = (select * from @SubObjectArray for xml auto);
	-- raiserror(@msg, 16, -1) with nowait;

	select [MainObject!TMainObject!Object] = null, [Id!!Id] = Id, [Name!!Name] = Name,
		NumValue = NumValue, BitValue= BitValue,
		[SubObject!TSubObject!RefId] = SubObject
	from @MainObject;

	select [!TSubObject!Map] = null, [Id!!Id] = Id, [Name!!Name] = Name, [!TMainObject!ParentId] = ParentId,
		[SubArray!TSubObjectArrayItem!Array] = null
	from @SubObject;

	select [!TSubObjectArrayItem!Array] = null, [X] = X, [Y] = Y, [!TSubObject!ParentId] = ParentId
	from @SubObjectArray;
end
go
