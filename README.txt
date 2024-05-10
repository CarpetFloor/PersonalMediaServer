Note that this currently only works on Windows machines.

Adding media to the server:
    -To add any media to the server, drag all files or folders that you want into the "Media" folder.
    -You can organize your media in any way you want in the "Media" folder by adding as many folders as you want, just make sure that all media you add is in the "Media" folder.
    -Note that currently, only videos of type mp4, webm, and ogg are supported.
    -Also note that the file ".gitignore" in the "Media" folder can be deleted.

Controlling the server:
    -Start the server by running startGUI.bat or startHeadless.bat depending on if you need the GUI controller. Note that the GUI is currently under development.
    -You will only be able to access your media when the server is running, so make sure you have a computer dedicated to running the server.
    -To close the server, if running headless just close the terminal window or terminate the process. If running through the GUI, either close the window or click the stop button in the GUI.

Configuring custom domain(s) for the SERVER COMPUTER ONLY:
    -Go to Windows\System32\drivers\etc\hosts and add 127.0.0.1 [your domain here]
    -You can add as many domains as you want, just make a new line in the same format as noted in the above line
    -To access your personal media server using a new domain, you have to add ":3000" after the domain in the address bar because the server runs on port 3000. For instance, if you used the doman exampledomain, to access your personal web server, you would have to go to exampledomain:3000 in the browser.
