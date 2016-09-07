require(["dojo", "dojo/query", "dojo/string", "dojo/on", "dojo/request", "dojo/NodeList-manipulate", "dojo/NodeList-traverse"],
    function (dojo, query, string, on, request) {
        var submit = query('#login-form .login'),
            form = query('.login-card'),
            userInput = query('#login-form input[name="user"]')[0],
            emailInput = query('#login-form input[name="email"')[0],
            passwordInput = query('#login-form input[name="pass"]')[0],
            repeatPasswordInput = query('#login-form input[name="rpass"]')[0];

        var isRegisterFormValid = function () {
            var isValid = true,
                emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            if (userInput.value.trim() === '') {
                isValid = false;
            }

            if (!emailFilter.test(emailInput.value.trim())) {
                isValid = false;
            }

            if (passwordInput.value === '' || repeatPasswordInput.value !== passwordInput.value) {
                isValid = false;
            }

            return isValid;
        };

        on(submit, "click", function (event) {
            form.children('.login-message').remove();

            if (isRegisterFormValid()) {
                request.post('/api/v1/add-user', {
                    data: {
                        username: userInput.value.trim(),
                        email: emailInput.value,
                        password: passwordInput.value
                    }
                }).then(function (success) {
                    if (success) {
                        form.prepend('<div class="login-message login-success">You have registered successfully!</div>')
                    } else {
                        form.prepend('<div class="login-message login-fail">There was an error while registering the user!</div>')
                    }
                });

            } else {
                form.prepend('<div class="login-message login-fail">Registration failed!</div>');
            }
        });
    });