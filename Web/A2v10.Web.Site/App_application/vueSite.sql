

create or alter procedure a2demo.[VueSite.Home.Load]
@UserId bigint = null
as
begin
	set nocount on;
	select [Home!THome!Object] = null, [Id!!Id] = 50, [Text]='Home text here'
end
go