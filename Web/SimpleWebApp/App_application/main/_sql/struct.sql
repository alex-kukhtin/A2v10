-- database stucture
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'app')
	exec sp_executesql N'create schema app';
go
