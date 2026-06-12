DAST automation artifacts.

Place a real `input.json` in this folder with the shape:

{
  "baseUrl": "http://localhost:5000",
  "roles": {
    "anonymous": "",
    "user": "<user-token-or-x-user-id>",
    "admin": "<admin-token-or-x-user-id>"
  }
}

Requirements: `curl`, `jq`, and `bash` to run the provided scripts.

Run `./run_all.sh` to execute discovery and tests. If running on Windows, use WSL or Git Bash.
