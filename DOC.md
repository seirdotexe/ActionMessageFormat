# Limitations

- No XML support (as of now)
- No `weak-keys` support for Dictionary
- No planned Flex / AMF gateway remoting support, but this library does supports the backbone for that
- No planned RTMP support

# AVM+ marker (and remoting)

The AVM+ marker, which is only used in remoting, requires a lot of work behind the hood. For example, AMF0 and AMF3 must be able to communicate with each other, we need to reset AMF3 references within AMF0, we need to know how many AMF3 bytes there truly are, and even serialize data with AMF3 within the AMF0 class. All this without breaking the entire thing. The entire logic is also in the AMF0 classes.

This library also correctly implements the header & message length by storing each position before and after. So no lazy `-1` and be done with it. This is also in fact very crucial for deserializing AVM+ data.

It also utilises the `strict array` type for each packet's message data. It's basically an array, but it inspects what types of data you're trying to serialize, and it'll decide whether to go AVM+ or not. Upon testing this myself, certain types aren't allowed to be serialized in AMF3 format (number, string, boolean, null and undefined). The caveat here is that you could be writing numbers in AMF0 and then suddenly switch to AMF3 due to AVM+ because there's an object. You'll need to detect that.

There's one final thing I didn't understand which is when reading a header's data, and it's AVM+, it'll include a zero at the end of the buffer. I researched this for a while but it doesn't seem to matter and I couldn't figure it out in the end.

All in all, a lot of undocumented logic and nonsense which I tried my best on to document within the AMF0 class.

# AMF0 array

AVM secretly cleans up sparse entries in an array (undocumented behavior). But very important to note: it only does this when setting array values by index. It does this to optimize buffer space.

var value:Array = []; // It won't optimize when you do [,,1] - Also Node is unable to determine the difference. AVM probably inspects this behavior through a proxy class
value[2] = 1; // Optimized

The AMF0 serialized hex will be: 08 00 00 00 03 00 01 32 00 3f f0 00 00 00 00 00 00 00 00 09
01 32 = writeUTF length and the letter '2' followed by the number 1 in writeDouble

Because the length is still written, sparse entries will naturally return, and the deserialized value will be unaffected.

Undocumented behavior - An associative array's length will always write 0 by AVM. This is done on purpose; we must treat it as an object! The keys will turn into sparse entries which is unwanted.
Undocumented behavior - Upon deserializing an AMF0 array, it'll turn invalid values (null or undefined) into empty values.

# AMF3 array

Once again, AVM is weird in handling arrays. Setting by index turns it into an associative array.

Option 1 - Associative:
var value:* = [];
value[1] = 1; // or even ["1"]
buffer: 09 01 03 31 04 01 01

Option 2 - Dense:
var value:* = [,1];
buffer: 09 05 01 00 04 01

Since there's no way for us to tell them apart, we're going with option 2, because that's how it's done in JS. The serialized output will differ but its functionality won't break!

# Dynamic classes

Every class in Javascript is dynamic. To modify this behavior in an untyped language, I'm utilizing a simple getter called `dynamic` that the program will check for. When it's set to `false`, the class will be sealed, mimicking typed language behavior. You'll have to seal the class yourself upon serialization if you want to replicate true behavior (it won't change the outcome of the byte stream). When deserializing, it'll be done automatically.

# Externalizable classes

Tough to implement into an untyped language, but it works. The library detects an Externalizable class by checking if it has `writeExternal` and `readExternal`. Still looking for a way to improve this, so if you have an idea, please share it!

# New Ecmascript types

`Set()` turns into a regular array for AMF0/AMF3. `Map()` turns into a regular object for AMF0, and in AMF3 it's used as `Dictionary`.

# Vector

For regular vectors that are known (VECTOR_INT, VECTOR_UINT, VECTOR_DOUBLE) we're just using the typed arrays in JS. For VECTOR_OBJECT however I've come up with something here. By setting `VectorObject` on an array, it turns an array into a detectable Vector Object for our program.

It depends on `Object.defineProperty(value, 'VectorObject', { value: '' });` where the value string must either match your registered class alias (remember: registerClassAlias) or keep it empty for example to use Vector string.

# ByteArray

Full drop-in support for ByteArray to my package [dynbuffer](https://github.com/seirdotexe/dynbuffer). It also supports `Buffer`.

# Trait reference
