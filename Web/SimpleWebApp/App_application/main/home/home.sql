-- Home model
-----------------------------------------------
create or alter procedure app.[Home.Load]
@UserId bigint
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	select [Home!THome!Object] = null, [User!TUser!RefId] = @UserId;

	select [!TUser!Map] = null, [Id!!Id] = Id, [UserName], [PersonName]
	from a2security.Users where Id = @UserId;
end
go