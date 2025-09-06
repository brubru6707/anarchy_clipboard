import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';
const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68b7065000206766162b');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage, ID, Query, Permission, Role };
