# Workflows

We are using multiple workflows to run this project. A workflow is a `.yml` file with code / a configuration that will be ran when a commit has happened to a specific branch, or other configurable moments

## Deploy

Our `deploy.yml` is the script that hosts our backend on a vps. I personally use [contabo](https://contabo.com/en/), but I am sure you can use any other VPS that has [docker](https://www.docker.com/) support.

If you are going to fork this repo, or if you are me from the future, you'll have to configure a few things to make this work. 

### VPS Configuration

To make this work on your vps, you’ll be setting up your VPS so that:
1. It can accept SSH connections from GitHub Actions.
2. It has Docker and Docker Compose installed.
3. It contains a directory where your app (and its .env and docker-compose.yml) will live.
4. Your GitHub workflow can SSH into the VPS, pull the latest image, and run it.

---

#### 1. **Connect to your VPS**

On your local machine, open a terminal and connect via SSH:

```bash
ssh root@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with your actual VPS IP.

---

#### 2. **Create a non-root deploy user**

It’s better to not deploy as `root`. Create a dedicated user:

```bash
adduser deploy
```

Then give it permission to run Docker commands:

```bash
usermod -aG docker deploy
```

---

#### 3. **Install Docker and Docker Compose**

If you’re using Ubuntu (which most VPSes do):

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```

Add Docker’s GPG key and repository:

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Install Docker and Compose plugin:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Verify Docker works:

```bash
docker --version
docker compose version
```

---

#### 4. **Create the deployment directory**

Connect to your vps as `deploy` (or the user you added).

```bash
ssh deploy@YOUR_SERVER_IP
```

And then run:

```bash
sudo mkdir -p /home/deploy/YOUR_REPO_NAME
sudo chown -R deploy:deploy /home/deploy/YOUR_REPO_NAME
```

Replace `YOUR_REPO_NAME` with your actual repository name (it’ll be the same one GitHub Actions uses in the workflow). So for my repo it will be `Avans-2.1-LU1-POC-backend`

---

#### 5. **Copy your `.env` and `docker-compose.yml`**

If you do not have an `.env` setup yet, run the [setup script](./setup.md). 

From your local machine, copy those two files to the VPS:

```bash
scp .env docker-compose.yml deploy@YOUR_SERVER_IP:/home/deploy/YOUR_REPO_NAME/
```

If your SSH key is not yet configured for the `deploy` user, you can temporarily use `root`:

```bash
scp .env docker-compose.yml root@YOUR_SERVER_IP:/home/deploy/YOUR_REPO_NAME/
```

Then fix the permissions (if you used `root`):

```bash
sudo chown deploy:deploy /home/deploy/YOUR_REPO_NAME/.env /home/deploy/YOUR_REPO_NAME/docker-compose.yml
```

---

#### 6. **Set up SSH key authentication for GitHub Actions**

The GitHub Actions workflow uses this block:

```yaml
with:
  host: ${{ secrets.SERVER_HOST }}
  username: ${{ secrets.SERVER_USER }}
  key: ${{ secrets.SSH_PRIVATE_KEY }}
  port: ${{ secrets.SERVER_SSH_PORT }}
```

This means you need to **add a public key to your VPS** and store the **private key** as a GitHub secret.

On your local machine, generate a new SSH key (if you don’t already have one for CI/CD):

```bash
ssh-keygen -t ed25519 -C "github-actions"
```

Then copy the public key to your VPS (for the `deploy` user):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@YOUR_SERVER_IP
```

Now, make sure to keep the contents of the **private key** (`~/.ssh/id_ed25519`) near, because you will need that soon in the [user secrets](#github-user-secrets) step.

---

With this workflow, GitHub Actions will:

1. Build and push your image to Docker Hub.
2. SSH into your VPS.
3. Pull the latest image.
4. Restart your containers via `docker compose up -d --remove-orphans`.
5. Print the container status.

The only thing left to do is the user secrets.


### Github User Secrets

This workflow uses [user secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets) to get access to specific things, like the vps. User secrets make it so that you don't have to put your raw credentials like passwords etc inside a commit, because that would be unsafe. I will list below which secrets you will have to set, but if you don't know how to set them, read our [article](./user_secrets.md) about that first.

