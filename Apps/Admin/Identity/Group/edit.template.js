
/* identity/group template */

const template = {
    properties: {
        "TGroup.$IdOrNew"() { return this.$isNew ? "Новая" : this.Id; },
    },
	validators: {
        'Group.Name': [
            "Введите наименование",
            { valid: duplicateName, async: true, msg: "Группа с таким наименованием уже существует" }
        ],
        "Group.Key":
        { valid: duplicateKey, async: true, msg: "Группа с таким ключом уже существует" }
    },
    commands: {
        addUser
	}
};

async function addUser(array) {
    var vm = this.$vm;
    let user = await vm.$showDialog('/Identity/User/Browse');
    if (array.find((u) => u.Id === user.Id)) {
        vm.$alert('Пользователь уже включен в группу');
        return;
    }
    array.$append({ Id: user.Id, Name: user.Name, PersonName: user.PersonName });
}

function duplicateName(group, value) {
    var vm = group.$vm;
    if (!group.Name)
        return true;
    return vm.$asyncValid('duplicateName', { Name: group.Name, Id: group.Id });
}

function duplicateKey(group, value) {
    var vm = group.$vm;
    if (!group.Key)
        return true;
    return vm.$asyncValid('duplicateKey', { Key: group.Key, Id: group.Id });
}

module.exports = template;