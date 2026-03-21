# Action Message Format

Adobe's binary format, Action Message Format (AMF0 and AMF3), faithfully rewritten in modern JavaScript.

# Example

**Dynamic Property Writer**
```js
import AMF from '@seirdotexe/actionmessageformat';

const myPropWriter = (obj) => {
  if (obj.id) obj.id *= 100;
  if (obj.username) obj.username += ` #${obj.id}`
}

AMF.registerDynamicPropertyWriter(myPropWriter, 0);

const value = { username: 'User', id: 5 };
const serialized = AMF.serialize(value, 0);
const deserialized = AMF.deserialize(serialized, 0);

console.log(deserialized); // { username: 'User #500', id: 500 }
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
const serialized = AMF.serialize(value, 0);
const deserialized = AMF.deserialize(serialized, 0);

console.log(deserialized); // Character { username: 'Seir', level: 100 }
```

# Reference system

Both AMF0 (only objects) and AMF3 (objects, strings, traits) utilize a reference check to optimize serializing and deserializing cycles. It's simple, 'cache.referenced' will be false when the object is first seen; it's our first time seeing the object, so it won't be referenced. If the same object is seen again, then 'cache.referenced' will be true, and then it'll be taken care of in the application.

For AMF3 traits, this is a little different. Traits don't have to be the referenceable, just equal. Hence the use of a JSON stringify module.

Together with uint29 for encoding integers, AMF3 can seriously minimize data length and optimize objects.

# License

This project applies the BSD-3-Clause license.