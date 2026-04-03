package
{
  import flash.display.Sprite;

  import flash.utils.ByteArray;
  import flash.utils.Dictionary;

  import flash.net.ObjectEncoding;
  import flash.net.registerClassAlias;

  import PropertyWriter;
  import Character;
  import Person;
  import Car;

  public class Main extends Sprite
  {
    public function Main()
    {
      var ba:ByteArray = new ByteArray();
      ba.objectEncoding = ObjectEncoding.AMF3;

      var value:* = 1;

      ba.writeObject(value);
      trace(traceByteArray(ba));
      ba.position = 0;
      trace(traceObject(ba.readObject()));
    }

    private function traceByteArray(ba:ByteArray):String
    {
      var result:String = '';

      for (var i:uint = 0; i < ba.length; i++)
      {
        result += ('00' + ba[i].toString(16)).substr(-2, 2);

        if (i < ba.length - 1)
          result += ' ';
      }

      return result;
    }

    private function traceObject(obj:Object):String
    {
      var result:String = '';

      for (var key:* in obj)
      {
        result += key + '=>' + obj[key] + '\n';
      }

      return result;
    }
  }
}