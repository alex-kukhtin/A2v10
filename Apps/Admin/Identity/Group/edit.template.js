
/* identity/group template */

const template = {
    properties: {
    },
	events: {
		'Group.Users[].adding': userAdding
    },
	validators: {
		'Group.Name': "Назва не може бути пустою"
    },
    commands: {

	}
};

function userAdding(array, user) {
	let vm = array.$vm;
	if (array.find((u) => u.Id === user.Id)) {
		vm.$alert('Користувач вже в групі');
		return false;
	}
}

module.exports = template;