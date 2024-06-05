# Fortify Wallet

A web-based custodial Hierarchical Deterministic wallet for Bitcoin built specifically for organizational use case.

# Contents

1. [Features](#features)
2. [How to Get Started](#how-to-get-started)

## Features

1. Role Based Access Control (RBAC)
2. 2-Factor Authentication
3. Hierarchical Control Over Departments and Members
4. Multisignature Transactions and Addresses
5. Offline Transaction Signing (Utilizing PSBTs)

## How to Get Started

## Prerequisites

1. [Git](https://www.git-scm.com/downloads)
2. [Node.js v20.10.0 or above](https://nodejs.org/en/download/package-manager)
3. [XAMPP](https://www.apachefriends.org/index.html)

## Get Started

To start using the application there are several components to setup. First, install all dependencies for both the frontend and backend of the application. You can achieve this by running the following commands on your terminal:

```bash
cd fortify-wallet
```

Then, install all dependencies of the NextJs application:

```bash
npm install
```

Consequently, you should also install the dependencies for the backend server by running the following command:

```bash
cd server
```

Then, install all dependencies of the Node and Express server:

```bash
npm install
```

**Note:**
to enable self-signed certificates for HTTPS (you can see this in the cert folder in the server), you would need to set the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable to `0`. This method is an insecure and cheap way of overlapping the self-signed certificate issue, thus to bolster better security it is recommended to obtain a valid SSL certificate from a trusted certificate authority (CA) and configure it properly in your server.

### MySQL Database

The database used for the application is MySQL. Thus, a new database needs to be created with the name 'fortify_wallet' (this is the default name, you can change it in .env.example).

### Token Secrets

In the authentication process of the application, the access and refresh tokens require a secret to be generated and securely stored. This secret should be a long, randomly generated string of characters. Thus, it is recommended to set your own secret by changing it in the environment variables. The secret should be kept confidential and unique.

### AWS KMS Key

In the application, AWS KMS is used to encrypt the keys for secure storage. Thus, there are several things needed to enable this, which are KMS key ID, AWS Access Key, and AWS Secret Access Key. The KMS Key ID can be retrieved by first creating a symmetric key in the AWS Key Management Service (KMS) console. Once the key is created, you can obtain its ID from the console.

To configure the AWS Access Key and AWS Secret Access Key, you need to have an AWS account. If you don't have one, you can sign up for free on the AWS website. Once you have an account, you can generate an access key and secret access key in the AWS Identity and Access Management (IAM) console. These credentials will be used to authenticate your application with AWS KMS.

For more detailed instructions on how to configure AWS KMS, you can refer to the AWS documentation on [Using AWS Key Management Service (KMS) in your application](https://docs.aws.amazon.com/kms/latest/developerguide/services.html).

### Blockcypher Token

To broadcast transactions and retrieve information regarding specific addresses/wallets, this application utilizes Blockcypher. Thus, a blockcypher token is needed to enable such operations. This token can be retrieved by creating an account on Blockcypher.

### Starting the Application

After setting up everything, which includes running and setting up the database, setting up the token secrets, AWS Keys, and Blockcypher tokens, you can start running the application by simply running the following command for both the frontend NextJs application and Node/Express backend server:

```bash
npm run dev
```
