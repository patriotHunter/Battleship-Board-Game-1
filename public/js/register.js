var socket;

$(document).ready(() => (socket = io()));

function register() {
	var input = [ $('#email'), $('#username'), $('#password'), $('#confirmPassword') ];
	var ready = [ true, true, true, true ];

	input.forEach((element) => {
		switch (element[0].id) {
			case 'email':
				if (element.val() == '') {
					ready[0] = false;
					$('#email-mandatory').css('display', 'block');
					$('#email-mandatory').html('* This field is mandatory!');
				} else if (!checkEmail(element.val())) $('#email-mandatory').html('This email is invalid!');
				else {
					ready[0] = true;
					$('#email-mandatory').css('display', 'none');
				}
				break;

			case 'username':
				if (element.val() == '') {
					ready[1] = false;
					$('#username-mandatory').css('display', 'block');
					$('#username-mandatory').html('* This field is mandatory!');
				} else {
					$('#username-mandatory').css('display', 'none');
					ready[1] = true;
				}

				break;

			case 'password':
				if (element.val() == '') {
					ready[2] = false;
					$('#password-mandatory').css('display', 'block');
					$('#password-mandatory').html('* This field is mandatory!');
				} else if (element.val().length < 8) {
					ready[2] = false;
					$('#password-mandatory').css('display', 'block');
					$('#password-mandatory').html('* Password must have 8 characters!');
				} else {
					$('#password-mandatory').css('display', 'none');
					ready[2] = true;
				}

				break;

			case 'confirmPassword':
				if (element.val() == '') {
					ready[3] = false;
					$('#confirmPassword-mandatory').css('display', 'block');
					$('#confirmPassword-mandatory').html('* This field is mandatory!');
				} else if ($('#password').val() != $('#confirmPassword').val()) {
					ready[3] = false;
					$('#password-mandatory').css('display', 'block');
					$('#confirmPassword-mandatory').css('display', 'block');
					$('#confirmPassword-mandatory').html('* Password does not match');
					$('#password-mandatory').html('* Password does not match');
				} else if (element.val().length < 8) {
					$('#password-mandatory').html('* Password must have 8 characters!');
					$('#confirmPassword-mandatory').css('display', 'none');
				} else {
					$('#password-mandatory').css('display', 'none');
					$('#confirmPassword-mandatory').css('display', 'none');
					ready[3] = true;
				}
				break;
		}
	});

	if (isReady(ready)) {
		console.log('sendig data');
		socket.emit('register', input[0].val(), input[1].val(), input[2].val());
	}
}

function isReady(array) {
	var result = true;
	array.forEach((element) => {
		if (!element) {
			result = false;
		}
	});
	return result;
}

function checkEmail(mail) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) return true;
	return false;
}
