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

# License

This project applies the BSD-3-Clause license.