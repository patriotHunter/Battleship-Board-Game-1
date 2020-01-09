$('document').ready(function() {
	var emailSet = false;
	var usernameSet = false;
	var passwrodMatch = false;
	$('#email').on('blur', function() {
		var email = $('#email').val();
		if (email == '') {
			emailSet = false;
			$('#email-mandatory').css('display', 'block');
			$('#email-mandatory').html('* This field is mandatory!');
			return;
		} else if (!checkEmail(email)) {
			$('#email-mandatory').css('display', 'block');
			$('#email-mandatory').html('This email is invalid!');
			return;
		}
		$.ajax({
			url: '/register',
			type: 'post',
			data: {
				emailcheck: 1,
				email: email
			},
			success: function(result) {
				if (result == 'taken') {
					emailSet = false;
					$('#email-mandatory').css('display', 'block');
					$('#email-mandatory').html('* This email alredy exist!');
				} else if (result == 'avaliable') {
					emailSet = true;
					$('#email-mandatory').css('display', 'block');
					$('#email-mandatory').css('color', 'green');
					$('#email-mandatory').html('This email is avaliable!');
				}
			}
		});
	});
	$('#register').on('click', function() {
		var email = $('#email').val();
		var username = $('#username').val();
		var password = $('#password').val();
		var confirmPassword = $('#confirmPassword').val();
		if (email == '') {
			$('#email-mandatory').css('display', 'block');
			$('#email-mandatory').html('* This field is mandatory!');
			emailSet = false;
		} else if (!checkEmail(email)) {
			$('#email-mandatory').css('display', 'block');
			$('#email-mandatory').html('This email is invalid!');
			emailSet = false;
		}

		if (username == '') {
			usernameSet = false;
			$('#username-mandatory').css('display', 'block');
			$('#username-mandatory').html('* This field is mandatory!');
		} else {
			usernameSet = true;
			$('#username-mandatory').css('display', 'none');
		}

		if (password == '') {
			$('#password-mandatory').css('display', 'block');
			$('#password-mandatory').html('* This field is mandatory!');
		} else if (password.length < 8) {
			$('#password-mandatory').css('display', 'block');
			$('#password-mandatory').html('* This field must have 8 characters.');
		} else if (password != confirmPassword) {
			$('#password-mandatory').css('display', 'block');
			$('#confirmPassword-mandatory').css('display', 'block');
			$('#confirmPassword-mandatory').html('* Password does not match');
			$('#password-mandatory').html('* Password does not match');
		} else {
			$('#password-mandatory').css('display', 'none');
			$('#confirmPassword-mandatory').css('display', 'none');
			passwrodMatch = true;
		}
		if ((emailSet && usernameSet && passwrodMatch)) {
			$.ajax({
				url: '/register',
				type: 'post',
				data: {
					emailcheck: 0,
					email: email,
					name: username,
					pass: password
				},
				success: function(result) {
					console.log(result);
					window.location = '/';
				}
			});
		}
	});
});

function checkEmail(mail) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) return true;
	return false;
}
