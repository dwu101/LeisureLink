# LeisureLink 

## Get Started

use `git clone https://github.com/dwu101/LeisureLink.git` to clone this repo 

download node from https://nodejs.org/en if you haven't already 

download PostgreSQL from https://www.postgresql.org/download/ if you haven't already 

download Postman if you haven't already to test API endpoints

## How to run:

You must have 2 terminals on whatever ide you use. Assuming you use vscode, there is a + button on the very right side of the terminal. 


In one terminal, cd into the backend folder and execute `pip install -r requirements.txt`, which will download all the necessary packages (if this doesn't work, you'll have to manually install packages that can't import when you start the app). Then execute `python app.py`. This will run on http://127.0.0.1:5000, sound an alarm if this port doesn't work for you. The port number is important becuase I added a proxy to the frontend meaning all API calls go directly to port 5000. This is so instead of having to call http://127.0.0.1:5000/apiName, we can just call /apiName. This avoids all CORS errors (i think), and avoids issues with pushing/pulling code with different port values. 

In the other terminal, cd into the frontend folder and execute `npm install`, which will download all the necessary packages (if this doesn't work, you'll have to manually install packages that can't import when you render a certain page) `npm start`. This will open a page on http://localhost:3000/. 

If its active, changes to the code will be made automatically in the frontend and backend (i dont think u need to reload usually, but u may sometimes)

## Pushing

Ensure you are pushing from the root directory (the one with backend and frontend), otherwise only a fraction of the app will be pushed

Before you push, you MUST pull the repo from the github to ensure the rest of the codebase is up-to-date so you don't accidentally delete other people's pushes:

`git add *`

`git commit -m "insert a message here"`

`git pull origin main` 

If there is a merge conflict, there will be a notification on the file(s) that have the conflict(s). Open the Merge Editor that they have for you and select the version you wish to keep.

Resolve any conflicts that github tells you there are. If the conflicts involve features other people added, please notify the discord and @everyone.

@everyone when you finally push so we know.

