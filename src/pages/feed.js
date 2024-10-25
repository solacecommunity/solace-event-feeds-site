import React, { useEffect, useReducer } from 'react';
import axios from 'axios';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Loading from '../components/loading';
import BrokerConfig from '../components/brokerConfig';
import PublishEvents from '../components/publishEvents';
import Stream from '../components/stream';
import { Container, Row, Col } from 'react-bootstrap';
import { SolaceSession } from '../util/helpers/solaceSession';

const feedMetadata = {
  fakerRules: [],
  feedInfo: [],
  feedRules: [],
  // For AsyncAPI feeds
  analysis: [],
  feedSchemas: [],
  // For REST API feeds
  feedAPI: [],
};

// Testing
const testFeedMetadata = {
  fakerRules: {
    StringRules: {
      description: 'Module to generate string related entries',
      rules: {
        alpha: {
          minLength: 10,
          maxLength: 100,
          casing: 'mixed',
          description:
            'Generating a string consisting of letters in the English alphabet.',
        },
        alphanumeric: {
          minLength: 10,
          maxLength: 100,
          casing: 'mixed',
          description:
            'Generating a string consisting of alpha characters and digits.',
        },
        enum: {
          enum: '',
          description: 'Returns a random value from an Enum object',
        },
        words: {
          count: 5,
          description:
            'Returns a string containing a number of space separated random words.',
        },
        nanoid: {
          minLength: 5,
          maxLength: 5,
          description: 'Generates a Nano ID.',
        },
        numeric: {
          minLength: 5,
          maxLength: 5,
          leadingZeros: false,
          description: 'Generates a given length string of digits.',
        },
        symbol: {
          minLength: 5,
          maxLength: 5,
          description: 'Returns a string containing only special characters',
        },
        uuid: {
          description: 'Returns a UUID v4 (Universally Unique Identifier).',
        },
        fromRegExp: {
          pattern: '^[A-Za-z]$',
          description:
            'Generates a string matching the given regex like expressions',
        },
        phoneNumber: {
          description: 'Returns a random phone number',
        },
        json: {
          description:
            'Returns a string representing JSON object with 7 pre-defined properties.',
        },
      },
    },
    NullRules: {
      description: 'Module to generate null or empty values.',
      rules: {
        null: {
          description: 'Returns null value',
        },
        empty: {
          description: 'Returns an empty string',
        },
      },
    },
    NumberRules: {
      description: 'Module to generate numbers of any kind.',
      rules: {
        float: {
          minimum: 0,
          maximum: 1000,
          fractionDigits: 2,
          description: 'Returns a single random floating-point number',
        },
        int: {
          minimum: 0,
          maximum: 1000,
          description: 'Returns a single random integer.',
        },
      },
    },
    BooleanRules: {
      description: 'Module to generate boolean values.',
      rules: {
        boolean: {
          description: 'Returns the boolean value true or false',
        },
      },
    },
    DateRules: {
      description: 'Module to generate dates',
      rules: {
        anytime: {
          description:
            'Generates a random date that can be either in the past or in the future.',
        },
        future: {
          years: 10,
          description: 'Generates a random date in the future.',
        },
        past: {
          years: 10,
          description: 'Generates a random date in the past.',
        },
        recent: {
          days: 10,
          description: 'Generates a random date in the recent past.',
        },
        soon: {
          days: 10,
          description: 'Generates a random date in the near future.',
        },
        month: {
          abbreviated: false,
          description: 'Returns a random name of a month.',
        },
        weekday: {
          abbreviated: false,
          description: 'Returns a random day of the week.',
        },
      },
    },
    LoremRules: {
      description: 'Module to generate random texts and words',
      rules: {
        lines: {
          minimum: 2,
          maximum: 5,
          description:
            "Generates the given number lines of lorem separated by '\n'.",
        },
        paragraph: {
          minimum: 2,
          maximum: 5,
          description:
            'Generates a paragraph with the given number of sentences.',
        },
        sentence: {
          minimum: 5,
          maximum: 10,
          description: 'Generates a space separated list of words.',
        },
        text: {
          description:
            'Generates a random text based on a random lorem method.',
        },
        word: {
          minimum: 5,
          maximum: 10,
          description: 'Generates a word of a specified length.',
        },
      },
    },
    PersonRules: {
      description:
        "Module to generate people's personal information such as names and job titles.",
      rules: {
        prefix: {
          description: 'Returns a random person prefix.',
        },
        firstName: {
          description: 'Returns a random first name.',
        },
        lastName: {
          description: 'Returns a random last name.',
        },
        middleName: {
          description: 'Returns a random middle name.',
        },
        fullName: {
          description: 'Generates a random full name.',
        },
        suffix: {
          description: 'Returns a random person suffix.',
        },
        sex: {
          description: 'Returns a random sex.',
        },
        jobTitle: {
          description: 'Generates a random job title.',
        },
        jobDescriptor: {
          description: 'Generates a random job descriptor.',
        },
        jobType: {
          description: 'Generates a random job type.',
        },
      },
    },
    LocationRules: {
      description: 'Module to generate addresses and locations',
      rules: {
        buildingNumber: {
          description: 'Generates a random building number.',
        },
        street: {
          description: 'Generates a random localized street name.',
        },
        streetAddress: {
          description: 'Generates a random localized street address.',
        },
        city: {
          description: 'Generates a random localized city name.',
        },
        state: {
          description: 'Returns a random localized state.',
        },
        zipCode: {
          description: 'Generates random zip code from specified format.',
        },
        country: {
          description: 'Returns a random country name.',
        },
        countryCode: {
          description: 'Returns a random ISO_3166-1 country code.',
        },
        latitude: {
          minimum: 90,
          maximum: 90,
          precision: 4,
          description: 'Generates a random latitude.',
        },
        longitude: {
          minimum: 90,
          maximum: 90,
          precision: 4,
          description: 'Generates a random longitude.',
        },
        timeZone: {
          description: 'Returns a random time zone.',
        },
      },
    },
    FinanceRules: {
      description: 'Module to generate finance and money related entries',
      rules: {
        accountNumber: {
          description: 'Generates a random account number.',
        },
        amount: {
          minimum: 0,
          maximum: 1000,
          description: 'Generates a random amount between the given bounds.',
        },
        swiftOrBic: {
          description:
            'Generates a random SWIFT/BIC code based on the ISO-9362 format.',
        },
        creditCardIssuer: {
          description: 'Returns a random credit card issuer.',
        },
        creditCardNumber: {
          description: 'Generates a random credit card number.',
        },
        currencyCode: {
          description: 'Returns a random currency code.',
        },
        currencyName: {
          description: 'Returns a random currency name.',
        },
        currencySymbol: {
          description: 'Returns a random currency symbol.',
        },
        bitcoinAddress: {
          description: 'Generates a random Bitcoin address.',
        },
        ethereumAddress: {
          description: 'Creates a random, non-checksum Ethereum address.',
        },
        transactionDescription: {
          description: 'Generates a random transaction description.',
        },
        transactionType: {
          description: 'Returns a random transaction type.',
        },
      },
    },
    AirlineRules: {
      description: 'Module to generate airline and airport related data.',
      rules: {
        airline: {
          description: 'Generates a random airline.',
        },
        airplane: {
          description: 'Generates a random airplane.',
        },
        airport: {
          description: 'Generates a random airport name with code.',
        },
        airportName: {
          description: 'Generates a random airport name.',
        },
        airportCode: {
          description: 'Generates a random airport code.',
        },
        flightNumber: {
          minimum: 1,
          maximum: 3,
          leadingZeros: false,
          description: 'Returns a random flight number.',
        },
      },
    },
    CommerceRules: {
      description: 'Module to generate commerce and product related entries.',
      rules: {
        companyName: {
          description: 'Generates a random company name.',
        },
        department: {
          description: 'Returns a random department inside a shop.',
        },
        isbn: {
          description: 'Returns a random ISBN identifier.',
        },
        price: {
          minimum: 1,
          maximum: 999,
          description: 'Generates a random price between min and max.',
        },
        product: {
          description: 'Returns a random short product name.',
        },
        productDescription: {
          description: 'Returns a random product description.',
        },
        productName: {
          description: 'Generates a random descriptive product name.',
        },
      },
    },
  },
  feedInfo: {
    name: 'Mining - HR Service',
    img: '',
    title: 'HR Service',
    description:
      'HR services in mining are crucial for managing the distinct challenges posed by the industry, which operates in often remote and hazardous environments. These services ensure the effective recruitment, retention, and development of a skilled workforce equipped to meet operational demands. Key functions include conducting robust safety and skills training, overseeing compliance with labor laws and safety regulations, and implementing programs that promote employee well-being and job satisfaction.',
    github: 'Mining---HR-Service',
    contributor: 'SolaceLabs',
    domain: 'Mining',
    tags: 'HR Service, Shift Management, Break Management',
    type: 'asyncapi_feed',
    lastUpdated: '2024-06-09T16:31:36.870Z',
  },
  feedRules: [
    {
      topic:
        'acmeResources/ops/employee/breakStarted/v1/{region}/{mine}/{employeeId}',
      eventName: 'Break Started',
      eventVersion: '0.1.2',
      messageName: 'Break_Started',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
          rule: {
            name: 'mine',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
          rule: {
            name: 'employeeId',
            type: 'string',
            group: 'StringRules',
            rule: 'alpha',
            casing: 'mixed',
            minLength: 10,
            maxLength: 10,
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
          rule: {
            name: 'region',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['americas', 'apac', 'emea'],
          },
        },
      },
      payload: {
        break: {
          maximum: 90,
          type: 'number',
          minimum: 0,
          rule: {
            name: 'break',
            type: 'number',
            group: 'StringRules',
            rule: 'enum',
            enum: ['15', '30', '45', '60'],
          },
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
          rule: {
            name: 'employee',
            type: 'number',
            group: 'StringRules',
            rule: 'numeric',
            minLength: 5,
            maxLength: 5,
            leadingZeros: false,
          },
        },
      },
      publishSettings: {
        count: 20,
        interval: '1',
        delay: 0,
      },
      mappings: [
        {
          type: 'Topic Parameter',
          source: {
            type: 'Payload Parameter',
            name: 'employee',
            fieldName: 'employee',
            fieldType: 'number',
          },
          target: {
            type: 'Topic Parameter',
            name: 'employeeId',
            fieldName: 'employeeId',
            fieldType: 'string',
          },
        },
      ],
    },
    {
      topic:
        'acmeResources/ops/employee/shiftEnded/v1/{region}/{mine}/{employeeId}',
      eventName: 'Shift Ended',
      eventVersion: '0.1.2',
      messageName: 'Shift_Ended',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
          rule: {
            name: 'mine',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
          rule: {
            name: 'employeeId',
            type: 'string',
            group: 'StringRules',
            rule: 'alpha',
            casing: 'mixed',
            minLength: 10,
            maxLength: 10,
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
          rule: {
            name: 'region',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['americas', 'apac', 'emea'],
          },
        },
      },
      payload: {
        shift: {
          maximum: 90,
          type: 'number',
          minimum: 0,
          rule: {
            name: 'shift',
            type: 'number',
            group: 'NumberRules',
            rule: 'int',
            minimum: 1,
            maximum: 5,
          },
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
          rule: {
            name: 'employee',
            type: 'number',
            group: 'StringRules',
            rule: 'numeric',
            minLength: 5,
            maxLength: 5,
            leadingZeros: false,
          },
        },
      },
      publishSettings: {
        count: 20,
        interval: '1',
        delay: '3',
      },
      mappings: [
        {
          type: 'Topic Parameter',
          source: {
            type: 'Payload Parameter',
            name: 'employee',
            fieldName: 'employee',
            fieldType: 'number',
          },
          target: {
            type: 'Topic Parameter',
            name: 'employeeId',
            fieldName: 'employeeId',
            fieldType: 'string',
          },
        },
      ],
    },
    {
      topic:
        'acmeResources/ops/employee/breakEnded/v1/{region}/{mine}/{employeeId}',
      eventName: 'Break Ended',
      eventVersion: '0.1.2',
      messageName: 'Break_Ended',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
          rule: {
            name: 'mine',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
          rule: {
            name: 'employeeId',
            type: 'string',
            group: 'StringRules',
            rule: 'alpha',
            casing: 'mixed',
            minLength: 10,
            maxLength: 10,
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
          rule: {
            name: 'region',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['americas', 'apac', 'emea'],
          },
        },
      },
      payload: {
        break: {
          maximum: 90,
          type: 'number',
          minimum: 0,
          rule: {
            name: 'break',
            type: 'number',
            group: 'StringRules',
            rule: 'enum',
            enum: ['15', '30', '45', '60'],
          },
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
          rule: {
            name: 'employee',
            type: 'number',
            group: 'StringRules',
            rule: 'numeric',
            minLength: 5,
            maxLength: 5,
            leadingZeros: false,
          },
        },
      },
      publishSettings: {
        count: 20,
        interval: '1',
        delay: '0',
      },
      mappings: [
        {
          type: 'Topic Parameter',
          source: {
            type: 'Payload Parameter',
            name: 'employee',
            fieldName: 'employee',
            fieldType: 'number',
          },
          target: {
            type: 'Topic Parameter',
            name: 'employeeId',
            fieldName: 'employeeId',
            fieldType: 'string',
          },
        },
      ],
    },
    {
      topic:
        'acmeResources/ops/employee/shiftStarted/v1/{region}/{mine}/{employeeId}',
      eventName: 'Shift Started',
      eventVersion: '0.1.2',
      messageName: 'Shift_Started',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
          rule: {
            name: 'mine',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
          rule: {
            name: 'employeeId',
            type: 'string',
            group: 'StringRules',
            rule: 'alpha',
            casing: 'mixed',
            minLength: 10,
            maxLength: 10,
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
          rule: {
            name: 'region',
            type: 'string',
            group: 'StringRules',
            rule: 'enum',
            enum: ['americas', 'apac', 'emea'],
          },
        },
      },
      payload: {
        shift: {
          maximum: 90,
          type: 'number',
          minimum: 0,
          rule: {
            name: 'shift',
            type: 'number',
            group: 'NumberRules',
            rule: 'int',
            minimum: 1,
            maximum: 5,
          },
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
          rule: {
            name: 'employee',
            type: 'number',
            group: 'StringRules',
            rule: 'numeric',
            minLength: 5,
            maxLength: 5,
            leadingZeros: false,
          },
        },
      },
      publishSettings: {
        count: 20,
        interval: '1',
        delay: 0,
      },
      mappings: [
        {
          type: 'Topic Parameter',
          source: {
            type: 'Payload Parameter',
            name: 'employee',
            fieldName: 'employee',
            fieldType: 'number',
          },
          target: {
            type: 'Topic Parameter',
            name: 'employeeId',
            fieldName: 'employeeId',
            fieldType: 'string',
          },
        },
      ],
    },
  ],
  // For AsyncAPI feeds
  analysis: {
    messages: {
      Break_Started: {
        send: [
          {
            topicName:
              'acmeResources/ops/employee/breakStarted/v1/{region}/{mine}/{employeeId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
            },
            message: {
              'x-ep-event-id': '46qworz8ema',
              'x-ep-event-version-displayname': '0.1.0',
              description: '',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': '4r6l17e8heg',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': 'ztpi4zis2nc',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Shift Break Started information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Shift Break Started',
                title: 'Shift Break Started',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': 'l732pj4n6v2',
                properties: {
                  break: {
                    maximum: 90,
                    type: 'number',
                    minimum: 0,
                    'x-parser-schema-id': '<anonymous-schema-1>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-2>',
                  },
                },
                $id: 'https://example.com/shift-break-started.schema.json',
                'x-parser-schema-id':
                  'https://example.com/shift-break-started.schema.json',
              },
              'x-ep-event-version': '0.1.2',
              'x-ep-event-name': 'Break Started',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Break_Started',
            },
            servers: {},
            bindings: {},
          },
        ],
        receive: [],
        hasPayload: true,
        schema: 'Shift Break Started',
      },
      Ticket_Valid: {
        send: [],
        receive: [
          {
            topicName:
              'acmeResources/ops/ticket/ticketValid/v1/{region}/{mine}/{employeeId}/{ticketId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              ticketId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'ticketId',
                },
                'x-ep-parameter-name': 'ticketId',
              },
            },
            message: {
              'x-ep-event-id': 'caitj4rbiii',
              'x-ep-event-version-displayname': '0.1.0',
              description:
                'This event triggers when a valid ticket is presented by an employee',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': 'qeo7n4zhym5',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': 'l04yg9gqv8m',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Ticket Valid information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Ticket Valid',
                title: 'Ticket Valid',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '0.1.0',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': 'g69ixbpup5h',
                properties: {
                  ticket: {
                    maximum: 1000000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-3>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-4>',
                  },
                },
                $id: 'https://example.com/ticket-valid.schema.json',
                'x-parser-schema-id':
                  'https://example.com/ticket-valid.schema.json',
              },
              'x-ep-event-version': '0.1.0',
              'x-ep-event-name': 'Ticket Valid',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Ticket_Valid',
            },
            servers: {},
            bindings: {},
            consumers: {
              TicketValidConsumer: {
                name: 'TicketValidConsumer',
                topicSubscriptions: [
                  'acmeResources/ops/ticket/ticketValid/v1/*/*/*/*',
                ],
              },
            },
          },
        ],
        hasPayload: true,
        schema: 'Ticket Valid',
      },
      Shift_Ended: {
        send: [
          {
            topicName:
              'acmeResources/ops/employee/shiftEnded/v1/{region}/{mine}/{employeeId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
            },
            message: {
              'x-ep-event-id': 'u700ygwowbz',
              'x-ep-event-version-displayname': '0.1.0',
              description: '',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': '46e24jxzcqj',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': 'h4w6tors2e3',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Shift Ended information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Shift Ended',
                title: 'Shift Ended',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': '8kr6o3cmbqc',
                properties: {
                  shift: {
                    maximum: 90,
                    type: 'number',
                    minimum: 0,
                    'x-parser-schema-id': '<anonymous-schema-5>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-6>',
                  },
                },
                $id: 'https://example.com/shift-ended.schema.json',
                'x-parser-schema-id':
                  'https://example.com/shift-ended.schema.json',
              },
              'x-ep-event-version': '0.1.2',
              'x-ep-event-name': 'Shift Ended',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Shift_Ended',
            },
            servers: {},
            bindings: {},
          },
        ],
        receive: [],
        hasPayload: true,
        schema: 'Shift Ended',
      },
      Break_Ended: {
        send: [
          {
            topicName:
              'acmeResources/ops/employee/breakEnded/v1/{region}/{mine}/{employeeId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
            },
            message: {
              'x-ep-event-id': 'v3sb9swg0r6',
              'x-ep-event-version-displayname': '0.1.0',
              description: '',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': '860ss0l3psq',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': 'md1wdhwf8f1',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Shift Break Ended information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Shift Break Ended',
                title: 'Shift Break Ended',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '0.1.0',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': '8d58pijifml',
                properties: {
                  break: {
                    maximum: 90,
                    type: 'number',
                    minimum: 0,
                    'x-parser-schema-id': '<anonymous-schema-7>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-8>',
                  },
                },
                $id: 'https://example.com/shift-break-ended.schema.json',
                'x-parser-schema-id':
                  'https://example.com/shift-break-ended.schema.json',
              },
              'x-ep-event-version': '0.1.2',
              'x-ep-event-name': 'Break Ended',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Break_Ended',
            },
            servers: {},
            bindings: {},
          },
        ],
        receive: [],
        hasPayload: true,
        schema: 'Shift Break Ended',
      },
      Shift_Started: {
        send: [
          {
            topicName:
              'acmeResources/ops/employee/shiftStarted/v1/{region}/{mine}/{employeeId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
            },
            message: {
              'x-ep-event-id': '2gzdj4o1utt',
              'x-ep-event-version-displayname': '0.1.0',
              description: '',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': '4o2sqifa6ov',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': '7jkk7hggr91',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Shift Started information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Shift Started',
                title: 'Shift Started',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': 'v0ftinciv7n',
                properties: {
                  shift: {
                    maximum: 90,
                    type: 'number',
                    minimum: 0,
                    'x-parser-schema-id': '<anonymous-schema-9>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-10>',
                  },
                },
                $id: 'https://example.com/shift-started.schema.json',
                'x-parser-schema-id':
                  'https://example.com/shift-started.schema.json',
              },
              'x-ep-event-version': '0.1.2',
              'x-ep-event-name': 'Shift Started',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Shift_Started',
            },
            servers: {},
            bindings: {},
          },
        ],
        receive: [],
        hasPayload: true,
        schema: 'Shift Started',
      },
      Ticket_Cancelled: {
        send: [],
        receive: [
          {
            topicName:
              'acmeResources/ops/ticket/ticketCancelled/v1/{region}/{mine}/{employeeId}/{ticketId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              ticketId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'ticketId',
                },
                'x-ep-parameter-name': 'ticketId',
              },
            },
            message: {
              'x-ep-event-id': 'iphx7t484i7',
              'x-ep-event-version-displayname': '0.1.0',
              description:
                'This event is triggered when an employee has a ticket cancelled.',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': 'ig5ejbfnpuh',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': '3fa8yvawat0',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Ticket Cancelled information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Ticket Cancelled',
                title: 'Ticket Cancelled',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '0.1.0',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': 'g3hex6lseyr',
                properties: {
                  ticket: {
                    maximum: 1000000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-11>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-12>',
                  },
                },
                $id: 'https://example.com/ticket-cancelled.schema.json',
                'x-parser-schema-id':
                  'https://example.com/ticket-cancelled.schema.json',
              },
              'x-ep-event-version': '0.1.0',
              'x-ep-event-name': 'Ticket Cancelled',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Ticket_Cancelled',
            },
            servers: {},
            bindings: {},
            consumers: {
              TicketCancelledConsumer: {
                name: 'TicketCancelledConsumer',
                topicSubscriptions: [
                  'acmeResources/ops/ticket/ticketCancelled/v1/*/*/*/*',
                ],
              },
            },
          },
        ],
        hasPayload: true,
        schema: 'Ticket Cancelled',
      },
      Ticket_Expired: {
        send: [],
        receive: [
          {
            topicName:
              'acmeResources/ops/ticket/ticketExpired/v1/{region}/{mine}/{employeeId}/{ticketId}',
            topicParameters: {
              mine: {
                schema: {
                  type: 'string',
                  enum: ['Newman', 'Tom Price', 'Paraburdoo'],
                  'x-parser-schema-id': 'mine',
                },
                'x-ep-enum-state-name': 'DRAFT',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mines',
                'x-ep-enum-state-id': '1',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': 'pfuzs9b8rdg',
                'x-ep-enum-id': 'n8j3iwr7ch7',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'mine',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              employeeId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'employeeId',
                },
                'x-ep-parameter-name': 'employeeId',
              },
              region: {
                schema: {
                  type: 'string',
                  enum: ['americas', 'apac', 'emea'],
                  'x-parser-schema-id': 'region',
                },
                'x-ep-enum-state-name': 'RELEASED',
                'x-ep-enum-version-displayname': '0.1.0',
                'x-ep-enum-version': '0.1.0',
                'x-ep-enum-name': 'Mine Regions',
                'x-ep-enum-state-id': '2',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-enum-version-id': '2rxd6hoqiq7',
                'x-ep-enum-id': '5o5mublcbai',
                'x-ep-shared': 'true',
                'x-ep-parameter-name': 'region',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
              },
              ticketId: {
                schema: {
                  type: 'string',
                  'x-parser-schema-id': 'ticketId',
                },
                'x-ep-parameter-name': 'ticketId',
              },
            },
            message: {
              'x-ep-event-id': '7dx24fl4eji',
              'x-ep-event-version-displayname': '0.1.0',
              description:
                'This event occurs when a ticket held by an employee expires.',
              'x-ep-application-domain-id': 't9nnsdbedw0',
              schemaFormat: 'application/vnd.aai.asyncapi+json;version=2.0.0',
              'x-ep-event-state-name': 'DRAFT',
              'x-ep-shared': 'true',
              'x-ep-application-domain-name': 'Natural Resource: Mining',
              'x-ep-event-version-id': '8f0xbp8lorz',
              payload: {
                'x-ep-schema-version': '0.1.0',
                'x-ep-schema-version-id': '32gadhg9782',
                $schema: 'https://json-schema.org/draft/2019-09/schema',
                description: 'Ticket Expired information.',
                'x-ep-schema-state-name': 'DRAFT',
                'x-ep-schema-name': 'Ticket Expired',
                title: 'Ticket Expired',
                type: 'object',
                'x-ep-application-domain-id': 't9nnsdbedw0',
                'x-ep-schema-version-displayname': '0.1.0',
                'x-ep-shared': 'true',
                'x-ep-application-domain-name': 'Natural Resource: Mining',
                'x-ep-schema-state-id': '1',
                'x-ep-schema-id': 'pmyhhu8ovam',
                properties: {
                  ticket: {
                    maximum: 1000000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-13>',
                  },
                  employee: {
                    maximum: 100000,
                    type: 'number',
                    minimum: 1,
                    'x-parser-schema-id': '<anonymous-schema-14>',
                  },
                },
                $id: 'https://example.com/ticket-expired.schema.json',
                'x-parser-schema-id':
                  'https://example.com/ticket-expired.schema.json',
              },
              'x-ep-event-version': '0.1.0',
              'x-ep-event-name': 'Ticket Expired',
              contentType: 'application/json',
              'x-ep-event-state-id': '1',
              'x-parser-message-name': 'Ticket_Expired',
            },
            servers: {},
            bindings: {},
            consumers: {
              TicketExpiredConsumer: {
                name: 'TicketExpiredConsumer',
                topicSubscriptions: [
                  'acmeResources/ops/ticket/ticketExpired/v1/*/*/*/*',
                ],
              },
            },
          },
        ],
        hasPayload: true,
        schema: 'Ticket Expired',
      },
    },
    schemas: {
      'Shift Break Started': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': 'ztpi4zis2nc',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Shift Break Started information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Shift Break Started',
        title: 'Shift Break Started',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': 'l732pj4n6v2',
        properties: {
          break: {
            maximum: 90,
            type: 'number',
            minimum: 0,
            'x-parser-schema-id': '<anonymous-schema-1>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-2>',
          },
        },
        $id: 'https://example.com/shift-break-started.schema.json',
        'x-parser-schema-id':
          'https://example.com/shift-break-started.schema.json',
      },
      'Ticket Valid': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': 'l04yg9gqv8m',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Ticket Valid information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Ticket Valid',
        title: 'Ticket Valid',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '0.1.0',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': 'g69ixbpup5h',
        properties: {
          ticket: {
            maximum: 1000000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-3>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-4>',
          },
        },
        $id: 'https://example.com/ticket-valid.schema.json',
        'x-parser-schema-id': 'https://example.com/ticket-valid.schema.json',
      },
      'Shift Started': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': '7jkk7hggr91',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Shift Started information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Shift Started',
        title: 'Shift Started',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': 'v0ftinciv7n',
        properties: {
          shift: {
            maximum: 90,
            type: 'number',
            minimum: 0,
            'x-parser-schema-id': '<anonymous-schema-9>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-10>',
          },
        },
        $id: 'https://example.com/shift-started.schema.json',
        'x-parser-schema-id': 'https://example.com/shift-started.schema.json',
      },
      'Ticket Cancelled': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': '3fa8yvawat0',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Ticket Cancelled information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Ticket Cancelled',
        title: 'Ticket Cancelled',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '0.1.0',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': 'g3hex6lseyr',
        properties: {
          ticket: {
            maximum: 1000000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-11>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-12>',
          },
        },
        $id: 'https://example.com/ticket-cancelled.schema.json',
        'x-parser-schema-id':
          'https://example.com/ticket-cancelled.schema.json',
      },
      'Shift Ended': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': 'h4w6tors2e3',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Shift Ended information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Shift Ended',
        title: 'Shift Ended',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': '8kr6o3cmbqc',
        properties: {
          shift: {
            maximum: 90,
            type: 'number',
            minimum: 0,
            'x-parser-schema-id': '<anonymous-schema-5>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-6>',
          },
        },
        $id: 'https://example.com/shift-ended.schema.json',
        'x-parser-schema-id': 'https://example.com/shift-ended.schema.json',
      },
      'Ticket Expired': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': '32gadhg9782',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Ticket Expired information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Ticket Expired',
        title: 'Ticket Expired',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '0.1.0',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': 'pmyhhu8ovam',
        properties: {
          ticket: {
            maximum: 1000000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-13>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-14>',
          },
        },
        $id: 'https://example.com/ticket-expired.schema.json',
        'x-parser-schema-id': 'https://example.com/ticket-expired.schema.json',
      },
      'Shift Break Ended': {
        'x-ep-schema-version': '0.1.0',
        'x-ep-schema-version-id': 'md1wdhwf8f1',
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        description: 'Shift Break Ended information.',
        'x-ep-schema-state-name': 'DRAFT',
        'x-ep-schema-name': 'Shift Break Ended',
        title: 'Shift Break Ended',
        type: 'object',
        'x-ep-application-domain-id': 't9nnsdbedw0',
        'x-ep-schema-version-displayname': '0.1.0',
        'x-ep-shared': 'true',
        'x-ep-application-domain-name': 'Natural Resource: Mining',
        'x-ep-schema-state-id': '1',
        'x-ep-schema-id': '8d58pijifml',
        properties: {
          break: {
            maximum: 90,
            type: 'number',
            minimum: 0,
            'x-parser-schema-id': '<anonymous-schema-7>',
          },
          employee: {
            maximum: 100000,
            type: 'number',
            minimum: 1,
            'x-parser-schema-id': '<anonymous-schema-8>',
          },
        },
        $id: 'https://example.com/shift-break-ended.schema.json',
        'x-parser-schema-id':
          'https://example.com/shift-break-ended.schema.json',
      },
    },
    servers: {},
    info: {
      'x-ep-application-version': '0.1.1',
      'x-ep-application-version-id': 'cdc6y9ru2dy',
      'x-ep-application-id': 'bqf7rllgiwg',
      'x-ep-displayname': '0.1.1',
      'x-ep-state-name': 'DRAFT',
      title: 'HR Service',
      'x-ep-application-domain-id': 't9nnsdbedw0',
      version: '0.1.1',
      'x-ep-state-id': '1',
      'x-ep-application-domain-name': 'Natural Resource: Mining',
    },
    version: '2.5.0',
    fileName: 'Mining - HR Service-0.1.1.json',
  },
  feedSchemas: [
    {
      topic:
        'acmeResources/ops/ticket/ticketValid/v1/{region}/{mine}/{employeeId}/{ticketId}',
      eventName: 'Ticket Valid',
      eventVersion: '0.1.0',
      messageName: 'Ticket_Valid',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
        },
        ticketId: {
          schema: {
            type: 'string',
          },
        },
      },
      payload: {
        ticket: {
          maximum: 1000000,
          type: 'number',
          minimum: 1,
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
        },
      },
      consumers: [
        {
          name: 'TicketValidConsumer',
          topicSubscriptions: [
            'acmeResources/ops/ticket/ticketValid/v1/*/*/*/*',
          ],
        },
      ],
    },
    {
      topic:
        'acmeResources/ops/ticket/ticketCancelled/v1/{region}/{mine}/{employeeId}/{ticketId}',
      eventName: 'Ticket Cancelled',
      eventVersion: '0.1.0',
      messageName: 'Ticket_Cancelled',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
        },
        ticketId: {
          schema: {
            type: 'string',
          },
        },
      },
      payload: {
        ticket: {
          maximum: 1000000,
          type: 'number',
          minimum: 1,
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
        },
      },
      consumers: [
        {
          name: 'TicketCancelledConsumer',
          topicSubscriptions: [
            'acmeResources/ops/ticket/ticketCancelled/v1/*/*/*/*',
          ],
        },
      ],
    },
    {
      topic:
        'acmeResources/ops/ticket/ticketExpired/v1/{region}/{mine}/{employeeId}/{ticketId}',
      eventName: 'Ticket Expired',
      eventVersion: '0.1.0',
      messageName: 'Ticket_Expired',
      topicParameters: {
        mine: {
          schema: {
            type: 'string',
            enum: ['Newman', 'Tom Price', 'Paraburdoo'],
          },
        },
        employeeId: {
          schema: {
            type: 'string',
          },
        },
        region: {
          schema: {
            type: 'string',
            enum: ['americas', 'apac', 'emea'],
          },
        },
        ticketId: {
          schema: {
            type: 'string',
          },
        },
      },
      payload: {
        ticket: {
          maximum: 1000000,
          type: 'number',
          minimum: 1,
        },
        employee: {
          maximum: 100000,
          type: 'number',
          minimum: 1,
        },
      },
      consumers: [
        {
          name: 'TicketExpiredConsumer',
          topicSubscriptions: [
            'acmeResources/ops/ticket/ticketExpired/v1/*/*/*/*',
          ],
        },
      ],
    },
  ],
  // For REST API feeds
  feedAPI: {
    apiUrl: 'https://swapi.dev/api/people/$charID',
    apiAuthType: 'None',
    topic: 'solace/feed/starwars',
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FAKER_RULES':
      return { ...state, fakerRules: action.payload };
    case 'SET_FEED_INFO':
      return { ...state, feedInfo: action.payload };
    case 'SET_FEED_RULES':
      return { ...state, feedRules: action.payload };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload };
    case 'SET_FEED_SCHEMAS':
      return { ...state, feedSchemas: action.payload };
    case 'SET_FEED_API':
      return { ...state, feedAPI: action.payload };
    default:
      return state;
  }
};

const FeedPage = ({ location }) => {
  // const [state, dispatch] = useReducer(reducer, feedMetadata);
  // for local testing only //
  const [state, dispatch] = useReducer(reducer, testFeedMetadata);

  const params = new URLSearchParams(location.search);
  const feed = {
    name: params.get('name'),
    isLocal: params.get('isLocal'),
    type: params.get('type'),
  };

  useEffect(() => {
    const fetchFeedInfo = async () => {
      // Query all the feed metadata
      // var feedFakerRules = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/fakerrules.json`);
      // dispatch({ type: 'SET_FAKER_RULES', payload: feedFakerRules.data });
      // var feedInfo = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedinfo.json`);
      // dispatch({ type: 'SET_FEED_INFO', payload: feedInfo.data });
      // var feedRules = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedrules.json`);
      // dispatch({ type: 'SET_FEED_RULES', payload: feedRules.data });
      // if (feed.type === 'asyncapi_feed') {
      //   var analysis = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/analysis.json`);
      //   dispatch({ type: 'SET_ANALYSIS', payload: analysis.data });
      //   var feedSchemas = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedschemas.json`);
      //   dispatch({ type: 'SET_FEED_SCHEMAS', payload: feedSchemas.data });
      // } else if (feed.type === 'restapi_feed') {
      //   var feedAPI = await axios.get(`https://raw.githubusercontent.com/solacecommunity/solace-event-feeds/main/${encodeURIComponent(feed.name)}/feedapi.json`);
      //   dispatch({ type: 'SET_FEED_API', payload: feedAPI.data });
      // }
    };

    fetchFeedInfo();
  }, []);

  return (
    <Layout>
      <SEO title={`${feed.name} Stream`} />
      <section id="intro">
        <Container className="pt6 pb5">
          <Row className="tc">
            <Col>
              <h1>{feed.name.replace(/_/g, ' ')}</h1>
              {state.feedInfo.length === 0 ? (
                <Loading section="Description" />
              ) : (
                <div>{state.feedInfo.description}</div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <SolaceSession>
        <Container className="pb5">
          <Row className="mt3">
            <BrokerConfig />
          </Row>

          {feed.type === 'asyncapi_feed' ? (
            state.feedSchemas.length === 0 ? (
              <Loading section="Events" />
            ) : (
              <Row className="mt3">
                <PublishEvents feedRules={state.feedRules} />
              </Row>
            )
          ) : feed.type === 'restapi_feed' ? (
            state.feedAPI.length === 0 ? (
              <Loading section="Events" />
            ) : (
              <Row className="mt3">
                <p> REST APIs Not yet supported</p>
              </Row>
            )
          ) : null}
          <Row className="mt3">
            <Stream />
          </Row>
        </Container>
      </SolaceSession>

      {/* The events component */}
    </Layout>
  );
};

export default FeedPage;
