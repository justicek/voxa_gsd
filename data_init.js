var ContextIO = require('contextio');

// context io client, hardcoded with dev api account
var ctxtio = new ContextIO.Client('2.0', {
    key: 'k0ihq8ff',
    secret: 'mwurxO11F22rZSai'
});

/* Context.IO Account Constructor */
var Account = function(email, source, webhook) {
    this.email = email;
    this.source = source;
    this.webhook = webhook;
};

/* Context.IO Account Source Constructor */
var Source = function(email, password, server, ssl, port, type) {
    this.email = email;
    this.server = server;
    this.username = email;
    this.use_ssl = ssl || 1;
    this.port = port || 993;
    this.type = type || 'IMAP';
    this.password = password;
};

/* Context.IO Account Webhook Constructor */
var Webhook = function(successUrl, failureUrl) {
    this.success_url = successUrl;
    this.failure_url = failureUrl || successUrl;
};

/* Initialize and register accounts with Context.IO */
function initialize() {
    var ec2webhook = new Webhook('http://ec2-54-200-40-85.us-west-2.compute.amazonaws.com:8080');

    // hardcoded accounts for testing, more can be added
    var accounts = [];
    accounts.push(new Account('voxatest@gmail.com', new Source('voxatest@gmail.com', 'lionshead12', 'imap.gmail.com'), ec2webhook));
    accounts.push(new Account('gsdmail42@gmail.com', new Source('gsdmail42@gmail.com', 'lionshead12', 'imap.gmail.com'), ec2webhook));

    for (var i = 0; i < accounts.length; i++) {
        var create = function() {
            var account = accounts[i];
            var id;

            ctxtio.accounts().post({
                email: account.email
                },
                function(error, response) {
                    console.log('creating account for ' + account.email);
                    if (error)
                        console.log('error posting account for ' + account.email);

                    id = response.body.id;
                    ctxtio.accounts(id).sources().post({
                        email: account.source.email,
                        server: account.source.server,
                        username: account.source.username,
                        use_ssl : account.source.use_ssl,
                        port: account.source.port,
                        type: account.source.type,
                        password: account.source.password
                    },
                    function(err) {
                        console.log('creating source for ' + account.email);
                        if (err)
                            console.log('error posting source for ' + account.email);

                        ctxtio.accounts(id).webhooks().post({
                            callback_url: account.webhook.success_url,
                            failure_notif_url: account.webhook.failure_url,
                            sync_period: 'immediate',               // always alert immediately
                            include_body: 1                                 // and include the body
                            },
                            function(e) {
                                console.log('creating webhook for ' + account.email);
                                if (e) { console.log('error attaching webhook for ' + account.email); }
                                else { console.log('successfully added account ' + account.email); }
                        });
                    });
                }
            );
        };

        // offset function call to mitigate asynchornous unpredictability
        // (todo: implement promises or other async control)
        if (i > 0) {
            setTimeout(create(), 2000);
        }
        else
            create();
    }
}

module.exports = initialize;
