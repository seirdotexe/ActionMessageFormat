# Limitations

- No XML support (as of now)
- No `weak-keys` support for Dictionary
- No planned Flex / AMF gateway remoting support. This library supports the backbone for that, though
- No planned RTMP support

# AVM+ marker

# AMF0 array

# AMF3 array

# Dynamic classes

Every class in Javascript is dynamic. To modify this behavior in an untyped language, I'm utilizing a simple getter called `dynamic` that the program will check for. When it's set to `false`, the class will be sealed, mimicking typed language behavior. You'll have to seal the class yourself upon serialization if you want to replicate true behavior (it won't change the outcome of the byte stream). When deserializing, it'll be done automatically.

# New Ecmascript types

`Set()` turns into a regular array for AMF0/AMF3. `Map()` turns into a regular object for AMF0, and in AMF3 it's used as `Dictionary`.

# Vector

# ByteArray

Full drop-in support for ByteArray to my package [dynbuffer](https://github.com/seirdotexe/dynbuffer). It also supports `Buffer`.

# Trait reference