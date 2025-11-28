#!/usr/bin/env python3
"""
push_to_hf.py

Small helper to create a Hugging Face Hub repo (if required) and push a project folder
to the Hub using huggingface_hub (no CLI required in PATH).

Usage (PowerShell / bash):
  # set HUGGINGFACE_HUB_TOKEN as env var (recommended)
  $Env:HUGGINGFACE_HUB_TOKEN = 'hf_xxx'
  python push_to_hf.py --repo-name my-hf-repo --path . --repo-type model

Or supply token interactively if env var is not set.

It will:
 - create the remote repo under your user (or org) if it's not present
 - initialize git in the target folder, add files, commit and push

Requires: huggingface_hub and git installed
pip install huggingface_hub
"""

import argparse
import getpass
import os
import sys
from huggingface_hub import HfApi, Repository


def get_token():
    # look for common env vars used by HF
    for name in ("HUGGINGFACE_HUB_TOKEN", "HF_TOKEN", "HUGGINGFACE_TOKEN"):
        v = os.environ.get(name)
        if v:
            return v
    # fallback to interactive input
    try:
        token = getpass.getpass("Hugging Face token (input hidden): ")
    except Exception:
        token = input("Hugging Face token: ")
    return token.strip()


def main(argv):
    parser = argparse.ArgumentParser(description="Push a folder to the Hugging Face Hub (automated)")
    parser.add_argument("--repo-name", required=True, help="Repo name on the Hub (e.g. my-repo)")
    parser.add_argument("--path", default=".", help="Local folder to push (default: current folder)")
    parser.add_argument("--repo-type", default="model", choices=("model", "dataset", "space"), help="repo type")
    parser.add_argument("--private", action="store_true", help="Create private repo")
    parser.add_argument("--commit-message", default="Initial push from push_to_hf.py", help="Commit message")
    parser.add_argument("--allow-existing", action="store_true", help="Do not fail if remote exists")

    args = parser.parse_args(argv)
    local_path = os.path.abspath(args.path)

    if not os.path.isdir(local_path):
        print(f"ERROR: path does not exist or is not a directory: {local_path}")
        sys.exit(1)

    token = get_token()
    if not token:
        print("ERROR: no token provided. Create a token at https://huggingface.co/settings/tokens and set HUGGINGFACE_HUB_TOKEN env var.")
        sys.exit(1)

    api = HfApi()

    # whoami -> get username/org
    whoami = api.whoami(token=token)
    username = whoami.get("name") or whoami.get("user", {}).get("username")
    if not username:
        print("Couldn't determine username from token — check token scope/validity.")
        sys.exit(1)

    repo_id = f"{username}/{args.repo_name}"
    print(f"Working with repo: {repo_id} (type={args.repo_type}, private={args.private})")

    try:
        api.create_repo(repo_id=repo_id, token=token, repo_type=args.repo_type, private=args.private, exist_ok=args.allow_existing)
    except Exception as e:
        # many reasons (already exists, permission, rate limit...) — continue if allow_existing
        if args.allow_existing:
            print(f"Warning: create_repo failed but continuing because --allow-existing: {e}")
        else:
            print(f"Failed to create repo: {e}")
            sys.exit(1)

    # Repository will initialize / reuse a .git in local_path and push the contents to the remote
    print("Preparing to push files — this uses the git binary. Ensure 'git' is installed and on PATH.")
    repo = Repository(local_dir=local_path, clone_from=repo_id, use_auth_token=token)

    # Push everything under the directory (Repository.push_to_hub will add untracked files etc)
    print(f"Pushing {local_path} -> {repo_id}")
    try:
        repo.push_to_hub(commit_message=args.commit_message)
    except Exception as e:
        print(f"Push failed: {e}")
        sys.exit(1)

    print("Push completed — visit https://huggingface.co/" + repo_id)


if __name__ == "__main__":
    main(sys.argv[1:])
