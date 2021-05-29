/**
 * edit customer
 */


const template = {
    events: {
    },
    validators: {
	},
	commands: {
		confirmPhone,
		confirmCode
	}
};

module.exports = template;


async function confirmPhone() {
	var root = this;
	let vm = root.$vm;
	let result = await vm.$invoke('sendVerifyCode', { PhoneNumber: root.User.PhoneNumber });
	alert(result);
}

async function confirmCode() {
	var root = this;
	let vm = root.$vm;
	let result = await vm.$invoke('confirmVerifyCode', { PhoneNumber: root.User.PhoneNumber, Code: root.User.VerifyCode });
	alert(result);
}