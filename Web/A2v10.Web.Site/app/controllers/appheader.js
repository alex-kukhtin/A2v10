// Copyright © 2021-2022 Oleksandr Kukhtin. All rights reserved.

/*20221123-7907*/
/* controllers/appheader.js */

(function () {

	const locale = window.$$locale;
	const eventBus = require('std:eventBus');
	const menuTools = component('std:navmenu');

	const a2AppHeader = {
		template: `
<header class="header">
	<div class=h-menu v-if=isNavBarMenu @click.stop.prevent=clickMenu><i class="ico ico-grid2"></i></div>
	<a class=h-block v-if='!isNavBarMenu' @click.stop.prevent=root href='/'  tabindex="-1">
		<!--<i class="ico-user"></i>-->
		<span class="app-logo" v-if=hasLogo>
			<img :src="logoSrc" />
		</span>
		<span class=app-title v-text="title"></span>
		<span class=app-subtitle v-text="subtitle"></span>
	</a>
	<div v-if=isNavBarMenu class=h-menu-title v-text=seg0text></div>
	<div class="aligner"></div>
	<span class="title-notify" v-if="notifyText" v-text="notifyText" :title="notifyText" :class="notifyClass"></span>
	<div class="aligner"></div>
	<template v-if="!isSinglePage ">
		<a2-new-button :menu="newMenu" icon="plus" btn-style="success"></a2-new-button>
		<slot></slot>
		<a2-new-button :menu="settingsMenu" icon="gear-outline" :title="locale.$Settings"></a2-new-button>
		<a class="nav-admin middle" v-if="hasFeedback" tabindex="-1" @click.prevent="showFeedback" :title="locale.$Feedback" :class="{open: feedbackVisible}"><i class="ico ico-comment-outline"></i></a>
		<a class="nav-admin" v-if="userIsAdmin" href="/admin/" tabindex="-1"><i class="ico ico-gear-outline"></i></a>
	</template>
	<div class="dropdown dir-down separate" v-dropdown>
		<button class="btn user-name" toggle :title="personName"><i class="ico ico-user"></i> 
			<span id="layout-person-name" class="person-name" v-text="personName"></span>
			<span id="layout-client-id" class="client-id" v-if="clientId"> [<span v-text="clientId" ></span>]</span>
			<span class="caret"></span>
		</button>
		<div class="dropdown-menu menu down-left">
			<template v-if="!isSinglePage " v-for="(itm, itmIndex) in profileItems">
				<div class="divider" v-if="itm.type === 'separator'"></div>
				<a v-else @click.prevent="doProfileMenu(itm)" class="dropdown-item" tabindex="-1"><i class="ico" :class="'ico-' + itm.icon"></i> <span v-text="itm.title" :key="itmIndex"></span></a>
			</template>
			<a v-if="isChangePasswordEnabled" @click.prevent="changePassword" class="dropdown-item" tabindex="-1"><i class="ico ico-access"></i> <span v-text="locale.$ChangePassword"></span></a>
			<div class="divider"></div>
			<form id="logoutForm" method="post" action="/account/logoff">
				<a href="javascript:document.getElementById('logoutForm').submit()" tabindex="-1" class="dropdown-item"><i class="ico ico-exit"></i> <span v-text="locale.$Quit"></span></a>
			</form>
		</div>
	</div>
</header>
`,
		props: {
			title: String,
			subtitle: String,
			userState: Object,
			personName: String,
			clientId: String,
			userIsAdmin: Boolean,
			menu: Array,
			newMenu: Array,
			settingsMenu: Array,
			appData: Object,
			showFeedback: Function,
			feedbackVisible: Boolean,
			singlePage: String,
			changePassword: Function,
			navBarMode: String,
			logo: String
		},
		computed: {
			isSinglePage() {
				return !!this.singlePage;
			},
			isChangePasswordEnabled() {
				return this.changePassword != undefined;
			},
			locale() { return locale; },
			notifyText() {
				return this.getNotify(2);
			},
			notifyClass() {
				return this.getNotify(1).toLowerCase();
			},
			feedback() {
				return this.appData ? this.appData.feedback : null;
			},
			hasFeedback() {
				return this.appData && this.appData.feedback;
			},
			hasLogo() {
				return this.appData && this.appData.appLogo;
			},
			logoSrc() {
				return this.hasLogo ? this.appData.appLogo : '';
			},
			profileItems() {
				return this.appData ? this.appData.profileMenu : null;
			},
			isNavBarMenu() {
				return this.navBarMode === 'Menu';
			},
			seg0text() {
				let seg0 = this.$store.getters.seg0;
				let mx = this.menu.find(x => x.Url === seg0);
				return mx ? mx.Name : '';
			}
		},
		methods: {
			getNotify(ix) {
				let n = this.userState ? this.userState.Notify : null;
				if (!n) return '';
				let m = n.match(/\((.*)\)(.*)/);
				if (m && m.length > ix)
					return m[ix];
				return '';
			},
			root() {
				let opts = { title: null };
				let currentUrl = this.$store.getters.url;
				let menuUrl = this.isSinglePage ? ('/' + this.singlePage) : menuTools.makeMenuUrl(this.menu, '/', opts);
				if (currentUrl === menuUrl) {
					return; // already in root
				}
				this.$store.commit('navigate', { url: menuUrl, title: opts.title });
			},
			doProfileMenu(itm) {
				switch (itm.type || '') {
					case '':
					case 'page':
						this.$store.commit('navigate', { url: itm.url });
						break;
					case 'dialog':
						this.dialog(itm.url);
						break;
					case 'external':
						window.open(itm.url, '_blank');
						break;
					default:
						alert('Unknown profile item type');
				}
			},
			clickMenu() {
				if (this.isNavBarMenu) {
					eventBus.$emit('clickNavMenu', true);
				}
			},
			dialog(url) {
				const dlgData = { promise: null };
				eventBus.$emit('modaldirect', url, dlgData);
				dlgData.promise.then(function (r) {
				});
			}
		}
	};

	app.components['std:appHeader'] = a2AppHeader;
})();	