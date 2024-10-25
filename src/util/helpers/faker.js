import { faker } from '@faker-js/faker';

class Faker {
  constructor() {
    // Initialize any properties here
  }

  generateRandomPayload(item) {
    const payload = {};

    for (const param of Object.keys(item.payload)) {
      const paramType = item.payload[param].type;

      if (paramType === 'object') {
        const nestedPayload = {};
        for (const childParam of Object.keys(item.payload[param].properties)) {
          nestedPayload[childParam] = this.generateContent(
            item.payload[param].properties[childParam]
          );
        }
        payload[param] = nestedPayload;
      } else {
        payload[param] = this.generateContent(item.payload[param]);
      }
    }

    return payload;
  }

  generateRandomTopic(item, payload) {
    let topic = item.topic;
    const mappedParams = new Set();

    // Handle mappings if they exist
    if (item.mappings && item.mappings.length > 0) {
      // Process mappings for Topic Parameters
      for (const mapping of item.mappings) {
        if (mapping.target.type === 'Topic Parameter') {
          // Get the value from payload using source field name
          const payloadValue = payload[mapping.source.fieldName];
          if (payloadValue !== undefined) {
            // Replace the corresponding parameter in topic string
            topic = topic.replace(
              `{${mapping.target.fieldName}}`,
              payloadValue
            );
            // Keep track of mapped parameters
            mappedParams.add(mapping.target.fieldName);
          }
        }
      }
    }

    // Handle remaining unmapped parameters with generated content
    for (const param of Object.keys(item.topicParameters)) {
      // Skip if parameter was already handled by mapping
      if (!mappedParams.has(param)) {
        console.log(`Generating random content for topic ${param}`);
        const content = this.generateContent(item.topicParameters[param]);
        console.log(content);
        topic = topic.replace(`{${param}}`, content);
      }
    }

    return topic;
  }

  generateContent(parameter) {
    switch (parameter.rule.group) {
      case 'StringRules':
        return this.processStringRules(parameter.rule);
      case 'NullRules':
        return this.processNullRules(parameter.rule);
      case 'NumberRules':
        return this.processNumberRules(parameter.rule);
      case 'BooleanRules':
        return this.processBooleanRules(parameter.rule);
      case 'DateRules':
        return this.processDateRules(parameter.rule);
      case 'LoremRules':
        return this.processLoremRules(parameter.rule);
      case 'PersonRules':
        return this.processPersonRules(parameter.rule);
      case 'LocationRules':
        return this.processLocationRules(parameter.rule);
      case 'FinanceRules':
        return this.processFinanceRules(parameter.rule);
      case 'AirlineRules':
        return this.processAirlineRules(parameter.rule);
      case 'CommerceRules':
        return this.processCommerceRules(parameter.rule);
      default:
        return 'NoRuleGroupFound';
    }
  }

  processStringRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'alpha':
        options = {
          length: {
            min: rule.minLength,
            max: rule.maxLength,
          },
          casing: rule.casing,
        };
        return faker.string.alpha(options);
      case 'alphanumeric':
        options = {
          length: {
            min: rule.minLength,
            max: rule.maxLength,
          },
          casing: rule.casing,
        };
        return faker.string.alphanumeric(options);
      case 'enum':
        let enumObj = {};
        rule.enum.forEach((t) => {
          enumObj[`'${t}'`] = t;
        });
        return faker.helpers.enumValue(Object.freeze(enumObj));
      case 'words':
        return faker.lorem.words(rule.count);
      case 'nanoid':
        options = {
          min: rule.minLength,
          max: rule.maxLength,
        };
        return faker.string.nanoid(options);
      case 'numeric':
        options = {
          length: {
            min: rule.minLength,
            max: rule.maxLength,
          },
          allowLeadingZeros: rule.leadingZeros,
        };
        return faker.string.numeric(options);
      case 'symbol':
        options = {
          min: rule.minLength,
          max: rule.maxLength,
        };
        return faker.string.symbol(options);
      case 'uuid':
        return faker.string.uuid();
      case 'fromRegExp':
        return faker.helpers.fromRegExp(rule.pattern);
      case 'phoneNumber':
        return faker.phone.number();
      case 'json':
        return faker.datatype.json();
      default:
        return 'NoTypeFound';
    }
  }

  processNullRules(rule) {
    switch (rule.rule) {
      case 'null':
        return null;
      case 'empty':
        return '';
      default:
        return 'NoTypeFound';
    }
  }

  processNumberRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'int':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.number.int(options);
      case 'float':
        options = {
          min: rule.minimum,
          max: rule.maximum,
          fractionDigits: parseInt(rule.fractionDigits),
        };
        return faker.number.float(options);
      default:
        return 'NoTypeFound';
    }
  }

  processBooleanRules(rule) {
    switch (rule.rule) {
      case 'boolean':
        return faker.datatype.boolean();
      default:
        return 'NoTypeFound';
    }
  }

  processDateRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'anytime':
        return faker.date.anytime();
      case 'future':
        options = { years: rule.years };
        return faker.date.future(options);
      case 'past':
        options = { years: rule.years };
        return faker.date.past(options);
      case 'recent':
        options = { days: rule.days };
        return faker.date.recent(options);
      case 'soon':
        options = { days: rule.days };
        return faker.date.soon(options);
      case 'month':
        options = { abbreviated: rule.abbreviated };
        return faker.date.month(options);
      case 'weekday':
        options = { abbreviated: rule.abbreviated };
        return faker.date.weekday(options);
      default:
        return 'NoTypeFound';
    }
  }

  processLoremRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'lines':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.lorem.lines(options);
      case 'paragraph':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.lorem.paragraphs(options);
      case 'sentence':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.lorem.sentence(options);
      case 'text':
        return faker.lorem.text();
      case 'word':
        options = {
          length: {
            min: rule.minimum,
            max: rule.maximum,
          },
        };
        return faker.lorem.word(options);
      default:
        return 'NoTypeFound';
    }
  }

  processPersonRules(rule) {
    switch (rule.rule) {
      case 'prefix':
        return faker.person.prefix();
      case 'firstName':
        return faker.person.firstName();
      case 'lastName':
        return faker.person.lastName();
      case 'middleName':
        return faker.person.middleName();
      case 'fullName':
        return faker.person.fullName();
      case 'suffix':
        return faker.person.suffix();
      case 'sex':
        return faker.person.sex();
      case 'jobTitle':
        return faker.person.jobTitle();
      case 'jobDescriptor':
        return faker.person.jobDescriptor();
      case 'jobType':
        return faker.person.jobType();
      default:
        return 'NoTypeFound';
    }
  }

  processLocationRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'buildingNumber':
        return faker.location.buildingNumber();
      case 'street':
        return faker.location.street();
      case 'streetAddress':
        return faker.location.streetAddress();
      case 'city':
        return faker.location.city();
      case 'state':
        return faker.location.state();
      case 'zipCode':
        return faker.location.zipCode();
      case 'country':
        return faker.location.countryCode();
      case 'countryCode':
        return faker.location.countryCode();
      case 'latitude':
        options = {
          min: rule.minimum,
          max: rule.maximum,
          precision: parseInt(rule.precision),
        };
        return faker.location.latitude(options);
      case 'longitude':
        options = {
          min: rule.minimum,
          max: rule.maximum,
          precision: parseInt(rule.precision),
        };
        return faker.location.longitude(options);
      case 'timeZone':
        return faker.location.timeZone();
      default:
        return 'NoTypeFound';
    }
  }

  processFinanceRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'accountNumber':
        return faker.finance.accountNumber();
      case 'amount':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.finance.amount(options);
      case 'swiftOrBic':
        return faker.finance.bic();
      case 'creditCardNumber':
        return faker.finance.creditCardNumber();
      case 'currencyCode':
        return faker.finance.currencyCode();
      case 'currencyName':
        return faker.finance.currencyName();
      case 'currencySymbol':
        return faker.finance.currencySymbol();
      case 'bitcoinAddress':
        return faker.finance.bitcoinAddress();
      case 'ethereumAddress':
        return faker.finance.ethereumAddress();
      case 'transactionDescription':
        return faker.finance.transactionDescription();
      case 'transactionType':
        return faker.finance.transactionType();
      default:
        return 'NoTypeFound';
    }
  }

  processAirlineRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'airline':
        return faker.airline.airline();
      case 'airplane':
        const airplane = faker.airline.airplane();
        return `${airplane.name} [${airplane.iataTypeCode}]`;
      case 'airport':
        const airport = faker.airline.airport();
        return `${airport.name} [${airport.iataCode}]`;
      case 'airportName':
        return faker.airline.airport().name;
      case 'airportCode':
        return faker.airline.airport().iataCode;
      case 'flightNumber':
        options = {
          length: {
            min: rule.minimum,
            max: rule.maximum,
          },
          addLeadingZeros: rule.leadingZeros,
        };
        return faker.airline.flightNumber(options);
      default:
        return 'NoTypeFound';
    }
  }

  processCommerceRules(rule) {
    var options = {};
    switch (rule.rule) {
      case 'companyName':
        return faker.company.name();
      case 'department':
        return faker.commerce.department();
      case 'isbn':
        return faker.commerce.isbn();
      case 'price':
        options = {
          min: rule.minimum,
          max: rule.maximum,
        };
        return faker.commerce.price(options);
      case 'product':
        return faker.commerce.product();
      case 'productDescription':
        return faker.commerce.productDescription();
      case 'productName':
        return faker.commerce.productName();
      default:
        return 'NoTypeFound';
    }
  }
}

export default Faker;
