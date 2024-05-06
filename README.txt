Note that this only works on Windows machines!

Adding media to the server:
    -To add any media to the server, drag all files or folders that you want into the "Media" folder.
    -You can organize your media in any way you want in the "Media" folder by adding as many folders as you want, just make sure that all media you add is in the "Media" folder.
    -Note that currently, only videos of type mp4, webm, and ogg are supported.
    -Also note that the file ".gitignore" in the "Media" folder can be deleted.

Controlling the server:
    -In order for other devices to access your media you have put on this server, you have to start the server by double-clicking the file "startServer.bat".
    -You will only be able to access your media when the server is running, so make sure you have a computer dedicated to running this server.
    -To stop the server, close out of the terminal window that opened up when you double-clicked "startServer.bat".

Configuring custom domain(s):
    -In order to use a custom domain for THE SERVER COMPUTER ONLY to access your personal media server, you have to configure it in the steps listed here
    -Go to Windows\System32\drivers\etc\hosts and add 127.0.0.1 [your domain here]
    -You can add as many domains as you want, just make a new line in the same format as noted in the above line
    -To access your personal media server using a new domain, you have to add ":3000" after the domain in the address bar because the server runs on port 3000. For instance, if you used the doman exampledomain, to access your personal web server, you would have to go to exampledomain:3000 in the browser.

Server not opening up:
    -If you try to open up the server and nothing happens except for being stuck on the page that says it is not necessary (which often happens when you first open a new domain you configured), just make sure that on the page popups are not blocked.