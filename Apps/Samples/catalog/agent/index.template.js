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
            },
            'TRoot.$ParentFolderData'() {
                let sel = this.Folders.$selected;
                return sel ? { Parent: sel.Id } : {};
            }
        },
        events: {
            'Root.$Filter.change': filterChange,
            'Folders[].select': selectionChange
        },
        commands: {
            clearFilter,
            createFolder: {
                exec: createFolder
            },
            createSubFolder: {
                exec: createSubFolder,
                canExec: canExecForFolder
            },
            deleteFolder: {
                exec: deleteFolder,
                canExec: canDeleteFolder,
                confirm: 'Ви дійсно бажаєте видалити папку?'
            },
            deleteItem: {
                exec: deleteItem,
                canExec(arr) { return !!arr && !!arr.$selected; },
                confirm: 'Ви дійсно бажаєте видалити контрагента?'
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
    async function createFolder(parent) {
        const ctrl = this.$ctrl;
        if (parent && parent.$IsSearch)
            return;
        let elem = await ctrl.$showDialog('/catalog/agent/editFolder');
        let searchFolder = this.Folders.$find(x => x.Id === -1);
        let fld = this.Folders.$insert(elem, "above", searchFolder);
        fld.$select(this.Folders);
    }
    async function createSubFolder(parent) {
        const ctrl = this.$ctrl;
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
        await ctrl.$invoke('deleteFolder', { Id: folder.Id });
        folder.$remove();
    }
    function canDeleteFolder(folder) {
        return folder && folder.$IsFolder && !folder.HasSubItems && folder.Children.$isEmpty;
    }
    async function deleteItem(arr) {
        const ctrl = this.$ctrl;
        if (!arr || !arr.$selected)
            return;
        await ctrl.$invoke('deleteItem', { Id: arr.$selected.Id });
        arr.$selected.$remove();
    }
});
