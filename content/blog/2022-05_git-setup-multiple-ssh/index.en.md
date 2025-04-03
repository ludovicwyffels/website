---
title: "How to set up multiple SSH keys for multiple accounts"
authors:
  - ludovicwyffels
date: 2022-05-14T15:03:35+02:00
summary: "I have personal and work accounts on [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/).
How could I set all of this to work properly through SSH keys so that my system relies on the correct SSH key based on the identity it needs to use"
draft: false
tags:
  - "git"
  - "security"
  - "ssh"
categories: ["git"]
# series: ["Secure git"]

---

I have personal and work accounts on [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) and [Bitbucket](https://bitbucket.org/).
How could I set all of this to work properly through SSH keys so that my system relies on the correct SSH key based on the identity it needs to use.

For this particular post, we're going to connect a personal and business identity for each account.
But you can add as many as you like 😉

## 🔑 Key generation.

We're going to create default identities.

We can use the same SSH key for this or use a specific key per account.
- Same key: `id_rsa`
- Account specific key: `id_rsa_github`; `id_rsa_bitbucket`; `id_rsa_gitlab`

Let's use the "account specific key" method. It will then be clearer for everyone to understand the concept.
Also, we need the email address you use for these accounts.
But feel free to do whatever you like.😉 

### 👨‍💻 🗝️ Generation of personal keys

#### ✍️ Required information

Let's summarize what we need in a table.

Account | SSH key name | E-mail
--- | --- | ---
Github | `id_rsa_github` | name.github@gmail.com
Gitlab | `id_rsa_gitlab` | name.gitlab@gmail.com
Bitbucket | `id_rsa_bitbucket` | name.bitbucket@gmail.com

#### 🛠️ SSH key creation

Let's run these commands to create SSH keys.
```bash
ssh-keygen -f "~/.ssh/id_rsa_github" -t rsa -b 4096 -C "name.github@gmail.com"
ssh-keygen -f "~/.ssh/id_rsa_gitlab" -t rsa -b 4096 -C "name.gitlab@gmail.com"
ssh-keygen -f "~/.ssh/id_rsa_bitbucket" -t rsa -b 4096 -C "name.bitbucket@gmail.com"
```

Now we have 3 keys for our personal use.

### 🏢 🔑 Organization key generation

#### ✍️ Required information

Let's summarize what we need in a table.

Account | SSH key name | E-mail
--- | --- | ---
Organization Github | `id_rsa_github_companyName` | name.github@company.com
Organization Gitlab | `id_rsa_gitlab_companyName` | name.gitlab@company.com
Organization Bitbucket | `id_rsa_bitbucket_companyName` | name.bitbucket@company.com

#### 🛠️ Creating SSH keys

Let's run these commands to create SSH keys.
```bash
ssh-keygen -f "~/.ssh/id_rsa_github_companyName" -t rsa -b 4096 -C "name.github@company.com"
ssh-keygen -f "~/.ssh/id_rsa_gitlab_companyName" -t rsa -b 4096 -C "name.gitlab@company.com"
ssh-keygen -f "~/.ssh/id_rsa_bitbucket_companyName" -t rsa -b 4096 -C "name.bitbucket@company.com"
```

Now we have 3 keys for our business use.

## 📦 Add SSH keys to the SSH agent

We now have 6 SSH keys. Let's add them to the SSH agent.

```bash
# Add personal keys
ssh-add ~/.ssh/id_rsa_github
ssh-add ~/.ssh/id_rsa_gitlab
ssh-add ~/.ssh/id_rsa_bitbucket

# Add organization keys
ssh-add ~/.ssh/id_rsa_github_companyName
ssh-add ~/.ssh/id_rsa_gitlab_companyName
ssh-add ~/.ssh/id_rsa_bitbucket_companyName
```

So we have in the SSH agent the 3 keys for our personal use and the 3 keys for the professional use.

Now it is mandatory to set up the configuration in order to define which key should be used according to the context.

## 📝 Configuration

Open the file `~/.ssh/config` or create it if it doesn't exist yet.

```bash
vim ~/.ssh/config
```

Nous allons définir quelques règles basées sur les hôtes.

```txt
Host github.com
  HostName github.com
  IdentityFile ~/.ssh/id_rsa_github

Host gitlab.com
  HostName gitlab.com
  IdentityFile ~/.ssh/id_rsa_gitlab

Host bitbucket.org
  HostName bitbucket.org
  IdentityFile ~/.ssh/id_rsa_bitbucket


Host organisation.github.com
  HostName github.com
  IdentityFile ~/.ssh/id_rsa_github_companyName

Host organisation.gitlab.com
  HostName gitlab.com
  IdentityFile ~/.ssh/id_rsa_gitlab_companyName

Host organisation.bitbucket.org
  HostName bitbucket.org
  IdentityFile ~/.ssh/id_rsa_bitbucket_companyName
```

Save and close the file.

## 💭 Add the keys to your repository accounts

Everything is set up correctly locally. Now you need to add the **public SSH keys** to the services you are using.

```bash
# macOS
tr -d '\n' < ~/.ssh/id_rsa.pub | pbcopy

# Linux (requires the xclip package)
xclip -sel clip < ~/.ssh/id_rsa.pub

# Git Bash on Windows
cat ~/.ssh/id_rsa.pub | clip
```

Let's log into your accounts and go to the settings to add our SSH keys.

Follow the documentation of your service to know how to add the keys.

- Github: [documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- Gitlab: [documentation](https://docs.gitlab.com/ee/user/ssh.html)
- Bitbucket: [documentation](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

## 👨‍👦 Cloning repositories

Now that we have our setup for all our environments, we can clone repositories from Github, Gitlab or Bitbucket with the appropriate identity.

### 👨‍💻 Personal repositories

So we can clone projects using a command that you must have used many times.

```bash
git clone git@bitbucket.org:yourPersonalAccount/pet-project.git
```

With this command, git uses the "default" SSH key. This is the one that has been set for the host "Host github.com" in the file `~/.ssh/config`.

You can then pull or push on the repository with this identity.

### 🏢 Organization repositories

For your organization's projects, simply clone the project replacing `bitbucket.org` with `organization.bitbucket.org` (as defined in the `~/.ssh/config` file).

```bash
git clone git@companyname.bitbucket.org:companyName/company-project.git
```

So the right identity will be used.
You can then pullor push as many times as you want with your organization's identity.

I hope this helps.