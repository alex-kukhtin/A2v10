define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let savedFolderId;
    const template = {
        properties: {
            'TRoot.$Filter': String,
            'TRoot.$IsSeachFolder'() { return this.Folders.$selected.$IsSearch; },
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
            'Model.load': modelLoad,
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
            },
            editItem: {
                exec: editItem,
                canExec(arr) { return !!arr && !!arr.$selected; }
            },
            gotoFolder
        }
    };
    exports.default = template;
    function createModelInfo(root, arr) {
        return root.$createModelInfo(arr, {
            Filter: {
                Fragment: null
            },
            PageSize: 10,
            Offset: 0,
            SortDir: "asc",
            SortOrder: 'name'
        });
    }
    async function modelLoad() {
        const ctrl = this.$ctrl;
        let srFolder = this.Folders.$find(x => x.Id == -1);
        createModelInfo(this, srFolder.Children);
    }
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
            srFolder.Children.$ModelInfo.Filter.Fragment = newVal;
            ctrl.$reload(srFolder.Children);
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
    async function editItem(arr) {
        const ctrl = this.$ctrl;
        if (!arr || !arr.$selected)
            return;
        let ag = arr.$selected;
        let oldParent = ag.ParentFolder.Id;
        let result = await ctrl.$showDialog('/catalog/agent/editItem', ag);
        let newParent = result.ParentFolder.Id;
        if (newParent == oldParent) {
            ag.$merge(result);
        }
        else {
            ag.$remove();
            let nf = this.Folders.$find(x => x.Id === newParent);
            if (nf != null) {
                if (nf.Children.$loaded)
                    nf.Children.$append(result);
            }
        }
    }
    async function gotoFolder(agent) {
        const ctrl = this.$ctrl;
        function findAgent(arr) {
            let ag = arr.$find(a => a.Id == agent.Id);
            if (ag) {
                console.dir(ag);
                ag.$select();
                return ag;
            }
            return null;
        }
        async function findAgentOffset(folder, mi) {
            folder.Children.$lockUpdate(true);
            let res = await ctrl.$invoke('findIndex', { Id: agent.Id, Parent: folder.Id, Order: mi.SortOrder, Dir: mi.SortDir });
            folder.Children.$lockUpdate(false);
            if (res && res.Result) {
                let ix = res.Result.RowNo;
                let pageNo = Math.floor(ix / mi.PageSize);
                return pageNo * mi.PageSize;
            }
            return -1;
        }
        const parentFolder = agent.ParentFolder.Id;
        const folders = this.Folders;
        let fld = folders.$find(itm => itm.Id == parentFolder);
        let path = [];
        if (fld != null) {
            while (fld && fld != this) {
                path.push(fld.Id);
                fld = fld.$parent.$parent;
            }
            path = path.reverse();
        }
        else {
            let result = await ctrl.$invoke('getPath', { Id: agent.ParentFolder.Id });
            if (result && result.Result)
                path = result.Result.map(x => x.Id);
        }
        if (!path.length)
            return;
        let l1 = folders.$find(itm => itm.Id == path[0]);
        let selFolder = await l1.$selectPath(path, (itm, num) => itm.Id === num);
        if (!selFolder)
            return;
        selFolder.$select(folders);
        let ch = selFolder.Children;
        if (ch.$loaded) {
            let ag = findAgent(ch);
            if (!ag) {
                ch.$resetLazy();
                let mi = createModelInfo(this, ch);
                let offset = await findAgentOffset(selFolder, mi);
                if (offset == -1)
                    return;
                mi.Offset = offset;
                await ch.$reload();
                findAgent(ch);
            }
        }
        else {
            console.dir('новая загрузка');
            let mi = createModelInfo(this, ch);
            let offset = await findAgentOffset(selFolder, mi);
            if (offset == -1)
                return;
            mi.Offset = offset;
            console.dir('offset: ' + offset);
            await ch.$reload();
            findAgent(ch);
        }
    }
});
