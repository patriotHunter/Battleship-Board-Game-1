$('document').ready(function() {
	$('#login').on('click', function() {
		email = $('#email').val();
		password = $('#password').val();

		$.ajax({
			url: '/login',
			type: 'post',
			data: {
				email: email,
				password: password
			},
			success: function(result) {
				console.log(result);
				window.location = '/';
			}
		});
	});
});
