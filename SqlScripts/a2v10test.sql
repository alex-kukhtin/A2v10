/* 20170901-7022 */

use a2v10test;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2test')
begin
	exec sp_executesql N'create schema a2test';
end
go
------------------------------------------------
-- initial data for testing
if not exists(select * from a2security.Users where Id=50)
begin
	insert into a2security.Users (Id, UserName, SecurityStamp) values (50, N'Test User 50', N'SecurityStamp50') 
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
	select [Model!TModel!Object] = null, [Id!!Id] = 123, [Name!!Name]='ObjectName', [Decimal] = cast(55.1234 as decimal(10, 5));
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'ArrayModel')
	drop procedure a2test.ArrayModel
go
------------------------------------------------
create procedure a2test.ArrayModel
@UserId bigint = null
as
begin
	set nocount on;
	select [Customers!TCustomer!Array] = null, [Id!!Id] = 123, [Name!!Name]='ObjectName', [Amount] = cast(55.1234 as decimal(10, 5));
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
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'EmptyArray')
	drop procedure a2test.EmptyArray
go
------------------------------------------------
create procedure a2test.EmptyArray
@UserId bigint = 0
as
begin
	set nocount on;
	select [Model!TModel!Object] = null, [Key!!Id] = N'Key1', [ModelName!!Name]='Object 1',
		[Rows!TRow!Array] = null
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
			{X: 5, Y:6, D:5.1 },
			{X: 8, Y:9, D:7.23 }
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
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'NewObject.Metadata')
	drop procedure a2test.[NewObject.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'NewObject.Update')
	drop procedure a2test.[NewObject.Update]
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
	[Y] int,
	[D] decimal(10, 5)
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
	select [MainObject!MainObject!Metadata]=null, * from @NestedMain;
	select [SubObject!MainObject.SubObject!Metadata]=null, * from @SubObject;
	select [SubObjectArray!MainObject.SubObject.SubArray!Metadata]=null, * from @SubObjectArray;
end
go
------------------------------------------------
create procedure a2test.[NewObject.Metadata]
as
begin
	set nocount on;
	declare @NestedMain [a2test].[NestedMain.TableType];
	select [MainObject!MainObject!Metadata]=null, * from @NestedMain;
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

	select [!TSubObject!Map] = null, [Id!!Id] = Id, [Name!!Name] = Name, [!TMainObject.SubObject!ParentId] = ParentId,
		[SubArray!TSubObjectArrayItem!Array] = null
	from @SubObject;

	select [!TSubObjectArrayItem!Array] = null, [X] = X, [Y] = Y, [D] = D, [!TSubObject.SubArray!ParentId] = ParentId
	from @SubObjectArray;
end
go
------------------------------------------------
create procedure a2test.[NewObject.Update]
@UserId bigint = null,
@MainObject [a2test].[NestedMain.TableType] readonly
as
begin
	set nocount on;
	
	if exists(select * from @MainObject where Id is null)
		select [MainObject!TMainObject!Object] = null, [Name] = N'Id is null';
	else
		select [MainObject!TMainObject!Object] = null, [Name] = N'Id is not null';
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'ComplexObjects')
	drop procedure a2test.ComplexObjects
go
------------------------------------------------
create procedure a2test.ComplexObjects
@UserId bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id]=200, [Agent.Id!TAgent!Id] = 300, [Agent.Name!TAgent] = 'Agent name';
end
go


------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'RefObjects')
	drop procedure a2test.RefObjects
go
------------------------------------------------
create procedure a2test.RefObjects
@UserId bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id]=200, [Agent!TAgent!RefId] = 300, [Company!TAgent!RefId]= 500;

	select [!TAgent!Map] = null, [Id!!Id] = 300, Name = N'Agent Name'
	union all
	select [!TAgent!Map] = null, [Id!!Id] = 500, Name = N'Company Name';
end
go

------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'Document.Load')
	drop procedure a2test.[Document.Load]
go
------------------------------------------------
create procedure a2test.[Document.Load]
@UserId bigint = null,
@Id bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id]=@Id, [Agent!TAgent!RefId] = 300, 
	[Company!TAgent!RefId]= 500, 
	[PriceList!TPriceList!RefId] = 1,
	[PriceKind!TPriceKind!RefId] = 7,
	[Rows!TRow!Array] = null

	select [!TRow!Array] = null, [Id!!Id] = 59, [!TDocument.Rows!ParentId] = @Id,
		[PriceKind!TPriceKind!RefId] = 7, [Entity!TEntity!RefId] = 96;

	select [!TAgent!Map] = null, [Id!!Id] = 300, Name = N'Agent Name'
	union all
	select [!TAgent!Map] = null, [Id!!Id] = 500, Name = N'Company Name';

	select [!TEntity!Map] = null, [Id!!Id] = 96, Name = N'Entity Name',
		[Prices!TPrice!Array] = null;

	select [PriceLists!TPriceList!Array] = null, [Id!!Id] = 1, 
		Name = N'PriceList', [PriceKinds!TPriceKind!Array] = null;

	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = 7,
		[!TPriceList.PriceKinds!ParentId] = 1, Name=N'Kind', 
		[Prices!TPrice!Array] = null
	union all
	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = 8,
		[!TPriceList.PriceKinds!ParentId] = 1, Name=N'Kind', 
		[Prices!TPrice!Array] = null;

	select [!TPrice!Array] = null, [Id!!Id] = 40, [!TPriceKind.Prices!ParentId] = 7, 
		[!TEntity.Prices!ParentId] = 96, [PriceKind!TPriceKind!RefId] = 8,
		Price = 22.5
	union all
	select [!TPrice!Array] = null, [Id!!Id] = 41, [!TPriceKind!Prices.ParentId] = 7, 
		[!TEntity.Prices!ParentId] = 96, [PriceKind!TPriceKind!RefId] = 8,
		Price = 36.8
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'Document2.Load')
	drop procedure a2test.[Document2.Load]
go
------------------------------------------------
create procedure a2test.[Document2.Load]
@UserId bigint = null,
@Id bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id]=@Id,
	[Rows!TRow!Array] = null, [PriceKind!TPriceKind!RefId] = cast(4294967306 as bigint)

	select [!TRow!Array] = null, [Id!!Id] = 59, [!TDocument.Rows!ParentId] = @Id,
		[Entity!TEntity!RefId] = cast(4295140867 as bigint);

	select [!TEntity!Map] = null, [Id!!Id] = cast(4295140867 as bigint), Name = N'Entity Name',
		[Prices!TPrice!Array] = null;

	select [PriceLists!TPriceList!Array] = null, [Id!!Id] = cast(4294967300 as bigint), 
		Name = N'PriceList', [PriceKinds!TPriceKind!Array] = null
	union all
	select [PriceLists!TPriceList!Array] = null, [Id!!Id] = cast(4294967304 as bigint), 
		Name = N'PriceList', [PriceKinds!TPriceKind!Array] = null;

	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = cast(4294967305  as bigint), [Name!!Name]=N'Kind 1', Main=1, [!TPriceList.PriceKinds!ParentId] = cast(4294967304 as bigint) 
	union all
	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = cast(4294967304 as bigint), [Name!!Name]=N'Kind 2', Main=0, [!TPriceList.PriceKinds!ParentId] = cast(4294967304 as bigint)
	union all
	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = cast(4294967306 as bigint), [Name!!Name]=N'Kind 3', Main=0, [!TPriceList.PriceKinds!ParentId] = cast(4294967304 as bigint)
	union all
	select [PriceKinds!TPriceKind!Array] = null, [Id!!Id] = cast(4294967303 as bigint), [Name!!Name]=N'Kind 4', Main=0, [!TPriceList.PriceKinds!ParentId] = cast(4294967304 as bigint)

	select [!TPrice!Array] = null, [PriceKind!TPriceKind!RefId] = cast(4294967305 as bigint),
		[!TEntity.Prices!ParentId] = cast(4295140867 as bigint), Price = 185.7
	union all
	select [!TPrice!Array] = null, [PriceKind!TPriceKind!RefId] = cast(4294967304 as bigint),
		[!TEntity.Prices!ParentId] = cast(4295140867 as bigint), Price = 179.4
	union all
	select [!TPrice!Array] = null, [PriceKind!TPriceKind!RefId] = cast(4294967306 as bigint),
		[!TEntity.Prices!ParentId] = cast(4295140867 as bigint), Price = 172.44
end
go

-- CLEAN UP DATABASE
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2test' and ROUTINE_NAME=N'Workflow.Clear.All')
	drop procedure a2test.[Workflow.Clear.All]
go
------------------------------------------------
create procedure a2test.[Workflow.Clear.All]
as
begin
	set nocount on;
	delete from a2workflow.[Log];
	delete from a2workflow.[Inbox];
	delete from a2workflow.[Processes];
	delete from [System.Activities.DurableInstancing].InstancesTable;
end
go


