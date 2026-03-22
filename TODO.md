# TODO

## Project

- Readme
  - Getter `dynamic()`
  - Options explanation and behavior

## AMF General

- Restructure marker to value order in code `Serializer` and `Deserializer`
- XML functionality
- Avoid `filter()` to check for sparse arrays in `determineArray` while maintaining functionality
- Tests, explicity test AMF3 trait reference

## Remoting

- Remoting functionality; strict array type. packet, header, and message class. testing AS3 NetConnection
- Flex remoting?

## AMF0

- AVM+ marker to switch to AMF3
- Utilize `timezoneOffset` in Date based on option `dateOffset`

## AMF3

- Support for vector-object-type
- Support for Set
- What about WeakMap? Dictionary weak-keys?
- Examine Decorators for Externalizable, is it viable?