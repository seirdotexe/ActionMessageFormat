package
{
  import flash.net.IDynamicPropertyWriter;
  import flash.net.IDynamicPropertyOutput;

  public class PropertyWriter implements IDynamicPropertyWriter
  {
    public function PropertyWriter()
    {
    }

    public function writeDynamicProperties(obj:Object, output:IDynamicPropertyOutput):void
    {
      output.writeDynamicProperty("age", obj["age"] * 100);
    }
  }
}