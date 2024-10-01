import { MongoClient, ObjectId } from 'mongodb';
import sha1 from 'sha1';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

/**
 * This is a MongoDB Client Class
 */
class DBClient {
  constructor() {
    this.client = new MongoClient(
      `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
    );
    this.isConnected = false;
    this.db = null;
    this.client.connect((err) => {
      if (!err) {
        this.isConnected = true;
        this.db = this.client.db(DB_DATABASE);
      }
    });
  }

  /**
   * This checks if the mongoDb client is alive.
   *
   * @return {boolean} The connection status of the mongoDb.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * This asynchronously counts the num of documents in the "users" collection.
   *
   * @return {Promise<number>} The num of documents in the "users" collection.
   */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
   * This calculates the number of files in the 'files' collection in the database.
   *
   * @return {Promise<number>} Returns a Promise that resolves to the number of files in the 'files' collection.
   */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  /**
   * This returns the 'files' collection from the database.
   *
   * @return {Collection} The 'files' collection.
   */
  filesCollection() {
    return this.db.collection('files');
  }

  /**
   * This finds a user by their email in the "users" collection.
   *
   * @param {string} email - The email of the user to find.
   * @return {Promise} A Promise that resolves with the user object, or null if not found
   */
  findUserByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  /**
   * This finds a user by their ID in the database.
   *
   * @param {string} userId - ID of the user to find.
   * @return {Promise<object>} A promise that resolves to the user object if found, or null if not found.
   */
  findUserById(userId) {
    return this.db.collection('users').findOne({ _id: ObjectId(userId) });
  }

  /**
   * This adds a new user to the database with the email and password given.
   *
   * @param {string} email - Email of the user to add.
   * @param {string} password - Password of the user to add.
   * @return {Object} User object that was added to the database, with the password and _id fields removed.
   */
  async addUser(email, password) {
    const hashedPassword = sha1(password);
    const result = await this.db.collection('users').insertOne(
      {
        email,
        password: hashedPassword,
      },
    );
    return {
      email: result.ops[0].email,
      id: result.ops[0]._id,
    };
  }
}

const dBClient = new DBClient();
export default dBClient;
