Vue.component('board', {
	props: [ 'columns', 'rows' ],
	template: '#board-template',
	methods: {}
});
Vue.component('enemy-board', {
	template: '#enemyBoard-template',
	props: [ 'columns', 'rows' ],
});


new Vue({
	el: '#main_game',

	data: {
		teste: 'teste'
	}
});
