# Vizabi DDF Service Reader

This Vizabi DDF Service Reader is used to connect your Vizabi visualization to data that is published by a [DDF Service](https://github.com/Gapminder/big-waffle/blob/master/SERVICE_SPEC.md).  

## Usage

To use the reader include the script:

    <script src="vizabi-ddfservice-reader.js"></script>

Then simply create an instance and pass it to Vizabi. 

    var ddfReader = DDFServiceReader.getReader();
    Vizabi.Reader.extend("ddfbw", ddfReader);

Then configure Vizabi to provide the reader with the URL of the DDF Service and the name of the dataset:

    Object.assign(ConfigPopByAge, {
    data: {
        "reader": "ddfbw",
        "service": "https://big-waffle.gapminder.org",
        "dataset": "population",
        "version": "4ced761"
    },
    locale: {
        "filePath": "//s3-eu-west-1.amazonaws.com/static.gapminderdev.org/vizabi/develop/assets/translation/"
    }
    });

    Vizabi("PopByAge", document.getElementById("vizabi"), ConfigPopByAge);


## Usage without vizabi
[jsfiddle example](https://jsfiddle.net/7gn91sr0/3/)

```
var ddfReader = DDFServiceReader.getReader();


ddfReader.init({
  service: 'https://big-waffle.gapminder.org', 
  name: "wdi-master"
});


ddfReader.read({
	select: {
  	key: ["geo", "time"], 
  	value: ["sh_sta_brtc_zs"]
  }, 
  where: {
  	geo: {"$in": ["rwa"]}},
    from: "datapoints"
  })
.then(console.log);

```
