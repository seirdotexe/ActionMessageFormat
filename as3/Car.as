package
{
  import flash.utils.IExternalizable;
  import flash.utils.IDataInput;
  import flash.utils.IDataOutput;

  public class Car implements IExternalizable
  {
    public var brand:String;
    public var model:String;

    public function Car(brand:String, model:String)
    {
      this.brand = brand;
      this.model = model;
    }

    public function writeExternal(output:IDataOutput):void
    {
      output.writeUTF(this.brand);
      output.writeUTF(this.model);
    }

    public function readExternal(input:IDataInput):void
    {
      this.brand = input.readUTF();
      this.model = input.readUTF();
    }
  }
}