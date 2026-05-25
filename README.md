# Action Message Format

[![NPM Version](https://img.shields.io/npm/v/@seirdotexe/actionmessageformat)](https://www.npmjs.com/package/@seirdotexe/actionmessageformat)
[![GitHub stars](https://img.shields.io/github/stars/seirdotexe/actionmessageformat)](https://github.com/seirdotexe/actionmessageformat)

⚠️ This package is not fully tested as of yet, bugs may appear. Please see the todo's.

Adobe's binary format, Action Message Format (AMF0 and AMF3), implemented in modern JavaScript.

AMF was used in products written with Actionscript from the Adobe Flash era for lots of use cases like: game networking (ie Moviestarplanet, Panfu, Fishao), binary serialization, and endpoint communication (ie AMF gateways with remoting and packets). One of its key features is that it can preserve entire class structures which both the client & server must understand. This was very useful back in the day. It also tries to compress the byte stream by implementing a reference system. Objects were cached, and if they were seen 'referenced' before, it would write the index to that cache entry. Nowadays, AMF is obsolute; Protobuf does almost everything, but more efficient, and more modern. AMF was also used in-house by Adobe for numerous formats, like in FLV 'Flash Video', LSO 'Local shared object' and RTMP 'Real Time Messaging Protocol'.

The goal of this project is to preserve the protocol which was once so crucial yet unknown to the user.

# Requirements and installation

Requires Node V24 and up.

> npm install @seirdotexe/actionmessageformat

# Examples

The entire class is well documented and is accessible [here](https://seirdotexe.github.io/amf-api/).

```js
import AMF, { Packet } from '@seirdotexe/actionmessageformat';

const serialized = AMF.serialize({id:1}); // 0a 0b 01 05 69 64 04 01 01
const deserialized = AMF.deserialize(serialized); // { id: 1 }
```

**Dynamic Property Writer**

Modify objects based on your own logic before serialization.
```js
const myPropWriter = (obj) => {
  if (obj.id && obj.username) {
    obj.username += ` ${obj.id}`;
  }
}

AMF.registerDynamicPropertyWriter(myPropWriter, 0); // Active for AMF0

const value = { username: 'User', id: 5 };
const serialized = AMF.serialize(value, 0); // 03 00 08 75 73 65 72 6e 61 6d 65 02 00 06 55 73 65 72 20 35 00 02 69 64 00 40 14 00 00 00 00 00 00 00 00 09
const deserialized = AMF.deserialize(serialized, 0); // { username: 'User 5', id: 5 }
```

**Typed classes**

Excellent support for registering typed classes, as well as anonymous objects (typed class, but not registered).
```js
class Character {
  constructor(username, level) {
    this.username = username;
    this.level = level;
  }
}

AMF.classAlias.registerClassAlias('src.Character', Character);
// Also: unregisterClassAlias, getClassByAlias and getAliasByClass

const value = new Character('Seir', 100);
const serialized = AMF.serialize(value, 0); // 10 00 0d 73 72 63 2e 43 68 61 72 61 63 74 65 72 00 08 75 73 65 72 6e 61 6d 65 02 00 04 53 65 69 72 00 05 6c 65 76 65 6c 00 40 59 00 00 00 00 00 00 00 00 09
const deserialized = AMF.deserialize(serialized, 0); // Character { username: 'Seir', level: 100 }
```

**Dynamic class**

Every object in JS is dynamic by default. You can use the getter `dynamic` to control this behavior.
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

Tough to implement into an untyped language, but it works. Still looking for a way to improve this, perhaps with decorators, an experimental feature.
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

By setting `VectorObject` on an array, it turns an array into a detectable Vector Object.
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

Regular built-in types also work.
```js
const value = ['A', 'B', 'C'];
Object.defineProperty(value, 'VectorObject', { value: '' }); // Set to empty string is mandatory!

const serialized = AMF.serialize(value); // 10 07 00 01 06 03 41 06 03 42 06 03 43
const deserialized = AMF.deserialize(serialized); // [ 'A', 'B', 'C' ]
```

**Remoting**

Full serialize and deserialize remoting support, including AVM+ with all its quirks.
```js
const value = new Packet();

value.addHeader('Header', false, { id: 1 });
value.addMessage('Message', '/1', { id: 2 }, 'ABC');

const serialized = AMF.serializePacket(value);
const deserialized = AMF.deserializePacket(serialized);

/*
Packet {
  version: 3,
  headers: Set(1) { Header { name: 'Header', mustUnderstand: false, data: { id: 1 } } },
  messages: Set(1) { Message { targetURI: 'Message', responseURI: '/1', data: [ { id: 2 }, 'ABC' ] } }
}

00 03 00 01 00 06 48 65 61 64 65 72 00 00 00 00 0a 11 0a 0b 01 05 69 64 04 01 01 00 01 00 07 4d 65 73 73 61 67 65 00 02 2f 31 00 00 00 14 0a 00 00 00 02 00 3f f0 00 00 00 00 00 00 02 00 03 41 42 43
*/
```

**AVM+ extension marker**

Theoretically used only for remoting, but also works out of the box.
```js
const serialized = Buffer.concat([new Uint8Array([0x11]), AMF.serialize({ id: 1 }, 3)]); // 11 (0a 0b 01 05 69 64 04 01 01)
const deserialized = AMF.deserialize(serialized, 0); // { id: 1 }
```

# Modifications and limitations

**Limitations**
- No XML support (as of now)
- No `weak-keys` support for Dictionary (as of now)
- No planned Flex remoting support
- No planned AMF gateway remoting support

**Modifications**
- `Set()` turns into a regular array for AMF0/AMF3. `Map()` turns into a regular object for AMF0, and in AMF3 it's used as `Dictionary`.
- Full drop-in support for ByteArray to my package [dynbuffer](https://github.com/seirdotexe/dynbuffer)
- Getter `dynamic` to specificy if a class is dynamic or not
- Object property `VectorObject` to specificy a Vector Object

# License

This project applies the BSD-3-Clause license.