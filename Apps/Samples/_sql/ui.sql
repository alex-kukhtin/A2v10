/*
------------------------------------------------
Copyright © 2012-2021 Alex Kukhtin

Last updated : 31 jan 2021
*/
------------------------------------------------
begin
	-- App Title/SubTitle
	if not exists (select * from a2sys.SysParams where [Name] = N'AppTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppTitle', N'A2v10:Samples'); 
	if not exists (select * from a2sys.SysParams where [Name] = N'AppSubTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppSubTitle', N'приклади роботи'); 
end
go
------------------------------------------------
begin
	set nocount on;

	declare @menu a2ui.[Menu2.TableType];
	insert into @menu(Id, Parent, [Name], [Url], Icon, [Order])
	values
		(1,   null, N'Default',     null,       null,     0),
		(10,  1,    N'Довідники',   N'catalog', null,     10),
		(100, 10,   N'Контрагенти', N'agent',   N'user',  10);

	exec a2ui.[Menu.Merge] @menu, 1, 1000;

	if not exists (select * from a2security.Acl where [Object] = 'std:menu' and [ObjectId] = 1 and GroupId = 1)
		insert into a2security.Acl ([Object], ObjectId, GroupId, CanView) values (N'std:menu', 1, 1, 1);

	exec a2security.[Permission.UpdateAcl.Menu];
end
go

