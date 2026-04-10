# Action Message Format

Adobe's binary format, Action Message Format (AMF0 and AMF3), faithfully rewritten in modern JavaScript.

# Examples

**Dynamic Property Writer**
```js
const myPropWriter = (obj) => {
  if (obj.id) obj.id *= 100;
  if (obj.username) obj.username += ` #${obj.id}`
}

AMF.registerDynamicPropertyWriter(myPropWriter, 0);

const value = { username: 'User', id: 5 };
const serialized = AMF.serialize(value, 0); // 03 00 08 75 73 65 72 6e 61 6d 65 02 00 09 55 73 65 72 20 23 35 30 30 00 02 69 64 00 40 7f 40 00 00 00 00 00 00 00 09
const deserialized = AMF.deserialize(serialized, 0); // { username: 'User #500', id: 500 }
```

**Typed classes**
```js
class Character {
  constructor(username, level) {
    this.username = username;
    this.level = level;
  }
}

AMF.classAlias.registerClassAlias('src.Character', Character);

const value = new Character('Seir', 100);
const serialized = AMF.serialize(value, 0); // 10 00 0d 73 72 63 2e 43 68 61 72 61 63 74 65 72 00 08 75 73 65 72 6e 61 6d 65 02 00 04 53 65 69 72 00 05 6c 65 76 65 6c 00 40 59 00 00 00 00 00 00 00 00 09
const deserialized = AMF.deserialize(serialized, 0); // Character { username: 'Seir', level: 100 }
```

**Dynamic class**
Every object in JS is dynamic.
```js
class Person {
  constructor(name) {
    this.name = name;
  }

  get dynamic() { return false; }
}

AMF.classAlias.registerClassAlias('src.Person', Person);

const value = new Person('Seir');
Object.seal(value);

const serialized = AMF.serialize(value); // 0a 13 15 73 72 63 2e 50 65 72 73 6f 6e 09 6e 61 6d 65 06 09 53 65 69 72
const deserialized = AMF.deserialize(serialized); // Person { name: 'Seir' }

deserialized.age = 32; // Throws an error
```

**Externalizable**
Still looking for a way to improve this, perhaps with decorators, an experimental feature.
```js
class Car {
  constructor(brand, model) {
    this.brand = brand;
    this.model = model;
  }

  writeExternal(output) {
    output.writeUTF(this.brand);
    output.writeUTF(this.model);
  }

  readExternal(input) {
    this.brand = input.readUTF();
    this.model = input.readUTF();
  }
}

AMF.classAlias.registerClassAlias('src.Car', Car);

const value = new Car('Mercedes AMG', 'C63');
const serialized = AMF.serialize(value); // 0a 07 0f 73 72 63 2e 43 61 72 00 0c 4d 65 72 63 65 64 65 73 20 41 4d 47 00 03 43 36 33
const deserialized = AMF.deserialize(serialized); // Car { brand: 'Mercedes AMG', model: 'C63' }
```

**Vector object**
A simple way to turn an array into a detectable Vector Object.
```js
class Character {
  constructor(username) {
    this.username = username;
  }
}

AMF.classAlias.registerClassAlias('src.Character', Character); // Must match in Object.defineProperty or else it'll write an empty class name

const value = [new Character('Seir')];
Object.defineProperty(value, 'VectorObject', { value: 'src.Character' });

const serialized = AMF.serialize(value); // 10 03 00 1b 73 72 63 2e 43 68 61 72 61 63 74 65 72 0a 13 00 11 75 73 65 72 6e 61 6d 65 06 09 53 65 69 72
const deserialized = AMF.deserialize(serialized); // [ Character { username: 'Seir' } ]
```

**AVM+ extension marker**
```js
const serialized = Buffer.concat([new Uint8Array([0x11]), AMF.serialize({ id: 1 }, 3)]); // 11 (0a 0b 01 05 69 64 04 01 01)
const deserialized = AMF.deserialize(serialized, 0); // { id: 1 }
```

# Reference system

Both AMF0 (only objects) and AMF3 (objects, strings, traits) utilize a reference check to optimize serializing and deserializing cycles. It's simple, 'cache.referenced' will be false when the object is first seen, so it won't be referenced. If the same object is seen again, then 'cache.referenced' will be true, and it'll get taken care of in the application. For AMF3 traits, this is a little different. Traits don't have to be referenceable in an object sense of way, just equal. Hence the use of a JSON stringify module.

# License

This project applies the BSD-3-Clause license.