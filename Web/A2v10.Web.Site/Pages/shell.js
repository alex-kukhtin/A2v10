/*20170818-7015*/
/*shell.js*/

/*
TODO:
3. SideBar - разные режимы
4. Collapse/expand
5. 
*/

(function () {

    const Shell = component('std:shellController');

    const menu = [
        {
            title: "Начало", url: "home", menu234: [
                {
                    title: 'xxxx', icon: 'save', menu: [
                        {title: 'yyyy', url: 'subhome'}
                    ]
                }
            ]
        },
        {
            type:'tree', title: 'Справочники', url: 'catalog', menu: [
                { title: "Suppliers", url: 'suppliers', icon:'users', query:'order=Name&dir=desc'},
				{ title: "Покупатели", url: 'customers', icon: 'database' },
				{ title: "Объекты строительства", url: 'buildings', icon: 'step' },
                { title: "Edit 3 segment", url: 'edit/5', icon:'dashboard' },
                {
                    title: "Menu Folder", icon: 'folder', menu: [
                        { title: "Suppliers 2 (with long text <b>bold</b> escaped <script></script>)", url: 'suppliers1', icon: 'save' },
                        { title: "Customers 2", url: 'customers2', icon:'dot'}
                    ]
                }
            ]
        },
        {
            type:'accordion', title: 'Документы', url: 'document', menu: [
                { title: "Заявки", url: 'request', icon: 'file', query:'order=Date&dir=asc' },
                { title: "Котировки", url: 'quotations', icon: 'database'},
                { title: "edit 4 segment", url: 'outgoing/edit/2', icon: 'comment' }
            ]
        }
    ];



    // main VIEW SHELL

    const shell = new Shell({
        el: '#shell',
        data: {
            title: 'application title',
            version: '$(AppVersion)',
            menu: menu
        }
    });

})();