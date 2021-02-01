define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const template = {
        validators: {
            'Agent.Name': "notBlank"
        },
        events: {
            'Model.load': modelLoad
        }
    };
    function modelLoad(root) {
        let agent = root.Agent;
        if (agent.$isNew)
            agent.ParentFolder = root.ParentFolder.Id;
    }
    exports.default = template;
});
