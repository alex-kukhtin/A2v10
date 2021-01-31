define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let savedFolderId;
    const template = {
        properties: {
            'TRoot.$Filter': String,
            'TFolder.$IsSearch'() { return this.Id === -1; },
            'TFolder.$IsFolder'() { return this.Id !== -1; },
            'TFolder.$IsVisible'() {
                return this.$IsFolder || !!this.$root.$Filter;
            }
        },
        events: {
            'Root.$Filter.change': filterChange,
            'Folders[].select': selectionChange
        },
        commands: {
            clearFilter,
            createFolder: {
                exec: createFolder,
                canExec: canExecForFolder
            },
            createSubFolder: {
                exec: createSubFolder,
                canExec: canExecForFolder
            },
            deleteFolder: {
                exec: deleteFolder,
                canExec: canDeleteFolder,
                confirm: 'Ви дійсно бажаєте видалити папку?'
            }
        }
    };
    exports.default = template;
    function filterChange(elem, newVal, oldVal, propName) {
        const folders = elem.Folders;
        const ctrl = this.$ctrl;
        let srFolder = folders.$find(x => x.Id == -1);
        if (newVal) {
            if (!savedFolderId) {
                let sel = folders.$selected;
                savedFolderId = sel ? sel.Id : 0;
            }
            srFolder.$select(folders);
            this.$defer(() => {
                ctrl.$setFilter(srFolder.Children, 'Fragment', newVal);
            });
        }
        else {
            srFolder.Children.$resetLazy();
            if (savedFolderId) {
                let frItem = folders.$find(x => x.Id === savedFolderId);
                if (frItem)
                    frItem.$select(folders);
            }
            savedFolderId = 0;
        }
    }
    function selectionChange(folders) {
        let sel = folders.$selected;
        if (sel && sel.$IsFolder) {
            savedFolderId = 0;
            this.$Filter = '';
        }
    }
    function clearFilter() {
        this.$Filter = '';
    }
    function canExecForFolder(sel) {
        return sel && sel.$IsFolder;
    }
    function createFolder(sel) {
        if (sel.$IsSearch)
            return;
        alert('top level folder');
    }
    async function createSubFolder(parent) {
        let ctrl = this.$ctrl;
        if (!parent || parent.$IsSearch)
            return;
        await ctrl.$expand(parent, 'SubItems', true);
        let elem = await ctrl.$showDialog('/catalog/agent/editFolder', { Id: 0 }, { Parent: parent.Id });
        let fld = parent.SubItems.$append(elem);
        fld.$select(this.Folders);
    }
    async function deleteFolder(folder) {
        const ctrl = this.$ctrl;
        if (!folder || folder.$IsSearch || !canDeleteFolder(folder))
            return;
        folder.$remove();
    }
    function canDeleteFolder(folder) {
        return folder && folder.$IsFolder && !folder.HasSubItems && folder.Children.$isEmpty;
    }
});
