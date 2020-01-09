$('document').ready(function() {
	$('#login').on('click', function() {
		email = $('#email').val();
		password = $('#password').val();
		if (password != '' && email != '') {
			$.ajax({
				url: '/login',
				type: 'post',
				data: {
					email: email,
					password: password
				},
				success: function(result) {
					if (result == 'Dados inválidos') {
						console.log('dados inválidos');
						$('#error').css('display', 'block');
						$('#error').css('font-weight', 'bold');
						$('#error').html('Something is wrong!');
					} else window.location = '/';
				}
			});
		}
	});
});
