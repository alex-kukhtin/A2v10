
/* identity/role template */

const utils = require('std:utils');

const template = {
    properties: {
        "TRole.$IdOrNew"() { return this.$isNew ? "Новая" : this.Id; },
        "TUserOrGroup.$Id"() { return this.UserId ? this.UserId : this.GroupId; },
        "TUserOrGroup.$Icon"() { return this.UserId ? "user" : 'users'; },
        "TUserOrGroup.$Name"() { return this.UserId ? `${this.UserName} [${this.PersonName}]` : this.GroupName; },
        "TUserOrGroup.$UGName"() { return this.UserId ? "Пользователь" : "Группа"; }
    },
	validators: {
        'Role.Name': [
            "Введите наименование роли",
            { valid: duplicateName, async: true, msg: "Роль с таким наименованием уже существует" }
        ],
        "Role.Key":
            { valid: duplicateKey, async: true, msg: "Роль с таким ключом уже существует" }
    },
    commands: {
        addUser,
        addGroup
	}
};

function onAddingUsersOrGroups(array, elem) {
    console.dir(elem);
    if (array.find(item => item.Id === elem.Id))
        return false; // такая группа уже есть
    return true;
}

function duplicateKey(role, value) {
    var vm = role.$vm;
    if (!role.Key)
        return true;
    return vm.$asyncValid('duplicateKey', { Key: role.Key, Id: role.Id });
}

function duplicateName(role, value) {
    var vm = role.$vm;
    if (!role.Name)
        return true;
    return vm.$asyncValid('duplicateName', { Name: role.Name, Id: role.Id });
}

async function addUser(array) {
    var vm = this.$vm;
    let users = await vm.$showDialog('/Identity/User/Browse');
    if (!utils.isArray(users))
        users = [users];
    users.forEach(function (user) {
        if (array.find((u) => u.UserId === user.Id)) {
            return;
        }
        array.$append({ UserId: user.Id, UserName: user.Name, PersonName: user.PersonName });
    });
}

async function addGroup(array) {
    var vm = this.$vm;
    let groups = await vm.$showDialog('/Identity/Group/Browse');
    if (!utils.isArray(groups))
        groups = [groups];
	groups.forEach(function (group) {
		if (array.find((ug) => ug.GroupId === group.Id)) {
			return;
		}
		array.$append({ GroupId: group.Id, GroupName: group.Name });
	});
}

module.exports = template;