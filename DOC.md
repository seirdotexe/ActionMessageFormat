# AVM+ marker

# AMF0 array

# AMF3 array

# Dynamic classes

Every class in Javascript is dynamic. To modify this behavior in an untyped language, I'm utilizing a simple getter called `dynamic` that the program will check for. When it's set to `false`, the class will be sealed, mimicking typed language behavior.

# Trait reference