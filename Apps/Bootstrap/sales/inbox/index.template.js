/*invoice index template*/


const template = {
	properties: {
		'TInbox.$Arg'() { return { X: 5, Y: 6 };},
		'TInbox.$TestNull'() { return this.Id % 2 === 0 ? 'text' : null }
    }
};

module.exports = template;

