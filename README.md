Small worker app that loads a collection of user records (email credentials and imap info) and registers email-event listeners.

Usage instructions:
	Out of the box, 2 email accounts are registered:
		- voxatest@gmail.com
		- gsdmail42@gmail.com

	Send an email to one of the registered addresses, as the default ones are unlikely to receive an email on their own. Then, check the following api endpoints for email data including subject, body, authors, and more:
		- http://ec2-54-200-40-85.us-west-2.compute.amazonaws.com:8080 (for all messages)
		- http://ec2-54-200-40-85.us-west-2.compute.amazonaws.com:8080/messages/n (for the last n messages)

	That's basically all there is to it! Send one or more email(s) and use the api to consume data. All of the magic is courtesy context.io.

If you want to set up your own server, follow these instructions:
	1) Clone the repository, cd to the directory
	2) Change the 'ec2webhook' variable in data_init.js to the public-facing address you'll be running the service on (around line 35)
	3) *Optional* Add/remove email address in data_init.js (around line 40)
	4) Run 'npm start' or 'node messages.js'