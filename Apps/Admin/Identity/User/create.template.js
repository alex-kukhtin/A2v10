
/* identity/user template (create) */

const CONFIRM_MSG = "Пароль и подтверждение не совпадают";

const template = {
	properties: {
		"TUser.Password": String,
		"TUser.Confirm": String
	},
	events: {
		"User.Groups[].adding": onAdding
	},
	validators: {
		"User.Name": [
			"Не указан логин",
			{ valid: duplicateLogin, async: true, msg: "Пользователь с таким логином уже существует" }
		],
		"User.Email": { valid: 'email', msg: 'Ошибка в адресе электронной почты' },
		"User.Password": [
			"Не указан пароль",
			{ valid: validLen, msg: "Длина пароля не менее 6 символов" },
			{ valid: passwordEq, msg: CONFIRM_MSG }
		],
		"User.Confirm": [
			"Не указано подтверждение пароля",
			{ valid: passwordEq, msg: CONFIRM_MSG }
		]
	},
	commands: {

	}
};

function passwordEq(user) {
	return user.Password === user.Confirm;
}

function validLen(user) {
	return user.Password.length >= 6;
}

function duplicateLogin(user, value) {
	// this === rule ???
	var vm = user.$vm;
	if (!user.Name)
		return true;
	return vm.$asyncValid('duplicateLogin', { Login: user.Name, Id: user.Id });
}

function onAdding(array, elem) {
	if (array.find(item => item.Id === elem.Id))
		return false; // такая группа уже есть
	return true;
}

module.exports = template;