const fs = require('fs');
const uuid = require('uuid');
const _ = require('lodash');

class Schema {
  /**
   * @private
   * @type {Record<string, any>}
   */
  schema;

  /**
   * Set the schema
   * @param {Record<string, any>} schema - The schema
   * @returns {void} - Sets the schema
   */
  constructor(schema) {
    this.schema = schema;
  }

  /**
   * Validates the schema
   * @param {Schema} data - The data
   * @returns {boolean} true or false
   */
  validate(data) {
    for (const key in this.schema) {
      const field = this.schema[key];
      const value = data[key];

      if (field.required && (value === undefined || value === null)) {
        console.error(`Validation error: ${key} is required.`);
        return false;
      }

      if (field.type && typeof value !== field.type) {
        console.error(
          `Validation error: ${key} must be of type ${field.type}.`
        );
        return false;
      }
    }

    return true;
  }
}

class JSONDatabase {
  dbName;
  /**
   * @type {Schema}
   */
  schema;
  constructor(options) {
    this.dbName = options.dbName;
    this.schema = options.schema;
  }

  /**
   * Generates an Id
   * @returns {string}
   * @private
   */
  generateRandomId() {
    const randomId = `${uuid.v4().substring(0, 4)}${_.random(1000, 9999)}-${uuid
      .v4()
      .substring(0, 4)}-${_.chain(this.dbName).camelCase().value()}`;
    return randomId;
  }

  set(data) {
    if (this.schema.validate(data)) {
      const existingData = this.getDataFromFile();

      const existingEntryIndex = existingData.findIndex(
        (entry) => entry.name === data.name
      );

      if (existingEntryIndex !== -1) {
        existingData[existingEntryIndex].id =
          data.id || this.generateRandomId();
      } else {
        data.id = data.id || this.generateRandomId();
        existingData.push(data);
      }

      this.writeDataToFile(existingData);
    }
  }

  get(query) {
    const data = this.getDataFromFile();

    if (typeof query === 'object') {
      const { id, field } = query;

      if (id) {
        const result = data.find((entry) => entry.id === id);
        return result ? (field ? result[field] : result) : undefined;
      } else if (field) {
        return data.map((entry) => ({ id: entry.id, [field]: entry[field] }));
      }
    }

    return undefined;
  }

  delete(query) {
    const data = this.getDataFromFile();
    if (typeof query === 'object') {
      const { id } = query;
      if (id) {
        const newData = data.filter((entry) => entry.id !== id);
        this.writeDataToFile(newData);
      }
    }
  }

  has(query) {
    const data = this.getDataFromFile();
    if (typeof query === 'object') {
      const { id } = query;
      if (id) {
        return data.some((entry) => entry.id === id);
      }
    }
    return false;
  }

  getDataFromFile() {
    try {
      const rawData = fs.readFileSync(`${this.dbName}.json`, {
        encoding: 'utf-8',
      });
      return JSON.parse(rawData);
    } catch (error) {
      return [];
    }
  }

  writeDataToFile(data) {
    fs.writeFileSync(`${this.dbName}.json`, JSON.stringify(data, null, 2));
  }
}

module.exports = { Schema, JSONDatabase };
