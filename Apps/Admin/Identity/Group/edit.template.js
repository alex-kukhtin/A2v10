
/* identity/group template */

const template = {
    properties: {
        "TGroup.$IdOrNew"() { return this.$isNew ? "Новая" : this.Id; },
        "TGroup.$KeyDisabled"() { return this.Id !== 0 && this.Id < 100; }
    },
    events: {
        "Group.Users[].adding": onAddingUsers
    },
	validators: {
        'Group.Name': [
            "Введите наименование",
            { valid: duplicateName, async: true, msg: "Группа с таким наименованием уже существует" }
        ],
        "Group.Key":
        { valid: duplicateKey, async: true, msg: "Группа с таким ключом уже существует" }
    }
};

function onAddingUsers(array, elem) {
    if (array.find(item => item.Id === elem.Id))
        return false; // такой пользователь уже есть
    return true;
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