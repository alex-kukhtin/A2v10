define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const template = {
        validators: {
            'Folder.Name': "notBlank"
        },
        events: {
            'Model.load': modelLoad
        }
    };
    function modelLoad(root) {
        let folder = root.Folder;
        if (folder.$isNew)
            folder.ParentFolder = root.ParentFolder.Id;
    }
    exports.default = template;
});
