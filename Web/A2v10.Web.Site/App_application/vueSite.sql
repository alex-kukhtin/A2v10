

create or alter procedure a2demo.[VueSite.Home.Load]
@UserId bigint = null,
@Id bigint = 50
as
begin
	set nocount on;
	select [Home!THome!Object] = null, [Id!!Id] = @Id, [Text]='Home text here'
end
go