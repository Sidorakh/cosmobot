# cosmobot
For the Friendly Cosmic Station Discord Server / Friendly Cosmonaut

Includes a web UI as well accessible [here](https://cosmobot.redshirt.dev)

To run locally, you will need Node.JS v8 at least and must run `npm i` once withn the directory to downlaod the dependencies. 

Use `npm start` or `node server` to start the bot. Make sure to copy `config-template` to `config.json`, and add your own bot token!


| Command | Usage | Description |
| --- | --- | --- |
| `say` | `!say` | Repeats a user-given string |
| `yt` | `!yt <search term>` | Searches youtube for a video |
| `role` | `!role [role]` | If a role is specified, toggles the given role, otherwise, lists all available roles |
| `help` | `!help [command]` | Sends a list of commands annd some absic help for each, or sends detailed help for a single command if one is specified |
