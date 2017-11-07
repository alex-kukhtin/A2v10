
/* element template */

const utils = require('std:utils');

let template = {
	commands: {
        async ResumeProcess(inbox) {
            const vm = this.$vm;
            let result = await vm.$invoke('resumeProcess', { Id: inbox.Id, Comment: 'Comment from resume' });
            alert(utils.toJson(result));
            vm.$close();
        }
    }
};


module.exports = template;