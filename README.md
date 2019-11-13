# Vizabi DDF Service Reader

This Vizabi DDF Service Reader is used to connect your Vizabi visualization to data that is published by a [DDF Service](https://github.com/Gapminder/big-waffle/blob/master/SERVICE_SPEC.md).  

## Usage

To use the reader include the script:

    <script src="dist/vizabi-ddfservice-reader.js"></script>

Then simply create an instance and pass it to Vizabi. 

    var ddfReader = DDFServiceReader.getReader();
    Vizabi.stores.dataSources.createAndAddType("ddfBW", ddfReader);

Next define a data specification, e.g. like this:

    const data = {
    modelType: "ddfBW",
    dataset: {name: "unhcr"} // e.g. version could also be in here;

And use that in the config of your Vizabi visualization:

    var config = {
    markers: {
        marker_destination: {
        data: {
            locale: "en",
            source: data,
            space: ["asylum_residence", "time"]
        },
        ...
        ...
        ...

## Options

Options for the reader can be given as object argument to __DDFServiceReader.getReader()__:

    var ddfReader = DDFServiceReader.getReader({service: 'http://localhost:3001'}); //reader config that's not dataset specific goes here

For now __service__ is the only option with reader scope.

In addition a dataset specific configuration object must be supplied in the __init()__ call. Vizabi supplies the
dataset property of a data source as the configuration object. The supported options are:

    {
        name: "unhcr",          // the name of the dataset, the only property that is mandatory
        version: "2019111203"   // a version string, if absent the default version supplied by the service will be used
    }
