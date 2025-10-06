# Workflows

We are using multiple workflows to run this project. A workflow is a `.yml` file with code / a configuration that will be ran when a commit has happened to a specific branch, or other configurable moments

## Deploy

Our `deploy.yml` is the script that hosts our backend on a vps. I personally use [contabo](https://contabo.com/en/), but I am sure you can use any other VPS that has [docker](https://www.docker.com/) support.

If you are going to fork this repo, or if you are me from the future, you'll have to configure a few things to make this work. 

### VPS Configuration

To make this work on your vps, you should do the following things.

### Github User Secrets

This workflow uses [user secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) to get access to specific things, like the vps. User secrets make it so that you don't have to put your raw credentials like passwords etc inside a commit, because that would be unsafe. I will list below which secrets you will have to set, but if you don't know how to set them, read our [article](./user_secrets.md) about that first.

