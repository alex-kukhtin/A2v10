/*
------------------------------------------------
Copyright © 2012-2021 Alex Kukhtin

Last updated : 31 jan 2021
*/
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'samples')
	exec sp_executesql N'create schema samples authorization dbo';
go

