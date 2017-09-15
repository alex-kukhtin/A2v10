/*20170818-7015*/
/*shellAdmin.js*/

/*
*/

(function () {

    const Shell = component('std:shellController');

    const menu = [
    /*
        {
            title:"Dashboard", url: "dashboard"
        },
        */
        {
            type:'tree', title: 'Администратор', url: 'identity', menu: [
                { title: "Пользователи", url: 'user', icon:'user'},
				{ title: "Группы", url: 'group', icon: 'users' },
                { title: "Роли", url: 'role', icon: 'users' }
            ]
        },
        {
            title: "Бизнес процессы", url:'workflow', icon: 'folder', menu: [
                { title: "Выполняемые", url: 'executing', icon: 'save' },
                { title: "Аварийные", url: 'failed', icon: 'dot' }
            ]
        }
    ];



    // main VIEW SHELL

    const shell = new Shell({
        el: '#shell',
        data: {
            title: 'application title (admin)',
            version: '$(AppVersion)',
            menu: menu
        }
    });

	window.$rootUrl = '';

})();