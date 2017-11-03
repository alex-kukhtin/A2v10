
/* identity/role template */

const template = {
    properties: {
        "TRole.$IdOrNew"() { return this.$isNew ? "Новая" : this.Id; },
        "TUserOrGroup.$Icon"() { return this.UserId ? "user" : 'users'; },
        "TUserOrGroup.$Name"() { return this.UserId ? this.UserName : this.GroupName; },
        "TUserOrGroup.$UGName"() { return this.UserId ? "Пользователь" : "Группа"; }
    },
	events: {
    },
	validators: {
        'Role.Name': [
            "Введите наименование",
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
    let user = await vm.$showDialog('/Identity/User/Browse');
    if (array.find((u) => u.UserId === user.Id)) {
        vm.$alert('Пользователь уже включен в роль');
        return;
    }
    array.$append({ UserId: user.Id, UserName: user.Name });
}

async function addGroup(array) {
    var vm = this.$vm;
    let group = await vm.$showDialog('/Identity/Group/Browse');
    if (array.find((ug) => ug.GroupId === group.Id)) {
        vm.$alert('Группа уже включена в роль');
        return;
    }
    array.$append({ GroupId: group.Id, GroupName: group.Name });
}

module.exports = template;