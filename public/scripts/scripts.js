require(["dojo", "dojo/query", "dojo/on", "dojo/request", "dojo/cookie", "dojo/NodeList-manipulate", "dojo/NodeList-traverse"],
    function (dojo, query, on, request, cookie) {

        var submit = query('#login-form .login')[0],
            form = query('.login-card'),
            userInput = query('#login-form input[name="user"]')[0],
            passwordInput = query('#login-form input[name="pass"]')[0];

        on(submit, 'click', function (event) {
            form.children('.login-message').remove();

            request.post('api/v2/authenticate', {
                data: {
                    username: userInput.value,
                    password: passwordInput.value
                }
            }).then(function (response) {
                cookie('jwt-token', JSON.parse(response).token);
                form.prepend('<div class="login-message login-success">Logged in succesfully!</div>');
            }, function (error) {
                form.prepend('<div class="login-message login-fail">Login failed!</div>');
            });
        });

    });